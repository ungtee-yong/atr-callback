(function () {
  'use strict';

  var reasonLabels = {
    followup: 'Follow-up',
    billing: 'Billing Question',
    escalation: 'Escalation',
    technical: 'Technical Support',
    other: 'Other'
  };

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

  function initializeApp() {
    cacheElements();
    bindEvents();
    renderCallbacks();
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

    addEvent(window, 'keydown', handleKeyDown);
  }

  function renderCallbacks() {
    if (!tableBody) {
      return;
    }

    var rowsHtml = '';
    for (var i = 0; i < callbacks.length; i += 1) {
      rowsHtml += buildRow(callbacks[i]);
    }

    tableBody.innerHTML = rowsHtml;

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
    renderCallbacks();
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
    if (event.keyCode === 27 && isModalVisible) {
      closeModal(event);
    }
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
