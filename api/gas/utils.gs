// Shared helper utilities for GAS scripts
// This file supports either a single spreadsheet (legacy SPREADSHEET_ID)
// or a per-resource mapping in SPREADSHEET_MAP so each resource (students, payments, etc.)
// can point to its own Spreadsheet ID.

// Legacy fallback spreadsheet ID (optional)
var SPREADSHEET_ID = '1CpAerH364qShBcXFO7C7QgDHjsBBcq31JSzrglpDe34';

// Map resourceName -> Spreadsheet ID. Replace values with your IDs or store them in PropertiesService.
const SPREADSHEET_MAP = {
  students: "1CpAerH364qShBcXFO7C7QgDHjsBBcq31JSzrglpDe34",
  student_groups: "1b9gthaVbLnX3Z3iHhI4tGWlxiZN7MXS6tMzl2l5G4h8",
  attendance: "1BKq45lP7HpVVKpHNuBWpuczJFjaVKuJNOK5MeFvnqmo",
  payments: "1G1RAyMgGPwbAWNm3XFFd6OLE6GcyFGqRN1yIq3OEZCs",
  events: "13h4b1DCvu8UqZd3l97WULe4JOVmFGOOc63Z7r9Fp0uo",
  contacts: "1zbuFAHpek0s62NM6rcycg4POggPOdUp4vo0kRIpYWHA",
  config: "12fr2P9S-1NlZgPXzJWb7ZNDgVlQoWgazwZSVoKAs4vA"
};

function getSpreadsheet(){
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'REPLACE_WITH_SPREADSHEET_ID'){
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSpreadsheetForResource(resource){
  if (!resource) return getSpreadsheet();
  var id = SPREADSHEET_MAP[resource];
  if (id && id !== '' && id.indexOf('REPLACE_WITH') === -1){
    return SpreadsheetApp.openById(id);
  }
  // fallback to legacy single spreadsheet
  return getSpreadsheet();
}

// sheetName: name of sheet inside the spreadsheet
// resource: optional resource key to look up spreadsheet mapping
function getSheetValues(sheetName, resource){
  var ss = getSpreadsheetForResource(resource);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  var rows = [];
  for (var i = 1; i < values.length; i++){
    var row = {};
    for (var j = 0; j < headers.length; j++){
      row[headers[j]] = values[i][j];
    }
    rows.push(row);
  }
  return rows;
}

function appendRow(sheetName, obj, resource){
  var ss = getSpreadsheetForResource(resource);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return null;
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  var row = headers.map(function(h){ return obj[h] || ''; });
  sheet.appendRow(row);
  return true;
}

function findRowIndexById(sheetName, idField, idValue, resource){
  var ss = getSpreadsheetForResource(resource);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return -1;
  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  var idCol = headers.indexOf(idField);
  if (idCol === -1) return -1;
  for (var i = 1; i < values.length; i++){
    if (String(values[i][idCol]) === String(idValue)) return i+1; // sheet row index (1-based)
  }
  return -1;
}

function updateRowByIndex(sheetName, rowIndex, obj, resource){
  var ss = getSpreadsheetForResource(resource);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return false;
  var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
  for (var j = 0; j < headers.length; j++){
    var h = headers[j];
    if (obj.hasOwnProperty(h)){
      sheet.getRange(rowIndex, j+1).setValue(obj[h]);
    }
  }
  return true;
}

function generateId(prefix){
  prefix = prefix || '';
  return prefix + Utilities.getUuid();
}

// ===== BUSINESS LOGIC HELPERS =====

/**
 * Get today's groups from Config based on current weekday
 */
function getTodaysGroups(){
  var config = getSheetValues('Config', 'config');
  var today = new Date();
  var dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][today.getDay()];
  
  var todaysGroups = [];
  config.forEach(function(row){
    if (row.schedule_day === dayName){
      todaysGroups.push({
        group_name: row.group_name,
        teacher_name: row.teacher_name,
        schedule_time: row.schedule_time,
        level: row.level
      });
    }
  });
  return todaysGroups;
}

