export async function onRequest(context) {
  const { env } = context;
  try {
    // 1. Get Peptides with concatenated FAQs
    const peptides = await env.DB.prepare(`
      SELECT p.*, 
             GROUP_CONCAT(f.question, '|||') as faq_questions,
             GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank DESC
    `).all();

    // 2. Get Stacks with concatenated FAQs
    const stacks = await env.DB.prepare(`
      SELECT s.*, 
             GROUP_CONCAT(f.question, '|||') as faq_questions,
             GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Stacks s
      LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
      LEFT JOIN FAQs f ON sf.faq_id = f.id
      GROUP BY s.id
      ORDER BY s.rank DESC
    `).all();

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