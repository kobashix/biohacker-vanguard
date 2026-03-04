export async function onRequest(context) {
  const { env } = context;
  
  // 1. Dynamic D1 Binding Detection
  // We look for any binding that has the 'prepare' method (characteristic of D1)
  let d1 = env.DB; 
  if (!d1) {
    const d1Key = Object.keys(env).find(key => env[key] && typeof env[key].prepare === 'function');
    if (d1Key) d1 = env[d1Key];
  }

  if (!d1) {
    return new Response(JSON.stringify({ 
      error: "D1 Database binding not found.", 
      debug_env_keys: Object.keys(env),
      tip: "Go to Pages > Settings > Functions > D1 database bindings and ensure your D1 is bound." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 2. Fetch all data from D1
    // We use broad SELECT * to ensure we get everything present in the tables
    const { results: peptides } = await d1.prepare("SELECT * FROM peptides").all();
    const { results: stacksRaw } = await d1.prepare("SELECT * FROM stacks").all();

    const stacks = stacksRaw.map(s => {
      try {
        // Handle cases where component_list might be stored as a JSON string or object
        return {
          ...s,
          component_list: typeof s.component_list === 'string' ? JSON.parse(s.component_list) : s.component_list
        };
      } catch (e) {
        return s;
      }
    });

    // 3. Return the authoritative D1 response
    return new Response(JSON.stringify({ 
      peptides, 
      stacks,
      source: "Cloudflare D1 Database",
      count: peptides.length,
      timestamp: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "Access-Control-Allow-Origin": "*"
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack,
      context: "D1 Query Failure - Verify table names 'peptides' and 'stacks' exist."
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
