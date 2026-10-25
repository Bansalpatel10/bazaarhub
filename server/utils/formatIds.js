// Same formatting as client – use for invoices and emails

function formatOrderId(id) {
  if (id == null || id === "") return "";
  const str = typeof id === "object" ? (id?.toString?.() || String(id)) : String(id);
  const trimmed = str.trim();
  if (!trimmed) return "";
  const uniquePart = trimmed.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, "") || "000000";
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `ORD-${year}${month}${day}-${uniquePart}`;
}

function formatReturnId(id) {
  if (!id) return "";
  const str = typeof id === "object" ? (id?.toString?.() || String(id)) : String(id);
  const uniquePart = str.slice(-6).toUpperCase().replace(/[^A-Z0-9]/g, "");
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `REF-${year}${month}${day}-${uniquePart}`;
}

function formatPaymentId(paymentId) {
  if (!paymentId) return "";
  const cleanId = String(paymentId).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const part1 = cleanId.slice(0, 4);
  const part2 = cleanId.slice(4, 8);
  return part2 ? `PAY-${part1}-${part2}` : `PAY-${part1}`;
}

function formatProductId(productId) {
  if (!productId) return "";
  const cleanId = String(productId).replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const shortId = cleanId.slice(-8);
  return `PRD-${shortId}`;
}

module.exports = {
  formatOrderId,
  formatReturnId,
  formatPaymentId,
  formatProductId,
};
