/**
 * MinMaxMuscle - Peptide Detail Resolver
 * This function handles the dynamic resolution of peptide dossiers
 * ensuring AdSense-friendly, content-rich responses.
 */

const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
    const slug = event.path.split('/').pop();
    
    try {
        // In a real environment, this would fetch from a DB or JSON file
        // For this implementation, we'll assume a data source exists or fallback to the main API
        const response = await fetch(`${process.env.URL || 'https://minmaxmuscle.com'}/api/peptides`);
        const data = await response.json();
        const peptide = data.peptides.find(p => p.slug === slug);

        if (!peptide) {
            return { statusCode: 404, body: "Peptide not found" };
        }

        let template = fs.readFileSync(path.resolve(__dirname, '../../peptidetemplate.html'), 'utf8');

        // Replace tokens with unique, high-value content
        const html = template
            .replace(/{{peptide_name}}/g, peptide.peptide_name)
            .replace(/{{Category}}/g, peptide.Category || 'Core Research')
            .replace(/{{nicknames}}/g, peptide.nicknames || 'N/A')
            .replace(/{{Status}}/g, peptide.Status || 'Active Research')
            .replace(/{{rank}}/g, peptide.rank || '0')
            .replace(/{{forum_url}}/g, peptide.forum_topic_url || `https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=${encodeURIComponent(peptide.peptide_name)}`)
            .replace(/{{research_summary}}/g, peptide.primary_focus || peptide.research_summary)
            .replace(/{{molecular_data}}/g, peptide.molecular_data || 'Data Classified - Review Clinical Literature')
            .replace(/{{FAQs}}/g, renderFAQs(peptide))
            .replace(/{{Sources}}/g, renderSources(peptide));

        return {
            statusCode: 200,
            headers: { "Content-Type": "text/html" },
            body: html
        };
    } catch (error) {
        return { statusCode: 500, body: "Internal Server Error: " + error.message };
    }
};

function renderFAQs(p) {
    const q = p.faq_questions ? p.faq_questions.split('|||') : [];
    const a = p.faq_answers ? p.faq_answers.split('|||') : [];
    if (!q.length) return '<p class="text-gray-500 italic text-xs">No specific inquiries recorded for this compound.</p>';
    
    return q.map((qi, i) => `
        <details class="bg-white/5 rounded-2xl group border border-white/5">
            <summary class="p-6 cursor-pointer font-bold text-sm flex justify-between items-center italic uppercase text-white leading-none">
                ${qi}
                <i data-feather="chevron-down" class="w-4 h-4 text-gray-600 group-open:rotate-180 transition"></i>
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
        <a href="${s.trim()}" target="_blank" class="p-4 bg-white/5 rounded-xl border border-white/10 text-[10px] text-blue-400 hover:bg-blue-600 hover:text-white transition flex justify-between items-center group">
            <span class="font-black uppercase italic">Source Dossier ${i+1}</span>
            <i data-feather="external-link" class="w-3 h-3 opacity-50 group-hover:opacity-100"></i>
        </a>
    `).join('');
}
