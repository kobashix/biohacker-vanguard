/**
 * MINMAXMUSCLE - Core SPA Logic
 * Handles routing, data fetching, rendering, and interactive components.
 */

const ROUTES = { 
    '/': { id: 'view-home', title: 'MINMAXMUSCLE | Peak Human Performance' },
    '/peptides': { id: 'view-peptides', title: 'Peptide Database | MINMAXMUSCLE' },
    '/stacks': { id: 'view-stacks', title: 'Protocol Stacks | MINMAXMUSCLE' },
    '/calculators': { id: 'view-calculators', title: 'Peptide Calculators | MINMAXMUSCLE' },
    '/coaching': { id: 'view-coaching', title: 'Performance Coaching | MINMAXMUSCLE' },
    '/about': { id: 'view-about', title: 'About Us | MINMAXMUSCLE' },
    '/contact': { id: 'view-contact', title: 'Contact | MINMAXMUSCLE' },
    '/privacy': { id: 'view-privacy', title: 'Privacy Policy | MINMAXMUSCLE' },
    '/terms': { id: 'view-terms', title: 'Terms of Service | MINMAXMUSCLE' }
};

let DB = { 
    peptides: [
        { id: 1, slug: 'semaglutide', peptide_name: 'Semaglutide', Category: 'Metabolic', nicknames: 'Ozempic, Wegovy', Status: 'FDA Approved (Weight Loss)', rank: 1, primary_focus: 'Appetite regulation and bodyweight reduction via GLP-1 activity.', research_summary: 'Semaglutide is a glucagon-like peptide-1 (GLP-1) receptor agonist. It increases insulin secretion, decreases glucagon secretion, and slows gastric emptying, leading to significant weight loss and improved glycemic control.', molecular_data: 'C187H291N45O59', faq_questions: 'How does it work?|||What are common side effects?', faq_answers: 'It mimics the GLP-1 hormone that targets areas of the brain that regulate appetite and food intake.|||Nausea, diarrhea, vomiting, and constipation are commonly reported.' },
        { id: 2, slug: 'tirzepatide', peptide_name: 'Tirzepatide', Category: 'Metabolic', nicknames: 'Mounjaro, Zepbound', Status: 'FDA Approved (Weight Loss)', rank: 2, primary_focus: 'Dual incretin activity tied to weight loss and glucose regulation.', research_summary: 'Tirzepatide is a dual glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptor agonist. This dual action leads to greater weight loss and glycemic control compared to selective GLP-1 agonists.', molecular_data: 'C225H348N48O68', faq_questions: 'What makes it different from Semaglutide?|||Is it once weekly?', faq_answers: 'It targets two receptors (GIP and GLP-1) instead of just one, which may enhance its metabolic effects.|||Yes, it is typically administered via subcutaneous injection once per week.' },
        { id: 3, slug: 'bpc-157', peptide_name: 'BPC-157', Category: 'Recovery', nicknames: 'Body Protection Compound 157', Status: 'Research Only', rank: 3, primary_focus: 'Soft-tissue recovery, tendon resilience, and gut-related support.', research_summary: 'BPC-157 is a pentadecapeptide composed of 15 amino acids. It is a partial sequence of body protection compound (BPC) that is discovered in and isolated from human gastric juice.', molecular_data: 'C62H98N16O22', faq_questions: 'Is it stable in the gut?|||How is it administered?', faq_answers: 'Yes, BPC-157 is known for its stability in gastric juice, making oral administration viable for GI issues.|||Commonly administered via subcutaneous or intramuscular injection near the injury site, or orally.' },
        { id: 4, slug: 'thymosin-beta-4', peptide_name: 'Thymosin Beta-4', Category: 'Recovery', nicknames: 'TB-500', Status: 'Research Only', rank: 4, primary_focus: 'Healing support and tissue-regeneration claims.', research_summary: 'Thymosin Beta-4 is a major actin-sequestering protein in most tissues. It plays a vital role in cell proliferation, migration, and differentiation, which are key to tissue repair.', molecular_data: 'C212H350N56O78S', faq_questions: 'Is TB-500 the same as TB4?|||What is the focus of research?', faq_answers: 'TB-500 is a synthetic version of the active region of Thymosin Beta-4.|||Research focuses on its ability to promote angiogenesis and reduce inflammation in injured tissues.' },
        { id: 5, slug: 'ipamorelin', peptide_name: 'Ipamorelin', Category: 'GH Axis', nicknames: 'NNC 26-0161', Status: 'Research Only', rank: 5, primary_focus: 'Growth-hormone secretagogue activity tied to recovery and sleep.', research_summary: 'Ipamorelin is a selective GH secretagogue and ghrelin receptor agonist. It stimulates GH release without significantly affecting cortisol or prolactin levels.', molecular_data: 'C38H49N9O5', faq_questions: 'Does it increase appetite?|||When is it usually taken?', faq_answers: 'Unlike GHRP-6, Ipamorelin does not significantly increase hunger.|||It is often administered before bed to mimic the natural nocturnal pulse of growth hormone.' },
        { id: 6, slug: 'cjc-1295', peptide_name: 'CJC-1295', Category: 'GH Axis', nicknames: 'DAC:GRF', Status: 'Research Only', rank: 6, primary_focus: 'Sustained growth-hormone pulse support.', research_summary: 'CJC-1295 is a tetrasubstituted 29-amino acid peptide hormone analog of GHRH. The DAC (Drug Affinity Complex) version extends its half-life significantly.', molecular_data: 'C165H271N47O46', faq_questions: 'What is DAC?|||Is it often stacked?', faq_answers: 'DAC allows the peptide to bind to albumin, extending its duration of action from minutes to days.|||Yes, it is frequently combined with Ipamorelin for synergistic GH release.' },
        { id: 7, slug: 'tesamorelin', peptide_name: 'Tesamorelin', Category: 'GH Axis', nicknames: 'Egrifta', Status: 'FDA Approved (Lipodystrophy)', rank: 7, primary_focus: 'Growth hormone stimulation and visceral fat reduction.', research_summary: 'Tesamorelin is a synthetic analog of growth hormone-releasing factor (GRF). It is specifically used to reduce excess abdominal fat in HIV-infected patients with lipodystrophy.', molecular_data: 'C221H366N72O67S', faq_questions: 'Does it target subcutaneous fat?|||Is it a GHRP?', faq_answers: 'Its primary clinical indication is for visceral adipose tissue, not general subcutaneous fat.|||No, it is a GHRH (Growth Hormone Releasing Hormone) analog.' },
        { id: 8, slug: 'mots-c', peptide_name: 'MOTS-c', Category: 'Metabolic', nicknames: 'Mitochondrial Open Reading Frame of the 12S rRNA-c', Status: 'Research Only', rank: 8, primary_focus: 'Metabolic signaling and endurance-related research.', research_summary: 'MOTS-c is a mitochondrial-derived peptide that regulates metabolic homeostasis. It is known to enhance fatty acid oxidation and improve exercise capacity.', molecular_data: 'C101H152N28O22S', faq_questions: 'Is it an exercise mimetic?|||Where is it found?', faq_answers: 'It is often referred to as an "exercise mimetic" because it activates similar metabolic pathways as physical activity.|||It is naturally encoded in the mitochondrial genome.' },
        { id: 9, slug: 'epitalon', peptide_name: 'Epitalon', Category: 'Longevity', nicknames: 'Epithalon, Epithalamin', Status: 'Research Only', rank: 9, primary_focus: 'Longevity-related research and sleep-rhythm claims.', research_summary: 'Epitalon is a synthetic tetrapeptide (Ala-Glu-Asp-Gly) based on a natural peptide called epithalamin. It is researched for its ability to activate telomerase.', molecular_data: 'C14H22N4O9', faq_questions: 'How does it affect sleep?|||What are telomeres?', faq_answers: 'It is believed to regulate melatonin production, which helps normalize circadian rhythms.|||Telomeres are protective caps on chromosomes; Epitalon is studied for its potential to extend them.' },
        { id: 10, slug: 'ghk-cu', peptide_name: 'GHK-Cu', Category: 'Dermal', nicknames: 'Copper Peptide', Status: 'Cosmetic Use', rank: 10, primary_focus: 'Skin health, collagen support, and hair-related claims.', research_summary: 'GHK-Cu is a naturally occurring copper complex of the tripeptide glycyl-L-histidyl-L-lysine. It is widely used in skincare for its remodeling and anti-aging properties.', molecular_data: 'C14H24CuN6O4', faq_questions: 'Can it be used topically?|||Does it help with hair growth?', faq_answers: 'Yes, it is very common in high-end anti-aging creams and serums.|||Research suggests it may enlarge hair follicles and stimulate growth in certain models.' }
    ],
    stacks: [
        { 
            slug: 'wolverine-stack', 
            stack_name: 'Wolverine Stack', 
            rank: 1, 
            description: 'The ultimate recovery protocol focused on rapid tissue repair and tendon resilience.', 
            component_list: [
                { name: 'BPC-157', slug: 'bpc-157', dosage: '250mcg BID' },
                { name: 'Thymosin Beta-4', slug: 'thymosin-beta-4', dosage: '5mg weekly' }
            ],
            faq_questions: 'Why combine these two?|||Is it for acute injuries?', 
            faq_answers: 'BPC-157 and TB-500 work through different pathways to accelerate angiogenesis and collagen synthesis.|||Yes, it is most commonly used by researchers to analyze recovery from soft tissue tears and strains.'
        },
        { 
            slug: 'glow-stack', 
            stack_name: 'Glow Stack', 
            rank: 2, 
            description: 'Focused on dermal integrity, collagen production, and systemic anti-inflammatory support.', 
            component_list: [
                { name: 'GHK-Cu', slug: 'ghk-cu', dosage: '50mg reconstituted' },
                { name: 'BPC-157', slug: 'bpc-157', dosage: '250mcg daily' }
            ],
            faq_questions: 'Is this for skin only?|||Does it help with hair?', 
            faq_answers: 'While focused on the dermis, BPC-157 provides systemic support that can benefit overall health.|||GHK-Cu is specifically noted in research for its potential hair follicle support.'
        }
    ]
};

