export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Query your D1 Database (using the schema from your backup)
    // We map 'peptide_name' to 'name' to match the frontend
    const results = await env.DB.prepare(
      `SELECT 
        id, 
        peptide_name as name, 
        slug, 
        Category as cat, 
        primary_focus as desc, 
        rank, 
        Status as status 
       FROM Peptides 
       ORDER BY rank DESC`
    ).all();

    // 2. Return JSON to the frontend
    return new Response(JSON.stringify(results.results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600" // Cache for speed (1hr)
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}