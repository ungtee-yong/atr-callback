(function () {
  'use strict';

  var callbacks = [
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
        tag: 'Escalation',
        text: 'Transferred to supervisor for resolution'
      },
      callStatus: { type: 'calling', text: 'Calling' },
      action: { type: 'disabled', text: 'Calling...' }
    }
  ];

  function renderCallbacks() {
    var body = document.getElementById('callbacks-body');
    if (!body) {
      return;
    }

    var rowsHtml = '';
    for (var i = 0; i < callbacks.length; i += 1) {
      var item = callbacks[i];
      rowsHtml += buildRow(item);
    }

    body.innerHTML = rowsHtml;

    var range = document.getElementById('results-range');
    if (range) {
      range.innerHTML = '1-' + callbacks.length + ' of ' + callbacks.length + ' results';
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
      '<td>' + buildNotes(item.notes) + '</td>' +
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

  if (window.attachEvent) {
    window.attachEvent('onload', renderCallbacks);
  } else {
    window.addEventListener('DOMContentLoaded', renderCallbacks, false);
  }
})();