/**
 * Navigation handler for SPA
 */
function navigate(path, push = true) {
    if (path.startsWith('/peptide/')) return openPepDossier(path.split('/')[2], push);
    if (path.startsWith('/stack/')) return openStackDossier(path.split('/')[2], push);
    
    // Redirect /peptides to the standalone DB page if not on index.html
    if (path === '/peptides' && !document.getElementById('view-peptides')) {
        window.location.href = '/peptidesdb.html';
        return;
    }

    const routeData = ROUTES[path] || ROUTES['/'];
    const viewId = routeData.id;
    const targetView = document.getElementById(viewId);
    
    // If target view doesn't exist on this page, perform hard navigation to index
    if (!targetView && path !== '/') {
        window.location.href = '/#' + path.replace('/', '');
        return;
    }

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    if(targetView) targetView.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const lid = 'nav-' + path.replace('/', '');
    if(document.getElementById(lid)) document.getElementById(lid).classList.add('active');
    
    if (push) window.history.pushState({}, '', path);
    window.scrollTo(0, 0);
    closeModal();
    
    if (!path.startsWith('/peptide') && !path.startsWith('/stack')) {
        document.title = routeData.title;
    }
}

/**
 * Initialize application and fetch data
 */
async function init() {
    /* 
    try {
        const fetchPath = window.location.origin.startsWith('http') ? new URL('/api/peptides', window.location.origin).href : '/api/peptides';
        const res = await fetch(fetchPath);
        if(!res.ok) throw new Error("API unavailable");
        DB = await res.json();
    } catch(e) {
        console.warn("API Error, falling back to empty database", e);
    }
    */
    renderP(DB.peptides);
    renderS(DB.stacks);
    handleURL();
    feather.replace();
}

