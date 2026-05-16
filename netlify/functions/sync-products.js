// netlify/functions/sync-products.js
// Updates products.js in GitHub repo via GitHub API
// This triggers Netlify auto-rebuild so ALL users see new products

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

    if (!githubToken || !repoOwner || !repoName) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing githubToken, repoOwner, or repoName' }) };
    }

    if (!Array.isArray(products)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'products must be an array' }) };
    }

    const filePath = 'src/products.js';
    const apiBase  = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const ghHeaders = {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // 1. Get current file SHA (needed to update)
    const getRes  = await fetch(apiBase, { headers: ghHeaders });
    const getData = await getRes.json();

    if (!getRes.ok) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Could not read file from GitHub: ' + (getData.message || 'unknown error') }) };
    }

    const sha = getData.sha;

    // 2. Build new products.js content
    const newContent = `const PRODUCTS = ${JSON.stringify(products, null, 2)};\nexport default PRODUCTS;\n`;

    // 3. Base64 encode
    const encoded = Buffer.from(newContent).toString('base64');

    // 4. Push update to GitHub
    const updateRes = await fetch(apiBase, {
      method: 'PUT',
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Admin: updated products list (${products.length} items)`,
        content: encoded,
        sha: sha,
      }),
    });

    const updateData = await updateRes.json();

    if (!updateRes.ok) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'GitHub update failed: ' + (updateData.message || 'unknown') }) };
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({ success: true, message: `Products synced to GitHub! Netlify will rebuild in ~2 minutes.`, count: products.length }),
    };

  } catch (err) {
    console.error('sync-products error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server error: ' + err.message }) };
  }
};