/**
 * Get all students enrolled in a specific group (active status only)
 */
function getGroupStudents(groupName){
  var enrollments = getSheetValues('student_groups', 'student_groups');
  var students = getSheetValues('students', 'students');
  
  var groupStudents = enrollments.filter(function(e){ 
    return e.group_name === groupName && e.status === 'active';
  });
  
  var result = [];
  groupStudents.forEach(function(enrollment){
    var student = students.find(function(s){ return s.student_id === enrollment.student_id; });
    if (student){
      result.push(Object.assign({}, student, { 
        enrollment_id: enrollment.id,
        teacher_name: enrollment.teacher_name 
      }));
    }
  });
  return result;
}

/**
 * Get sibling group (students with same family_id)
 */
function getSiblings(studentId){
  var students = getSheetValues('students', 'students');
  var student = students.find(function(s){ return s.student_id === studentId; });
  if (!student || !student.family_id) return [];
  
  return students.filter(function(s){ 
    return s.family_id === student.family_id && s.student_id !== studentId && s.status === 'active';
  });
}

/**
 * Calculate discount percentage based on family size and Config rules
 */
function getDiscountForFamily(familyId){
  if (!familyId) return 0;
  
  var students = getSheetValues('students', 'students');
  var siblingCount = students.filter(function(s){
    return s.family_id === familyId && s.status === 'active';
  }).length;
  
  var config = getConfigValue('discount_rules') || { min_siblings: 2, discount_percent: 10 };
  
  if (siblingCount >= config.min_siblings){
    return config.discount_percent || 10;
  }
  return 0;
}

/**
 * Get a single config value (for settings like discount rules, admin emails, etc.)
 */
function getConfigValue(key){
  var config = getSheetValues('Config', 'config');
  var setting = config.find(function(r){ return r.key === key; });
  return setting ? setting.value : null;
}

/**
 * Get all family members and their payment status
 */
function getFamilyPaymentStatus(familyId){
  if (!familyId) return { paid: 0, pending: 0, overdue: 0 };
  
  var students = getSheetValues('students', 'students');
  var payments = getSheetValues('payments', 'payments');
  
  var familyStudentIds = students
    .filter(function(s){ return s.family_id === familyId; })
    .map(function(s){ return s.student_id; });
  
  var familyPayments = payments.filter(function(p){
    return familyStudentIds.indexOf(p.student_id) !== -1;
  });
  
  var status = { paid: 0, pending: 0, overdue: 0 };
  familyPayments.forEach(function(p){
    status[p.status] = (status[p.status] || 0) + 1;
  });
  return status;
}

/**
 * Send payment reminders (aggregated by family)
 * Triggers daily; groups multiple students' payments into one email per parent
 */
function sendPaymentReminders(){
  var payments = getSheetValues('payments', 'payments');
  var students = getSheetValues('students', 'students');
  var contacts = getSheetValues('contacts', 'contacts');
  
  var overdue = payments.filter(function(p){ return p.status === 'overdue'; });
  if (overdue.length === 0) return { ok: true, message: 'No overdue payments' };
  
  // Group by family
  var byFamily = {};
  overdue.forEach(function(payment){
    var student = students.find(function(s){ return s.student_id === payment.student_id; });
    if (!student) return;
    
    var familyId = student.family_id || 'nofamily_' + student.student_id;
    if (!byFamily[familyId]) byFamily[familyId] = [];
    byFamily[familyId].push(payment);
  });
  
  var emailsSent = 0;
  for (var familyId in byFamily){
    var familyPayments = byFamily[familyId];
    var studentId = familyPayments[0].student_id;
    var student = students.find(function(s){ return s.student_id === studentId; });
    var contact = contacts.find(function(c){ return c.contact_id === student.parent_contact_id; });
    
    if (contact && contact.email){
      var message = buildPaymentReminderEmail(familyPayments, student, contact);
      MailApp.sendEmail(contact.email, 'Payment Reminder - ' + contact.name, message);
      emailsSent++;
    }
  }
  
  return { ok: true, emailsSent: emailsSent };
}