/**
 * Handles initial URL loading and popstate events
 */
function handleURL() {
    const p = window.location.pathname;
    const h = window.location.hash;
    
    if(p.startsWith('/peptide/')) openPepDossier(p.split('/')[2], false);
    else if(p.startsWith('/stack/')) openStackDossier(p.split('/')[2], false);
    else if(h) navigate('/' + h.replace('#', ''), false);
    else navigate(p, false);
}

/**
 * Renders Peptide grid
 */
function renderP(arr) {
    const grid = document.getElementById('pep-grid');
    if (!grid) return;
    
    grid.innerHTML = arr.map(p => {
        const forumUrl = `https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=${encodeURIComponent(p.peptide_name)}`;
        return `
            <div class="bento-card p-8 group flex flex-col h-full relative">
                <a href="/peptide/${p.slug}" onclick="event.preventDefault(); openPepDossier('${p.slug}')" class="flex-grow block">
                    <div class="flex justify-between mb-4">
                        <span class="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">${p.Category || 'Core'}</span>
                        <span class="text-gray-800 text-[10px] font-mono">PX-0${p.id}</span>
                    </div>
                    <h3 class="text-2xl font-black italic mb-2 uppercase leading-none break-words">${p.peptide_name}</h3>
                    <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">${p.nicknames ? p.nicknames.split(',')[0] : 'Protocol'}</p>
                    <p class="text-sm text-gray-400 line-clamp-3 leading-relaxed font-medium">${p.primary_focus || p.research_summary}</p>
                </a>
                <div class="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                    <a href="${forumUrl}" target="_blank" class="text-[9px] font-black uppercase text-gray-600 hover:text-blue-400 flex items-center gap-1 transition">
                        <i data-feather="message-square" class="w-3 h-3"></i>
                        FORUM
                    </a>
                    <a href="/peptide/${p.slug}" onclick="event.preventDefault(); openPepDossier('${p.slug}')" class="text-[9px] font-black uppercase text-gray-600 group-hover:text-blue-500 flex items-center gap-1 transition">
                        DOSSIER
                        <i data-feather="arrow-right" class="w-3 h-3 group-hover:translate-x-1 transition"></i>
                    </a>
                </div>
            </div>
        `;
    }).join('');
    feather.replace();
}

