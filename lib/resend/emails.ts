import { resend, FROM_EMAIL, ORDERS_EMAIL } from './index'
import { SITE_URL, SUPPORT_EMAIL } from '@/lib/site'

const APP_URL = SITE_URL

type OrderLineItem = { name: string; quantity: number; price: number; price_unit?: string }

// ---------------------------------------------------------------------------
// Brand template — basil/cream/marigold, Georgia display, email-safe inline CSS
// ---------------------------------------------------------------------------

const COLOR = {
  basil: '#182A20',
  cream: '#F7F2E7',
  surface: '#FDFAF2',
  marigold: '#E8A33D',
  tomato: '#D25B43',
  ink: '#22261F',
  inkSoft: '#5B6156',
  border: '#E5DFCE',
}

function btn(href: string, label: string, variant: 'basil' | 'gold' | 'tomato' = 'basil') {
  const bg = variant === 'gold' ? COLOR.marigold : variant === 'tomato' ? COLOR.tomato : COLOR.basil
  const fg = variant === 'gold' ? COLOR.basil : COLOR.cream
  return `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${href}" style="background: ${bg}; color: ${fg}; padding: 14px 30px; text-decoration: none; border-radius: 999px; font-weight: bold; font-size: 15px; display: inline-block;">${label}</a>
    </div>
  `
}

// audience 'customer' adds the powered-by growth footer; caterer emails skip it
function baseTemplate(content: string, opts: { audience?: 'customer' | 'caterer' } = {}) {
  const poweredBy =
    opts.audience === 'customer'
      ? `<p style="color: #9A9F92; font-size: 12px; text-align: center; margin: 14px 0 0 0;">
          <a href="${APP_URL}/?utm_source=powered-by&utm_medium=email" style="color: #9A9F92;">Powered by Caterfy — websites for independent caterers</a>
        </p>`
      : ''
  return `
    <div style="background: ${COLOR.cream}; padding: 28px 16px; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 22px;">
          <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 28px; color: ${COLOR.basil};">Caterfy</span>
        </div>
        <div style="background: ${COLOR.surface}; border: 1px solid ${COLOR.border}; border-radius: 14px; padding: 32px 28px; color: ${COLOR.ink}; font-size: 15px; line-height: 1.6;">
          ${content}
        </div>
        <p style="color: #9A9F92; font-size: 12px; text-align: center; margin: 22px 0 0 0;">
          Questions? Reply to this email or write to <a href="mailto:${SUPPORT_EMAIL}" style="color: #9A9F92;">${SUPPORT_EMAIL}</a><br/>
          <a href="${APP_URL}/terms" style="color: #9A9F92;">Terms</a> · <a href="${APP_URL}/privacy" style="color: #9A9F92;">Privacy</a>
        </p>
        ${poweredBy}
      </div>
    </div>
  `
}

function heading(text: string) {
  return `<h2 style="font-family: Georgia, 'Times New Roman', serif; font-weight: 400; font-size: 24px; color: ${COLOR.basil}; margin: 0 0 14px 0;">${text}</h2>`
}

