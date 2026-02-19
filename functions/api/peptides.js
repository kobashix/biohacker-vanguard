export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Fetch Peptides (Ordered by Rank High->Low)
    const pReq = env.DB.prepare(`
      SELECT p.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id
      ORDER BY p.rank DESC
    `).all();

    // 2. Fetch Stacks (Ordered by Rank High->Low)
    const sReq = env.DB.prepare(`
      SELECT s.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Stacks s
      LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
      LEFT JOIN FAQs f ON sf.faq_id = f.id
      GROUP BY s.id
      ORDER BY s.rank DESC
    `).all();

    // 3. Robust Mapping for Stack Components
    let mapping = { results: [] };
    try {
      mapping = await env.DB.prepare(`SELECT * FROM View_Stack_Details`).all();
    } catch (e) {
      console.log("View_Stack_Details missing, using fallback parsing.");
    }

    const [peptides, stacks] = await Promise.all([pReq, sReq]);

    // 4. Merge Data
    const pList = peptides.results;
    const sList = stacks.results;
    const links = mapping.results || [];

    sList.forEach(stack => {
        // Try View Table first
        const matches = links.filter(l => l.stack_id === stack.id);
        let componentNames = matches.map(m => {
            const p = pList.find(x => x.id === m.peptide_id);
            return p ? p.peptide_name : null;
        }).filter(n => n);

        // Fallback to text string
        if (componentNames.length === 0 && stack.peptides_used) {
            componentNames = stack.peptides_used.split(',').map(s => s.trim());
        }
        stack.component_list = componentNames;
    });

    return new Response(JSON.stringify({
      peptides: pList,
      stacks: sList
    }), { headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}