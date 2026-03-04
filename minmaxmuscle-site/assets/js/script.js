/**
 * MINMAXMUSCLE - Core SPA Logic
 * Handles routing, data fetching, rendering, and interactive components.
 */

const ROUTES = { 
    '/': { id: 'view-home', title: 'MINMAXMUSCLE | Peak Human Performance' },
    '/peptides': { id: 'view-peptides', title: 'Peptide Database | MINMAXMUSCLE' },
    '/peptidesdb.html': { id: 'view-peptides', title: 'Peptide Database | MINMAXMUSCLE' },
    '/stacks': { id: 'view-stacks', title: 'Protocol Stacks | MINMAXMUSCLE' },
    '/stacksdb.html': { id: 'view-stacks', title: 'Protocol Stacks | MINMAXMUSCLE' },
    '/calculators': { id: 'view-calculators', title: 'Peptide Calculators | MINMAXMUSCLE' },
    '/coaching': { id: 'view-coaching', title: 'Performance Coaching | MINMAXMUSCLE' },
    '/about': { id: 'view-about', title: 'About Us | MINMAXMUSCLE' },
    '/contact': { id: 'view-contact', title: 'Contact | MINMAXMUSCLE' },
    '/privacy': { id: 'view-privacy', title: 'Privacy Policy | MINMAXMUSCLE' },
    '/terms': { id: 'view-terms', title: 'Terms of Service | MINMAXMUSCLE' }
};

// INITIALIZE EMPTY: ALL DATA SERVED FROM D1 DATABASE
let DB = {
    peptides: [],
    stacks: []
};

/**
 * Navigation handler for SPA
 */
function navigate(path, push = true) {
    if (path.startsWith('/peptide/')) return openPepDossier(path.split('/')[2], push);
    if (path.startsWith('/stack/')) return openStackDossier(path.split('/')[2], push);
    
    // Normalize path: remove .html, hashes, and trailing slashes for comparison
    const normPath = (p) => p.replace('.html', '').replace('#', '').replace(/\/$/, '') || '/';
    const cleanPath = normPath(path);
    const currPath = normPath(location.pathname);
    const isIndex = currPath === '/' || currPath === '/index';

    // Global navigation behavior for Peptides/Stacks
    if (cleanPath === '/peptides') {
        if (!isIndex && currPath !== '/peptides' && currPath !== '/peptidesdb') { 
            window.location.href = '/peptides'; 
            return; 
        }
    }
    if (cleanPath === '/stacks') {
        if (!isIndex && currPath !== '/stacks' && currPath !== '/stacksdb') { 
            window.location.href = '/stacks'; 
            return; 
        }
    }

    const routeData = ROUTES[path] || ROUTES[path + '.html'] || ROUTES['/' + cleanPath] || ROUTES['/'];
    if (!routeData) return;

    const viewId = routeData.id;
    const targetView = document.getElementById(viewId);
    
    // If target view doesn't exist on this page, perform clean navigation ONLY if different
    if (!targetView) {
        const targetUrl = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
        if (currPath !== normPath(targetUrl)) {
            window.location.href = targetUrl;
        }
        return;
    }

    document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
    targetView.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const lid = 'nav-' + cleanPath.replace('/', '');
    const navEl = document.getElementById(lid);
    if(navEl) navEl.classList.add('active');
    
    if (push) {
        const pushUrl = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;
        window.history.pushState({}, '', pushUrl);
    }
    window.scrollTo(0, 0);
    closeModal();
    
    // Close mobile menu if open
    document.getElementById('mobile-menu')?.classList.add('hidden');
    
    if (!cleanPath.startsWith('/peptide') && !cleanPath.startsWith('/stack')) {
        document.title = routeData.title;
    }
}

/**
 * Initialize application and fetch data FROM D1
 */
