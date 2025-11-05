(function () {
  'use strict';

  var reasonLabels = {
    followup: 'Follow-up',
    billing: 'Billing Question',
    escalation: 'Escalation',
    technical: 'Technical Support',
    other: 'Other'
  };

  var seedCallbacks = [
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
      notes: {
        code: '',
        tag: '',
        text: 'Available after call completion'
      },
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
      notes: {
        code: 'followup',
        tag: 'Follow-up',
        text: 'Follow-up required next week'
      },
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
      notes: {
        code: 'billing',
        tag: 'Billing Question',
        text: 'Customer not available at this time'
      },
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
      notes: {
        code: 'billing',
        tag: 'Billing Question',
        text: 'Billing inquiry about monthly charges'
      },
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
      notes: {
        code: '',
        tag: '',
        text: 'Click to add reason & notes'
      },
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
      notes: {
        code: '',
        tag: '',
        text: 'Available after call completion'
      },
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
      notes: {
        code: '',
        tag: '',
        text: 'Available after call completion'
      },
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
      notes: {
        code: 'escalation',
        tag: 'Escalation',
        text: 'Transferred to supervisor for resolution'
      },
      callStatus: { type: 'calling', text: 'Calling' },
      action: { type: 'disabled', text: 'Calling...' }
    }
  ];

  var callbacks = seedCallbacks.slice(0);
  var currentList = [];

  var activeFilters = {
    phone: '',
    reason: '',
    fromDate: '',
    fromHour: '',
    fromMinute: '',
    toDate: '',
    toHour: '',
    toMinute: '',
    callStatus: '',
    lastStatus: '',
    skills: [],
    agent: ''
  };

  var noteModal = null;
  var noteBackdrop = null;
  var noteForm = null;
  var noteReason = null;
  var noteText = null;
  var noteCounter = null;
  var noteError = null;
  var tableBody = null;
  var currentNoteId = null;
  var isModalVisible = false;

  var filterModal = null;
  var filterBackdrop = null;
  var filterForm = null;
  var filterPhoneInput = null;
  var filterReasonInput = null;
  var filterFromDateInput = null;
  var filterFromHourSelect = null;
  var filterFromMinuteSelect = null;
  var filterToDateInput = null;
  var filterToHourSelect = null;
  var filterToMinuteSelect = null;
  var filterCallStatusSelect = null;
  var filterLastStatusSelect = null;
  var filterAgentSelect = null;
  var filterClearButton = null;
  var filterButton = null;

  var skillTrigger = null;
  var skillPanel = null;
  var skillCheckboxes = [];
  var selectedSkills = [];

  var calendarContainer = null;
  var calendarLabel = null;
  var calendarGrid = null;
  var calendarPrev = null;
  var calendarNext = null;
  var calendarTargetInput = null;
  var calendarMonth = 0;
  var calendarYear = 0;

  var isFilterModalVisible = false;
  var isCalendarVisible = false;
  var socket = null;

  function initializeApp() {
    cacheElements();
    bindEvents();
    initializeFilters();
    currentList = callbacks.slice(0);
    runFilters();
    setupRealtime();
  }

  function cacheElements() {
    tableBody = document.getElementById('callbacks-body');
    noteModal = document.getElementById('note-modal');
    noteBackdrop = document.getElementById('note-backdrop');
    noteForm = document.getElementById('note-form');
    noteReason = document.getElementById('note-reason');
    noteText = document.getElementById('note-text');
    noteCounter = document.getElementById('note-counter');
    noteError = document.getElementById('note-error');
    filterModal = document.getElementById('filter-modal');
    filterBackdrop = document.getElementById('filter-backdrop');
    filterForm = document.getElementById('filter-form');
    filterPhoneInput = document.getElementById('filter-phone');
    filterReasonInput = document.getElementById('filter-reason');
    filterFromDateInput = document.getElementById('filter-from-date');
    filterFromHourSelect = document.getElementById('filter-from-hour');
    filterFromMinuteSelect = document.getElementById('filter-from-minute');
    filterToDateInput = document.getElementById('filter-to-date');
    filterToHourSelect = document.getElementById('filter-to-hour');
    filterToMinuteSelect = document.getElementById('filter-to-minute');
    filterCallStatusSelect = document.getElementById('filter-call-status');
    filterLastStatusSelect = document.getElementById('filter-last-status');
    filterAgentSelect = document.getElementById('filter-agent');
    filterClearButton = document.getElementById('filter-clear');
    filterButton = document.getElementById('open-filter');
    skillTrigger = document.getElementById('filter-skills-trigger');
    skillPanel = document.getElementById('filter-skills-panel');
    calendarContainer = document.getElementById('filter-calendar');
    calendarLabel = document.getElementById('calendar-label');
    calendarGrid = document.getElementById('calendar-grid');
    calendarPrev = document.getElementById('calendar-prev');
    calendarNext = document.getElementById('calendar-next');
  }

  function bindEvents() {
    if (tableBody) {
      addEvent(tableBody, 'click', handleTableClick);
    }

    if (noteForm) {
      addEvent(noteForm, 'submit', handleNoteSubmit);
    }

    var cancelButton = document.getElementById('note-cancel');
    if (cancelButton) {
      addEvent(cancelButton, 'click', closeModal);
    }

    if (noteBackdrop) {
      addEvent(noteBackdrop, 'click', closeModal);
    }

    if (noteReason) {
      addEvent(noteReason, 'change', clearNoteError);
    }

    if (noteText) {
      addEvent(noteText, 'keyup', handleNoteInput);
      addEvent(noteText, 'input', handleNoteInput);
    }

    if (filterForm) {
      addEvent(filterForm, 'submit', handleFilterSubmit);
    }

    if (filterClearButton) {
      addEvent(filterClearButton, 'click', handleFilterClear);
    }

    if (filterBackdrop) {
      addEvent(filterBackdrop, 'click', closeFilterModal);
    }

    if (filterButton) {
      addEvent(filterButton, 'click', openFilterModal);
    }

    if (skillTrigger) {
      addEvent(skillTrigger, 'click', toggleSkillPanel);
    }

    if (calendarPrev) {
      addEvent(calendarPrev, 'click', handleCalendarPrev);
    }

    if (calendarNext) {
      addEvent(calendarNext, 'click', handleCalendarNext);
    }

    if (calendarGrid) {
      addEvent(calendarGrid, 'click', handleCalendarGridClick);
    }

    addEvent(window, 'keydown', handleKeyDown);
    addEvent(document, 'click', handleDocumentClick);
  }

  function renderCallbacks() {
    if (!tableBody) {
      return;
    }

    var rowsHtml = '';
    for (var i = 0; i < currentList.length; i += 1) {
      rowsHtml += buildRow(currentList[i]);
    }

    tableBody.innerHTML = rowsHtml;

    var range = document.getElementById('results-range');
    if (range) {
      if (currentList.length === 0) {
        range.innerHTML = '0 results';
      } else {
        range.innerHTML = '1-' + currentList.length + ' of ' + currentList.length + ' results';
      }
    }
  }

  function buildRow(item) {
    return (
      '<tr>' +
      '<td>' + item.id + '</td>' +
      '<td>' + item.time + '</td>' +
      '<td>' + formatPhone(item.phone) + '</td>' +
      '<td>' + buildStatusChip(item.lastStatus) + '</td>' +
      '<td>' + item.skill + '</td>' +
      '<td>' + item.agent + '</td>' +
      '<td>' + item.waiting + '</td>' +
      '<td>' + item.abandonTime + '</td>' +
      '<td>' + item.callbackTime + '</td>' +
      '<td>' + item.conversation + '</td>' +
      '<td>' + item.kpi + '</td>' +
      '<td class="note-cell" data-note-id="' + item.id + '">' + buildNotes(item.notes) + '</td>' +
      '<td>' + buildCallStatus(item.callStatus) + '</td>' +
      '<td>' + buildAction(item.action) + '</td>' +
      '</tr>'
    );
  }

  function buildStatusChip(status) {
    if (!status) {
      return '-';
    }
    var type = status.type ? ' ' + status.type : '';
    return '<span class="status-chip' + type + '">' + status.text + '</span>';
  }

  function buildNotes(notes) {
    if (!notes) {
      return '';
    }
    var html = '';
    if (notes.tag) {
      html += '<span class="note-tag">' + notes.tag + '</span>';
    }
    if (notes.text) {
      html += '<span class="note-text">' + notes.text + '</span>';
    }
    return html;
  }

  function buildCallStatus(status) {
    if (!status) {
      return '-';
    }
    var type = status.type ? ' ' + status.type : '';
    return (
      '<span class="call-status' + type + '"><span class="status-dot-small"></span>' +
      '<span>' + status.text + '</span></span>'
    );
  }

  function buildAction(action) {
    if (!action) {
      return '';
    }
    if (action.type === 'disabled') {
      return '<button class="action-disabled" type="button" disabled="disabled">' + action.text + '</button>';
    }
    return '<button class="action-call" type="button">' + action.text + '</button>';
  }

  function setupRealtime() {
    if (socket || typeof window.io !== 'function') {
      if (!socket && typeof window.io !== 'function') {
        logInfo('Socket.io client not available; skipping realtime updates.');
      }
      return;
    }

    try {
      socket = window.io({ transports: ['websocket', 'polling'] });
    } catch (err) {
      logInfo('Failed to initialise realtime connection: ' + (err && err.message ? err.message : err));
      socket = null;
      return;
    }

    socket.on('callbacks:update', function (payload) {
      var normalized = normalizeIncomingCallbacks(payload);
      if (normalized !== null) {
        setCallbacks(normalized);
      }
    });

    socket.on('connect_error', function (err) {
      logInfo('Realtime connection error: ' + (err && err.message ? err.message : err));
    });

    socket.on('reconnect', function () {
      logInfo('Realtime connection re-established.');
    });
  }

  function initializeFilters() {
    populateTimeSelect(filterFromHourSelect, 23, 1);
    populateTimeSelect(filterToHourSelect, 23, 1);
    populateTimeSelect(filterFromMinuteSelect, 55, 5);
    populateTimeSelect(filterToMinuteSelect, 55, 5);
    populateCallStatusOptions();
    populateAgentOptions();
    buildSkillOptions(getUniqueSkills());
    attachCalendarTriggers();
    populateFilterFormFromState();
  }

  function populateTimeSelect(selectElement, maxValue, step) {
    if (!selectElement) {
      return;
    }
    var existingLength = selectElement.options ? selectElement.options.length : 0;
    while (existingLength > 1) {
      selectElement.remove(1);
      existingLength -= 1;
    }
    for (var value = 0; value <= maxValue; value += step) {
      var option = document.createElement('option');
      option.value = padNumber(value);
      option.innerHTML = padNumber(value);
      selectElement.appendChild(option);
    }
  }

  function populateCallStatusOptions() {
    if (!filterCallStatusSelect) {
      return;
    }
    clearSelectOptions(filterCallStatusSelect);
    var statuses = getUniqueCallStatuses();
    for (var i = 0; i < statuses.length; i += 1) {
      appendOption(filterCallStatusSelect, statuses[i]);
    }
  }

  function populateAgentOptions() {
    if (!filterAgentSelect) {
      return;
    }
    clearSelectOptions(filterAgentSelect);
    var agents = getUniqueAgents();
    for (var i = 0; i < agents.length; i += 1) {
      appendOption(filterAgentSelect, agents[i]);
    }
  }

  function clearSelectOptions(selectElement) {
    if (!selectElement || !selectElement.options) {
      return;
    }
    while (selectElement.options.length > 1) {
      selectElement.remove(1);
    }
  }

  function appendOption(selectElement, value) {
    if (!selectElement) {
      return;
    }
    var option = document.createElement('option');
    option.value = value;
    option.innerHTML = value;
    selectElement.appendChild(option);
  }

  function buildSkillOptions(skills) {
    if (!skillPanel) {
      return;
    }
    skillPanel.innerHTML = '';
    skillCheckboxes = [];
    for (var i = 0; i < skills.length; i += 1) {
      var label = document.createElement('label');
      label.className = 'multi-select-option';
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = skills[i];
      checkbox.name = 'filter-skill';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(skills[i]));
      skillPanel.appendChild(label);
      skillCheckboxes.push(checkbox);
      addEvent(checkbox, 'change', handleSkillChange);
    }
  }

  function attachCalendarTriggers() {
    var triggers = document.getElementsByClassName('calendar-trigger');
    for (var i = 0; i < triggers.length; i += 1) {
      addEvent(triggers[i], 'click', handleCalendarTrigger);
    }
  }

  function populateFilterFormFromState() {
    if (filterPhoneInput) {
      filterPhoneInput.value = activeFilters.phone;
    }
    if (filterReasonInput) {
      filterReasonInput.value = activeFilters.reason;
    }
    if (filterFromDateInput) {
      filterFromDateInput.value = activeFilters.fromDate;
    }
    if (filterFromHourSelect) {
      filterFromHourSelect.value = activeFilters.fromHour;
    }
    if (filterFromMinuteSelect) {
      filterFromMinuteSelect.value = activeFilters.fromMinute;
    }
    if (filterToDateInput) {
      filterToDateInput.value = activeFilters.toDate;
    }
    if (filterToHourSelect) {
      filterToHourSelect.value = activeFilters.toHour;
    }
    if (filterToMinuteSelect) {
      filterToMinuteSelect.value = activeFilters.toMinute;
    }
    if (filterCallStatusSelect) {
      filterCallStatusSelect.value = activeFilters.callStatus;
    }
    if (filterLastStatusSelect) {
      filterLastStatusSelect.value = activeFilters.lastStatus;
    }
    if (filterAgentSelect) {
      filterAgentSelect.value = activeFilters.agent;
    }
    selectedSkills = activeFilters.skills.slice(0);
    syncSkillCheckboxes();
    updateSkillDisplay();
  }

  function setCallbacks(items) {
    if (items && typeof items.length === 'number') {
      callbacks = items.slice(0);
    } else {
      callbacks = [];
    }
    refreshFiltersAfterData();
    runFilters();
  }

  function refreshFiltersAfterData() {
    populateCallStatusOptions();
    if (filterCallStatusSelect) {
      filterCallStatusSelect.value = activeFilters.callStatus;
    }
    populateAgentOptions();
    if (filterAgentSelect) {
      filterAgentSelect.value = activeFilters.agent;
    }
    var skillsReference = isFilterModalVisible ? selectedSkills.slice(0) : activeFilters.skills.slice(0);
    buildSkillOptions(getUniqueSkills());
    selectedSkills = skillsReference;
    syncSkillCheckboxes();
    updateSkillDisplay();
  }

  function runFilters() {
    var phoneFilter = trimValue(activeFilters.phone).replace(/\D/g, '');
    var reasonFilter = trimValue(activeFilters.reason).toLowerCase();
    var callFilter = trimValue(activeFilters.callStatus).toLowerCase();
    var lastFilter = trimValue(activeFilters.lastStatus).toLowerCase();
    var agentFilter = trimValue(activeFilters.agent).toLowerCase();
    var skillsFilter = [];
    var i;
    for (i = 0; i < activeFilters.skills.length; i += 1) {
      skillsFilter.push(activeFilters.skills[i].toLowerCase());
    }

    var fromTimestamp = buildFilterTimestamp(activeFilters.fromDate, activeFilters.fromHour, activeFilters.fromMinute);
    var toTimestamp = buildFilterTimestamp(activeFilters.toDate, activeFilters.toHour, activeFilters.toMinute);
    if (toTimestamp !== null) {
      toTimestamp += 59999;
    }

    var list = [];
    for (i = 0; i < callbacks.length; i += 1) {
      var item = callbacks[i];
      var include = true;
      var itemPhone = item.phone ? item.phone.replace(/\D/g, '') : '';

      if (phoneFilter && itemPhone.indexOf(phoneFilter) === -1) {
        include = false;
      }

      if (include && reasonFilter) {
        var tagValue = item.notes && item.notes.tag ? item.notes.tag.toLowerCase() : '';
        var noteValue = item.notes && item.notes.text ? item.notes.text.toLowerCase() : '';
        if (tagValue.indexOf(reasonFilter) === -1 && noteValue.indexOf(reasonFilter) === -1) {
          include = false;
        }
      }

      var itemTimestamp = null;
      if (include && (fromTimestamp !== null || toTimestamp !== null)) {
        itemTimestamp = parseItemTime(item.time);
        if (itemTimestamp === null) {
          include = false;
        }
      }

      if (include && fromTimestamp !== null && itemTimestamp < fromTimestamp) {
        include = false;
      }

      if (include && toTimestamp !== null && itemTimestamp > toTimestamp) {
        include = false;
      }

      if (include && callFilter) {
        var callStatus = item.callStatus && item.callStatus.text ? item.callStatus.text.toLowerCase() : '';
        if (callStatus !== callFilter) {
          include = false;
        }
      }

      if (include && lastFilter) {
        var lastStatus = item.lastStatus && item.lastStatus.text ? item.lastStatus.text.toLowerCase() : '';
        if (lastStatus !== lastFilter) {
          include = false;
        }
      }

      if (include && skillsFilter.length > 0) {
        var skillValue = item.skill ? item.skill.toLowerCase() : '';
        if (indexOfValue(skillsFilter, skillValue) === -1) {
          include = false;
        }
      }

      if (include && agentFilter) {
        var agentValue = item.agent ? item.agent.toLowerCase() : '';
        if (agentValue !== agentFilter) {
          include = false;
        }
      }

      if (include) {
        list.push(item);
      }
    }

    currentList = list;
    renderCallbacks();
  }

  function buildFilterTimestamp(dateValue, hourValue, minuteValue) {
    if (!dateValue) {
      return null;
    }
    var parts = dateValue.split('-');
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
      hour = 0;
    }
    if (isNaN(minute)) {
      minute = 0;
    }
    var dateObject = new Date(year, month, day, hour, minute, 0);
    return dateObject.getTime();
  }

  function parseItemTime(value) {
    if (!value || value === '-') {
      return null;
    }
    var segments = value.split(' ');
    if (segments.length === 0) {
      return null;
    }
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
    return dateObject.getTime();
  }

  function getUniqueCallStatuses() {
    var lookup = {};
    var results = [];
    for (var i = 0; i < callbacks.length; i += 1) {
      var status = callbacks[i].callStatus && callbacks[i].callStatus.text ? callbacks[i].callStatus.text : '';
      if (status && !lookup[status]) {
        lookup[status] = true;
        results.push(status);
      }
    }
    return results;
  }

  function getUniqueAgents() {
    var lookup = {};
    var results = [];
    for (var i = 0; i < callbacks.length; i += 1) {
      var agent = callbacks[i].agent || '';
      if (agent && !lookup[agent]) {
        lookup[agent] = true;
        results.push(agent);
      }
    }
    return results;
  }

  function getUniqueSkills() {
    var lookup = {};
    var results = [];
    for (var i = 0; i < callbacks.length; i += 1) {
      var skill = callbacks[i].skill || '';
      if (skill && !lookup[skill]) {
        lookup[skill] = true;
        results.push(skill);
      }
    }
    return results;
  }

  function syncSkillCheckboxes() {
    for (var i = 0; i < skillCheckboxes.length; i += 1) {
      var checkbox = skillCheckboxes[i];
      if (!checkbox) {
        continue;
      }
      checkbox.checked = indexOfValue(selectedSkills, checkbox.value) !== -1;
    }
  }

  function updateSkillDisplay() {
    if (!skillTrigger) {
      return;
    }
    if (!selectedSkills || selectedSkills.length === 0) {
      skillTrigger.innerHTML = 'All skills';
      return;
    }
    if (selectedSkills.length === 1) {
      skillTrigger.innerHTML = selectedSkills[0];
      return;
    }
    if (selectedSkills.length === 2) {
      skillTrigger.innerHTML = selectedSkills[0] + ', ' + selectedSkills[1];
      return;
    }
    var remainder = selectedSkills.length - 1;
    skillTrigger.innerHTML = selectedSkills[0] + ' +' + remainder + ' more';
  }

  function toggleSkillPanel(event) {
    event = preventDefault(event);
    stopPropagation(event);
    if (!skillPanel) {
      return false;
    }
    if (hasClass(skillPanel, 'hidden')) {
      openSkillPanel();
    } else {
      closeSkillPanel();
    }
    return false;
  }

  function openSkillPanel() {
    if (!skillPanel) {
      return;
    }
    syncSkillCheckboxes();
    removeClass(skillPanel, 'hidden');
  }

  function closeSkillPanel() {
    if (!skillPanel) {
      return;
    }
    addClass(skillPanel, 'hidden');
  }

  function handleSkillChange(event) {
    var checkbox = event.target || event.srcElement;
    if (!checkbox) {
      return;
    }
    var value = checkbox.value;
    if (checkbox.checked) {
      if (indexOfValue(selectedSkills, value) === -1) {
        selectedSkills.push(value);
      }
    } else {
      removeValue(selectedSkills, value);
    }
    updateSkillDisplay();
  }

  function openFilterModal(event) {
    if (event) {
      preventDefault(event);
      stopPropagation(event);
    }
    if (!filterModal || !filterBackdrop) {
      return false;
    }
    populateFilterFormFromState();
    removeClass(filterModal, 'hidden');
    removeClass(filterBackdrop, 'hidden');
    isFilterModalVisible = true;
    hideCalendar();
    closeSkillPanel();
    if (filterPhoneInput && filterPhoneInput.focus) {
      filterPhoneInput.focus();
    }
    return false;
  }

  function closeFilterModal(event) {
    if (event) {
      preventDefault(event);
    }
    if (!filterModal || !filterBackdrop) {
      return false;
    }
    addClass(filterModal, 'hidden');
    addClass(filterBackdrop, 'hidden');
    isFilterModalVisible = false;
    hideCalendar();
    closeSkillPanel();
    populateFilterFormFromState();
    return false;
  }

  function handleFilterSubmit(event) {
    event = preventDefault(event);
    if (filterPhoneInput) {
      activeFilters.phone = trimValue(filterPhoneInput.value);
    }
    if (filterReasonInput) {
      activeFilters.reason = trimValue(filterReasonInput.value);
    }
    if (filterFromDateInput) {
      activeFilters.fromDate = trimValue(filterFromDateInput.value);
    }
    if (filterFromHourSelect) {
      activeFilters.fromHour = trimValue(filterFromHourSelect.value);
    }
    if (filterFromMinuteSelect) {
      activeFilters.fromMinute = trimValue(filterFromMinuteSelect.value);
    }
    if (filterToDateInput) {
      activeFilters.toDate = trimValue(filterToDateInput.value);
    }
    if (filterToHourSelect) {
      activeFilters.toHour = trimValue(filterToHourSelect.value);
    }
    if (filterToMinuteSelect) {
      activeFilters.toMinute = trimValue(filterToMinuteSelect.value);
    }
    if (filterCallStatusSelect) {
      activeFilters.callStatus = trimValue(filterCallStatusSelect.value);
    }
    if (filterLastStatusSelect) {
      activeFilters.lastStatus = trimValue(filterLastStatusSelect.value);
    }
    if (filterAgentSelect) {
      activeFilters.agent = trimValue(filterAgentSelect.value);
    }
    activeFilters.skills = selectedSkills.slice(0);
    runFilters();
    closeFilterModal();
    return false;
  }

  function handleFilterClear(event) {
    event = preventDefault(event);
    resetActiveFilters();
    selectedSkills = [];
    populateFilterFormFromState();
    runFilters();
    return false;
  }

  function resetActiveFilters() {
    activeFilters.phone = '';
    activeFilters.reason = '';
    activeFilters.fromDate = '';
    activeFilters.fromHour = '';
    activeFilters.fromMinute = '';
    activeFilters.toDate = '';
    activeFilters.toHour = '';
    activeFilters.toMinute = '';
    activeFilters.callStatus = '';
    activeFilters.lastStatus = '';
    activeFilters.skills = [];
    activeFilters.agent = '';
  }

  function handleCalendarTrigger(event) {
    event = preventDefault(event);
    stopPropagation(event);
    var trigger = event.target || event.srcElement;
    if (!trigger) {
      return false;
    }
    var targetId = trigger.getAttribute('data-target');
    if (!targetId) {
      return false;
    }
    var input = document.getElementById(targetId);
    if (!input) {
      return false;
    }
    openCalendar(trigger, input);
    return false;
  }

  function openCalendar(trigger, input) {
    if (!calendarContainer) {
      return;
    }
    calendarTargetInput = input;
    var parsed = parseInputDate(input.value);
    if (parsed) {
      calendarYear = parsed.year;
      calendarMonth = parsed.month;
    } else {
      var today = new Date();
      calendarYear = today.getFullYear();
      calendarMonth = today.getMonth();
    }
    renderCalendar(calendarYear, calendarMonth, input.value);
    setCalendarPosition(trigger);
    removeClass(calendarContainer, 'hidden');
    isCalendarVisible = true;
  }

  function setCalendarPosition(trigger) {
    if (!calendarContainer) {
      return;
    }
    var parent = calendarContainer.offsetParent;
    if (!parent) {
      return;
    }
    var triggerRect = trigger.getBoundingClientRect();
    var parentRect = parent.getBoundingClientRect();
    var scrollTop = parent.scrollTop || 0;
    var scrollLeft = parent.scrollLeft || 0;
    var top = triggerRect.bottom - parentRect.top + scrollTop + 4;
    var left = triggerRect.left - parentRect.left + scrollLeft;
    calendarContainer.style.top = top + 'px';
    calendarContainer.style.left = left + 'px';
  }

  function renderCalendar(year, month, selectedValue) {
    if (!calendarLabel || !calendarGrid) {
      return;
    }
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    calendarLabel.innerHTML = monthNames[month] + ' ' + year;
    var firstDay = new Date(year, month, 1);
    var startingDay = firstDay.getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var selectedParts = parseInputDate(selectedValue);
    var rows = '';
    var day = 1;
    for (var i = 0; i < 6; i += 1) {
      rows += '<tr>';
      for (var j = 0; j < 7; j += 1) {
        var cellIndex = i * 7 + j;
        if (cellIndex < startingDay || day > daysInMonth) {
          rows += '<td><div class="calendar-day-empty"></div></td>';
        } else {
          var classes = 'calendar-day';
          if (selectedParts && selectedParts.year === year && selectedParts.month === month && selectedParts.day === day) {
            classes += ' selected';
          }
          rows += '<td><button type="button" class="' + classes + '" data-day="' + day + '">' + day + '</button></td>';
          day += 1;
        }
      }
      rows += '</tr>';
    }
    calendarGrid.innerHTML = rows;
  }

  function handleCalendarPrev(event) {
    event = preventDefault(event);
    if (!isCalendarVisible) {
      return false;
    }
    calendarMonth -= 1;
    if (calendarMonth < 0) {
      calendarMonth = 11;
      calendarYear -= 1;
    }
    renderCalendar(calendarYear, calendarMonth, calendarTargetInput ? calendarTargetInput.value : '');
    return false;
  }

  function handleCalendarNext(event) {
    event = preventDefault(event);
    if (!isCalendarVisible) {
      return false;
    }
    calendarMonth += 1;
    if (calendarMonth > 11) {
      calendarMonth = 0;
      calendarYear += 1;
    }
    renderCalendar(calendarYear, calendarMonth, calendarTargetInput ? calendarTargetInput.value : '');
    return false;
  }

  function handleCalendarGridClick(event) {
    var target = event.target || event.srcElement;
    if (!target || !hasClass(target, 'calendar-day') || hasClass(target, 'disabled')) {
      return;
    }
    var dayValue = parseInt(target.getAttribute('data-day'), 10);
    if (isNaN(dayValue) || !calendarTargetInput) {
      return;
    }
    var formatted = formatCalendarDate(calendarYear, calendarMonth, dayValue);
    calendarTargetInput.value = formatted;
    hideCalendar();
  }

  function hideCalendar() {
    if (!calendarContainer) {
      return;
    }
    addClass(calendarContainer, 'hidden');
    isCalendarVisible = false;
    calendarTargetInput = null;
  }

  function formatCalendarDate(year, month, day) {
    return year + '-' + padNumber(month + 1) + '-' + padNumber(day);
  }

  function parseInputDate(value) {
    if (!value) {
      return null;
    }
    var parts = value.split('-');
    if (parts.length !== 3) {
      return null;
    }
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return null;
    }
    return { year: year, month: month, day: day };
  }

  function normalizeIncomingCallbacks(payload) {
    if (payload === undefined || payload === null) {
      return [];
    }

    var data = convertToArray(payload);
    if (data === null) {
      return null;
    }

    var normalized = [];
    for (var i = 0; i < data.length; i += 1) {
      var source = data[i] || {};

      var idValue = pickValue(source, ['id', 'Id', 'ID']);
      if (idValue === undefined || idValue === null || idValue === '') {
        idValue = i + 1;
      }

      var timeValue = pickValue(source, ['time', 'Time', 'timeStamp', 'TimeStamp', 'timestamp']);
      var phoneValue = toStringSafeClient(pickValue(source, ['phone', 'Phone', 'contactNumber']));
      var waitingValue = toStringSafeClient(pickValue(source, ['waiting', 'Waiting']));
      var skillValue = toStringSafeClient(pickValue(source, ['skill', 'Skill', 'queue']));
      var agentValue = toStringSafeClient(pickValue(source, ['agent', 'Agent', 'assignedAgent']));
      if (!agentValue) {
        agentValue = 'Unassigned';
      }
      var abandonTimeValue = pickValue(source, ['abandonTime', 'AbandonTime']);
      var callbackTimeValue = pickValue(source, ['callbackTime', 'CallbackTime']);
      var conversationValue = toStringSafeClient(pickValue(source, ['conversation', 'Conversation', 'conversationDuration']));
      var kpiValue = toStringSafeClient(pickValue(source, ['kpi', 'Kpi', 'KPI']));

      var notesData = source.notes && typeof source.notes === 'object' ? source.notes : null;
      var reasonCodeValue = toStringSafeClient(pickValue(notesData, ['code'])) || toStringSafeClient(pickValue(source, ['reasonCode', 'ReasonCode']));
      var reasonTagValue = toStringSafeClient(pickValue(notesData, ['tag'])) || toStringSafeClient(pickValue(source, ['reasonTag', 'ReasonTag', 'Reason', 'ReasonLabel']));
      var notesValue = toStringSafeClient(pickValue(notesData, ['text'])) || toStringSafeClient(pickValue(source, ['notes', 'Notes', 'Note', 'NoteText']));

      var lastStatusData = source.lastStatus && typeof source.lastStatus === 'object' ? source.lastStatus : null;
      var lastStatusText = toStringSafeClient(pickValue(lastStatusData, ['text'])) || toStringSafeClient(pickValue(source, ['lastStatus', 'LastStatus']));
      var lastStatusType = toStringSafeClient(pickValue(lastStatusData, ['type']));
      if (!lastStatusType) {
        lastStatusType = normalizeStatusType(lastStatusText);
      }

      var callStatusData = source.callStatus && typeof source.callStatus === 'object' ? source.callStatus : null;
      var callStatusText = toStringSafeClient(pickValue(callStatusData, ['text'])) || toStringSafeClient(pickValue(source, ['callStatus', 'CallStatus', 'Status']));
      var callStatusType = toStringSafeClient(pickValue(callStatusData, ['type']));
      if (!callStatusType) {
        callStatusType = normalizeStatusType(callStatusText);
      }

      var actionData = source.action && typeof source.action === 'object' ? source.action : null;
      var actionType = toStringSafeClient(pickValue(actionData, ['type']));
      var actionText = toStringSafeClient(pickValue(actionData, ['text']));
      if (!actionType || !actionText) {
        var fallbackAction = clientBuildActionFromStatus(callStatusText);
        actionType = actionType || fallbackAction.type;
        actionText = actionText || fallbackAction.text;
      }

      normalized.push({
        id: idValue,
        time: formatDateTimeClient(timeValue),
        phone: phoneValue || '-',
        lastStatus: {
          type: normalizeStatusType(lastStatusText),
          text: lastStatusText || '-'
        },
        skill: skillValue || '',
        agent: agentValue || 'Unassigned',
        waiting: waitingValue || '-',
        abandonTime: formatDateTimeClient(abandonTimeValue),
        callbackTime: formatDateTimeClient(callbackTimeValue),
        conversation: conversationValue || '-',
        kpi: kpiValue || 'N/A',
        notes: {
          code: reasonCodeValue,
          tag: reasonTagValue,
          text: notesValue
        },
        callStatus: {
          type: normalizeStatusType(callStatusText),
          text: callStatusText || '-'
        },
        action: {
          type: actionType,
          text: actionText
        }
      });
    }

    return normalized;
  }

  function convertToArray(payload) {
    if (payload && typeof payload.length === 'number') {
      return payload;
    }
    if (payload && payload.recordset && typeof payload.recordset.length === 'number') {
      return payload.recordset;
    }
    if (payload && payload.data && typeof payload.data.length === 'number') {
      return payload.data;
    }
    if (payload === null || payload === undefined) {
      return null;
    }
    return null;
  }

  function pickValue(source, keys) {
    if (!source || typeof source !== 'object') {
      return null;
    }
    for (var i = 0; i < keys.length; i += 1) {
      var key = keys[i];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        var value = source[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
    }
    return null;
  }

  function toStringSafeClient(value) {
    if (value === undefined || value === null) {
      return '';
    }
    if (value instanceof Date) {
      return formatDateTimeClient(value);
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    return String(value);
  }

  function formatDateTimeClient(value) {
    if (!value && value !== 0) {
      return '-';
    }
    if (value instanceof Date) {
      return formatDateParts(value);
    }
    if (typeof value === 'number') {
      var numericDate = new Date(value);
      if (!isNaN(numericDate.getTime())) {
        return formatDateParts(numericDate);
      }
    }
    if (typeof value === 'string') {
      return value;
    }
    return String(value);
  }

  function formatDateParts(date) {
    return (
      padNumber(date.getMonth() + 1) +
      '/' +
      padNumber(date.getDate()) +
      '/' +
      date.getFullYear() +
      ' ' +
      padNumber(date.getHours()) +
      ':' +
      padNumber(date.getMinutes()) +
      ':' +
      padNumber(date.getSeconds())
    );
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

  function clientBuildActionFromStatus(statusText) {
    var label = (statusText || '').toLowerCase();
    if (label === 'calling') {
      return { type: 'disabled', text: 'Calling...' };
    }
    return { type: 'call', text: 'Call' };
  }

  function logInfo(message) {
    if (window.console && console.log) {
      console.log(message);
    }
  }

  function handleDocumentClick(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;
    if (!isFilterModalVisible) {
      return;
    }
    if (skillPanel && !hasClass(skillPanel, 'hidden') && !isDescendant(skillPanel, target) && target !== skillTrigger && !isDescendant(skillTrigger, target)) {
      closeSkillPanel();
    }
    if (isCalendarVisible && calendarContainer && !isDescendant(calendarContainer, target) && !hasClass(target, 'calendar-trigger')) {
      hideCalendar();
    }
  }

  function handleTableClick(event) {
    event = event || window.event;
    var target = event.target || event.srcElement;

    while (target && target !== tableBody && target.tagName !== 'TD') {
      target = target.parentNode;
    }

    if (!target || target === tableBody) {
      return;
    }

    if (!isNoteCell(target)) {
      return;
    }

    var idValue = target.getAttribute('data-note-id');
    if (!idValue) {
      return;
    }

    var numericId = parseInt(idValue, 10);
    if (isNaN(numericId)) {
      return;
    }

    openModal(findCallbackById(numericId));
  }

  function isNoteCell(node) {
    var className = node.className || '';
    return className.indexOf('note-cell') !== -1;
  }

  function findCallbackById(id) {
    for (var i = 0; i < callbacks.length; i += 1) {
      if (callbacks[i].id === id) {
        return callbacks[i];
      }
    }
    return null;
  }

  function openModal(item) {
    if (!item || !noteModal || !noteBackdrop) {
      return;
    }

    currentNoteId = item.id;

    var code = '';
    if (item.notes) {
      code = item.notes.code || getReasonValueFromTag(item.notes.tag || '');
    }

    if (noteReason) {
      noteReason.value = code || '';
    }

    if (noteText) {
      noteText.value = item.notes && item.notes.text ? item.notes.text : '';
    }

    clearNoteError();
    updateNoteCounter();

    removeClass(noteModal, 'hidden');
    removeClass(noteBackdrop, 'hidden');
    isModalVisible = true;

    if (noteReason && noteReason.focus) {
      noteReason.focus();
    }
  }

  function closeModal(event) {
    if (event && event.preventDefault) {
      event.preventDefault();
    } else if (event) {
      event.returnValue = false;
    }

    if (!noteModal || !noteBackdrop) {
      return;
    }

    addClass(noteModal, 'hidden');
    addClass(noteBackdrop, 'hidden');
    isModalVisible = false;
    currentNoteId = null;

    if (noteForm && noteForm.reset) {
      noteForm.reset();
    }

    clearNoteError();
    updateNoteCounter();
  }

  function handleNoteSubmit(event) {
    event = preventDefault(event);

    if (currentNoteId === null) {
      closeModal();
      return false;
    }

    var reasonValue = noteReason ? noteReason.value : '';
    var textValue = noteText ? noteText.value : '';
    var trimmedText = trimValue(textValue);

    if (!reasonValue) {
      setNoteError('Please select a reason.');
      if (noteReason && noteReason.focus) {
        noteReason.focus();
      }
      return false;
    }

    if (!trimmedText) {
      setNoteError('Please enter notes (up to 250 characters).');
      if (noteText && noteText.focus) {
        noteText.focus();
      }
      return false;
    }

    var label = getReasonLabel(reasonValue);
    updateCallbackNotes(currentNoteId, reasonValue, label, trimmedText);

    closeModal();
    runFilters();
    return false;
  }

  function updateCallbackNotes(id, code, label, text) {
    for (var i = 0; i < callbacks.length; i += 1) {
      if (callbacks[i].id === id) {
        callbacks[i].notes = callbacks[i].notes || {};
        callbacks[i].notes.code = code;
        callbacks[i].notes.tag = label;
        callbacks[i].notes.text = text;
        break;
      }
    }
  }

  function getReasonLabel(value) {
    return reasonLabels[value] || '';
  }

  function getReasonValueFromTag(tag) {
    for (var key in reasonLabels) {
      if (reasonLabels.hasOwnProperty(key) && reasonLabels[key] === tag) {
        return key;
      }
    }
    return '';
  }

  function handleNoteInput() {
    clearNoteError();
    updateNoteCounter();
  }

  function updateNoteCounter() {
    if (!noteCounter) {
      return;
    }
    var count = 0;
    if (noteText && typeof noteText.value === 'string') {
      count = noteText.value.length;
    }
    noteCounter.innerHTML = count + ' / 250';
  }

  function setNoteError(message) {
    if (noteError) {
      noteError.innerHTML = message;
    }
  }

  function clearNoteError() {
    setNoteError('');
  }

  function handleKeyDown(event) {
    event = event || window.event;
    if (event.keyCode === 27) {
      if (isCalendarVisible) {
        hideCalendar();
        return;
      }
      if (isFilterModalVisible) {
        closeFilterModal(event);
        return;
      }
      if (isModalVisible) {
        closeModal(event);
      }
    }
  }

  function padNumber(value) {
    return value < 10 ? '0' + value : String(value);
  }

  function indexOfValue(array, value) {
    if (!array) {
      return -1;
    }
    for (var i = 0; i < array.length; i += 1) {
      if (array[i] === value) {
        return i;
      }
    }
    return -1;
  }

  function removeValue(array, value) {
    if (!array) {
      return;
    }
    for (var i = array.length - 1; i >= 0; i -= 1) {
      if (array[i] === value) {
        array.splice(i, 1);
      }
    }
  }

  function stopPropagation(event) {
    if (!event) {
      return;
    }
    if (event.stopPropagation) {
      event.stopPropagation();
    } else {
      event.cancelBubble = true;
    }
  }

  function hasClass(element, className) {
    if (!element || !className || !element.className) {
      return false;
    }
    return new RegExp('(^|\\s)' + className + '(\\s|$)').test(element.className);
  }

  function isDescendant(parent, child) {
    if (!parent || !child) {
      return false;
    }
    var node = child;
    while (node) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  }

  function formatPhone(phone) {
    if (!phone) {
      return '-';
    }
    var cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.substr(0, 4) + ' ' + cleaned.substr(4, 3) + ' ' + cleaned.substr(7);
    }
    return phone;
  }

  function addEvent(element, type, handler) {
    if (!element) {
      return;
    }
    if (element.addEventListener) {
      element.addEventListener(type, handler, false);
    } else if (element.attachEvent) {
      element.attachEvent('on' + type, handler);
    }
  }

  function removeClass(element, className) {
    if (!element || !className) {
      return;
    }
    var pattern = new RegExp('(^|\\s)' + className + '(\\s|$)', 'g');
    element.className = (element.className || '').replace(pattern, ' ').replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
  }

  function addClass(element, className) {
    if (!element || !className) {
      return;
    }
    var current = element.className || '';
    if (current.indexOf(className) === -1) {
      element.className = current ? current + ' ' + className : className;
    }
  }

  function trimValue(value) {
    if (value === null || value === undefined) {
      return '';
    }
    return String(value).replace(/^\s+|\s+$/g, '');
  }

  function preventDefault(event) {
    event = event || window.event;
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    return event;
  }

  if (window.attachEvent) {
    window.attachEvent('onload', initializeApp);
  } else {
    window.addEventListener('DOMContentLoaded', initializeApp, false);
  }
})();
