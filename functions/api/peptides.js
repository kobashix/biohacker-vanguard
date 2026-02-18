export async function onRequest(context) {
  const { env } = context;

  try {
    // UPDATED: Selects ALL data columns needed for the detailed view
    const results = await env.DB.prepare(
      `SELECT 
        id, 
        peptide_name as name, 
        slug, 
        Category as cat, 
        primary_focus as focus, 
        rank, 
        Status as status,
        molecular_data as molecular,
        research_summary as summary,
        nicknames,
        Sources as sources
       FROM Peptides 
       ORDER BY rank DESC`
    ).all();

    return new Response(JSON.stringify(results.results), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}