/**
 * Build formatted email body for payment reminder
 */
function buildPaymentReminderEmail(payments, student, contact){
  var body = 'Dear ' + contact.name + ',\n\n';
  body += 'You have the following overdue payments:\n\n';
  
  payments.forEach(function(p){
    body += '- ' + p.student_id + ' (' + p.group_name + '): $' + p.amount + ' due ' + p.due_date + '\n';
  });
  
  body += '\nPlease settle these payments at your earliest convenience.\n\nThank you,\nLingoville Admin';
  return body;
}

/**
 * Mark attendance for a group and date (idempotent - updates if exists)
 */
function saveAttendanceForGroup(groupName, attendanceDate, studentAttendance){
  // studentAttendance is array of { student_id, status, notes }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('attendance');
  var attendance = getSheetValues('attendance', 'attendance');
  
  studentAttendance.forEach(function(entry){
    // Check if record exists
    var existing = attendance.find(function(a){
      return a.student_id === entry.student_id && 
             a.group_name === groupName && 
             a.attendance_date === attendanceDate;
    });
    
    if (existing){
      // Update
      var idx = findRowIndexById('attendance', 'attendance_id', existing.attendance_id, 'attendance');
      updateRowByIndex('attendance', idx, {
        status: entry.status,
        notes: entry.notes || ''
      }, 'attendance');
    } else {
      // Create new
      appendRow('attendance', {
        attendance_id: generateId('att_'),
        student_id: entry.student_id,
        group_name: groupName,
        attendance_date: attendanceDate,
        status: entry.status,
        notes: entry.notes || ''
      }, 'attendance');
    }
  });
  
  return { ok: true, count: studentAttendance.length };
}

/**
 * Get attendance rate for a student (percentage of sessions marked present)
 */
function getAttendanceRate(studentId){
  var attendance = getSheetValues('attendance', 'attendance');
  var studentAttendance = attendance.filter(function(a){ return a.student_id === studentId; });
  
  if (studentAttendance.length === 0) return 0;
  
  var present = studentAttendance.filter(function(a){ return a.status === 'present'; }).length;
  return Math.round((present / studentAttendance.length) * 100);
}

/**
 * Generate dashboard stats
 */
function getSummaryStats(){
  var students = getSheetValues('students', 'students');
  var payments = getSheetValues('payments', 'payments');
  var attendance = getSheetValues('attendance', 'attendance');
  var enrollments = getSheetValues('student_groups', 'student_groups');
  
  var activeStudents = students.filter(function(s){ return s.status === 'active'; }).length;
  var activeGroups = enrollments.filter(function(e){ return e.status === 'active'; })
    .map(function(e){ return e.group_name; })
    .filter(function(g, i, arr){ return arr.indexOf(g) === i; }).length;
  
  var totalCollected = payments
    .filter(function(p){ return p.status === 'paid'; })
    .reduce(function(sum, p){ return sum + (parseFloat(p.amount) || 0); }, 0);
  
  var totalDue = payments
    .filter(function(p){ return p.status === 'pending' || p.status === 'overdue'; })
    .reduce(function(sum, p){ return sum + (parseFloat(p.amount) || 0); }, 0);
  
  var todayAttendance = attendance
    .filter(function(a){ return a.attendance_date === Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'); });
  var presentCount = todayAttendance.filter(function(a){ return a.status === 'present'; }).length;
  var attendanceRate = todayAttendance.length > 0 ? Math.round((presentCount / todayAttendance.length) * 100) : 0;
  
  return {
    activeStudents: activeStudents,
    activeGroups: activeGroups,
    totalCollected: totalCollected,
    totalDue: totalDue,
    attendanceRate: attendanceRate,
    overduepayments: payments.filter(function(p){ return p.status === 'overdue'; }).length
  };
}
