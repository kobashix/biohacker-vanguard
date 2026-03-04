export async function onRequest(context) {
  const { env } = context;
  
  try {
    // Query Peptides from D1
    const { results: peptides } = await env.DB.prepare(
      "SELECT * FROM peptides ORDER BY rank ASC"
    ).all();

    // Query Stacks from D1
    const { results: stacksRaw } = await env.DB.prepare(
      "SELECT * FROM stacks ORDER BY rank ASC"
    ).all();

    // Map stacks to include component lists if they are stored as JSON strings
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

    return new Response(JSON.stringify({ peptides, stacks }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message, details: "Ensure D1 binding name is 'DB' in wrangler.toml or dashboard." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
