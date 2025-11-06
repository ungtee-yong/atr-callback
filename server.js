'use strict';

var path = require('path');
var http = require('http');
var express = require('express');
var sql = require('mssql');

var app = express();
var PORT = process.env.PORT || 3000;
var POLL_INTERVAL = parseInt(process.env.CALLBACK_POLL_INTERVAL_MS, 10) || 5000;
var CALL_STATUS_CALLING = process.env.CALLBACK_CALLING_STATUS || 'Calling';

app.use(express.static(path.join(__dirname, 'public')));

var server = http.createServer(app);
var io = require('socket.io')(server, {
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 60000,
  cookie: false
});

var dbConfig = createDbConfigFromEnv();
var queryText = process.env.CALLBACK_QUERY;
var updateQueryText = process.env.CALLBACK_UPDATE_QUERY || null;
var filterQueryText = process.env.CALLBACK_FILTER_QUERY || null;
var isDbConfigured = isDatabaseConfigured(dbConfig, queryText);
var latestCallbacks = getSeedCallbacks();
var pool = null;
var pollTimer = null;
var fallbackIdCounter = 1000;

io.on('connection', function (socket) {
  socket.emit('callbacks:update', latestCallbacks);

  socket.on('callbacks:call', function (payload, ack) {
    processCallRequest(payload)
      .then(function (result) {
        if (typeof ack === 'function') {
          ack({ success: true, updated: result.updated });
        }
      })
      .catch(function (err) {
        if (typeof ack === 'function') {
          ack({ success: false, error: err && err.message ? err.message : String(err) });
        }
      });
  });

  socket.on('callbacks:filter', function (payload, ack) {
    processFilterRequest(payload)
      .then(function (result) {
        if (typeof ack === 'function') {
          ack({ success: true, callbacks: result });
        }
      })
      .catch(function (err) {
        if (typeof ack === 'function') {
          ack({ success: false, error: err && err.message ? err.message : String(err) });
        }
      });
  });
});

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

server.listen(PORT, function () {
  console.log('Callback dashboard app listening on port ' + PORT);
  if (isDbConfigured) {
    console.log('Starting MSSQL polling every ' + POLL_INTERVAL + 'ms');
    startPolling();
  } else {
    console.log('MSSQL connection details not fully configured. Serving seed data only.');
  }
});

function startPolling() {
  pollDatabase();
  pollTimer = setInterval(pollDatabase, POLL_INTERVAL);
}

function pollDatabase() {
  getPool()
    .then(function (activePool) {
      return activePool.request().query(queryText);
    })
    .then(function (result) {
      var rows = (result && result.recordset) || [];
      var mapped = mapRows(rows);
      broadcastCallbacks(mapped);
    })
    .catch(function (err) {
      logError('Callback polling failed', err);
    });
}

function mapRows(rows) {
  var mapped = [];
  for (var i = 0; i < rows.length; i += 1) {
    mapped.push(mapRowToCallback(rows[i], i));
  }
  if (mapped.length === 0) {
    return [];
  }
  return mapped;
}

function broadcastCallbacks(data) {
  latestCallbacks = data;
  io.emit('callbacks:update', latestCallbacks);
}

function processCallRequest(payload) {
  return new Promise(function (resolve, reject) {
    if (!payload || payload.id === undefined || payload.id === null || payload.id === '') {
      return reject(new Error('INVALID_CALLBACK_ID'));
    }

    var idValue = String(payload.id);
    var agentLabel = trimValue(payload.agentLabel || payload.agentName || payload.agentCode) || 'Agent';
    var statusText = CALL_STATUS_CALLING;

    var updatePromise = Promise.resolve();
    if (isDbConfigured && updateQueryText) {
      updatePromise = getPool()
        .then(function (activePool) {
          var request = activePool.request();
          request.input('id', sql.VarChar, idValue);
          request.input('agent', sql.NVarChar, agentLabel);
          request.input('status', sql.NVarChar, statusText);
          request.input('updatedAt', sql.DateTime, new Date());
          return request.query(updateQueryText);
        });
    } else if (isDbConfigured && !updateQueryText) {
      logError('CALLBACK_UPDATE_QUERY not configured; skipping database update', '');
    }

    updatePromise
      .then(function () {
        var changed = markCallbackAsCalling(idValue, agentLabel, statusText);
        if (changed) {
          broadcastCallbacks(latestCallbacks);
        } else {
          pollDatabase();
        }
        resolve({ updated: changed });
      })
      .catch(function (err) {
        logError('Failed to update callback status', err);
        reject(new Error('DATABASE_UPDATE_FAILED'));
      });
  });
}

