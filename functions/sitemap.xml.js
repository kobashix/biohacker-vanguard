export async function onRequest(context) {
  const { env } = context;
  const domain = "https://minmaxmuscle.com";

  try {
    // Attempt to fetch DB logic, fallback to empty array if D1 binding isn't ready in the environment
    let peptides = [];
    let stacks = [];
    try {
      const pRes = await env.DB.prepare("SELECT slug, 'As Of' as date FROM Peptides").all();
      peptides = pRes.results;
      const sRes = await env.DB.prepare("SELECT slug FROM Stacks").all();
      stacks = sRes.results;
    } catch (e) {
      console.warn("DB not bound for sitemap yet.");
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${domain}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
      <url><loc>${domain}/peptides</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
      <url><loc>${domain}/stacks</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
      <url><loc>${domain}/calculators</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      <url><loc>${domain}/coaching</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>
      
      <!-- EEAT / Trust Pages (Critical for SEO/AdSense) -->
      <url><loc>${domain}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
      <url><loc>${domain}/contact</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
      <url><loc>${domain}/privacy</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>
      <url><loc>${domain}/terms</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>`;

    // Inject dynamic peptides
    peptides.forEach(row => {
      xml += `
      <url>
        <loc>${domain}/peptide/${row.slug}</loc>
        <lastmod>${row.date || new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
    });

    // Inject dynamic stacks
    stacks.forEach(row => {
      xml += `
      <url>
        <loc>${domain}/stack/${row.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
    });

    xml += `</urlset>`;

    return new Response(xml, { headers: { "Content-Type": "application/xml" } });

  } catch (err) {
    return new Response(`<error>${err.message}</error>`, { status: 500 });
  }
}