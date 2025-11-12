// Payment model helper
export function normalizePayment(raw = {}) {
  return {
    payment_id: String(raw.payment_id ?? '').trim(),
    student_id: String(raw.student_id ?? '').trim(),
    group_name: raw.group_name || '',
    amount: Number(raw.amount || 0),
    payment_date: raw.payment_date || null,
    due_date: raw.due_date || null,
    status: raw.status || 'pending',
    payment_method: raw.payment_method || '',
    notes: raw.notes || '',
  };
}

export function validatePayment(p) {
  if (!p.student_id) throw new Error('student_id is required');
  if (p.amount <= 0) throw new Error('amount must be greater than 0');
  return true;
}
