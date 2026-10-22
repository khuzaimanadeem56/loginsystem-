import express from "express";
import dotenv from "dotenv";
import Order from "../models/Order.js";
dotenv.config();

const router = express.Router();

// Create Stripe Checkout session
router.post('/create-checkout-session', async (req, res) => {
  const { items, success_url, cancel_url, email, name, address } = req.body;
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe secret key not configured on server.' });
  }

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = (items || []).map((it) => ({
      price_data: {
        currency: 'pkr',
        product_data: { name: it.name },
        unit_amount: Math.round((Number(it.sale || it.price || 0) || 0) * 100)
      },
      quantity: it.quantity || 1
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      // ensure session id is appended so frontend can fetch details after redirect
      success_url: success_url?.includes('{CHECKOUT_SESSION_ID}') ? success_url : `${success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url,
      customer_email: email,
      metadata: { frontend_user_name: name || '', frontend_address: address || '' }
    });

    console.log('[Stripe] create-checkout-session called, items:', (items || []).length, 'email:', email);
    // Persist pending orders so frontend/admin see the checkout immediately
    try {
      const shippingFee = 250;
      for (let i = 0; i < (items || []).length; i++) {
        const it = items[i];
        const order = new Order({
          userEmail: email || 'guest',
          userName: name || 'Guest',
          productName: it.name || 'Product',
          productId: it._id || null,
          quantity: it.quantity || 1,
          totalAmount: ((Number(it.sale || it.price || 0) * (it.quantity || 1)) + (i === 0 ? shippingFee : 0)),
          paymentMethod: 'Stripe',
          transactionId: session.id, // use session id as temporary transaction identifier
          address: address || '',
          status: 'Pending',
          date: new Date().toISOString()
        });
        try { await order.save(); console.log('[Stripe] pending order saved', { sessionId: session.id, product: it.name, quantity: it.quantity }); } catch (e) { console.error('Pending order save failed', e); }
      }
    } catch (e) {
      console.error('Failed to persist pending orders', e);
    }

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Stripe create session error', err);
    res.status(500).json({ error: 'Unable to create Stripe session' });
  }
});

// Stripe webhook endpoint to persist orders after successful payment
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).send('Stripe key missing');
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(500).send('Webhook secret missing');

  try {
    const Stripe = (await import('stripe')).default;
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed.', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      // retrieve full session with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, { expand: ['line_items'] });
      const items = fullSession.line_items?.data || [];
      const userEmail = fullSession.customer_email || '';
      const userName = fullSession.metadata?.frontend_user_name || fullSession.customer_details?.name || 'Stripe Customer';
      const address = fullSession.metadata?.frontend_address || '';

      console.log('[Stripe] webhook checkout.session.completed for session:', fullSession.id);
      // If pending orders already exist for this session, update them to Approved
      try {
        const existing = await Order.find({ transactionId: fullSession.id });
        if (existing && existing.length) {
          for (let o of existing) {
            o.status = 'Approved';
            o.transactionId = fullSession.payment_intent || fullSession.id;
            try { await o.save(); console.log('[Stripe] pending order approved', { orderId: o._id.toString(), transactionId: o.transactionId }); } catch (e) { console.error('Order update error', e); }
          }
        } else {
          // create order entries for each item (fallback if pending orders were not saved earlier)
          for (let i = 0; i < items.length; i++) {
            const li = items[i];
            const order = new Order({
              userEmail,
              userName,
              productName: li.description || li.price?.product?.name || 'Product',
              productId: null,
              quantity: li.quantity || 1,
              totalAmount: (li.amount_total || (li.price?.unit_amount || 0)) / 100,
              paymentMethod: 'Stripe',
              transactionId: fullSession.payment_intent || fullSession.id,
              address,
              // payment succeeded via Stripe so store as Approved
              status: 'Approved',
              date: new Date().toISOString()
            });
            try { await order.save(); console.log('[Stripe] fallback order saved', { product: li.description || li.price?.product?.name, qty: li.quantity }); } catch (e) { console.error('Order save error', e); }
          }
        }
      } catch (e) {
        console.error('Error updating/creating orders on webhook', e);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error', err);
    res.status(500).send('Server error');
  }
});

export default router;

// Endpoint to retrieve a Stripe session summary for frontend success page
router.get('/session/:id', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });
  try {
    const Stripe = (await import('stripe')).default;
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const sessionId = req.params.id;
    const fullSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    const items = (fullSession.line_items?.data || []).map(li => ({
      name: li.description || li.price?.product?.name || 'Product',
      quantity: li.quantity || 1,
      price: (li.price?.unit_amount || 0) / 100,
      total: (li.amount_total || 0) / 100
    }));
    const total = items.reduce((s, it) => s + (it.total || 0), 0);
    const payload = {
      items,
      total,
      transactionId: fullSession.payment_intent || fullSession.id,
      paymentMethod: 'Stripe',
      address: fullSession.metadata?.frontend_address || '',
      userName: fullSession.metadata?.frontend_user_name || fullSession.customer_details?.name || '' ,
      userEmail: fullSession.customer_email || ''
    };
    res.json(payload);
  } catch (err) {
    console.error('Stripe session fetch error', err);
    res.status(500).json({ error: 'Unable to fetch session' });
  }
});

// Debug: list orders for a given session id (helps verify pending/approved orders)
router.get('/debug/orders/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const orders = await Order.find({ transactionId: sessionId });
    res.json({ count: orders.length, orders });
  } catch (err) {
    console.error('Debug orders fetch error', err);
    res.status(500).json({ error: 'Unable to fetch orders' });
  }
});

// Debug: force-mark a session's pending orders as Approved (useful for local testing)
router.post('/debug/mark-approved/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe not configured' });
    const Stripe = (await import('stripe')).default;
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const fullSession = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['line_items'] });
    // reuse webhook logic: find pending orders and mark approved
    const existing = await Order.find({ transactionId: fullSession.id });
    if (existing && existing.length) {
      for (let o of existing) {
        o.status = 'Approved';
        o.transactionId = fullSession.payment_intent || fullSession.id;
        await o.save();
      }
      return res.json({ message: 'Orders marked Approved', count: existing.length });
    }
    return res.json({ message: 'No pending orders found for that session' });
  } catch (err) {
    console.error('Mark approved debug error', err);
    res.status(500).json({ error: 'Unable to mark approved' });
  }
});
