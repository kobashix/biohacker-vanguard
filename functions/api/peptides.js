export async function onRequest(context) {
  const { env } = context;

  try {
    // [ISSUE 3] Changed to ORDER BY rank ASC
    const pReq = env.DB.prepare(`
      SELECT p.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank ASC
    `).all();

    // [ISSUE 3] Changed to ORDER BY rank ASC
    const sReq = env.DB.prepare(`
      SELECT s.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Stacks s
      LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
      LEFT JOIN FAQs f ON sf.faq_id = f.id
      GROUP BY s.id
      ORDER BY s.rank ASC
    `).all();

    // [ISSUE 6] Fetch View_Stack_Details to get dosage instructions
    let mapping = { results: [] };
    try {
      mapping = await env.DB.prepare(`SELECT * FROM View_Stack_Details`).all();
    } catch (e) {
      console.log("View_Stack_Details missing or misspelled.", e);
    }

    const [peptides, stacks] = await Promise.all([pReq, sReq]);

    const pList = peptides.results;
    const sList = stacks.results;
    const links = mapping.results || [];

    sList.forEach(stack => {
        // [ISSUE 6] Match on stack_slug instead of ID, based on your screenshot
        const matches = links.filter(l => l.stack_slug === stack.slug);
        
        if (matches.length > 0) {
            stack.component_list = matches.map(m => ({
                name: m.peptide_name,
                slug: m.peptide_slug,
                dosage: m.dosage_instruction
            }));
        } else if (stack.peptides_used) {
            // Fallback
            stack.component_list = stack.peptides_used.split(',').map(s => ({
                name: s.trim(), slug: s.trim().toLowerCase().replace(' ', '-'), dosage: 'Review full protocol'
            }));
        } else {
            stack.component_list = [];
        }
    });

    return new Response(JSON.stringify({
      peptides: pList,
      stacks: sList
    }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}