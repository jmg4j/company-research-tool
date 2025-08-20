exports.handler = async (event, context) => {
  console.log('=== FUNCTION START ===');
  console.log('Method:', event.httpMethod);
  console.log('Has API Key:', !!process.env.PERPLEXITY_API_KEY);
  console.log('API Key prefix:', process.env.PERPLEXITY_API_KEY?.substring(0, 8));
  
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const apiKey = process.env.PERPLEXITY_API_KEY;
    
    if (!apiKey) {
      console.log('ERROR: No API key found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'No API key configured' }),
      };
    }

    console.log('Making API request...');
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-reasoning-pro',
        messages: [
          { role: 'user', content: 'Test message - just respond with "Hello"' }
        ],
        max_tokens: 50
      })
    });

    console.log('Response status:', response.status);
    console.log('Response content-type:', response.headers.get('content-type'));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('API Error Response:', errorText);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: 'Perplexity API error', details: errorText }),
      };
    }

    const data = await response.json();
    console.log('SUCCESS: Got JSON response');
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'API working!' }),
    };

  } catch (error) {
    console.log('CATCH ERROR:', error.message);
    console.log('Error stack:', error.stack);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Function error', details: error.message }),
    };
  }
};