// Renders an order's items as an email-safe table. Returns '' when there are none
// (e.g. quote requests, which have no line items).
function itemsTable(items?: OrderLineItem[] | null) {
  if (!items || !Array.isArray(items) || items.length === 0) return ''
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border};">${i.name} × ${i.quantity}</td><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border}; text-align: right;">£${(Number(i.price) * Number(i.quantity)).toFixed(2)}</td></tr>`
    )
    .join('')
  return `
    <p style="font-weight: bold; margin: 24px 0 4px 0;">Your items</p>
    <table style="width: 100%; border-collapse: collapse; margin: 4px 0 8px 0;">
      <tbody>${rows}</tbody>
    </table>
  `
}

function detailRow(label: string, value: string, bold = false) {
  return `<tr><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border}; color: ${COLOR.inkSoft};">${label}</td><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border};${bold ? ' font-weight: bold;' : ''}">${value}</td></tr>`
}

const formatDateGB = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

// ---------------------------------------------------------------------------
// Auth & onboarding
// ---------------------------------------------------------------------------

export async function sendEmailVerification(to: string, verificationUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: 'Verify your Caterfy account',
    html: baseTemplate(`
      ${heading('Verify your email address')}
      <p>Thanks for signing up to Caterfy! Please verify your email address to get started.</p>
      ${btn(verificationUrl, 'Verify Email Address')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
    `),
  })
}

export async function sendWelcomeEmail(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Welcome to Caterfy, ${businessName}!`,
    html: baseTemplate(`
      ${heading('Welcome to Caterfy! 🎉')}
      <p>Your account for <strong>${businessName}</strong> is ready, and your 14-day free trial has started. Here's how to get set up:</p>
      <ol>
        <li>Pick a template and set your colours</li>
        <li>Add your menu and services</li>
        <li>Upload gallery photos (min. 3)</li>
        <li>Connect Stripe if you want card payments</li>
        <li>Share your link!</li>
      </ol>
      ${btn(`${APP_URL}/dashboard`, 'Go to Dashboard')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">Your trial runs for 14 days from signup — no card needed until you're ready.</p>
    `),
  })
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export async function sendNewOrderNotification(
  to: string,
  businessName: string,
  order: { reference_number: string; customer_name: string; event_date: string; total?: number; order_type: string }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `New order received — ${order.reference_number}`,
    html: baseTemplate(`
      ${heading('New order received')}
      <p>Hi ${businessName}, you have a new ${order.order_type === 'quote' ? 'quote request' : 'order'}.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${detailRow('Reference', order.reference_number, true)}
        ${detailRow('Customer', order.customer_name)}
        ${detailRow('Event Date', formatDateGB(order.event_date))}
        ${order.total ? detailRow('Total', `£${order.total.toFixed(2)}`, true) : ''}
      </table>
      ${btn(`${APP_URL}/orders`, 'View Order')}
      <p style="color: ${COLOR.tomato}; font-size: 14px;">⚠️ Please respond within 48 hours or the order will be auto-cancelled.</p>
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
    items?: OrderLineItem[] | null
  }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Order confirmation — ${order.reference_number}`,
    html: baseTemplate(`
      ${heading('Order submitted!')}
      <p>Your ${order.order_type === 'quote' ? 'quote request' : 'order'} has been submitted to <strong>${order.business_name}</strong>.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${detailRow('Reference', order.reference_number, true)}
        ${detailRow('Caterer', order.business_name)}
        ${detailRow('Event Date', formatDateGB(order.event_date))}
        ${order.total ? detailRow('Total', `£${order.total.toFixed(2)}`) : ''}
        ${detailRow('Payment', order.payment_method === 'offline' ? 'Pay later — the caterer will contact you to arrange payment once your order is confirmed' : order.payment_method === 'bank_transfer' ? 'Bank transfer — details provided at checkout' : 'Card — awaiting acceptance')}
      </table>
      ${itemsTable(order.items)}
      ${btn(`${APP_URL}/order-status?ref=${order.reference_number}`, 'Track Order Status')}
    `, { audience: 'customer' }),
  })
}

export async function sendOrderAccepted(
  to: string,
  order: { reference_number: string; business_name: string; id: string; items?: OrderLineItem[] | null }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Order accepted — ${order.reference_number}`,
    html: baseTemplate(`
      ${heading('Your order has been accepted! 🎉')}
      <p><strong>${order.business_name}</strong> has accepted your order (${order.reference_number}).</p>
      ${itemsTable(order.items)}
      <p>They will be in touch to confirm the details. If you paid by card, your card will now be charged.</p>
      <p style="margin-top: 24px; color: ${COLOR.inkSoft}; font-size: 14px;">Once your event is over, we'd love to hear how it went!</p>
      ${btn(`${APP_URL}/review?order=${order.id}`, 'Leave a Review', 'gold')}
    `, { audience: 'customer' }),
  })
}

export async function sendOrderDeclined(to: string, order: { reference_number: string; business_name: string }) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Order update — ${order.reference_number}`,
    html: baseTemplate(`
      ${heading('Order update')}
      <p>Unfortunately, <strong>${order.business_name}</strong> is unable to fulfil your order (${order.reference_number}).</p>
      <p>Browse other caterers in our directory to find another match.</p>
      ${btn(`${APP_URL}/directory`, 'Browse Directory')}
    `, { audience: 'customer' }),
  })
}

export async function sendOrderReminder(to: string, businessName: string, orderId: string) {
  void orderId
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: 'Order awaiting your response',
    html: baseTemplate(`
      ${heading('You have a pending order')}
      <p>Hi ${businessName}, a customer is waiting for your response. Please accept or decline within 24 hours or the order will be auto-cancelled.</p>
      ${btn(`${APP_URL}/orders`, 'Respond Now', 'tomato')}
    `),
  })
}

