// netlify/functions/sync-products.js
// Updates src/products.js in GitHub → triggers Netlify auto-rebuild

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST')    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };

  try {
    const { products, githubToken, repoOwner, repoName } = JSON.parse(event.body || '{}');

    if (!githubToken) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing GitHub token' }) };
    if (!repoOwner)   return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing repo owner' }) };
    if (!repoName)    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing repo name' }) };
    if (!Array.isArray(products)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'products must be an array' }) };

    const filePath = 'src/products.js';
    const apiUrl   = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const ghHeaders = {
      'Authorization': `token ${githubToken}`,
      'Accept':        'application/vnd.github.v3+json',
      'Content-Type':  'application/json',
      'User-Agent':    'netlify-shop-sync',
    };

    // Get current file SHA
    const getRes  = await fetch(apiUrl, { headers: ghHeaders });
    const getData = await getRes.json();

    if (!getRes.ok) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `GitHub error: ${getData.message || 'Could not read file'}` }) };
    }

    // Build new file content
    const newContent = `const PRODUCTS = ${JSON.stringify(products, null, 2)};\nexport default PRODUCTS;\n`;
    const encoded    = Buffer.from(newContent).toString('base64');

    // Push to GitHub
    const putRes  = await fetch(apiUrl, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Admin: update products (${products.length} items)`,
        content: encoded,
        sha:     getData.sha,
      }),
    });
    const putData = await putRes.json();

    if (!putRes.ok) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: `GitHub update failed: ${putData.message || 'unknown error'}` }) };
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, message: `✅ ${products.length} products synced! Netlify is rebuilding (~2 min).` }),
    };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
