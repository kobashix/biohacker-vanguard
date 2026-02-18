export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Fetch Peptides with Deep Data
    const peptideQuery = `
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
    
    // 2. Fetch Stacks (So we can link them in the modal)
    // Assuming a 'Stacks' table exists based on your backup. 
    // If not, this part returns empty array to prevent crash.
    let stacks = [];
    try {
      const stackRes = await env.DB.prepare("SELECT * FROM Stacks").all();
      stacks = stackRes.results;
    } catch (e) {
      console.log("No Stacks table found yet, sending empty list.");
    }

    const peptides = await env.DB.prepare(peptideQuery).all();

    return new Response(JSON.stringify({
      peptides: peptides.results,
      stacks: stacks
    }), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}