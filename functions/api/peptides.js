export async function onRequest(context) {
  const { env } = context;

  try {
    // 1. Fetch Peptides + FAQs
    const pReq = env.DB.prepare(`
      SELECT p.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Peptides p
      LEFT JOIN Peptide_FAQs pf ON p.id = pf.peptide_id
      LEFT JOIN FAQs f ON pf.faq_id = f.id
      GROUP BY p.id ORDER BY p.rank DESC
    `).all();

    // 2. Fetch Stacks + FAQs
    const sReq = env.DB.prepare(`
      SELECT s.*, 
        GROUP_CONCAT(f.question, '|||') as faq_questions,
        GROUP_CONCAT(f.answer, '|||') as faq_answers
      FROM Stacks s
      LEFT JOIN Stack_FAQs sf ON s.id = sf.stack_id
      LEFT JOIN FAQs f ON sf.faq_id = f.id
      GROUP BY s.id ORDER BY s.rank DESC
    `).all();

    // 3. Fetch The Link Table (The Missing Piece)
    // We select everything just in case columns are named differently (stack_id/peptide_id vs names)
    const mapReq = env.DB.prepare(`SELECT * FROM View_Stack_Details`).all();

    const [peptides, stacks, mapping] = await Promise.all([pReq, sReq, mapReq]);

    // 4. DATA MERGE: Manually rebuild the 'peptides_used' list based on the View table
    const pList = peptides.results;
    const sList = stacks.results;
    const links = mapping.results;

    sList.forEach(stack => {
        // Find all rows in the View table that match this stack
        const matches = links.filter(l => l.stack_id === stack.id);
        
        // Map those rows to actual Peptide Names from the peptide list
        const componentNames = matches.map(m => {
            const p = pList.find(x => x.id === m.peptide_id);
            return p ? p.peptide_name : null;
        }).filter(n => n); // Remove nulls

        // If we found links in the View table, overwrite the string column
        if(componentNames.length > 0) {
            stack.peptides_used = componentNames.join(', ');
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