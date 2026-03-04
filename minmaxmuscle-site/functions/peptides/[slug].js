/**
 * MinMaxMuscle - Peptide Detail Resolver (D1 Authoritative)
 * This function queries the Cloudflare D1 database directly to serve
 * high-value, SEO-friendly peptide dossiers.
 */

const fs = require('fs');
const path = require('path');

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const slug = url.pathname.split('/').pop();
    
    // 1. Dynamic D1 Binding Detection
    let d1 = env.DB; 
    if (!d1) {
        const d1Key = Object.keys(env).find(key => env[key] && typeof env[key].prepare === 'function');
        if (d1Key) d1 = env[d1Key];
    }

    if (!d1) {
        return new Response("D1 Database binding not found. Please check Cloudflare dashboard settings.", { status: 500 });
    }

    try {
        // 2. Query Peptide from D1 by slug
        const peptide = await d1.prepare("SELECT * FROM peptides WHERE slug = ?").bind(slug).first();

        if (!peptide) {
            return new Response("Peptide dossier not found in archive.", { status: 404 });
        }

        // 3. Load Template
        // Note: In Cloudflare Pages Functions, we can use standard fetch to get the local template or assume it's in the assets
        const templateUrl = new URL('/peptidetemplate.html', request.url);
        const templateRes = await fetch(templateUrl);
        let template = await templateRes.text();

        // 4. Resolve unique content
        const forumUrl = peptide.forum_topic_url || `https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=${encodeURIComponent(peptide.peptide_name)}`;
        
        const html = template
            .replace(/{{peptide_name}}/g, peptide.peptide_name)
            .replace(/{{Category}}/g, peptide.Category || 'Core Research')
            .replace(/{{nicknames}}/g, peptide.nicknames || 'N/A')
            .replace(/{{Status}}/g, peptide.Status || 'Active Research')
            .replace(/{{rank}}/g, peptide.rank || '0')
            .replace(/{{forum_url}}/g, forumUrl)
            .replace(/{{research_summary}}/g, peptide.primary_focus || peptide.research_summary)
            .replace(/{{molecular_data}}/g, peptide.molecular_data || 'Data Classified - Review Clinical Literature')
            .replace(/{{FAQs}}/g, renderFAQs(peptide))
            .replace(/{{Sources}}/g, renderSources(peptide));

        return new Response(html, {
            headers: { 
                "Content-Type": "text/html",
                "Cache-Control": "public, max-age=3600" 
            }
        });
    } catch (error) {
        return new Response("Internal Resolver Error: " + error.message, { status: 500 });
    }
}

function renderFAQs(p) {
    const q = p.faq_questions ? p.faq_questions.split('|||') : [];
    const a = p.faq_answers ? p.faq_answers.split('|||') : [];
    if (!q.length) return '<p class="text-gray-500 italic text-xs">No specific inquiries recorded for this compound.</p>';
    
    return q.map((qi, i) => `
        <details class="bg-white/5 rounded-2xl group border border-white/5 mb-2">
            <summary class="p-6 cursor-pointer font-bold text-sm flex justify-between items-center italic uppercase text-white leading-none">
                ${qi}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-gray-600 group-open:rotate-180 transition"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </summary>
            <p class="p-6 pt-0 text-sm text-gray-400 leading-relaxed border-t border-white/5 mt-4">
                ${a[i] || 'Details pending additional clinical review.'}
            </p>
        </details>
    `).join('');
}

function renderSources(p) {
    const src = p.Sources ? p.Sources.split(',') : [];
    if (!src.length) return '<p class="text-gray-500 italic text-[10px]">Primary sources pending archival.</p>';
    
    return src.map((s, i) => `
        <a href="${s.trim()}" target="_blank" class="p-4 bg-white/5 rounded-xl border border-white/10 text-[10px] text-blue-400 hover:bg-blue-600 hover:text-white transition flex justify-between items-center group mb-2">
            <span class="font-black uppercase italic">Source Dossier ${i+1}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover:opacity-100"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
        </a>
    `).join('');
}
