// Payments handlers
function payments_list(params, body, e){
  var rows = getSheetValues('payments', 'payments');
  return { ok:true, data: rows };
}

function payments_create(params, body, e){
  var p = body.payment || {};
  p.payment_id = p.payment_id || generateId('pay_');
  
  // Calculate discount if family has siblings
  var student = getSheetValues('students', 'students').find(function(s){ return s.student_id === p.student_id; });
  if (student){
    var discountPercent = getDiscountForFamily(student.family_id);
    p.discount_applied = discountPercent;
    if (discountPercent > 0){
      p.amount = p.base_amount * (1 - discountPercent / 100);
    }
  }
  
  appendRow('payments', p, 'payments');
  return { ok:true, data: p };
}

function payments_update(params, body, e){
  var p = body.payment || {};
  if (!p.payment_id) return { ok:false, error:'payment_id required' };
  var idx = findRowIndexById('payments', 'payment_id', p.payment_id, 'payments');
  if (idx === -1) return { ok:false, error:'not found' };
  updateRowByIndex('payments', idx, p, 'payments');
  return { ok:true, data: p };
}

function payments_delete(params, body, e){
  var id = params.payment_id || (body.payment && body.payment.payment_id);
  if (!id) return { ok:false, error:'payment_id required' };
  var idx = findRowIndexById('payments', 'payment_id', id, 'payments');
  if (idx === -1) return { ok:false, error:'not found' };
  var ss = getSpreadsheetForResource('payments');
  var sheet = ss.getSheetByName('payments');
  sheet.deleteRow(idx);
  return { ok:true };
}

/**
 * Mark payment as paid (bulk operation can mark multiple at once)
 * Body: { payment_ids: [id1, id2, ...] } or { payment_ids: [id] }
 */
function payments_mark_paid(params, body, e){
  var paymentIds = body.payment_ids || [];
  if (!Array.isArray(paymentIds) || paymentIds.length === 0){
    return { ok:false, error: 'payment_ids array required' };
  }
  
  var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var updated = 0;
  
  paymentIds.forEach(function(paymentId){
    var idx = findRowIndexById('payments', 'payment_id', paymentId, 'payments');
    if (idx !== -1){
      updateRowByIndex('payments', idx, {
        status: 'paid',
        payment_date: today
      }, 'payments');
      updated++;
    }
  });
  
  return { ok:true, updated: updated };
}

/**
 * Get payment summary stats
 */
function payments_summary(params, body, e){
  var payments = getSheetValues('payments', 'payments');
  
  var collected = payments
    .filter(function(p){ return p.status === 'paid'; })
    .reduce(function(sum, p){ return sum + (parseFloat(p.amount) || 0); }, 0);
  
  var pending = payments
    .filter(function(p){ return p.status === 'pending'; })
    .reduce(function(sum, p){ return sum + (parseFloat(p.amount) || 0); }, 0);
  
  var overdue = payments
    .filter(function(p){ return p.status === 'overdue'; })
    .reduce(function(sum, p){ return sum + (parseFloat(p.amount) || 0); }, 0);
  
  return {
    ok: true,
    data: {
      collected: collected,
      pending: pending,
      overdue: overdue,
      total: collected + pending + overdue,
      payment_count: payments.length,
      overdue_count: payments.filter(function(p){ return p.status === 'overdue'; }).length
    }
  };
}

/**
 * Send payment reminders to families with overdue payments
 */
function payments_send_reminders(params, body, e){
  var result = sendPaymentReminders();
  return result;
}
