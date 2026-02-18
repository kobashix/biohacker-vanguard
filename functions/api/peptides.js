export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Fetch Peptides + FAQs
    const peptideQuery = `
      SELECT 
        p.id, p.peptide_name as name, p.slug, p.Category as cat, p.primary_focus as focus, 
        p.rank, p.Status as status, p.molecular_data as molecular, p.research_summary as summary,
        p.nicknames, p.Sources as sources,
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank DESC
    `;
    
    // 2. Fetch Stacks + Stack FAQs
    const stackQuery = `
        SELECT 
          s.id, s.stack_name as name, s.description as desc, s.peptides_used as components,
          GROUP_CONCAT(f.question, '|||') as faq_questions,
          GROUP_CONCAT(f.answer, '|||') as faq_answers
        FROM Stacks s
        LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
        LEFT JOIN FAQs f ON sf.faq_id = f.id
        GROUP BY s.id
    `;

    const peptides = await env.DB.prepare(peptideQuery).all();
    const stacks = await env.DB.prepare(stackQuery).all();

    return new Response(JSON.stringify({
      peptides: peptides.results,
      stacks: stacks.results
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