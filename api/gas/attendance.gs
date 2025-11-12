// Attendance handlers
function attendance_list(params, body, e){
  var rows = getSheetValues('attendance', 'attendance');
  return { ok:true, data: rows };
}

function attendance_create(params, body, e){
  var a = body.attendance || {};
  a.attendance_id = a.attendance_id || generateId('att_');
  appendRow('attendance', a, 'attendance');
  return { ok:true, data: a };
}

function attendance_update(params, body, e){
  var a = body.attendance || {};
  if (!a.attendance_id) return { ok:false, error:'attendance_id required' };
  var idx = findRowIndexById('attendance', 'attendance_id', a.attendance_id, 'attendance');
  if (idx === -1) return { ok:false, error:'not found' };
  updateRowByIndex('attendance', idx, a, 'attendance');
  return { ok:true, data: a };
}

function attendance_delete(params, body, e){
  var id = params.attendance_id || (body.attendance && body.attendance.attendance_id);
  if (!id) return { ok:false, error:'attendance_id required' };
  var idx = findRowIndexById('attendance', 'attendance_id', id, 'attendance');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('attendance');
  var sheet = ss.getSheetByName('attendance');
  sheet.deleteRow(idx);
  return { ok:true };
}

/**
 * Load students for a specific group (returns with attendance status for today)
 */
function attendance_group_students(params, body, e){
  var groupName = params.group_name || (body.group_name);
  var attendanceDate = params.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  if (!groupName) return { ok:false, error: 'group_name required' };
  
  var students = getGroupStudents(groupName);
  var attendance = getSheetValues('attendance', 'attendance');
  
  // Enrich students with today's attendance status
  var result = students.map(function(student){
    var record = attendance.find(function(a){
      return a.student_id === student.student_id && 
             a.group_name === groupName && 
             a.attendance_date === attendanceDate;
    });
    
    return Object.assign({}, student, {
      attendance_id: record ? record.attendance_id : null,
      attendance_status: record ? record.status : null,
      notes: record ? record.notes : ''
    });
  });
  
  return { ok:true, data: result, date: attendanceDate, group: groupName };
}

/**
 * Save attendance for entire group (bulk operation - idempotent)
 * Body: { group_name, date, students: [{student_id, status, notes}, ...] }
 */
function attendance_save_group(params, body, e){
  var groupName = body.group_name;
  var attendanceDate = body.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var studentAttendance = body.students || [];
  
  if (!groupName || !Array.isArray(studentAttendance)){
    return { ok:false, error: 'group_name and students array required' };
  }
  
  var lock = LockService.getDocumentLock();
  lock.waitLock(30000);
  
  try {
    var result = saveAttendanceForGroup(groupName, attendanceDate, studentAttendance);
    return result;
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mark all students in a group as present/absent for a date
 */
function attendance_mark_all(params, body, e){
  var groupName = body.group_name;
  var attendanceDate = body.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var status = body.status; // 'present' or 'absent'
  
  if (!groupName || !status || (status !== 'present' && status !== 'absent')){
    return { ok:false, error: 'group_name and status (present/absent) required' };
  }
  
  var students = getGroupStudents(groupName);
  var studentAttendance = students.map(function(s){
    return {
      student_id: s.student_id,
      status: status,
      notes: 'Bulk marked as ' + status
    };
  });
  
  return attendance_save_group(params, {
    group_name: groupName,
    date: attendanceDate,
    students: studentAttendance
  }, e);
}

/**
 * Get attendance stats for a student
 */
function attendance_student_stats(params, body, e){
  var studentId = params.student_id || (body.student_id);
  if (!studentId) return { ok:false, error: 'student_id required' };
  
  var rate = getAttendanceRate(studentId);
  var attendance = getSheetValues('attendance', 'attendance').filter(function(a){
    return a.student_id === studentId;
  });
  
  var present = attendance.filter(function(a){ return a.status === 'present'; }).length;
  var absent = attendance.filter(function(a){ return a.status === 'absent'; }).length;
  var late = attendance.filter(function(a){ return a.status === 'late'; }).length;
  
  return {
    ok: true,
    data: {
      student_id: studentId,
      rate: rate,
      total_sessions: attendance.length,
      present: present,
      absent: absent,
      late: late
    }
  };
}
