const {
  formatOrderId,
  formatReturnId,
  formatPaymentId,
  formatProductId,
} = require("./formatIds");

const buildBaseEmail = (title, contentHtml) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body {
            margin: 0;
            padding: 0;
            background-color: #f5f5f7;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            color: #222;
          }
          .wrapper {
            width: 100%;
            padding: 24px 0;
          }
          .container {
            max-width: 640px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
          }
          .header {
            padding: 20px 24px;
            background: linear-gradient(135deg, #6d4aae, #ed174a);
            color: #ffffff;
            text-align: left;
          }
          .brand {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.08em;
          }
          .subtitle {
            font-size: 13px;
            opacity: 0.9;
            margin-top: 4px;
          }
          .content {
            padding: 24px;
            font-size: 14px;
            line-height: 1.6;
          }
          h1, h2, h3 {
            color: #111827;
            margin: 0 0 8px 0;
          }
          h2 {
            font-size: 18px;
          }
          .section {
            margin-top: 16px;
            padding: 12px 14px;
            border-radius: 8px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
          }
          .label {
            font-weight: 600;
            color: #4b5563;
          }
          .value {
            color: #111827;
          }
          .muted {
            color: #6b7280;
            font-size: 12px;
          }
          .code-box {
            display: inline-block;
            padding: 10px 16px;
            font-size: 20px;
            letter-spacing: 0.35em;
            border-radius: 8px;
            background: #111827;
            color: #ffffff;
            font-weight: 700;
            margin: 16px 0 8px;
          }
          .footer {
            padding: 16px 24px 20px;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            background: #f9fafb;
          }
          .footer a {
            color: #6d4aae;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="brand">ECOMMERCE</div>
              <div class="subtitle">Secure notifications from our store</div>
            </div>
            <div class="content">
              ${contentHtml}
            </div>
            <div class="footer">
              This email contains important information about your account and orders.<br/>
              If you have any questions, please contact our support team at
              <a href="mailto:support@example.com">support@example.com</a>.<br/><br/>
              If you did not initiate this request, please ignore this email or contact support immediately.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

// OTP verification email – fully professional branded HTML (no plain text; inline CSS for Gmail/Outlook)
const buildOtpEmail = ({ name, otp }) => {
  const safeName = name || "Customer";
  const subject = "Your verification code – ECOMMERCE";
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Verify your email – ECOMMERCE</title>
  <!--[if mso]>
  <noscript><meta http-equiv="X-UA-Compatible" content="IE=edge" /></noscript>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f0f2;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f2;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <!-- Logo / Header -->
          <tr>
            <td style="padding:28px 32px 24px 32px;background:linear-gradient(135deg,#6d4aae 0%,#53348c 100%);text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="font-size:24px;font-weight:700;letter-spacing:0.12em;color:#ffffff;">ECOMMERCE</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:6px;">Secure verification</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding:28px 32px 20px 32px;">
              <p style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#1a1a1a;">Hello ${safeName},</p>
              <p style="margin:0;font-size:15px;line-height:1.5;color:#4a4a4a;">Use the verification code below to complete your request. This code is required to verify your email or reset your password.</p>
            </td>
          </tr>
          <!-- OTP box -->
          <tr>
            <td style="padding:0 32px 24px 32px;" align="center">
              <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="background:#1a1a1a;border-radius:10px;">
                <tr>
                  <td style="padding:18px 32px;font-size:28px;font-weight:700;letter-spacing:8px;color:#ffffff;">${otp}</td>
                </tr>
              </table>
              <p style="margin:16px 0 0 0;font-size:13px;color:#6b7280;">Valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            </td>
          </tr>
          <!-- Security warning -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:#374151;">Security notice</p>
                    <p style="margin:0;font-size:12px;line-height:1.5;color:#6b7280;">Our team will never ask you for this code or your password. If you did not request this email, please ignore it and secure your account.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Support -->
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <p style="margin:0;font-size:13px;color:#4a4a4a;">Need help? Contact our support team:</p>
              <p style="margin:6px 0 0 0;font-size:13px;"><a href="mailto:support@example.com" style="color:#6d4aae;text-decoration:none;">support@example.com</a></p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px 28px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">This is an automated message from ECOMMERCE. Please do not reply to this email.</p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#9ca3af;">&copy; ECOMMERCE. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = `Hello ${safeName},\n\nYour verification code is: ${otp}\n\nValid for 10 minutes. Do not share this code.\n\nIf you did not request this, please ignore this email.\n\n— ECOMMERCE`;
  return { subject, html, text };
};

// Order confirmation email – table-based layout, formatted Order ID & Payment ID (ORD-..., PAY-...)
const buildOrderConfirmationEmail = (order) => {
  if (!order) return null;
  // Force order ID to string so formatOrderId always returns ORD-YYMMDD-XXXXXX (never raw ObjectId)
  // ALWAYS convert to pure string before formatting (fix email ID issue)
  let rawOrderId = order?._id || order?.id || "";

  if (typeof rawOrderId === "object" && rawOrderId !== null) {
    rawOrderId = rawOrderId.toString();
  }

  const orderIdF = rawOrderId ? formatOrderId(String(rawOrderId)) : "—";
  const rawPaymentId =
    order.paymentId != null && String(order.paymentId).trim() !== ""
      ? order.paymentId
      : null;
  const paymentIdF = rawPaymentId ? formatPaymentId(String(rawPaymentId)) : "—";
  const dateStr = order.date ? String(order.date).split("T")[0] : "—";
  const total = order.amount != null ? Number(order.amount) : 0;
  const customerName = order.name || "Customer";
  const itemsHtml = Array.isArray(order.products)
    ? order.products
        .map(
          (p) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;color:#1a1a1a;">${String(p.productTitle || "").replace(/</g, "&lt;")}</td>
            <td align="right" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${p.quantity || 0}</td>
            <td align="right" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">₹${p.price != null ? p.price : 0}</td>
            <td align="right" style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">₹${p.subTotal != null ? p.subTotal : 0}</td>
          </tr>`,
        )
        .join("")
    : "";

  const subject = `Order confirmation – ${orderIdF}`;
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Order confirmed – ${orderIdF}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f2;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f0f2;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 24px 32px;background:linear-gradient(135deg,#6d4aae 0%,#53348c 100%);">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size:24px;font-weight:700;letter-spacing:0.12em;color:#ffffff;">ECOMMERCE</div>
                    <div style="font-size:12px;color:rgba(255,255,255,0.9);margin-top:6px;">Order confirmation</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px 20px 32px;">
              <p style="margin:0 0 8px 0;font-size:18px;font-weight:600;color:#1a1a1a;">Hi ${customerName},</p>
              <p style="margin:0;font-size:15px;line-height:1.5;color:#4a4a4a;">Thank you for your purchase. Your order has been received and is being processed.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr>
                  <td width="50%" style="vertical-align:top;padding-right:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                      <tr><td style="padding:14px 16px;font-size:13px;">
                        <div style="font-weight:600;color:#4b5563;margin-bottom:8px;">Order details</div>
                        <div style="margin:4px 0;"><strong>Order ID:</strong> ${orderIdF}</div>
                        <div style="margin:4px 0;"><strong>Payment ID:</strong> ${paymentIdF}</div>
                        <div style="margin:4px 0;"><strong>Date:</strong> ${dateStr}</div>
                        <div style="margin:4px 0;"><strong>Total:</strong> ₹${total}</div>
                      </td></tr>
                    </table>
                  </td>
                  <td width="50%" style="vertical-align:top;padding-left:8px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;">
                      <tr><td style="padding:14px 16px;font-size:13px;">
                        <div style="font-weight:600;color:#4b5563;margin-bottom:8px;">Delivery address</div>
                        <div style="margin:4px 0;">${String(order.name || "").replace(/</g, "&lt;")}</div>
                        <div style="margin:4px 0;">${String(order.address || "").replace(/</g, "&lt;")}</div>
                        <div style="margin:4px 0;">${order.pincode ? "Pincode: " + order.pincode : ""}</div>
                        <div style="margin:4px 0;">${order.phoneNumber ? "Phone: " + order.phoneNumber : ""}</div>
                      </td></tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 16px 32px;">
              <p style="margin:0 0 10px 0;font-size:14px;font-weight:600;color:#1a1a1a;">Order summary</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;border:1px solid #e5e7eb;border-radius:8px;">
                <tr>
                  <th align="left" style="padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:600;">Product</th>
                  <th align="right" style="padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:600;">Qty</th>
                  <th align="right" style="padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:600;">Price</th>
                  <th align="right" style="padding:10px 12px;background:#f9fafb;border-bottom:1px solid #e5e7eb;font-weight:600;">Subtotal</th>
                </tr>
                ${itemsHtml}
                <tr>
                  <td colspan="3" align="right" style="padding:12px 12px;font-weight:700;border-top:1px solid #e5e7eb;">Total</td>
                  <td align="right" style="padding:12px 12px;font-weight:700;border-top:1px solid #e5e7eb;">₹${total}</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px 32px;">
              <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.5;">We will notify you when your order is shipped. You can view your order and download the invoice from your account.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;color:#6b7280;">Thank you for shopping with us.</p>
              <p style="margin:8px 0 0 0;font-size:11px;color:#9ca3af;">&copy; ECOMMERCE. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${customerName},\n\nThank you for your purchase. Your order has been received.\n\nOrder ID: ${orderIdF}\nPayment ID: ${paymentIdF}\nDate: ${dateStr}\nTotal: ₹${total}\n\nDelivery: ${order.address || ""} ${order.pincode ? "Pincode: " + order.pincode : ""} ${order.phoneNumber ? "Phone: " + order.phoneNumber : ""}\n\nView order and invoice from your account.`;
  return { subject, html, text };
};

// Return confirmed email – formatted Return ID & Order ID
const buildReturnConfirmedEmail = (returnReq) => {
  if (!returnReq) return null;
  const returnIdF = returnReq._id ? formatReturnId(String(returnReq._id)) : "—";
  let orderIdRaw = returnReq?.orderId?._id || returnReq?.orderId || "";

  if (typeof orderIdRaw === "object" && orderIdRaw !== null) {
    orderIdRaw = orderIdRaw.toString();
  }

  const orderIdF = orderIdRaw ? formatOrderId(String(orderIdRaw)) : "—";
  const subject = `Return request confirmed – ${returnIdF}`;
  const html = buildBaseEmail(
    "Return confirmed",
    `
      <p>Hi <strong>${returnReq.customerName || "Customer"}</strong>,</p>
      <p>Your return request has been <strong>confirmed</strong>.</p>

      <div class="section">
        <div><span class="label">Return ID:</span> <span class="value">${returnIdF}</span></div>
        <div><span class="label">Order ID:</span> <span class="value">${orderIdF}</span></div>
        <div><span class="label">Status:</span> <span class="value">${returnReq.status}</span></div>
      </div>

      <div class="section" style="margin-top:16px;">
        <div class="label" style="margin-bottom:8px;">Next steps</div>
        <p class="muted">
          Our team will arrange pickup of the product as per the return policy. Please keep the item packed and ready.
        </p>
      </div>
    `,
  );

  const text = `Hi ${returnReq.customerName || "Customer"},

Your return request has been confirmed.

Return ID: ${returnIdF}
Order ID: ${orderIdF}
Status: ${returnReq.status}

Our team will arrange pickup of the product.`;

  return { subject, html, text };
};

// Refund initiated email – formatted Order ID & Return ID
const buildRefundInitiatedEmail = ({ returnReq, refundAmount }) => {
  if (!returnReq) return null;
  const returnIdF = returnReq._id ? formatReturnId(returnReq._id) : "—";
  const orderIdRaw =
    returnReq.orderId != null
      ? returnReq.orderId._id != null
        ? returnReq.orderId._id
        : returnReq.orderId
      : null;
  const orderIdF = orderIdRaw ? formatOrderId(String(orderIdRaw)) : "—";
  const subject = `Refund initiated – ${orderIdF}`;
  const html = buildBaseEmail(
    "Refund initiated",
    `
      <p>Hi <strong>${returnReq.customerName || "Customer"}</strong>,</p>
      <p>Your refund has been <strong>initiated</strong> for the returned order.</p>

      <div class="section">
        <div><span class="label">Order ID:</span> <span class="value">${orderIdF}</span></div>
        <div><span class="label">Return ID:</span> <span class="value">${returnIdF}</span></div>
        <div><span class="label">Refund amount:</span> <span class="value">₹${refundAmount || returnReq.orderDetails?.amount || 0}</span></div>
        <div><span class="label">Payment method:</span> <span class="value">Original payment method</span></div>
      </div>

      <p class="muted" style="margin-top:16px;">
        Depending on your bank or card issuer, it may take 3–7 business days for the refund to appear in your account.
      </p>
    `,
  );

  const text = `Hi ${returnReq.customerName || "Customer"},

Your refund has been initiated.

Order ID: ${orderIdF}
Return ID: ${returnIdF}
Refund amount: ₹${refundAmount || returnReq.orderDetails?.amount || 0}
Payment method: Original payment method

It may take 3–7 business days for the refund to appear in your account.`;

  return { subject, html, text };
};

// Simple HTML invoice (printable in browser) – uses formatted IDs
const buildOrderInvoiceHtml = (order) => {
  if (!order) return "<html><body><p>Order not found.</p></body></html>";
  const rawOrderId = order._id != null ? order._id : order.id;
  const rawPaymentId =
    order.paymentId != null && String(order.paymentId).trim() !== ""
      ? order.paymentId
      : null;
  const orderIdF = rawOrderId ? formatOrderId(rawOrderId) : "—";
  const paymentIdF = rawPaymentId ? formatPaymentId(rawPaymentId) : "—";
  const itemsHtml = Array.isArray(order.products)
    ? order.products
        .map(
          (p) => `
      <tr>
        <td>${p.productTitle || ""}</td>
        <td align="right">${p.quantity || 0}</td>
        <td align="right">₹${p.price || 0}</td>
        <td align="right">₹${p.subTotal || 0}</td>
      </tr>
    `,
        )
        .join("")
    : "";
  const dateStr = String(order.date || "").split("T")[0];
  const total = order.amount || 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Invoice - ${orderIdF}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            margin: 0;
            padding: 24px;
            background: #f3f4f6;
          }
          .invoice {
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 10px;
            padding: 24px 28px;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
          }
          .brand-sub {
            font-size: 12px;
            color: #6b7280;
          }
          .invoice-meta {
            text-align: right;
            font-size: 13px;
            color: #374151;
          }
          h2 {
            margin: 12px 0 6px;
            font-size: 18px;
          }
          .two-col {
            display: flex;
            justify-content: space-between;
            gap: 18px;
            margin-top: 16px;
            margin-bottom: 20px;
          }
          .box {
            flex: 1;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            padding: 12px 14px;
            font-size: 13px;
          }
          .box-title {
            font-weight: 600;
            font-size: 13px;
            color: #4b5563;
            margin-bottom: 6px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 13px;
          }
          th, td {
            padding: 8px 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          th {
            text-align: left;
            background: #f9fafb;
            font-weight: 600;
          }
          tfoot td {
            font-weight: 700;
            border-top: 1px solid #e5e7eb;
          }
          .totals {
            margin-top: 12px;
            font-size: 13px;
            text-align: right;
          }
          .muted {
            font-size: 11px;
            color: #6b7280;
            margin-top: 24px;
          }
          @media print {
            body {
              background: #ffffff;
              padding: 0;
            }
            .invoice {
              box-shadow: none;
              border-radius: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div>
              <div class="brand">ECOMMERCE</div>
              <div class="brand-sub">Order invoice</div>
            </div>
            <div class="invoice-meta">
              <div><strong>Invoice #</strong> ${orderIdF}</div>
              <div><strong>Date</strong> ${dateStr}</div>
              <div><strong>Payment ID</strong> ${paymentIdF || "-"}</div>
            </div>
          </div>

          <div class="two-col">
            <div class="box">
              <div class="box-title">Billed to</div>
              <div>${order.name || ""}</div>
              <div>${order.address || ""}</div>
              <div>${order.pincode ? "Pincode: " + order.pincode : ""}</div>
              <div>${order.phoneNumber ? "Phone: " + order.phoneNumber : ""}</div>
              <div>${order.email || ""}</div>
            </div>
            <div class="box">
              <div class="box-title">Order details</div>
              <div><strong>Order ID:</strong> ${orderIdF}</div>
              <div><strong>Status:</strong> ${order.status || "-"}</div>
              <div><strong>Total amount:</strong> ₹${total}</div>
            </div>
          </div>

          <h2>Items</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th align="right">Qty</th>
                <th align="right">Price</th>
                <th align="right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" align="right">Total</td>
                <td align="right">₹${total}</td>
              </tr>
            </tfoot>
          </table>

          <div class="muted">
            This is a computer generated invoice and does not require a signature.
          </div>
        </div>
      </body>
    </html>
  `;
};

// Refund / return invoice HTML – uses formatted IDs
const buildRefundInvoiceHtml = (returnReq) => {
  if (!returnReq) return "<html><body><p>Return not found.</p></body></html>";
  const returnIdF = formatReturnId(returnReq._id);
  const orderIdRaw = returnReq.orderId?._id || returnReq.orderId;
  const orderIdF = formatOrderId(orderIdRaw);
  const paymentIdF = formatPaymentId(returnReq.orderDetails?.paymentId);
  const refundAmount = returnReq.orderDetails?.amount || 0;
  const dateStr = String(returnReq.date || "").split("T")[0];
  const products = returnReq.orderDetails?.products || [];
  const bank = returnReq.bankDetails || {};
  const hasBankDetails = !!(
    bank.bankName ||
    bank.accountHolderName ||
    bank.accountNumber ||
    bank.ifscCode
  );
  const bankDetailsHtml = hasBankDetails
    ? `
          <div class="box" style="margin-top:16px;">
            <div class="box-title">Bank details for refund</div>
            <div>${bank.bankName || "-"}</div>
            <div><strong>Account holder:</strong> ${bank.accountHolderName || "-"}</div>
            <div><strong>Account number:</strong> ${bank.accountNumber ? "****" + String(bank.accountNumber).slice(-4) : "-"}</div>
            <div><strong>IFSC:</strong> ${bank.ifscCode || "-"}</div>
          </div>`
    : "";
  const itemsHtml = products
    .map(
      (p) => `
      <tr>
        <td>${p.productTitle || ""}</td>
        <td align="right">${p.quantity || 0}</td>
        <td align="right">₹${p.price || 0}</td>
        <td align="right">₹${p.subTotal || 0}</td>
      </tr>
    `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charSet="utf-8" />
        <title>Refund Invoice - ${returnIdF}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; margin: 0; padding: 24px; background: #f3f4f6; }
          .invoice { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 10px; padding: 24px 28px; box-shadow: 0 4px 16px rgba(15,23,42,0.08); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
          .brand { font-size: 20px; font-weight: 700; color: #111827; }
          .brand-sub { font-size: 12px; color: #6b7280; }
          .invoice-meta { text-align: right; font-size: 13px; color: #374151; }
          .refund-badge { background: #e8f5e9; color: #2e7d32; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .two-col { display: flex; justify-content: space-between; gap: 18px; margin: 16px 0 20px; }
          .box { flex: 1; border-radius: 8px; border: 1px solid #e5e7eb; padding: 12px 14px; font-size: 13px; }
          .box-title { font-weight: 600; font-size: 13px; color: #4b5563; margin-bottom: 6px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
          th, td { padding: 8px 6px; border-bottom: 1px solid #e5e7eb; }
          th { text-align: left; background: #f9fafb; font-weight: 600; }
          tfoot td { font-weight: 700; border-top: 1px solid #e5e7eb; }
          .muted { font-size: 11px; color: #6b7280; margin-top: 24px; }
          @media print { body { background: #fff; padding: 0; } .invoice { box-shadow: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <div>
              <div class="brand">ECOMMERCE</div>
              <div class="brand-sub">Refund invoice</div>
              <div class="refund-badge" style="margin-top:8px;">REFUND</div>
            </div>
            <div class="invoice-meta">
              <div><strong>Refund #</strong> ${returnIdF}</div>
              <div><strong>Order ID</strong> ${orderIdF}</div>
              <div><strong>Date</strong> ${dateStr}</div>
              <div><strong>Payment ID</strong> ${paymentIdF || "-"}</div>
            </div>
          </div>
          <div class="two-col">
            <div class="box">
              <div class="box-title">Customer</div>
              <div>${returnReq.customerName || ""}</div>
              <div>${returnReq.customerEmail || ""}</div>
              <div>${returnReq.customerPhone || ""}</div>
            </div>
            <div class="box">
              <div class="box-title">Return details</div>
              <div><strong>Return ID:</strong> ${returnIdF}</div>
              <div><strong>Order ID:</strong> ${orderIdF}</div>
              <div><strong>Status:</strong> ${returnReq.status || "-"}</div>
              <div><strong>Refund amount:</strong> ₹${refundAmount}</div>
              <div><strong>Reason:</strong> ${returnReq.reason || "-"}</div>
            </div>
          </div>
          ${bankDetailsHtml}
          <h2 style="margin:12px 0 6px;font-size:18px;">Items refunded</h2>
          <table>
            <thead>
              <tr><th>Product</th><th align="right">Qty</th><th align="right">Price</th><th align="right">Subtotal</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
              <tr><td colspan="3" align="right">Refund total</td><td align="right">₹${refundAmount}</td></tr>
            </tfoot>
          </table>
          <div class="muted">This is a computer generated refund invoice.</div>
        </div>
      </body>
    </html>
  `;
};

// Lightweight "order delivered" email using the same professional layout
const buildOrderDeliveredEmail = (order) => {
  if (!order) return null;
  let rawOrderId = order?._id || order?.id || "";
  if (typeof rawOrderId === "object" && rawOrderId !== null) {
    rawOrderId = rawOrderId.toString();
  }
  const orderIdF = rawOrderId ? formatOrderId(String(rawOrderId)) : "—";
  const dateStr = order.date ? String(order.date).split("T")[0] : "—";
  const total = order.amount != null ? Number(order.amount) : 0;
  const customerName = order.name || "Customer";

  const contentHtml = `
      <p>Hi <strong>${customerName}</strong>,</p>
      <p>Your order has been <strong>delivered</strong>. We hope you enjoy your purchase!</p>

      <div class="section">
        <div><span class="label">Order ID:</span> <span class="value">${orderIdF}</span></div>
        <div><span class="label">Delivered on:</span> <span class="value">${dateStr}</span></div>
        <div><span class="label">Total amount:</span> <span class="value">₹${total}</span></div>
        <div><span class="label">Status:</span> <span class="value">Delivered</span></div>
      </div>

      <div class="section" style="margin-top:16px;">
        <div class="label" style="margin-bottom:8px;">What&apos;s next?</div>
        <p class="muted">
          If there is any issue with your order, you can submit a return request from the &quot;My Returns&quot; section in your account (subject to the return policy).
        </p>
      </div>
  `;

  const subject = `Order delivered – ${orderIdF}`;
  const html = buildBaseEmail("Order delivered", contentHtml);
  const text = `Hi ${customerName},

Your order has been delivered.

Order ID: ${orderIdF}
Delivered on: ${dateStr}
Total amount: ₹${total}

If there is any issue with your order, you can submit a return request from your account.`;

  return { subject, html, text };
};

// Return request placed email – confirms that we received the request
const buildReturnRequestedEmail = (returnReq) => {
  if (!returnReq) return null;
  const returnIdF = returnReq._id ? formatReturnId(String(returnReq._id)) : "—";
  let orderIdRaw = returnReq?.orderId?._id || returnReq?.orderId || "";
  if (typeof orderIdRaw === "object" && orderIdRaw !== null) {
    orderIdRaw = orderIdRaw.toString();
  }
  const orderIdF = orderIdRaw ? formatOrderId(String(orderIdRaw)) : "—";
  const subject = `Return request received – ${returnIdF}`;
  const contentHtml = `
      <p>Hi <strong>${returnReq.customerName || "Customer"}</strong>,</p>
      <p>We have <strong>received</strong> your return request.</p>

      <div class="section">
        <div><span class="label">Return ID:</span> <span class="value">${returnIdF}</span></div>
        <div><span class="label">Order ID:</span> <span class="value">${orderIdF}</span></div>
        <div><span class="label">Status:</span> <span class="value">${returnReq.status || "Pending"}</span></div>
        <div><span class="label">Reason:</span> <span class="value">${returnReq.reason || "-"}</span></div>
      </div>

      <div class="section" style="margin-top:16px;">
        <div class="label" style="margin-bottom:8px;">Next steps</div>
        <p class="muted">
          Our team will review your request and update you once it is confirmed. You will receive another email when your return is accepted and when the refund is initiated.
        </p>
      </div>
  `;
  const html = buildBaseEmail("Return request received", contentHtml);
  const text = `Hi ${returnReq.customerName || "Customer"},

Your return request has been received.

Return ID: ${returnIdF}
Order ID: ${orderIdF}
Status: ${returnReq.status || "Pending"}
Reason: ${returnReq.reason || "-"}

We will review your request and notify you when it is accepted and when your refund is initiated.`;

  return { subject, html, text };
};

module.exports = {
  buildOtpEmail,
  buildOrderConfirmationEmail,
  buildReturnConfirmedEmail,
  buildRefundInitiatedEmail,
  buildOrderInvoiceHtml,
  buildRefundInvoiceHtml,
  buildOrderDeliveredEmail,
  buildReturnRequestedEmail,
};