function processFilterRequest(filters) {
  var normalized = normalizeFilterValues(filters);

  if (isDbConfigured && filterQueryText) {
    return getPool()
      .then(function (activePool) {
        var request = activePool.request();
        setNullableInput(request, 'phone', sql.VarChar, normalized.phoneRaw);
        setNullableInput(request, 'reason', sql.NVarChar, normalized.reasonRaw);
        setNullableInput(request, 'fromDate', sql.DateTime, normalized.fromDateObj);
        setNullableInput(request, 'toDate', sql.DateTime, normalized.toDateObj);
        setNullableInput(request, 'callStatus', sql.NVarChar, normalized.callStatusRaw);
        setNullableInput(request, 'lastStatus', sql.NVarChar, normalized.lastStatusRaw);
        setNullableInput(request, 'agent', sql.NVarChar, normalized.agentRaw);
        setNullableInput(request, 'skills', sql.NVarChar, normalized.skillsCsv);
        return request.query(filterQueryText);
      })
      .then(function (result) {
        var rows = (result && result.recordset) || [];
        return mapRows(rows);
      })
      .catch(function (err) {
        logError('Filter query failed', err);
        return filterLatestCallbacks(normalized);
      });
  }

  return Promise.resolve(filterLatestCallbacks(normalized));
}

function getPool() {
  if (!isDbConfigured) {
    return Promise.reject(new Error('MSSQL configuration is incomplete.'));
  }
  if (pool && pool.connected) {
    return Promise.resolve(pool);
  }
  pool = new sql.ConnectionPool(dbConfig);
  return pool
    .connect()
    .then(function (connectedPool) {
      connectedPool.on('error', function (err) {
        logError('MSSQL connection pool error', err);
        pool = null;
      });
      return connectedPool;
    })
    .catch(function (err) {
      pool = null;
      throw err;
    });
}

function mapRowToCallback(row, index) {
  row = row || {};

  var idValue = firstDefined([row.id, row.Id, row.ID]);
  if (idValue === undefined || idValue === null || idValue === '') {
    fallbackIdCounter += 1;
    idValue = fallbackIdCounter;
  }

  var timeValue = firstDefined([row.time, row.Time, row.TimeStamp, row.Timestamp, row.createdAt]);
  var phoneValue = toStringSafe(firstDefined([row.phone, row.Phone, row.contactNumber]));
  var lastStatusText = toStringSafe(firstDefined([row.lastStatus, row.LastStatus]));
  var skillValue = toStringSafe(firstDefined([row.skill, row.Skill, row.queue]));
  var agentValue = toStringSafe(firstDefined([row.agent, row.Agent, row.AssignedAgent]));
  var waitingValue = toStringSafe(firstDefined([row.waiting, row.Waiting]));
  var abandonTimeValue = firstDefined([row.abandonTime, row.AbandonTime]);
  var callbackTimeValue = firstDefined([row.callbackTime, row.CallbackTime]);
  var conversationValue = toStringSafe(firstDefined([row.conversation, row.Conversation, row.ConversationDuration]));
  var kpiValue = toStringSafe(firstDefined([row.kpi, row.Kpi, row.KPI]));
  var callStatusText = toStringSafe(firstDefined([row.callStatus, row.CallStatus, row.Status]));
  var reasonCodeValue = toStringSafe(firstDefined([row.reasonCode, row.ReasonCode]));
  var reasonTagValue = toStringSafe(firstDefined([row.reasonTag, row.ReasonTag, row.Reason, row.ReasonLabel]));
  var notesValue = toStringSafe(firstDefined([row.notes, row.Notes, row.Note, row.NoteText]));

  var normalizedCallStatusType = normalizeStatusType(callStatusText);
  var normalizedLastStatusType = normalizeStatusType(lastStatusText);

  return {
    id: idValue,
    time: formatDateTime(timeValue),
    phone: phoneValue || '-',
    lastStatus: {
      type: normalizedLastStatusType,
      text: lastStatusText || '-'
    },
    skill: skillValue || '',
    agent: agentValue || 'Unassigned',
    waiting: waitingValue || '-',
    abandonTime: formatDateTime(abandonTimeValue),
    callbackTime: formatDateTime(callbackTimeValue),
    conversation: conversationValue || '-',
    kpi: kpiValue || 'N/A',
    notes: {
      code: reasonCodeValue,
      tag: reasonTagValue,
      text: notesValue
    },
    callStatus: {
      type: normalizedCallStatusType,
      text: callStatusText || '-'
    },
    action: buildActionFromStatus(callStatusText)
  };
}

