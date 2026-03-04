export async function onRequest(context) {
  const { env } = context;
  
  // Verify DB binding exists
  if (!env.DB) {
    return new Response(JSON.stringify({ 
      error: "D1 Binding 'DB' not found.", 
      tip: "Ensure your D1 database is bound to the variable name 'DB' in the Cloudflare Pages dashboard under Settings > Functions > D1 database bindings." 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Query Peptides from D1
    const { results: peptides } = await env.DB.prepare(
      "SELECT * FROM peptides ORDER BY rank ASC"
    ).all();

    // Query Stacks from D1
    const { results: stacksRaw } = await env.DB.prepare(
      "SELECT * FROM stacks ORDER BY rank ASC"
    ).all();

    const stacks = stacksRaw.map(s => {
      try {
        return {
          ...s,
          component_list: typeof s.component_list === 'string' ? JSON.parse(s.component_list) : s.component_list
        };
      } catch (e) {
        return s;
      }
    });

    return new Response(JSON.stringify({ 
      peptides, 
      stacks,
      source: "Cloudflare D1 Database",
      timestamp: new Date().toISOString()
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message, 
      stack: error.stack,
      context: "Error querying D1 tables 'peptides' or 'stacks'"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
