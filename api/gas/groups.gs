// Master Groups handlers (distinct from student_groups which tracks enrollments)
// This manages the actual group definitions (classes), not individual enrollments

function groups_list(params, body, e){
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var students = getSheetValues('students', 'students');
  
  // Get unique group names with their info
  var groupMap = {};
  enrollments.forEach(function(enr){
    if (!groupMap[enr.group_name]){
      groupMap[enr.group_name] = {
        group_name: enr.group_name,
        level: enr.level || '',
        status: enr.status || 'active',
        student_count: 0,
        students: []
      };
    }
    groupMap[enr.group_name].student_count++;
    groupMap[enr.group_name].students.push(enr.student_id);
  });
  
  var groups = Object.keys(groupMap).map(function(name){
    return groupMap[name];
  });
  
  return { ok:true, data: groups };
}

function groups_create(params, body, e){
  // Creating a group means creating the first enrollment/record
  var g = body.group || {};
  if (!g.group_name) return { ok:false, error: 'group_name required' };
  
  var enrollment = {
    id: generateId('enr_'),
    group_name: g.group_name,
    student_id: g.student_id || '',
    enrollment_date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    status: g.status || 'active',
    level: g.level || '',
    notes: g.notes || ''
  };
  
  appendRow('student_groups', enrollment, 'student_groups');
  return { ok:true, data: enrollment };
}

function groups_update(params, body, e){
  var g = body.group || {};
  if (!g.group_name) return { ok:false, error: 'group_name required' };
  
  // Update all enrollments with this group name
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var updated = 0;
  
  enrollments.forEach(function(enr){
    if (enr.group_name === g.group_name){
      var idx = findRowIndexById('student_groups', 'id', enr.id, 'student_groups');
      if (idx !== -1){
        updateRowByIndex('student_groups', idx, {
          level: g.level || enr.level,
          status: g.status || enr.status,
          notes: g.notes || enr.notes
        }, 'student_groups');
        updated++;
      }
    }
  });
  
  return { ok:true, updated: updated };
}

function groups_delete(params, body, e){
  var groupName = params.group_name || (body.group && body.group.group_name);
  if (!groupName) return { ok:false, error: 'group_name required' };
  
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var ss = getSpreadsheetForResource('student_groups');
  var sheet = ss.getSheetByName('student_groups');
  var deleted = 0;
  
  // Delete all enrollments for this group (iterate backwards to avoid index issues)
  for (var i = enrollments.length - 1; i >= 0; i--){
    if (enrollments[i].group_name === groupName){
      var rowIndex = findRowIndexById('student_groups', 'id', enrollments[i].id, 'student_groups');
      if (rowIndex !== -1){
        sheet.deleteRow(rowIndex);
        deleted++;
      }
    }
  }
  
  return { ok:true, deleted: deleted };
}

/**
 * Enroll a student in a group
 */
function groups_enroll(params, body, e){
  var studentId = params.student_id || (body.student_id);
  var groupName = params.group_name || (body.group_name);
  
  if (!studentId || !groupName){
    return { ok:false, error: 'student_id and group_name required' };
  }
  
  // Check if already enrolled
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var exists = enrollments.find(function(e){
    return e.student_id === studentId && e.group_name === groupName;
  });
  
  if (exists){
    return { ok:false, error: 'Student already enrolled in this group' };
  }
  
  var enrollment = {
    id: generateId('enr_'),
    student_id: studentId,
    group_name: groupName,
    enrollment_date: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
    status: 'active',
    level: body.level || '',
    notes: body.notes || ''
  };
  
  appendRow('student_groups', enrollment, 'student_groups');
  return { ok:true, data: enrollment };
}

/**
 * Unenroll a student from a group
 */
function groups_unenroll(params, body, e){
  var studentId = params.student_id || (body.student_id);
  var groupName = params.group_name || (body.group_name);
  
  if (!studentId || !groupName){
    return { ok:false, error: 'student_id and group_name required' };
  }
  
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var enrollment = enrollments.find(function(e){
    return e.student_id === studentId && e.group_name === groupName;
  });
  
  if (!enrollment){
    return { ok:false, error: 'Enrollment not found' };
  }
  
  var idx = findRowIndexById('student_groups', 'id', enrollment.id, 'student_groups');
  if (idx === -1) return { ok:false, error: 'not found' };
  
  var ss = getSpreadsheetForResource('student_groups');
  var sheet = ss.getSheetByName('student_groups');
  sheet.deleteRow(idx);
  
  return { ok:true };
}

/**
 * Get students in a group
 */
function groups_get_students(params, body, e){
  var groupName = params.group_name || (body.group_name);
  if (!groupName) return { ok:false, error: 'group_name required' };
  
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var students = getSheetValues('students', 'students');
  
  var groupEnrollments = enrollments.filter(function(e){
    return e.group_name === groupName && e.status === 'active';
  });
  
  var result = groupEnrollments.map(function(enrollment){
    var student = students.find(function(s){ return s.student_id === enrollment.student_id; });
    return student ? Object.assign({}, student, { enrollment_id: enrollment.id }) : null;
  }).filter(function(s){ return s !== null; });
  
  return { ok:true, data: result };
}