export async function sendOrderAutoCancelled(
  to: string,
  order: { reference_number: string; business_name: string }
) {
  return resend.emails.send({
    from: ORDERS_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Order cancelled — ${order.reference_number}`,
    html: baseTemplate(`
      ${heading('Your order was cancelled')}
      <p>We're sorry — <strong>${order.business_name}</strong> didn't respond to your order (${order.reference_number}) in time, so it has been automatically cancelled. You haven't been charged.</p>
      <p>There are plenty of other great caterers on Caterfy:</p>
      ${btn(`${APP_URL}/directory`, 'Browse Directory')}
    `, { audience: 'customer' }),
  })
}

export async function sendFirstOrderCelebration(to: string, businessName: string, reference: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: '🎉 Your first order through your site!',
    html: baseTemplate(`
      ${heading('Your first order is in! 🎉')}
      <p>Hi ${businessName} — order <strong>${reference}</strong> just came through your Caterfy page. No DMs, no back-and-forth. This is what it's all about.</p>
      ${btn(`${APP_URL}/orders`, 'View the Order', 'gold')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">Tip: the more places your link lives (Instagram bio, WhatsApp status, a QR code on your stall), the more of these you'll get. You can grab your QR code from the Site Editor → Share.</p>
    `),
  })
}

// ---------------------------------------------------------------------------
// Reviews & invoices
// ---------------------------------------------------------------------------

export async function sendReviewRequest(
  to: string,
  customerName: string,
  businessName: string,
  orderId: string
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `How was ${businessName}?`,
    html: baseTemplate(`
      ${heading('How was your experience?')}
      <p>Hi ${customerName}, we hope your event was a success! How was the catering from <strong>${businessName}</strong>?</p>
      <p>Your review helps other customers find great caterers.</p>
      ${btn(`${APP_URL}/review?order=${orderId}`, 'Leave a Review', 'gold')}
    `, { audience: 'customer' }),
  })
}

export async function sendNewReviewNotification(to: string, businessName: string, rating: number) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `New ${rating}-star review received`,
    html: baseTemplate(`
      ${heading('New review received')}
      <p>Hi ${businessName}, you've received a new ${rating}-star review!</p>
      ${btn(`${APP_URL}/reviews`, 'View Review')}
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
    bank_transfer_details?: string
  }
) {
  const rows = invoice.line_items
    .map((l) => `<tr><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border};">${l.description}</td><td style="padding: 8px; border-bottom: 1px solid ${COLOR.border}; text-align: right;">£${Number(l.amount).toFixed(2)}</td></tr>`)
    .join('')

  const bankSection = invoice.bank_transfer_details
    ? `<div style="margin-top: 24px; padding: 16px; background: ${COLOR.cream}; border-radius: 8px; border: 1px solid ${COLOR.border};">
        <p style="font-weight: bold; margin: 0 0 8px 0; font-size: 14px;">Bank Transfer Details</p>
        <pre style="font-family: monospace; font-size: 13px; color: ${COLOR.ink}; margin: 0; white-space: pre-wrap;">${invoice.bank_transfer_details}</pre>
      </div>`
    : ''

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `Invoice ${invoice.invoice_number} from ${invoice.business_name}`,
    html: baseTemplate(`
      ${heading(`Invoice from ${invoice.business_name}`)}
      <p>Hi ${invoice.customer_name},</p>
      <p>Please find your invoice details below.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: ${COLOR.cream};">
            <th style="padding: 8px; text-align: left; border-bottom: 2px solid ${COLOR.border}; color: ${COLOR.inkSoft};">Description</th>
            <th style="padding: 8px; text-align: right; border-bottom: 2px solid ${COLOR.border}; color: ${COLOR.inkSoft};">Amount</th>
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
      ${invoice.due_date ? `<p style="color: ${COLOR.inkSoft}; font-size: 14px;">Payment due: <strong>${formatDateGB(invoice.due_date)}</strong></p>` : ''}
      ${bankSection}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px; margin-top: 16px;">If you have any questions, reply to this email.</p>
    `, { audience: 'customer' }),
  })
}

// ---------------------------------------------------------------------------
// Subscription lifecycle
// ---------------------------------------------------------------------------

