// netlify/functions/create-order.js
// Cashfree keys are read from Netlify Environment Variables (CASHFREE_APP_ID, CASHFREE_SECRET_KEY)
// OR passed from frontend if env vars not set (fallback for admin-configured keys)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount, customerName, customerPhone, orderId } = body;

    // Prefer Netlify env vars, fall back to what frontend sends
    const appId     = process.env.CASHFREE_APP_ID     || body.appId;
    const secretKey = process.env.CASHFREE_SECRET_KEY  || body.secretKey;
    const environment = process.env.CASHFREE_ENV       || body.environment || 'production';

    if (!amount)     return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing amount' }) };
    if (!appId)      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Payment gateway not configured. Add CASHFREE_APP_ID to Netlify environment variables.' }) };
    if (!secretKey)  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Payment gateway not configured. Add CASHFREE_SECRET_KEY to Netlify environment variables.' }) };

    const baseUrl = environment === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const origin = event.headers.origin
      || (event.headers.referer ? event.headers.referer.split('/').slice(0,3).join('/') : 'https://your-site.netlify.app');

    const payload = {
      order_id:       orderId || `order_${Date.now()}`,
      order_amount:   Number(amount),
      order_currency: 'INR',
      customer_details: {
        customer_id:    `cust_${Date.now()}`,
        customer_name:  customerName  || 'Customer',
        customer_phone: customerPhone || '9999999999',
        customer_email: `customer_${Date.now()}@shop.com`,
      },
      order_meta: {
        return_url:      `${origin}/payment-success?order_id={order_id}&order_token={order_token}`,
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
      return { statusCode: 400, headers, body: JSON.stringify({ error: data.message || data.type || 'Payment order creation failed' }) };
    }

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
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