function markCallbackAsCalling(identifier, agentLabel, statusText) {
  var matched = false;
  var normalizedId = String(identifier);
  var normalizedStatus = normalizeStatusType(statusText || CALL_STATUS_CALLING);
  for (var i = 0; i < latestCallbacks.length; i += 1) {
    var item = latestCallbacks[i];
    if (String(item.id) === normalizedId) {
      item.agent = agentLabel;
      item.callStatus = {
        type: normalizedStatus,
        text: statusText || CALL_STATUS_CALLING
      };
      item.action = { type: 'disabled', text: 'Calling...' };
      matched = true;
      break;
    }
  }
  return matched;
}

function buildActionFromStatus(statusText) {
  var label = (statusText || '').toLowerCase();
  if (label === 'calling') {
    return { type: 'disabled', text: 'Calling...' };
  }
  return { type: 'call', text: 'Call' };
}

function normalizeStatusType(statusText) {
  if (!statusText) {
    return '';
  }
  var label = statusText.toLowerCase();
  var map = {
    waiting: 'waiting',
    called: 'called',
    'no answer': 'no-answer',
    'no_answer': 'no-answer',
    noanswer: 'no-answer',
    busy: 'busy',
    calling: 'calling',
    abandon: 'abandon',
    abandoned: 'abandon',
    callback: 'callback'
  };
  if (map[label]) {
    return map[label];
  }
  return label.replace(/[^a-z0-9]+/g, '-');
}