/**
 * Renders Stacks grid
 */
function renderS(arr) {
    const grid = document.getElementById('stacks-grid');
    if (!grid) return;

    grid.innerHTML = arr.map(s => `
        <a href="/stack/${s.slug}" onclick="event.preventDefault(); openStackDossier('${s.slug}')" class="bento-card min-h-[300px] relative overflow-hidden group flex flex-col justify-end p-10 block">
            <img src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1000" class="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition duration-1000">
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            <div class="relative z-10">
                <span class="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 mb-3 inline-block">Rank: ${s.rank}</span>
                <h3 class="text-5xl font-black italic uppercase leading-none mb-4 group-hover:text-blue-500 transition">${s.stack_name}</h3>
                <p class="text-gray-400 text-sm max-w-md line-clamp-2">${s.description}</p>
                <div class="mt-8 px-8 py-3 bg-blue-600 rounded-full font-black text-[10px] uppercase italic hover:bg-white hover:text-black transition inline-block">Analyze Protocol</div>
            </div>
        </a>
    `).join('');
    feather.replace();
}

/**
 * Opens Peptide Detail Modal
 */
function openPepDossier(slug, push = true) {
    const p = DB.peptides.find(x => x.slug === slug);
    if(!p) return navigate('/peptides');
    
    const stacks = DB.stacks.filter(s => {
         if(s.component_list) {
             return s.component_list.some(c => c.name.toLowerCase() === p.peptide_name.toLowerCase());
         }
         return false;
    });
    const q = p.faq_questions ? p.faq_questions.split('|||') : [];
    const a = p.faq_answers ? p.faq_answers.split('|||') : [];
    const src = p.Sources ? p.Sources.split(',') : [];
    const forumUrl = `https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=${encodeURIComponent(p.peptide_name)}`;

    document.getElementById('modal-content').innerHTML = `
        <div class="grid md:grid-cols-12 min-h-[600px]">
            <div class="md:col-span-4 bg-[#050505] p-12 border-r border-white/5 flex flex-col">
                <h2 class="text-5xl font-black italic uppercase leading-[0.85] mb-4 break-words">${p.peptide_name}</h2>
                <span class="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] italic">${p.Category}</span>
                
                <div class="mt-8 space-y-4 flex-grow">
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Common Designations</p><p class="text-xs font-bold italic text-white">${p.nicknames || 'None'}</p></div>
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Status</p><p class="text-xs font-bold italic">${p.Status}</p></div>
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Search Rank</p><p class="text-xs font-bold italic text-blue-500">${p.rank}</p></div>
                </div>

                <a href="${forumUrl}" target="_blank" class="mt-8 w-full bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase italic text-center hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2 shadow-2xl">
                    <i data-feather="message-circle" class="w-4 h-4"></i>
                    Join Forum Discussion
                </a>
            </div>
            <div class="md:col-span-8 p-12 relative">
                <button onclick="closeModal()" class="absolute top-8 right-8 text-gray-600 hover:text-white transition p-2 bg-white/5 rounded-full"><i data-feather="x" class="w-4 h-4"></i></button>
                <h3 class="text-2xl font-black italic uppercase mb-6 border-l-4 border-blue-600 pl-6">Research Summary</h3>
                <p class="text-gray-300 leading-relaxed font-medium mb-12 text-lg">${p.research_summary || 'Analysis pending.'}</p>
                
                <h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest">Molecular Structure</h4>
                <div class="p-6 bg-black border border-white/5 rounded-2xl font-mono text-[10px] text-blue-400 mb-10 overflow-x-auto">${p.molecular_data || 'Data Classified'}</div>

                ${stacks.length ? `<h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest">Utilized in Stacks</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">${stacks.map(s => `<div onclick="openStackDossier('${s.slug}')" class="p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl cursor-pointer hover:border-blue-500/40 transition flex justify-between items-center"><span class="text-white font-black uppercase text-xs italic">${s.stack_name}</span><i data-feather="plus" class="w-3 h-3 text-blue-600"></i></div>`).join('')}</div>` : ''}
                
                ${q.length && q[0] ? `<h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest italic">Common Inquiries</h4><div class="space-y-2 mb-10">${q.map((qi, i) => qi ? `<details class="bg-white/5 rounded-2xl group"><summary class="p-5 cursor-pointer font-bold text-sm flex justify-between items-center italic uppercase leading-none">${qi}<i data-feather="chevron-down" class="w-4 h-4 text-gray-600 group-open:rotate-180 transition"></i></summary><p class="p-5 pt-0 text-sm text-gray-400 border-t border-white/5 leading-relaxed mt-4">${a[i] || 'Details pending.'}</p></details>` : '').join('')}</div>` : ''}

                ${src.length && src[0] ? `<h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 tracking-widest italic">Related Research</h4><div class="flex flex-wrap gap-4">${src.map((s, i) => `<a href="${s.trim()}" target="_blank" class="text-[10px] text-blue-500 hover:text-white transition font-black uppercase italic border-b border-blue-500/20 pb-1">Source ${i+1} <i data-feather="external-link" class="inline w-2 h-2 ml-1"></i></a>`).join('')}</div>` : ''}
            </div>
        </div>
    `;
    showM(); 
    if(push) window.history.pushState({}, '', `/peptide/${slug}`);
    document.title = `${p.peptide_name}, ${p.nicknames ? p.nicknames.split(',')[0] : 'Research'} | MinMaxMuscle Peptides`;
    feather.replace();
}

/**
 * Opens Stack Detail Modal
 */
function openStackDossier(slug, push = true) {
    const s = DB.stacks.find(x => x.slug === slug);
    if(!s) return navigate('/stacks');
    
    const comps = s.component_list || [];
    const q = s.faq_questions ? s.faq_questions.split('|||') : [];
    const a = s.faq_answers ? s.faq_answers.split('|||') : [];

    document.getElementById('modal-content').innerHTML = `
        <div class="grid md:grid-cols-12 min-h-[500px]">
            <div class="md:col-span-5 bg-[#050505] p-12 border-r border-white/5 flex flex-col justify-center">
                <span class="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 italic">Synergistic Matrix</span>
                <h2 class="text-7xl font-black italic leading-[0.85] uppercase mb-6">${s.stack_name}</h2>
                <p class="text-gray-400 font-medium leading-relaxed">${s.description}</p>
            </div>
            <div class="md:col-span-7 p-12 relative">
                <button onclick="closeModal()" class="absolute top-8 right-8 text-gray-500 hover:text-white transition p-2 bg-white/5 rounded-full"><i data-feather="x" class="w-4 h-4"></i></button>
                <h4 class="text-[10px] font-black text-gray-600 uppercase mb-8 tracking-widest italic">Components Matrix</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    ${comps.length > 0 ? comps.map(c => {
                        const found = DB.peptides.find(p => p.slug === c.slug || p.peptide_name.toLowerCase() === c.name.toLowerCase());
                        return `<div ${found ? `onclick="openPepDossier('${found.slug}')"` : ''} class="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between ${found ? 'cursor-pointer hover:border-blue-500/30' : 'opacity-40'} group">
                            <span class="text-[9px] text-gray-500 uppercase tracking-widest mb-1">COMPONENT</span>
                            <span class="font-black uppercase italic text-xl group-hover:text-blue-500 transition mb-2">${c.name}</span>
                            <span class="text-sm text-gray-400 italic">${c.dosage || 'Review full protocol'}</span>
                        </div>`;
                    }).join('') : '<p class="text-gray-500 text-xs italic">No specific components listed.</p>'}
                </div>

                ${q.length && q[0] ? `<h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 italic tracking-widest">Protocol Intelligence</h4><div class="space-y-2">${q.map((qi, i) => qi ? `<details class="bg-white/5 rounded-2xl group"><summary class="p-5 cursor-pointer font-bold text-sm flex justify-between italic uppercase leading-none">${qi}<i data-feather="chevron-down" class="w-4 h-4 text-gray-600 group-open:rotate-180 transition"></i></summary><p class="p-5 pt-0 text-sm text-gray-400 border-t border-white/5 leading-relaxed mt-4">${a[i]}</p></details>` : '').join('')}</div>` : ''}
            </div>
        </div>
    `;
    showM(); 
    if(push) window.history.pushState({}, '', `/stack/${slug}`);
    document.title = `${s.stack_name} | MinMaxMuscle Stacks`;
    feather.replace();
}

/**
 * Modal visibility helpers
 */
function showM() {
    document.getElementById('modal-overlay').classList.remove('hidden');
    setTimeout(() => { 
        document.getElementById('modal-content').classList.remove('opacity-0', 'scale-95'); 
        document.getElementById('modal-content').classList.add('opacity-100', 'scale-100'); 
    }, 10);
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    const content = document.getElementById('modal-content');
    content.classList.remove('opacity-100', 'scale-100'); 
    content.classList.add('opacity-0', 'scale-95');
    setTimeout(() => overlay.classList.add('hidden'), 350);
    
    const curr = window.location.pathname;
    if (curr.includes('/peptide/') || curr.includes('/stack/')) {
        const fallback = curr.includes('/peptide/') ? '/peptides' : '/stacks';
        window.history.pushState({}, '', fallback);
        document.title = "MINMAXMUSCLE | Peak Human Performance";
    }
}

/**
 * Calculator Switching
 */
function switchCalc(id) {
    document.querySelectorAll('.calc-view').forEach(v => v.classList.add('hidden'));
    document.getElementById('calc-'+id).classList.remove('hidden');
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

/**
 * Event Listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    init();

    // Peptide Search
    document.getElementById('pepSearch')?.addEventListener('input', (e) => {
        const t = e.target.value.toLowerCase();
        renderP(DB.peptides.filter(p => p.peptide_name.toLowerCase().includes(t) || p.primary_focus.toLowerCase().includes(t)));
    });

    // Reconstitution Calculator
    ['c-mg','c-ml','c-mcg'].forEach(id => document.getElementById(id)?.addEventListener('input', () => {
        const mg = parseFloat(document.getElementById('c-mg').value), 
              ml = parseFloat(document.getElementById('c-ml').value), 
              mcg = parseFloat(document.getElementById('c-mcg').value);
        if(mg && ml && mcg) {
            const res = (mcg / ((mg * 1000) / (ml * 100))).toFixed(1);
            document.getElementById('c-res').innerText = res;
        }
    }));

    // IU Converter
    document.getElementById('u-mcg')?.addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('u-res').innerText = val ? (val / 333.33).toFixed(1) : '0.0';
    });

    // Cycle Planner
    ['cy-dose','cy-freq','cy-weeks'].forEach(id => document.getElementById(id)?.addEventListener('input', () => {
        const dose = parseFloat(document.getElementById('cy-dose').value), 
              freq = parseFloat(document.getElementById('cy-freq').value), 
              wks = parseFloat(document.getElementById('cy-weeks').value);
        if(dose && freq && wks) {
            document.getElementById('cy-res').innerText = (dose * freq * wks).toFixed(1);
        }
    }));

    // Modal overlay click to close
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => { 
        if(e.target.id==='modal-overlay') closeModal(); 
    });
});

window.addEventListener('popstate', handleURL);