async function init() {
    try {
        const res = await fetch('/api/peptides');
        if(res.ok) {
            const data = await res.json();
            if (data && data.peptides) {
                console.log("Authoritative D1 Data Loaded:", data.peptides.length, "peptides");
                DB.peptides = data.peptides;
                DB.stacks = data.stacks || [];
                
                // Ensure all entries have forum links fallback
                DB.peptides = DB.peptides.map(p => ({
                    ...p,
                    forum_topic_url: p.forum_topic_url || `https://blog.minmaxmuscle.com/forum/search/?keywords=${encodeURIComponent(p.peptide_name)}`
                }));

                renderP(DB.peptides);
                renderS(DB.stacks);
                handleURL();
            }
        }
    } catch(e) {
        console.error("CRITICAL: D1 API Connection Failed", e);
    }
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
        const forumUrl = `https://blog.minmaxmuscle.com/forum/search/?keywords=${encodeURIComponent(p.peptide_name)}`;
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
                    <a href="${p.forum_topic_url || forumUrl}" target="_blank" class="text-[9px] font-black uppercase text-gray-600 hover:text-blue-400 flex items-center gap-1 transition">
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

    grid.innerHTML = arr.map(s => {
        const forumUrl = `https://blog.minmaxmuscle.com/forum/search/?keywords=${encodeURIComponent(s.stack_name)}`;
        return `
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
        `;
    }).join('');
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
             return s.component_list.some(c => c.slug === p.slug || (c.name && c.name.toLowerCase() === p.peptide_name.toLowerCase()));
         }
         return false;
    });
    const q = p.faq_questions ? p.faq_questions.split('|||') : [];
    const a = p.faq_answers ? p.faq_answers.split('|||') : [];
    const src = p.Sources ? p.Sources.split(',') : [];
    const forumUrl = `https://blog.minmaxmuscle.com/forum/search/?keywords=${encodeURIComponent(p.peptide_name)}`;

    document.getElementById('modal-content').innerHTML = `
        <div class="grid md:grid-cols-12 min-h-[600px]">
            <div class="md:col-span-4 bg-[#050505] p-12 border-r border-white/5 flex flex-col">
                <h2 class="text-5xl font-black italic uppercase leading-[0.85] mb-4 break-words">${p.peptide_name}</h2>
                <span class="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] italic">${p.Category}</span>
                
                <div class="mt-8 space-y-4 flex-grow">
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Common Designations</p><p class="text-xs font-bold italic text-white">${p.nicknames || 'None'}</p></div>
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Status</p><p class="text-xs font-bold italic">${p.Status}</p></div>
                    <div class="p-6 bg-white/5 rounded-2xl border border-white/10"><p class="text-[8px] text-gray-500 font-black uppercase mb-1">Search Rank</p><p class="text-xs font-bold italic text-blue-500">${p.rank}</p></div>
                    
                    <!-- Specific Forum Topic Link -->
                    <a href="${p.forum_topic_url || forumUrl}" target="_blank" class="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl block hover:bg-blue-600/20 transition group">
                        <p class="text-[8px] text-blue-400 font-black uppercase mb-1 flex items-center gap-1">
                            <i data-feather="message-square" class="w-2 h-2"></i>
                            Community Archive
                        </p>
                        <p class="text-xs font-black italic text-white group-hover:text-blue-400 transition">Discuss this protocol <i data-feather="external-link" class="inline w-2 h-2 ml-1"></i></p>
                    </a>
                </div>
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
    const forumUrl = `https://blog.minmaxmuscle.com/forum/search/?keywords=${encodeURIComponent(s.stack_name)}`;

    document.getElementById('modal-content').innerHTML = `
        <div class="grid md:grid-cols-12 min-h-[500px]">
            <div class="md:col-span-5 bg-[#050505] p-12 border-r border-white/5 flex flex-col justify-center">
                <span class="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 italic">Synergistic Matrix</span>
                <h2 class="text-7xl font-black italic leading-[0.85] uppercase mb-6">${s.stack_name}</h2>
                <p class="text-gray-400 font-medium leading-relaxed mb-8">${s.description}</p>
                
                <a href="${s.forum_topic_url || forumUrl}" target="_blank" class="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl block hover:bg-blue-600/20 transition group">
                    <p class="text-[8px] text-blue-400 font-black uppercase mb-1 flex items-center gap-1">
                        <i data-feather="message-square" class="w-2 h-2"></i>
                        Protocol Archive
                    </p>
                    <p class="text-xs font-black italic text-white group-hover:text-blue-400 transition">Discuss this stack <i data-feather="external-link" class="inline w-2 h-2 ml-1"></i></p>
                </a>
            </div>
            <div class="md:col-span-7 p-12 relative">
                <button onclick="closeModal()" class="absolute top-8 right-8 text-gray-600 hover:text-white transition p-2 bg-white/5 rounded-full"><i data-feather="x" class="w-4 h-4"></i></button>
                <h4 class="text-[10px] font-black text-gray-600 uppercase mb-8 tracking-widest italic">Components Matrix</h4>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                    ${comps.length > 0 ? comps.map(c => {
                        const found = DB.peptides.find(p => p.slug === c.slug || (c.name && p.peptide_name.toLowerCase() === c.name.toLowerCase()));
                        return `<div ${found ? `onclick="openPepDossier('${found.slug}')"` : ''} class="p-6 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-between ${found ? 'cursor-pointer hover:border-blue-500/30' : 'opacity-40'} group">
                            <span class="text-[9px] text-gray-500 uppercase tracking-widest mb-1">COMPONENT</span>
                            <span class="font-black uppercase italic text-xl group-hover:text-blue-500 transition mb-2">${c.name}</span>
                            <span class="text-sm text-gray-400 italic">${c.dosage || 'Review full protocol'}</span>
                        </div>`;
                    }).join('') : '<p class="text-gray-500 text-xs italic">No specific components listed.</p>'}
                </div>

                ${q.length && q[0] ? `<h4 class="text-[10px] font-black text-gray-600 uppercase mb-4 italic tracking-widest">Protocol Intelligence</h4><div class="space-y-2">${q.map((qi, i) => qi ? `<details class="bg-white/5 rounded-2xl group"><summary class="p-5 cursor-pointer font-bold text-sm flex justify-between italic uppercase leading-none">${qi}<i data-feather="chevron-down" class="w-4 h-4 text-gray-600 group-open:rotate-180 transition"></i></summary><p class="p-5 pt-0 text-sm text-gray-400 border-t border-white/5 leading-relaxed mt-4">${a[i] || 'Details pending.'}</p></details>` : '').join('')}</div>` : ''}
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
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    setTimeout(() => { 
        const content = document.getElementById('modal-content');
        if (content) {
            content.classList.remove('opacity-0', 'scale-95'); 
            content.classList.add('opacity-100', 'scale-100'); 
        }
    }, 10);
}

function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    const content = document.getElementById('modal-content');
    if (content) {
        content.classList.remove('opacity-100', 'scale-100'); 
        content.classList.add('opacity-0', 'scale-95');
    }
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
    const target = document.getElementById('calc-'+id);
    if(target) target.classList.remove('hidden');
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
        renderP(DB.peptides.filter(p => p.peptide_name.toLowerCase().includes(t) || (p.primary_focus && p.primary_focus.toLowerCase().includes(t))));
    });

    // Reconstitution Calculator
    ['c-mg','c-ml','c-mcg'].forEach(id => document.getElementById(id)?.addEventListener('input', () => {
        const mg = parseFloat(document.getElementById('c-mg').value), 
              ml = parseFloat(document.getElementById('c-ml').value), 
              mcg = parseFloat(document.getElementById('c-mcg').value);
        if(mg && ml && mcg) {
            const res = (mcg / ((mg * 1000) / (ml * 100))).toFixed(1);
            const resEl = document.getElementById('c-res');
            if(resEl) resEl.innerText = res;
        }
    }));

    // IU Converter
    document.getElementById('u-mcg')?.addEventListener('input', (e) => {
        const val = e.target.value;
        const resEl = document.getElementById('u-res');
        if(resEl) resEl.innerText = val ? (val / 333.33).toFixed(1) : '0.0';
    });

    // Cycle Planner
    ['cy-dose','cy-freq','cy-weeks'].forEach(id => document.getElementById(id)?.addEventListener('input', () => {
        const dose = parseFloat(document.getElementById('cy-dose').value), 
              freq = parseFloat(document.getElementById('cy-freq').value), 
              wks = parseFloat(document.getElementById('cy-weeks').value);
        if(dose && freq && wks) {
            const resEl = document.getElementById('cy-res');
            if(resEl) resEl.innerText = (dose * freq * wks).toFixed(1);
        }
    }));

    // Modal overlay click to close
    document.getElementById('modal-overlay')?.addEventListener('click', (e) => { 
        if(e.target.id==='modal-overlay') closeModal(); 
    });
});

window.addEventListener('popstate', handleURL);
