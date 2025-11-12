// student_groups linking handlers
function student_groups_list(params, body, e){
  var rows = getSheetValues('student_groups', 'student_groups');
  return { ok:true, data: rows };
}

function student_groups_create(params, body, e){
  var s = body.group || {};
  s.id = s.id || generateId('sg_');
  appendRow('student_groups', s, 'student_groups');
  return { ok:true, data: s };
}

function student_groups_update(params, body, e){
  var s = body.group || {};
  if (!s.id) return { ok:false, error:'id required' };
  var idx = findRowIndexById('student_groups', 'id', s.id, 'student_groups');
  if (idx === -1) return { ok:false, error:'not found' };
  updateRowByIndex('student_groups', idx, s, 'student_groups');
  return { ok:true, data: s };
}

function student_groups_delete(params, body, e){
  var id = params.id || (body.group && body.group.id);
  if (!id) return { ok:false, error:'id required' };
  var idx = findRowIndexById('student_groups', 'id', id, 'student_groups');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('student_groups');
  var sheet = ss.getSheetByName('student_groups');
  sheet.deleteRow(idx);
  return { ok:true };
}