// Contacts handlers
function contacts_list(params, body, e){
  var rows = getSheetValues('contacts', 'contacts');
  return { ok:true, data: rows };
}

function contacts_create(params, body, e){
  var c = body.contact || {};
  c.contact_id = c.contact_id || generateId('con_');
  appendRow('contacts', c, 'contacts');
  return { ok:true, data: c };
}

function contacts_update(params, body, e){
  var c = body.contact || {};
  if (!c.contact_id) return { ok:false, error:'contact_id required' };
  var idx = findRowIndexById('contacts', 'contact_id', c.contact_id, 'contacts');
  if (idx === -1) return { ok:false, error:'not found' };
  updateRowByIndex('contacts', idx, c, 'contacts');
  return { ok:true, data: c };
}

function contacts_delete(params, body, e){
  var id = params.contact_id || (body.contact && body.contact.contact_id);
  if (!id) return { ok:false, error:'contact_id required' };
  var idx = findRowIndexById('contacts', 'contact_id', id, 'contacts');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('contacts');
  var sheet = ss.getSheetByName('contacts');
  sheet.deleteRow(idx);
  return { ok:true };
}