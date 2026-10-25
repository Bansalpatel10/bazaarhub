// Professional ID formatting (same as admin panel)

export const formatOrderId = (id) => {
  if (!id) return '';
  const str = typeof id === 'object' ? (id?.toString?.() || String(id)) : String(id);
  const uniquePart = str.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `ORD-${year}${month}${day}-${uniquePart}`;
};

export const formatPaymentId = (paymentId) => {
  if (!paymentId) return '';
  const cleanId = String(paymentId).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const part1 = cleanId.slice(0, 4);
  const part2 = cleanId.slice(4, 8);
  return part2 ? `PAY-${part1}-${part2}` : `PAY-${part1}`;
};

export const formatProductId = (productId) => {
  if (!productId) return '';
  const cleanId = String(productId).replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const shortId = cleanId.slice(-8);
  return `PRD-${shortId}`;
};

export const formatUserId = (userId) => {
  if (!userId) return '';
  const str = typeof userId === 'object' ? (userId?.toString?.() || String(userId)) : String(userId);
  const cleanId = str.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const shortId = cleanId.slice(-8);
  return shortId ? `USR-${shortId}` : 'USR-';
};

export const formatReturnId = (id) => {
  if (!id) return '';
  const str = typeof id === 'object' ? (id?.toString?.() || String(id)) : String(id);
  const uniquePart = str.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `REF-${year}${month}${day}-${uniquePart}`;
};