export async function sendPaymentFailed(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: 'Payment failed — action required',
    html: baseTemplate(`
      ${heading('Payment failed')}
      <p>Hi ${businessName}, your Caterfy subscription payment failed. Please update your payment details to keep your site live.</p>
      ${btn(`${APP_URL}/settings`, 'Update Payment Details', 'tomato')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">If payment is not received within 4 days, your site will go offline. Your data is always preserved.</p>
    `),
  })
}

export async function sendTrialDay1(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: 'Your site is waiting — one step to get it live',
    html: baseTemplate(`
      ${heading('Ready in an afternoon')}
      <p>Hi ${businessName}, your Caterfy trial is ticking and your site is one step away: pick a template, add your accent colour, and claim your link.</p>
      ${btn(`${APP_URL}/site-editor`, 'Open the Site Editor', 'gold')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">Most caterers are live the same day they start. Stuck on anything? Just reply to this email.</p>
    `),
  })
}

export async function sendTrialDay7(
  to: string,
  businessName: string,
  stats: { pageViews: number; orders: number }
) {
  const hasActivity = stats.pageViews > 0 || stats.orders > 0
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: hasActivity ? `Your first week on Caterfy, ${businessName}` : 'One week in — a quick tip',
    html: baseTemplate(`
      ${heading('One week in')}
      ${hasActivity
        ? `<p>Hi ${businessName}, here's your first week: <strong>${stats.pageViews} page view${stats.pageViews === 1 ? '' : 's'}</strong> and <strong>${stats.orders} order${stats.orders === 1 ? '' : 's'}</strong> through your site.</p>
           <p>The single biggest thing you can do next: put your link everywhere your customers already are — Instagram bio, WhatsApp status, story highlights.</p>`
        : `<p>Hi ${businessName}, you're halfway through your trial. The caterers who get the most out of Caterfy do one thing in week one: <strong>share their link</strong> — Instagram bio, WhatsApp status, story highlights.</p>
           <p>Your Share screen has a copy button, a WhatsApp share and a printable QR poster ready to go.</p>`}
      ${btn(`${APP_URL}/site-editor`, 'Share Your Link', 'gold')}
    `),
  })
}

export async function sendTrialEnding(to: string, businessName: string, daysLeft: number, endsAt: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `${daysLeft} day${daysLeft === 1 ? '' : 's'} left on your Caterfy trial`,
    html: baseTemplate(`
      ${heading(`${daysLeft} day${daysLeft === 1 ? '' : 's'} to go`)}
      <p>Hi ${businessName}, your free trial ends on <strong>${formatDateGB(endsAt)}</strong>.</p>
      <p>Keeping your site live is £10/month, flat — no commission, cancel anytime, and everything you've built stays exactly as it is.</p>
      ${btn(`${APP_URL}/settings?tab=subscription`, 'Keep My Site Live', 'gold')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">If you decide it's not for you, your data is kept safe and you can come back whenever you like.</p>
    `),
  })
}

export async function sendTrialEnded(to: string, businessName: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: 'Your Caterfy trial has ended — your site is paused',
    html: baseTemplate(`
      ${heading('Your trial has ended')}
      <p>Hi ${businessName}, your 14-day trial is over, so your site is paused — visitors see a friendly "taking a break" page rather than your menu.</p>
      <p>Everything you built is saved. Subscribe for £10/month and it's back online instantly.</p>
      ${btn(`${APP_URL}/settings?tab=subscription`, 'Reactivate My Site', 'gold')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">Wasn't quite right? We'd genuinely love to know why — just reply to this email.</p>
    `),
  })
}

export async function sendMonthlySummary(
  to: string,
  businessName: string,
  summary: { monthLabel: string; orders: number; revenue: number; newReviews: number; pageViews: number }
) {
  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    replyTo: SUPPORT_EMAIL,
    subject: `${summary.monthLabel} at ${businessName}`,
    html: baseTemplate(`
      ${heading(`${summary.monthLabel} in numbers`)}
      <p>Hi ${businessName}, here's what your Caterfy site did last month:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        ${detailRow('Page views', String(summary.pageViews), true)}
        ${detailRow('Orders received', String(summary.orders), true)}
        ${detailRow('Order value', `£${summary.revenue.toFixed(2)}`, true)}
        ${detailRow('New reviews', String(summary.newReviews), true)}
      </table>
      ${btn(`${APP_URL}/analytics`, 'See Full Analytics')}
      <p style="color: ${COLOR.inkSoft}; font-size: 14px;">More views = more orders. Sharing your link once a week (story, status, post) is the highest-impact habit.</p>
    `),
  })
}
