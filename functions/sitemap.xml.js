export async function onRequest(context) {
  const { env } = context;
  const domain = "https://minmaxmuscle.com";

  try {
    // 1. Get all peptide slugs
    const { results } = await env.DB.prepare("SELECT slug, 'As Of' as date FROM Peptides").all();

    // 2. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url><loc>${domain}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
      <url><loc>${domain}/compounds</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>
      <url><loc>${domain}/calculators</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>`;

    // 3. Inject Dynamic Peptide Rows
    results.forEach(row => {
      xml += `
      <url>
        <loc>${domain}/peptide/${row.slug}</loc>
        <lastmod>${row.date || new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`;
    });

    xml += `</urlset>`;

    return new Response(xml, {
      headers: { "Content-Type": "application/xml" }
    });

  } catch (err) {
    return new Response(`<error>${err.message}</error>`, { status: 500 });
  }
}