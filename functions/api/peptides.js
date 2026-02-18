export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Fetch Peptides with joined FAQs
    const peptideQuery = `
      SELECT 
        p.id, p.peptide_name, p.slug, p.Category, p.primary_focus, 
        p.rank, p.Status, p.molecular_data, p.research_summary,
        p.nicknames, p.Sources,
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank DESC
    `;
    
    // 2. Fetch Stacks with joined FAQs
    const stackQuery = `
      SELECT 
        s.id, s.stack_name, s.slug, s.description, s.peptides_used, s.Category,
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Stacks s
      LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
      LEFT JOIN FAQs f ON sf.faq_id = f.id
      GROUP BY s.id
      ORDER BY s.rank DESC
    `;

    const [peptides, stacks] = await Promise.all([
      env.DB.prepare(peptideQuery).all(),
      env.DB.prepare(stackQuery).all()
    ]);

    return new Response(JSON.stringify({
      peptides: peptides.results,
      stacks: stacks.results
    }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}