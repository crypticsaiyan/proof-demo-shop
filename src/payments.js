// Fake payment processor. Mirrors the validation a real gateway does.

let seq = 1000;

export function charge({ amount, email }) {
  if (!Number.isInteger(amount)) {
    throw new Error(`PaymentError: invalid amount ${amount}`);
  }
  if (!email || !email.includes('@')) {
    throw new Error('PaymentError: receipt email required');
  }
  return { id: `ch_${++seq}`, amount };
}
