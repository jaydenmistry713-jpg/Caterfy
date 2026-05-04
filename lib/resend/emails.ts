import { resend, FROM_EMAIL, ORDERS_EMAIL } from './index'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://caterfy.com'

function baseTemplate(content: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a1a1a; font-size: 28px; margin: 0;">Caterfy</h1>
      </div>
      ${content}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">
        Caterfy · <a href="${APP_URL}/terms" style="color: #999;">Terms</a> · <a href="${APP_URL}/privacy" style="color: #999;">Privacy</a>
      </p>
    </div>
  `
}

export async function sendEmailVerification(to: string, verificationUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Verify your Caterfy account',
    html: baseTemplate(`
      <h2>Verify your email address</h2>
      <p>Thanks for signing up to Caterfy! Please verify your email address to get started.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email Address</a>
      </div>
      <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    `),
  })
}

export async function sendWelcomeEmail(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Welcome to Caterfy, ${businessName}!`,
    html: baseTemplate(`
      <h2>Welcome to Caterfy! 🎉</h2>
      <p>Your account for <strong>${businessName}</strong> is ready. Here's how to get started:</p>
      <ol>
        <li>Complete your business profile</li>
        <li>Add your menu and services</li>
        <li>Upload gallery photos (min. 3)</li>
        <li>Connect your Stripe account to accept payments</li>
        <li>Go live!</li>
      </ol>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/dashboard" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Go to Dashboard</a>
      </div>
      <p style="color: #666; font-size: 14px;">Your 14-day free trial starts when your site goes live.</p>
    `),
  })
}

export async function sendNewOrderNotification(
  to: string,
  businessName: string,
  order: { reference_number: string; customer_name: string; event_date: string; total?: number; order_type: string }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    subject: `New order received — ${order.reference_number}`,
    html: baseTemplate(`
      <h2>New order received</h2>
      <p>Hi ${businessName}, you have a new ${order.order_type === 'quote' ? 'quote request' : 'order'}.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Reference</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${order.reference_number}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Customer</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.customer_name}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Event Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(order.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
        ${order.total ? `<tr><td style="padding: 8px; color: #666;">Total</td><td style="padding: 8px; font-weight: bold;">£${order.total.toFixed(2)}</td></tr>` : ''}
      </table>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/orders" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Order</a>
      </div>
      <p style="color: #e63946; font-size: 14px;">⚠️ Please respond within 48 hours or the order will be auto-cancelled.</p>
    `),
  })
}

export async function sendOrderConfirmationToCustomer(
  to: string,
  order: {
    reference_number: string
    business_name: string
    event_date: string
    total?: number
    order_type: string
    payment_method?: string
  }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    subject: `Order confirmation — ${order.reference_number}`,
    html: baseTemplate(`
      <h2>Order submitted!</h2>
      <p>Your ${order.order_type === 'quote' ? 'quote request' : 'order'} has been submitted to <strong>${order.business_name}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Reference</td><td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">${order.reference_number}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Caterer</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${order.business_name}</td></tr>
        <tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Event Date</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(order.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
        ${order.total ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #666;">Total</td><td style="padding: 8px; border-bottom: 1px solid #eee;">£${order.total.toFixed(2)}</td></tr>` : ''}
        <tr><td style="padding: 8px; color: #666;">Payment</td><td style="padding: 8px;">${order.payment_method === 'offline' ? 'Pay later — the caterer will contact you to arrange payment once your order is confirmed' : 'Card — awaiting acceptance'}</td></tr>
      </table>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/order-status?ref=${order.reference_number}" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Track Order Status</a>
      </div>
    `),
  })
}

export async function sendOrderAccepted(
  to: string,
  order: { reference_number: string; business_name: string; id: string }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    subject: `Order accepted — ${order.reference_number}`,
    html: baseTemplate(`
      <h2>Your order has been accepted! 🎉</h2>
      <p><strong>${order.business_name}</strong> has accepted your order (${order.reference_number}).</p>
      <p>They will be in touch to confirm the details. If you paid by card, your card will now be charged.</p>
      <p style="margin-top: 24px; color: #666; font-size: 14px;">Once your event is over, we'd love to hear how it went!</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${APP_URL}/review?order=${order.id}" style="background: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-size: 14px;">Leave a Review</a>
      </div>
    `),
  })
}

export async function sendInvoiceEmail(
  to: string,
  invoice: {
    invoice_number: string
    business_name: string
    customer_name: string
    line_items: { description: string; amount: number }[]
    total: number
    due_date?: string
  }
) {
  const rows = invoice.line_items
    .map((l) => `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${l.description}</td><td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">£${Number(l.amount).toFixed(2)}</td></tr>`)
    .join('')

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Invoice ${invoice.invoice_number} from ${invoice.business_name}`,
    html: baseTemplate(`
      <h2>Invoice from ${invoice.business_name}</h2>
      <p>Hi ${invoice.customer_name},</p>
      <p>Please find your invoice details below.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f9f9f9;">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #eee; color: #666;">Description</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #eee; color: #666;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px 8px; font-weight: bold; font-size: 16px;">Total</td>
            <td style="padding: 12px 8px; font-weight: bold; font-size: 16px; text-align: right;">£${Number(invoice.total).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      ${invoice.due_date ? `<p style="color: #666; font-size: 14px;">Payment due: <strong>${new Date(invoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></p>` : ''}
      <p style="color: #666; font-size: 14px;">Please arrange payment directly with ${invoice.business_name}. If you have any questions, reply to this email.</p>
    `),
  })
}

export async function sendOrderDeclined(to: string, order: { reference_number: string; business_name: string }) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    subject: `Order update — ${order.reference_number}`,
    html: baseTemplate(`
      <h2>Order update</h2>
      <p>Unfortunately, <strong>${order.business_name}</strong> is unable to fulfil your order (${order.reference_number}).</p>
      <p>Browse other caterers in our directory to find another match.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/directory" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Browse Directory</a>
      </div>
    `),
  })
}

export async function sendOrderReminder(to: string, businessName: string, orderId: string) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    subject: 'Order awaiting your response',
    html: baseTemplate(`
      <h2>You have a pending order</h2>
      <p>Hi ${businessName}, a customer is waiting for your response. Please accept or decline within 24 hours or the order will be auto-cancelled.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/orders" style="background: #e63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Respond Now</a>
      </div>
    `),
  })
}

export async function sendReviewRequest(
  to: string,
  customerName: string,
  businessName: string,
  orderId: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `How was ${businessName}?`,
    html: baseTemplate(`
      <h2>How was your experience?</h2>
      <p>Hi ${customerName}, we hope your event was a success! How was the catering from <strong>${businessName}</strong>?</p>
      <p>Your review helps other customers find great caterers.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/review?order=${orderId}" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Leave a Review</a>
      </div>
    `),
  })
}

export async function sendPaymentFailed(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'Payment failed — action required',
    html: baseTemplate(`
      <h2>Payment failed</h2>
      <p>Hi ${businessName}, your Caterfy subscription payment failed. Please update your payment details to keep your site live.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/settings" style="background: #e63946; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">Update Payment Details</a>
      </div>
      <p style="color: #666; font-size: 14px;">If payment is not received within 4 days, your site will go offline. Your data is always preserved.</p>
    `),
  })
}

export async function sendNewReviewNotification(to: string, businessName: string, rating: number) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `New ${rating}-star review received`,
    html: baseTemplate(`
      <h2>New review received</h2>
      <p>Hi ${businessName}, you've received a new ${rating}-star review!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${APP_URL}/reviews" style="background: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Review</a>
      </div>
    `),
  })
}
