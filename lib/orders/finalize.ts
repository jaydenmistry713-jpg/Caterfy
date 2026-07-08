import {
  sendNewOrderNotification,
  sendOrderConfirmationToCustomer,
  sendFirstOrderCelebration,
  sendOrderAccepted,
} from '@/lib/resend/emails'

// Post-payment side effects for a *card* order. These are deferred from order
// creation to here so they only run once the customer actually pays — starting
// (and abandoning) the inline Stripe checkout must not email the caterer or
// customer, consume stock, or burn a discount use.
//
// Call this ONLY after atomically transitioning the order to paid (see the
// compare-and-set update in each reconcile path) so it runs exactly once, even
// if both the success-redirect and the webhook fire for the same order.
export async function finalizeCardOrder(supabase: any, orderId: string) {
  const { data: order } = await supabase
    .from('orders')
    .select('id, caterer_id, reference_number, customer_name, customer_email, event_date, total, order_type, payment_method, items, discount_code, caterers(email, business_name)')
    .eq('id', orderId)
    .single()
  if (!order) return

  const caterer = (order as any).caterers
  const businessName = caterer?.business_name || ''

  // Confirmation emails (caterer notification + customer confirmation),
  // deferred from creation.
  try {
    await Promise.all([
      caterer?.email
        ? sendNewOrderNotification(caterer.email, businessName, {
            reference_number: order.reference_number,
            customer_name: order.customer_name,
            event_date: order.event_date,
            total: order.total || undefined,
            order_type: order.order_type,
          })
        : Promise.resolve(),
      sendOrderConfirmationToCustomer(order.customer_email, {
        reference_number: order.reference_number,
        business_name: businessName,
        event_date: order.event_date,
        total: order.total || undefined,
        order_type: order.order_type,
        payment_method: order.payment_method,
        items: order.items as any,
      }),
    ])
  } catch (err) {
    console.error('Deferred order emails failed:', err)
  }

  // First-order celebration — the order row already exists, so a count of 1
  // means this is the caterer's first.
  try {
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('caterer_id', order.caterer_id)
    if (count === 1 && caterer?.email) {
      await sendFirstOrderCelebration(caterer.email, businessName, order.reference_number)
    }
  } catch (err) {
    console.error('First-order celebration failed:', err)
  }

  // Decrement stock for menu items with a stock_limit.
  if (Array.isArray(order.items)) {
    for (const it of order.items as any[]) {
      if (!it?.item_id || !it?.quantity) continue
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('stock_limit')
        .eq('id', it.item_id)
        .eq('caterer_id', order.caterer_id)
        .maybeSingle()
      if (menuItem && menuItem.stock_limit != null) {
        const newStock = Math.max(0, menuItem.stock_limit - Number(it.quantity))
        await supabase.from('menu_items').update({ stock_limit: newStock }).eq('id', it.item_id)
      }
    }
  }

  // Increment usage for an applied discount code.
  if (order.discount_code) {
    const { data: dc } = await supabase
      .from('discount_codes')
      .select('id, uses_count')
      .eq('caterer_id', order.caterer_id)
      .ilike('code', order.discount_code)
      .maybeSingle()
    if (dc) {
      await supabase.from('discount_codes').update({ uses_count: (dc.uses_count ?? 0) + 1 }).eq('id', dc.id)
    }
  }

  // Acceptance + review-link email — a paid card order is auto-accepted.
  try {
    await sendOrderAccepted(order.customer_email, {
      id: order.id,
      reference_number: order.reference_number,
      business_name: businessName,
      items: order.items as any,
    })
  } catch (err) {
    console.error('Acceptance email failed:', err)
  }
}