function firstDefined(candidates) {
  if (!candidates) {
    return null;
  }
  for (var i = 0; i < candidates.length; i += 1) {
    var value = candidates[i];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return null;
}

function toStringSafe(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (value instanceof Date) {
    return formatDateTime(value);
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return String(value);
}

function formatDateTime(value) {
  if (!value && value !== 0) {
    return '-';
  }
  if (value instanceof Date) {
    return formatDate(value);
  }
  if (typeof value === 'number') {
    var numericDate = new Date(value);
    if (!isNaN(numericDate.getTime())) {
      return formatDate(numericDate);
    }
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value);
}

function formatDate(date) {
  var month = padNumber(date.getMonth() + 1);
  var day = padNumber(date.getDate());
  var year = date.getFullYear();
  var hours = padNumber(date.getHours());
  var minutes = padNumber(date.getMinutes());
  var seconds = padNumber(date.getSeconds());
  return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

function padNumber(value) {
  return value < 10 ? '0' + value : String(value);
}

function trimValue(value) {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).replace(/^\s+|\s+$/g, '');
}

function setNullableInput(request, name, type, value) {
  if (value === undefined || value === null || value === '') {
    request.input(name, type, null);
  } else {
    request.input(name, type, value);
  }
}

function normalizeFilterValues(filters) {
  filters = filters || {};

  var phoneOriginal = trimValue(filters.phone);
  var phoneDigits = phoneOriginal ? digitsOnly(phoneOriginal) : '';
  var reasonRaw = trimValue(filters.reason);
  var reasonLower = reasonRaw.toLowerCase();
  var callStatusRaw = trimValue(filters.callStatus);
  var callStatusLower = callStatusRaw.toLowerCase();
  var lastStatusRaw = trimValue(filters.lastStatus);
  var lastStatusLower = lastStatusRaw.toLowerCase();
  var agentRaw = trimValue(filters.agent);
  var agentLower = agentRaw.toLowerCase();

  var skillsArray = [];
  if (filters.skills && typeof filters.skills.length === 'number') {
    for (var i = 0; i < filters.skills.length; i += 1) {
      var skill = trimValue(filters.skills[i]);
      if (skill) {
        skillsArray.push(skill);
      }
    }
  }
  var skillsLower = [];
  for (var j = 0; j < skillsArray.length; j += 1) {
    skillsLower.push(skillsArray[j].toLowerCase());
  }

  var fromDateObj = buildFilterDateObj(filters.fromDate, filters.fromHour, filters.fromMinute, false);
  var toDateObj = buildFilterDateObj(filters.toDate, filters.toHour, filters.toMinute, true);

  return {
    phoneRaw: phoneOriginal || null,
    phoneFilter: phoneDigits,
    reasonRaw: reasonRaw || null,
    reasonLower: reasonLower,
    callStatusRaw: callStatusRaw || null,
    callStatusLower: callStatusLower,
    lastStatusRaw: lastStatusRaw || null,
    lastStatusLower: lastStatusLower,
    agentRaw: agentRaw || null,
    agentLower: agentLower,
    skillsCsv: skillsArray.length > 0 ? skillsArray.join(',') : null,
    skillsLower: skillsLower,
    fromDateObj: fromDateObj,
    fromTimestamp: fromDateObj ? fromDateObj.getTime() : null,
    toDateObj: toDateObj,
    toTimestamp: toDateObj ? toDateObj.getTime() : null
  };
}

function filterLatestCallbacks(normalized) {
  var results = [];
  for (var i = 0; i < latestCallbacks.length; i += 1) {
    var item = latestCallbacks[i];
    if (matchesFilter(item, normalized)) {
      results.push(cloneCallback(item));
    }
  }
  return results;
}

function matchesFilter(item, normalized) {
  if (normalized.phoneFilter) {
    var itemPhone = digitsOnly(item.phone || '');
    if (itemPhone.indexOf(normalized.phoneFilter) === -1) {
      return false;
    }
  }

  if (normalized.reasonLower) {
    var tagValue = item.notes && item.notes.tag ? String(item.notes.tag).toLowerCase() : '';
    var noteValue = item.notes && item.notes.text ? String(item.notes.text).toLowerCase() : '';
    if (tagValue.indexOf(normalized.reasonLower) === -1 && noteValue.indexOf(normalized.reasonLower) === -1) {
      return false;
    }
  }

  if (normalized.fromTimestamp !== null || normalized.toTimestamp !== null) {
    var timeValue = parseItemTimeString(item.time);
    if (timeValue === null) {
      return false;
    }
    if (normalized.fromTimestamp !== null && timeValue < normalized.fromTimestamp) {
      return false;
    }
    if (normalized.toTimestamp !== null && timeValue > normalized.toTimestamp) {
      return false;
    }
  }

  if (normalized.callStatusLower) {
    var callStatus = item.callStatus && item.callStatus.text ? String(item.callStatus.text).toLowerCase() : '';
    if (callStatus !== normalized.callStatusLower) {
      return false;
    }
  }

  if (normalized.lastStatusLower) {
    var lastStatus = item.lastStatus && item.lastStatus.text ? String(item.lastStatus.text).toLowerCase() : '';
    if (lastStatus !== normalized.lastStatusLower) {
      return false;
    }
  }

  if (normalized.skillsLower.length > 0) {
    var skillValue = item.skill ? String(item.skill).toLowerCase() : '';
    if (normalized.skillsLower.indexOf(skillValue) === -1) {
      return false;
    }
  }

  if (normalized.agentLower) {
    var agentValue = item.agent ? String(item.agent).toLowerCase() : '';
    if (agentValue !== normalized.agentLower) {
      return false;
    }
  }

  return true;
}

function cloneCallback(item) {
  return JSON.parse(JSON.stringify(item));
}

function digitsOnly(value) {
  return value ? String(value).replace(/\D/g, '') : '';
}

function buildFilterDateObj(dateValue, hourValue, minuteValue, endOfRange) {
  if (!dateValue) {
    return null;
  }
  var parts = String(dateValue).split('-');
  if (parts.length !== 3) {
    return null;
  }
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) - 1;
  var day = parseInt(parts[2], 10);
  var hour = parseInt(hourValue, 10);
  var minute = parseInt(minuteValue, 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return null;
  }
  if (isNaN(hour)) {
    hour = endOfRange ? 23 : 0;
  }
  if (isNaN(minute)) {
    minute = endOfRange ? 59 : 0;
  }
  var second = endOfRange ? 59 : 0;
  var millisecond = endOfRange ? 999 : 0;
  var dateObject = new Date(year, month, day, hour, minute, second, millisecond);
  if (isNaN(dateObject.getTime())) {
    return null;
  }
  return dateObject;
}

function parseItemTimeString(value) {
  if (!value || value === '-') {
    return null;
  }
  var segments = String(value).split(' ');
  var datePart = segments[0];
  var timePart = segments.length > 1 ? segments[1] : '00:00:00';
  var dateParts = datePart.split('/');
  if (dateParts.length !== 3) {
    return null;
  }
  var month = parseInt(dateParts[0], 10) - 1;
  var day = parseInt(dateParts[1], 10);
  var year = parseInt(dateParts[2], 10);
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    return null;
  }
  var timeParts = timePart.split(':');
  var hour = timeParts.length > 0 ? parseInt(timeParts[0], 10) : 0;
  var minute = timeParts.length > 1 ? parseInt(timeParts[1], 10) : 0;
  var second = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
  if (isNaN(hour)) {
    hour = 0;
  }
  if (isNaN(minute)) {
    minute = 0;
  }
  if (isNaN(second)) {
    second = 0;
  }
  var dateObject = new Date(year, month, day, hour, minute, second);
  if (isNaN(dateObject.getTime())) {
    return null;
  }
  return dateObject.getTime();
}

