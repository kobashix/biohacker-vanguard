export async function onRequest(context) {
  const { env } = context;

  try {
    // UPDATED: Now performs a LEFT JOIN on the FAQ tables
    // Uses '|||' as a separator to bundle multiple questions into one string
    const query = `
      SELECT 
        p.id, 
        p.peptide_name as name, 
        p.slug, 
        p.Category as cat, 
        p.primary_focus as focus, 
        p.rank, 
        p.Status as status,
        p.molecular_data as molecular,
        p.research_summary as summary,
        p.nicknames,
        p.Sources as sources,
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank DESC
    `;

    const results = await env.DB.prepare(query).all();

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