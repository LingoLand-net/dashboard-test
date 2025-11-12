// Events handlers
function events_list(params, body, e){
  var rows = getSheetValues('events', 'events');
  return { ok:true, data: rows };
}

function events_create(params, body, e){
  var ev = body.event || {};
  ev.event_id = ev.event_id || generateId('ev_');
  appendRow('events', ev, 'events');
  return { ok:true, data: ev };
}

function events_update(params, body, e){
  var ev = body.event || {};
  if (!ev.event_id) return { ok:false, error:'event_id required' };
  var idx = findRowIndexById('events', 'event_id', ev.event_id, 'events');
  if (idx === -1) return { ok:false, error:'not found' };
  updateRowByIndex('events', idx, ev, 'events');
  return { ok:true, data: ev };
}

function events_delete(params, body, e){
  var id = params.event_id || (body.event && body.event.event_id);
  if (!id) return { ok:false, error:'event_id required' };
  var idx = findRowIndexById('events', 'event_id', id, 'events');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('events');
  var sheet = ss.getSheetByName('events');
  sheet.deleteRow(idx);
  return { ok:true };
}