// netlify/functions/create-order.js
// Runs SERVER-SIDE on Netlify. Your Cashfree keys are NEVER visible to users.

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode:200, headers, body:'' };
  if (event.httpMethod !== 'POST')    return { statusCode:405, headers, body: JSON.stringify({ error:'Method not allowed' }) };

  try {
    const { amount, customerName, customerPhone, orderId, appId, secretKey, environment } = JSON.parse(event.body || '{}');

    if (!amount || !appId || !secretKey) {
      return { statusCode:400, headers, body: JSON.stringify({ error:'Missing required fields: amount, appId, secretKey' }) };
    }

    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const origin = event.headers.origin || event.headers.referer?.replace(/\/$/, '') || 'https://your-site.netlify.app';

    const payload = {
      order_id: orderId || `order_${Date.now()}`,
      order_amount: Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id:    `cust_${Date.now()}`,
        customer_name:  customerName  || 'Customer',
        customer_phone: customerPhone || '9999999999',
        customer_email: `customer_${Date.now()}@shop.local`,
      },
      order_meta: {
        // After payment, customer returns to your site
        return_url: `${origin}/payment-success?order_id={order_id}&order_token={order_token}`,
        // All UPI apps + cards + wallets shown — no Cashfree branding on checkout
        payment_methods: 'upi,nb,cc,dc,wallet,emi',
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type':    'application/json',
        'x-api-version':   '2023-08-01',
        'x-client-id':     appId,
        'x-client-secret': secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cashfree error:', data);
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: data.message || data.type || 'Payment order creation failed' }),
      };
    }

    // Only return what frontend needs — keys are never sent back
    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        payment_session_id: data.payment_session_id,
        order_id:           data.order_id,
        payment_link:       data.payment_link || null,
      }),
    };

  } catch (err) {
    console.error('Function error:', err);
    return { statusCode:500, headers, body: JSON.stringify({ error:'Server error: ' + err.message }) };
  }
};
