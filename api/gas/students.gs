// Students CRUD handlers
function students_list(params, body, e){
  var rows = getSheetValues('students', 'students');
  return { ok: true, data: rows };
}

function students_create(params, body, e){
  // validate minimal
  var s = body.student || {};
  if (!s.first_name || !s.last_name) return { ok:false, error: 'first_name and last_name required' };
  
  s.student_id = s.student_id || generateId('stu_');
  s.enrollment_date = s.enrollment_date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  
  // If no family_id but has siblings, create one or link to existing
  if (!s.family_id && s.sibling_of){
    var students = getSheetValues('students', 'students');
    var sibling = students.find(function(st){ return st.student_id === s.sibling_of; });
    if (sibling && sibling.family_id){
      s.family_id = sibling.family_id;
    } else {
      s.family_id = generateId('fam_');
    }
  } else if (!s.family_id){
    s.family_id = generateId('fam_');
  }
  
  appendRow('students', s, 'students');
  return { ok:true, data: s };
}

function students_update(params, body, e){
  var s = body.student || {};
  if (!s.student_id) return { ok:false, error: 'student_id required' };
  var idx = findRowIndexById('students', 'student_id', s.student_id, 'students');
  if (idx === -1) return { ok:false, error: 'student not found' };
  updateRowByIndex('students', idx, s, 'students');
  return { ok:true, data: s };
}

function students_delete(params, body, e){
  var id = params.student_id || (body.student && body.student.student_id);
  if (!id) return { ok:false, error:'student_id required' };
  var idx = findRowIndexById('students', 'student_id', id, 'students');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('students');
  var sheet = ss.getSheetByName('students');
  sheet.deleteRow(idx);
  return { ok:true };
}

/**
 * Enroll student in a group (creates student_groups entry)
 * Optionally triggers payment creation with family discount
 */
function students_enroll(params, body, e){
  var enrollment = body.enrollment || {};
  if (!enrollment.student_id || !enrollment.group_name) {
    return { ok:false, error: 'student_id and group_name required' };
  }
  
  // Check if already enrolled
  var existing = getSheetValues('student_groups', 'student_groups').find(function(sg){
    return sg.student_id === enrollment.student_id && sg.group_name === enrollment.group_name;
  });
  
  if (existing && existing.status === 'active'){
    return { ok:false, error: 'Student already enrolled in this group' };
  }
  
  // Create enrollment
  if (!enrollment.id) enrollment.id = generateId('enr_');
  enrollment.enrollment_date = enrollment.enrollment_date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  enrollment.status = enrollment.status || 'active';
  
  appendRow('student_groups', enrollment, 'student_groups');
  
  // Optionally create initial payment with family discount
  if (enrollment.create_payment){
    var student = getSheetValues('students', 'students').find(function(s){
      return s.student_id === enrollment.student_id;
    });
    
    var discountPercent = getDiscountForFamily(student.family_id);
    var baseAmount = enrollment.payment_amount || 0;
    var discountedAmount = baseAmount * (1 - discountPercent / 100);
    
    var payment = {
      payment_id: generateId('pay_'),
      student_id: enrollment.student_id,
      group_name: enrollment.group_name,
      amount: discountedAmount,
      due_date: enrollment.due_date || Utilities.formatDate(new Date(new Date().setDate(new Date().getDate() + 7)), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      status: 'pending',
      discount_applied: discountPercent
    };
    
    appendRow('payments', payment, 'payments');
  }
  
  return { ok:true, data: enrollment };
}

/**
 * Get student with all linked data (groups, payments, attendance, contact)
 */
function students_profile(params, body, e){
  var studentId = params.student_id || (body.student && body.student.student_id);
  if (!studentId) return { ok:false, error: 'student_id required' };
  
  var student = getSheetValues('students', 'students').find(function(s){ return s.student_id === studentId; });
  if (!student) return { ok:false, error: 'student not found' };
  
  var enrollments = getSheetValues('student_groups', 'student_groups').filter(function(e){
    return e.student_id === studentId && e.status === 'active';
  });
  
  var payments = getSheetValues('payments', 'payments').filter(function(p){
    return p.student_id === studentId;
  });
  
  var attendance = getSheetValues('attendance', 'attendance').filter(function(a){
    return a.student_id === studentId;
  });
  
  var contact = student.parent_contact_id ? 
    getSheetValues('contacts', 'contacts').find(function(c){
      return c.contact_id === student.parent_contact_id;
    }) : null;
  
  var siblings = getSiblings(studentId);
  
  return {
    ok: true,
    data: {
      student: student,
      enrollments: enrollments,
      payments: payments,
      attendance: attendance,
      contact: contact,
      siblings: siblings,
      attendanceRate: getAttendanceRate(studentId),
      familyPaymentStatus: getFamilyPaymentStatus(student.family_id)
    }
  };
}