function createDbConfigFromEnv() {
  return {
    server: process.env.MSSQL_SERVER,
    database: process.env.MSSQL_DATABASE,
    user: process.env.MSSQL_USER,
    password: process.env.MSSQL_PASSWORD,
    options: {
      encrypt: process.env.MSSQL_ENCRYPT === 'true',
      trustServerCertificate: process.env.MSSQL_TRUST_CERT !== 'false'
    },
    pool: {
      max: parseInt(process.env.MSSQL_POOL_MAX, 10) || 10,
      min: 0,
      idleTimeoutMillis: parseInt(process.env.MSSQL_IDLE_TIMEOUT, 10) || 30000
    }
  };
}

function isDatabaseConfigured(config, query) {
  return (
    !!config.server &&
    !!config.database &&
    !!config.user &&
    !!config.password &&
    !!query
  );
}

function logError(message, err) {
  var details = err && err.message ? err.message : err;
  console.error(message + ': ' + details);
}

function getSeedCallbacks() {
  return [
    {
      id: 150,
      time: '06/19/2025 03:04:44',
      phone: '0823986914',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Technical',
      agent: 'Unassigned',
      waiting: '00:21:55',
      abandonTime: '06/19/2025 00:21:20',
      callbackTime: '-',
      conversation: '-',
      kpi: 'N/A',
      notes: { code: '', tag: '', text: 'Available after call completion' },
      callStatus: { type: 'waiting', text: 'Waiting' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 149,
      time: '06/18/2025 19:40:32',
      phone: '0818112922',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Support',
      agent: 'Unassigned',
      waiting: '00:16:39',
      abandonTime: '06/14/2025 19:08:19',
      callbackTime: '06/15/2025 01:14:37',
      conversation: '00:01:43',
      kpi: '06:06:17',
      notes: { code: 'followup', tag: 'Follow-up', text: 'Follow-up required next week' },
      callStatus: { type: 'called', text: 'Called' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 146,
      time: '06/19/2025 03:40:12',
      phone: '0808940416',
      lastStatus: { type: 'callback', text: 'Callback' },
      skill: 'Technical',
      agent: 'Unassigned',
      waiting: '00:19:55',
      abandonTime: '06/19/2025 13:41:19',
      callbackTime: '06/20/2025 08:59:51',
      conversation: '00:09:55',
      kpi: '19:18:32',
      notes: { code: 'billing', tag: 'Billing Question', text: 'Customer not available at this time' },
      callStatus: { type: 'no-answer', text: 'No Answer' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 145,
      time: '06/18/2025 15:42:16',
      phone: '0824438448',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Support',
      agent: 'Unassigned',
      waiting: '00:05:02',
      abandonTime: '06/16/2025 10:09:11',
      callbackTime: '06/16/2025 15:49:26',
      conversation: '00:08:56',
      kpi: '05:40:14',
      notes: { code: 'billing', tag: 'Billing Question', text: 'Billing inquiry about monthly charges' },
      callStatus: { type: 'called', text: 'Called' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 144,
      time: '06/19/2025 07:28:03',
      phone: '0892671246',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Sales',
      agent: 'Unassigned',
      waiting: '00:03:43',
      abandonTime: '06/14/2025 18:15:43',
      callbackTime: '-',
      conversation: '-',
      kpi: '06:33:39',
      notes: { code: '', tag: '', text: 'Click to add reason & notes' },
      callStatus: { type: 'no-answer', text: 'No Answer' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 143,
      time: '06/19/2025 04:00:40',
      phone: '0833527963',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Support',
      agent: 'Unassigned',
      waiting: '00:13:06',
      abandonTime: '06/14/2025 17:31:48',
      callbackTime: '-',
      conversation: '-',
      kpi: 'N/A',
      notes: { code: '', tag: '', text: 'Available after call completion' },
      callStatus: { type: 'no-answer', text: 'No Answer' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 142,
      time: '06/18/2025 16:32:20',
      phone: '0877654493',
      lastStatus: { type: 'abandon', text: 'Abandon' },
      skill: 'Sales',
      agent: 'Agent-002',
      waiting: '00:01:17',
      abandonTime: '06/13/2025 11:20:29',
      callbackTime: '-',
      conversation: '-',
      kpi: 'N/A',
      notes: { code: '', tag: '', text: 'Available after call completion' },
      callStatus: { type: 'busy', text: 'Busy' },
      action: { type: 'call', text: 'Call' }
    },
    {
      id: 141,
      time: '06/18/2025 09:10:05',
      phone: '0858861200',
      lastStatus: { type: 'callback', text: 'Callback' },
      skill: 'Support',
      agent: 'Agent-004',
      waiting: '00:00:55',
      abandonTime: '-',
      callbackTime: '06/18/2025 09:12:11',
      conversation: '00:04:20',
      kpi: '04:55:10',
      notes: { code: 'escalation', tag: 'Escalation', text: 'Transferred to supervisor for resolution' },
      callStatus: { type: 'calling', text: 'Calling' },
      action: { type: 'disabled', text: 'Calling...' }
    }
  ];
}

function gracefulShutdown() {
  if (pollTimer) {
    clearInterval(pollTimer);
  }
  if (pool && pool.close) {
    pool
      .close()
      .catch(function (err) {
        logError('Error closing MSSQL pool', err);
      })
      .then(function () {
        server.close(function () {
          process.exit(0);
        });
      });
  } else {
    server.close(function () {
      process.exit(0);
    });
  }
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
