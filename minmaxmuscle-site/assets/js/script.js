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

let DB = {
    peptides: [
        { id: 5, peptide_name: "Tirzepatide", slug: "tirzepatide", molecular_data: "39 Amino Acid Linear Peptide", research_summary: "Dual GIP/GLP-1 agonist researched for superior metabolic efficiency.", nicknames: "Mounjaro, Zepbound", Status: "FDA Approved (Diabetes)", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12477106/,https://pubmed.ncbi.nlm.nih.gov/34166613/", Category: "Metabolic & Weight Loss", primary_focus: "Weight Loss & Glucose Efficiency", rank: 1, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/tirzepatide-protocol/", faq_questions: "What is the proper storage protocol for lyophilized peptides?|||What is the role of bacteriostatic water in peptide research?|||How do GLP-1 receptor agonists influence metabolic signaling?|||How does Tirzepatide differ from standard Semaglutide research?|||What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the \"Dual Agonist\" advantage of Tirzepatide?|||How does Tirzepatide influence adipose tissue at the cellular level?|||What is the reported half-life of Tirzepatide in research models?", faq_answers: "Lyophilized (freeze-dried) peptides should be stored in a cool, dark place, ideally a freezer at -20°C for long-term stability. Exposure to light, heat, and moisture can lead to degradation. Once reconstituted with bacteriostatic water, the peptide must be refrigerated at 2°C to 8°C and typically used within 30 days to ensure potency and prevent bacterial growth.|||Bacteriostatic water is sterile water containing 0.9% benzyl alcohol, which acts as a preservative to inhibit the growth of bacteria. In research settings, it is the standard solvent for reconstituting peptides. Unlike sterile water, which is for single use, bacteriostatic water allows for multiple withdrawals from a vial over several weeks while maintaining a sterile environment.|||GLP-1 receptor agonists, such as Tirzepatide and Retatrutide, mimic the incretin hormones naturally produced in the gut. They enhance glucose-dependent insulin secretion, suppress glucagon release, and significantly slow gastric emptying. This dual or triple action (GIP/GLP-1/Glucagon) regulates energy homeostasis and reduces the \"set point\" for body weight in research models.|||Tirzepatide is a dual GIP (Glucose-dependent Insulinotropic Polypeptide) and GLP-1 receptor agonist. While Semaglutide targets only the GLP-1 receptor, the addition of GIP agonism in Tirzepatide has been shown to result in superior weight loss and glycemic control in clinical data, as GIP works synergistically to improve lipid metabolism and reduce nausea signals.|||All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Tirzepatide is a unimolecular dual agonist of the glucose-dependent insulinotropic polypeptide (GIP) and glucagon-like peptide-1 (GLP-1) receptors. While GLP-1 handles appetite suppression and gastric emptying, the GIP component is believed to improve metabolic flexibility and lipid handling, significantly reducing the side effect profile common in GLP-1 monotherapies. This dual-agonist pathway is well-documented in clinical phase trials.|||Beyond insulin secretion, Tirzepatide research shows it directly impacts white adipose tissue (WAT). It promotes a more \"thermogenic\" profile in fat cells, encouraging the breakdown of triglycerides into free fatty acids for energy, which explains the significant visceral fat reduction observed in clinical research trials.|||Tirzepatide has a remarkably long half-life of approximately 5 days (120 hours). This is achieved through a C20 fatty diacid moiety that allows the peptide to bind to albumin, preventing rapid renal clearance and enabling a steady-state concentration with once-weekly administration in experimental protocols." },
        { id: 4, peptide_name: "Semaglutide", slug: "semaglutide", molecular_data: "GLP-1 Analog (C187H291N45O59)", research_summary: "GLP-1 receptor agonist studied for appetite suppression and glycemic control.", nicknames: "Ozempic, Wegovy, GLP-1", Status: "FDA Approved", Sources: "https://www.ncbi.nlm.nih.gov/books/NBK603723/,https://pubmed.ncbi.nlm.nih.gov/33644386/", Category: "Metabolic & Weight Loss", primary_focus: "Metabolic & Weight Management", rank: 2, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/semaglutide-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Semaglutide compare to Liraglutide in half-life extension?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Semaglutide features a C18 fatty diacid chain that binds to serum albumin, extending its half-life to approximately 165 hours compared to Liraglutide's 13 hours. This structural modification allows for once-weekly administration in research protocols versus the daily dosing required for Liraglutide." },
        { id: 23, peptide_name: "Retatrutide", slug: "retatrutide", molecular_data: "Synthetic Peptide (C221H342N62O71S)", research_summary: "A triple hormone receptor agonist (GLP-1, GIP, and GCGR) studied for its potent effects on obesity and metabolic health.", nicknames: "GGG Tri-agonist", Status: "Phase 3 Clinical", Sources: "https://pubmed.ncbi.nlm.nih.gov/37366315/", Category: "Metabolic & Weight Loss", primary_focus: "Triple Incretin Agonism", rank: 3, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/retatrutide-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 1, peptide_name: "BPC-157", slug: "bpc-157", molecular_data: "15 Amino Acid Pentadecapeptide", research_summary: "A synthetic peptide derived from a protective protein in human gastric juice, studied for healing and regeneration.", nicknames: "Body Protection Compound 157", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/21030672/,https://pmc.ncbi.nlm.nih.gov/articles/PMC8504390/", Category: "Repair & Recovery", primary_focus: "Tissue & GI Repair", rank: 4, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/bpc-157-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does BPC-157 influence angiogenesis in research models?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||BPC-157 has been shown to upregulate the expression of Vascular Endothelial Growth Factor (VEGF) and activate the VEGFR2 signaling pathway. This stimulates the formation of new blood vessels, providing the necessary nutrients and oxygen to facilitate rapid repair of tendons, ligaments, and skeletal muscle in animal models." },
        { id: 2, peptide_name: "Thymosin Beta-4", slug: "thymosin-beta-4", molecular_data: "43 Amino Acid Polypeptide", research_summary: "Major actin-sequestering protein studied for cell migration and tissue repair.", nicknames: "TB-500, TB4", Status: "Research Only", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC2850581/,https://pubmed.ncbi.nlm.nih.gov/20536454/", Category: "Repair & Recovery", primary_focus: "Systemic Regeneration", rank: 5, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/tb-500-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the difference between Thymosin Beta-4 and the TB-500 fragment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Full-length Thymosin Beta-4 is a 43-amino acid peptide that occurs naturally in human and animal cells. TB-500 is often used interchangeably in research circles, but specifically refers to a synthetic fragment (usually the Ac-SDKP sequence) containing the most active region for promoting cell migration and angiogenesis. While TB4 is systemic, the fragment is often researched for its high oral bioavailability and specific regenerative properties." },
        { id: 3, peptide_name: "Ipamorelin", slug: "ipamorelin", molecular_data: "Pentapeptide (Aib-His-D-2-Nal-D-Phe-Lys-NH2)", research_summary: "Selective growth hormone secretagogue researched for minimal side-effect profile.", nicknames: "The Selective GHRP", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/9849822/,https://academic.oup.com/endo/article/139/11/4155/2990414", Category: "Growth Hormone Secretagogues", primary_focus: "GH Secretion & Sleep", rank: 6, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/ipamorelin-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||Why is Ipamorelin considered more \"selective\" than GHRP-6?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Ipamorelin is a third-generation GHRP that selectively binds to the ghrelin/growth hormone secretagogue receptor. Unlike earlier analogs like GHRP-6 or GHRP-2, Ipamorelin does not significantly stimulate the release of ACTH, Cortisol, or Prolactin, making it an ideal candidate for research focused purely on endogenous GH elevation without secondary hormonal cascades." },
        { id: 6, peptide_name: "CJC-1295", slug: "cjc-1295", molecular_data: "GHRH Analog (Tetrasubstituted 29-amino acid)", research_summary: "A GHRH analog studied for its ability to extend the half-life of growth hormone secretion.", nicknames: "Modified GRF 1-29, DAC:GRF", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/16352683/,https://academic.oup.com/jcem/article/91/3/799/2843281", Category: "Growth Hormone Secretagogues", primary_focus: "Long-Term GH Elevation", rank: 7, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/cjc-1295-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the functional difference between CJC-1295 with DAC and without DAC?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||CJC-1295 without DAC (also called Mod GRF 1-29) has a short half-life of roughly 30 minutes, mimicking the natural pulsatile release of GHRH. CJC-1295 with DAC (Drug Affinity Complex) binds to albumin in the blood, extending the half-life to approximately 6-8 days. This allows for a continuous, steady elevation of GH levels rather than short bursts." },
        { id: 7, peptide_name: "Tesamorelin", slug: "tesamorelin", molecular_data: "GHRH Analog (C221H366N72O67S)", research_summary: "GHRH analog approved for fat reduction in patients with lipodystrophy; researched for cognitive health.", nicknames: "Egrifta", Status: "FDA Approved (Lipodystrophy)", Sources: "https://pubmed.ncbi.nlm.nih.gov/24549600/,https://www.nejm.org/doi/full/10.1056/NEJMoa1006038", Category: "Growth Hormone Secretagogues", primary_focus: "Visceral Fat & Cognition", rank: 8, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/tesamorelin-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Tesamorelin specifically target visceral adipose tissue (VAT)?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Tesamorelin mimics the action of endogenous Growth Hormone Releasing Hormone (GHRH). By binding to receptors in the pituitary gland, it triggers a natural, pulsatile release of GH. Increased GH levels then act on fat cells, particularly those in the visceral (deep abdominal) cavity, to stimulate lipolysis and reduce the overall volume of VAT, as evidenced in multiple HIV-related clinical trials." },
        { id: 11, peptide_name: "GHK-Cu", slug: "ghk-cu", molecular_data: "Copper-binding Tripeptide (Gly-His-Lys)", research_summary: "Naturally occurring tripeptide studied for its potent regenerative and anti-aging properties.", nicknames: "Copper Peptide", Status: "Cosmetic Grade", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6073405/,https://pubmed.ncbi.nlm.nih.gov/26236730/", Category: "Skin & Dermal", primary_focus: "Collagen & Skin Repair", rank: 9, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/ghk-cu-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the \"Gene Modulation\" effect of GHK-Cu in longevity research?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||GHK-Cu is unique because it has been shown to reset over 3,000 human genes to a more youthful state. This include upregulating genes involved in DNA repair and antioxidant defense while downregulating genes associated with chronic inflammation and cancer progression, making it a primary focus for systemic anti-aging data." },
        { id: 8, peptide_name: "Thymosin Alpha-1", slug: "thymosin-alpha-1", molecular_data: "28 Amino Acid Peptide", research_summary: "A potent immune modulator studied for its role in T-cell maturation and immune balance.", nicknames: "TA1, Zadaxin", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/11336237/,https://pmc.ncbi.nlm.nih.gov/articles/PMC7747025/", Category: "Immune & Longevity", primary_focus: "Immune Optimization", rank: 10, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/thymosin-alpha-1-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Thymosin Alpha-1 influence T-cell differentiation?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||TA1 acts on the thymus gland to promote the maturation of T-cells into their active forms (CD4+ helper and CD8+ cytotoxic cells). It also increases the production of cytokines like Interferon-gamma and Interleukin-2, which orchestrate a more robust immune response against viral pathogens and senescent cells." },
        { id: 18, peptide_name: "NAD+", slug: "nad-plus", molecular_data: "Nicotinamide Adenine Dinucleotide (Coenzyme)", research_summary: "A critical coenzyme in all living cells, vital for energy metabolism and DNA repair.", nicknames: "The Energy Molecule, Anti-Aging IV", Status: "Nutraceutical", Sources: "https://pubmed.ncbi.nlm.nih.gov/30318066/,https://pmc.ncbi.nlm.nih.gov/articles/PMC7963035/", Category: "Longevity", primary_focus: "Cellular Energy & Repair", rank: 11, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/nad-plus-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the relationship between NAD+ and the Sirtuin longevity genes?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||NAD+ is the essential substrate for Sirtuins, a family of proteins that regulate cellular health and aging. Sirtuins require NAD+ to deacetylate target proteins that control DNA repair, mitochondrial biogenesis, and inflammatory response. As NAD+ levels decline with age, Sirtuin activity decreases, which is a primary driver of the aging process in research literature." },
        { id: 19, peptide_name: "Selank", slug: "selank", molecular_data: "Heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro)", research_summary: "A synthetic derivative of the human tetrapeptide tuftsin, studied for its anxiolytic and cognitive effects.", nicknames: "The Anxiolytic Nootropic", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/19094803/,https://www.sciencedirect.com/science/article/abs/pii/S004101011100167X", Category: "Cognitive & Nootropic", primary_focus: "Stress Management & Focus", rank: 12, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/selank-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Selank modulate GABAergic neurotransmission?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Unlike benzodiazepines, Selank does not bind directly to the GABA receptor. Instead, it appears to enhance the natural binding of GABA to its receptors and stabilize the internal concentration of enkephalins. This results in an anti-anxiety effect without the sedation, memory impairment, or addiction potential common in standard anxiolytics." },
        { id: 20, peptide_name: "Semax", slug: "semax", molecular_data: "Heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro)", research_summary: "Synthetic fragment of ACTH studied for BDNF upregulation and neuroprotection.", nicknames: "The Focus Peptide", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/16996037/,https://pmc.ncbi.nlm.nih.gov/articles/PMC10385311/", Category: "Cognitive & Nootropic", primary_focus: "Cognitive Performance", rank: 13, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/semax-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Semax influence Brain-Derived Neurotrophic Factor (BDNF)?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Semax has been shown to rapidly increase the expression of BDNF and its receptor, TrkB, in the brain. BDNF is a crucial protein for the survival of existing neurons and the growth of new ones. By upregulating this pathway, Semax enhances synaptic plasticity, leading to improved memory, learning, and resilience against cognitive decline in research models." },
        { id: 9, peptide_name: "PT-141", slug: "pt-141", molecular_data: "Cyclic Heptapeptide (Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH)", research_summary: "Melanocortin receptor agonist researched for its effects on sexual arousal and libido.", nicknames: "Bremelanotide, Vyleesi", Status: "FDA Approved", Sources: "https://pubmed.ncbi.nlm.nih.gov/12851303/,https://pmc.ncbi.nlm.nih.gov/articles/PMC4151601/", Category: "Neuro & Libido", primary_focus: "Sexual Function & Arousal", rank: 14, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/pt-141-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the mechanism of action for PT-141 compared to PDE5 inhibitors?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||While PDE5 inhibitors (like Viagra or Cialis) work peripherally by increasing blood flow to the genitals, PT-141 works centrally by activating melanocortin receptors in the brain (specifically the MC3 and MC4 receptors in the hypothalamus). This triggers a cascade of signals that increase sexual desire and arousal directly, rather than just facilitating the physical mechanics of blood flow." },
        { id: 10, peptide_name: "DSIP", slug: "dsip", molecular_data: "Nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu)", research_summary: "A naturally occurring peptide studied for its ability to induce deep sleep and regulate circadian rhythms.", nicknames: "Delta Sleep-Inducing Peptide", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/6295877/,https://pmc.ncbi.nlm.nih.gov/articles/PMC3533276/", Category: "Neuro & Sleep", primary_focus: "Sleep Quality & Recovery", rank: 15, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/dsip-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does DSIP influence the \"Delta\" phase of sleep in research?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||DSIP is researched for its ability to selectively increase delta-wave activity in the brain, which corresponds to the deepest and most restorative stages of sleep. It also appears to modulate the secretion of Luteinizing Hormone (LH) and Somatotropin (GH) during sleep, potentially enhancing nighttime recovery processes in animal models." },
        { id: 21, peptide_name: "HCG", slug: "hcg", molecular_data: "Complex Glycoprotein (237 Amino Acids)", research_summary: "LH mimetic studied for maintaining testosterone production and testicular integrity.", nicknames: "Human Chorionic Gonadotropin", Status: "FDA Approved", Sources: "https://pubmed.ncbi.nlm.nih.gov/23249548/,https://pmc.ncbi.nlm.nih.gov/articles/PMC4151601/", Category: "GH Axis & Hormonal", primary_focus: "LH Mimicry & Fertility", rank: 16, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/hcg-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 13, peptide_name: "Kisspeptin-10", slug: "kisspeptin-10", molecular_data: "10 Amino Acid Fragment (C63H78N18O13)", research_summary: "A potent stimulator of the GnRH pathway, studied for its role in hormonal signaling and libido.", nicknames: "The Master Switch", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/24549600/,https://www.nejm.org/doi/full/10.1056/NEJMoa1006038", Category: "GH Axis & Hormonal", primary_focus: "HPTA Signaling", rank: 17, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/kisspeptin-10-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||How does Kisspeptin-10 trigger the release of Testosterone in research models?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Kisspeptin-10 acts as the \"master regulator\" of the reproductive axis. It binds to the KISS1R receptor on GnRH neurons in the hypothalamus, stimulating the release of Gonadotropin-Releasing Hormone (GnRH). This, in turn, signals the pituitary to release LH and FSH, which subsequently stimulate the Leydig cells in the testes to produce endogenous testosterone." },
        { id: 31, peptide_name: "Hexarelin", slug: "hexarelin", molecular_data: "C47H58N12O6 (His-D-2-Me-Trp-Ala-Trp-D-Phe-Lys-NH2)", research_summary: "Synthetic hexapeptide growth hormone secretagogue (GHS) that mimics ghrelin to stimulate potent pulsatile release of endogenous growth hormone.", nicknames: "HEX, The Pulsatile GHRP", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/9562013/", Category: "Growth Hormone Secretagogues", primary_focus: "Pulsatile GH Release", rank: 18, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/ipamorelin-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 14, peptide_name: "Epitalon", slug: "epitalon", molecular_data: "Tetrapeptide (Ala-Glu-Asp-Gly)", research_summary: "A synthetic tetrapeptide researched for its ability to regulate telomerase and improve sleep quality.", nicknames: "Telomere Peptide, Epithalon", Status: "FDA Category 2", Sources: "https://www.innerbody.com/epitalon,https://pubmed.ncbi.nlm.nih.gov/14583740/", Category: "Longevity", primary_focus: "Longevity & Sleep", rank: 19, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/epitalon-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the \"Telomerase Theory\" behind Epitalon?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Epitalon is a tetrapeptide that induces telomerase activity in somatic cells. By elongating telomeres, it allows cells to exceed the Hayflick limit (the number of times a cell can divide), theoretically extending the lifespan of the cell line and delaying cellular senescence in longevity research." },
        { id: 15, peptide_name: "Dihexa", slug: "dihexa", molecular_data: "Small molecule peptide-like compound", research_summary: "An angiotensin IV-derived neuropeptide studied for potential neurodegenerative repair and brain plasticity.", nicknames: "Neuro-Repair, PNB-0408", Status: "FDA Category 2", Sources: "https://pubmed.ncbi.nlm.nih.gov/22514135/,https://pmc.ncbi.nlm.nih.gov/articles/PMC3533276/", Category: "Cognitive & Nootropic", primary_focus: "Neuroplasticity", rank: 19, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/dihexa-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 22, peptide_name: "5-Amino-1MQ", slug: "5-amino-1mq", molecular_data: "1-Methylquinolin-5-amine (C10H10N2)", research_summary: "NNMT enzyme inhibitor researched for its ability to increase NAD+ levels, shrink fat cells, and improve metabolic efficiency.", nicknames: "NNMT Inhibitor", Status: "Research Only", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6287896/", Category: "Metabolic & Weight Loss", primary_focus: "Fat Metabolism & Muscle Preservation", rank: 20, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/5-amino-1mq-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 12, peptide_name: "Melanotan II", slug: "melanotan-ii", molecular_data: "Cyclic heptapeptide", research_summary: "Synthetic alpha-MSH analog; studied for skin pigmentation.", nicknames: "The Tanning Peptide, Barbie Drug, MT2", Status: "FDA Category 2", Sources: "https://pubmed.ncbi.nlm.nih.gov/33332767/", Category: "Aesthetic / Tanning", primary_focus: "Skin Pigmentation & Libido", rank: 21, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/melanotan-ii-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||Why does Melanotan II suppress appetite?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||Melanotan II is a non-selective agonist of the melanocortin receptors. Its activation of MC3 and MC4 receptors in the hypothalamus signals satiety and increases energy expenditure. This central nervous system effect is a primary reason for the transient nausea and reduced food intake observed in research subjects." },
        { id: 17, peptide_name: "Matrixyl", slug: "matrixyl", molecular_data: "Pal-Lys-Thr-Thr-Lys-Ser", research_summary: "A palmitoyl pentapeptide-4 used extensively in topical research to stimulate collagen and elastin production.", nicknames: "Pal-KTTKS, Peptide 5", Status: "Cosmetic Grade", Sources: "https://pubmed.ncbi.nlm.nih.gov/23464303/,https://pmc.ncbi.nlm.nih.gov/articles/PMC10385311/", Category: "Skin Care", primary_focus: "Anti-Aging Topicals", rank: 21, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/ghk-cu-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 16, peptide_name: "Follistatin-344", slug: "follistatin-344", molecular_data: "Single-chain polypeptide", research_summary: "An autocrine glycoprotein that inhibits myostatin, allowing for increased muscle fiber growth.", nicknames: "Myostatin Inhibitor", Status: "Research Only", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12753066/,https://pubmed.ncbi.nlm.nih.gov/18048638/", Category: "Repair & Recovery", primary_focus: "Muscle Preservation", rank: 22, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/follistatin-344-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 24, peptide_name: "Orforglipron", slug: "orforglipron", molecular_data: "C48H48F2N10O5 (Non-Peptide Small Molecule)", research_summary: "Orally bioavailable non-peptide GLP-1 receptor agonist rationally designed for metabolic regulation and weight loss without subcutaneous injection.", nicknames: "LY3502970, The Oral GLP-1", Status: "Phase 3 Clinical", Sources: "https://en.wikipedia.org/wiki/Orforglipron", Category: "Metabolic & Weight Loss", primary_focus: "Non-Injectable Weight Loss", rank: 23, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/cagrilintide-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 25, peptide_name: "Tesofensine", slug: "tesofensine", molecular_data: "C17H23Cl2NO (Phenyltropane Family)", research_summary: "A potent serotonin-norepinephrine-dopamine reuptake inhibitor (SNDRI) studied for weight loss through appetite suppression and increased energy expenditure.", nicknames: "NS2330, Neuro-Fat Burner", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/11732356/", Category: "Metabolic & Weight Loss", primary_focus: "Appetite Suppression", rank: 24, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/tesofensine-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 26, peptide_name: "P-21", slug: "p-21", molecular_data: "C27H42N6O8 (Adamantane-modified Peptide)", research_summary: "Synthetic derivative of ciliary neurotrophic factor (CNTF) substituted with adamantane for blood-brain barrier penetrance; studied for neurogenesis.", nicknames: "Peptide 021, P021", Status: "Research Only", Sources: "https://en.wikipedia.org/wiki/Peptide_021", Category: "Cognitive & Nootropic", primary_focus: "Neurogenesis & Focus", rank: 25, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/frag-176-191-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 27, peptide_name: "ARA-290", slug: "ara-290", molecular_data: "C51H78N16O21 (Pyroglutamate helix B surface peptide)", research_summary: "11-amino-acid peptide derived from erythropoietin; selectively activates the Innate Repair Receptor (IRR) to mitigate neuropathic pain and inflammation.", nicknames: "Cibinetide, pHBSP", Status: "Phase 2 Clinical", Sources: "https://en.wikipedia.org/wiki/Cibinetide", Category: "Repair & Recovery", primary_focus: "Neuropathic Pain Repair", rank: 26, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/aod-9604-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 28, peptide_name: "SS-31", slug: "ss-31", molecular_data: "D-Arg-dimethyl-Tyr-Lys-Phe-NH2", research_summary: "Synthetic tetrapeptide that binds to cardiolipin in the inner mitochondrial membrane, optimizing oxidative phosphorylation and reducing oxidative stress.", nicknames: "Elamipretide, Bendavia", Status: "Phase 2 Clinical", Sources: "https://academic.oup.com/hmg/article/26/8/1483/2982370", Category: "Longevity", primary_focus: "Mitochondrial Function", rank: 27, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/ss-31-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?|||What is the target organelle for SS-31 (Elamipretide)?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material.|||SS-31 targets the inner mitochondrial membrane, specifically binding to cardiolipin. This interaction stabilizes the cristae structure and optimizes the electron transport chain efficiency, reducing reactive oxygen species (ROS) leakage and preserving cellular energy production under ischemic stress." },
        { id: 29, peptide_name: "GDF-8 (Propeptide)", slug: "gdf-8", molecular_data: "Recombinant N-terminal Prodomain of GDF-8", research_summary: "Recombinant inhibitor of active Myostatin; researched for the ability to block the suppressor of muscle growth and enhance bone/muscle repair.", nicknames: "Myostatin Propeptide, GDF-8 Inhibitor", Status: "Research Only", Sources: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3738012/", Category: "Repair & Recovery", primary_focus: "Muscle Mass Maximization", rank: 28, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/igf-1-lr3-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 30, peptide_name: "Liraglutide", slug: "liraglutide", molecular_data: "C172H265N43O51 (Acylated DNA-produced Peptide)", research_summary: "Long-acting GLP-1 analogue with 97% homology to human GLP-1; resistant to DPP-4 degradation and used for glycemic control and weight management.", nicknames: "Victoza, Saxenda", Status: "FDA Approved", Sources: "https://pubchem.ncbi.nlm.nih.gov/compound/Liraglutide", Category: "Metabolic & Weight Loss", primary_focus: "Glucagon-like Peptide-1", rank: 29, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/peg-mgf-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." },
        { id: 31, peptide_name: "Hexarelin", slug: "hexarelin", molecular_data: "C47H58N12O6 (His-D-2-Me-Trp-Ala-Trp-D-Phe-Lys-NH2)", research_summary: "Synthetic hexapeptide growth hormone secretagogue (GHS) that mimics ghrelin to stimulate potent pulsatile release of endogenous growth hormone.", nicknames: "HEX, The Pulsatile GHRP", Status: "Research Only", Sources: "https://pubmed.ncbi.nlm.nih.gov/9562013/", Category: "Growth Hormone Secretagogues", primary_focus: "Pulsatile GH Release", rank: 30, forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/hcg-protocol/", faq_questions: "What are the strict legal and safety limitations for research-grade peptides?|||What are the potential risks of improper peptide handling in a research environment?", faq_answers: "All products listed in this research database are intended solely for laboratory research purposes and are not for human or animal consumption, diagnostic, or therapeutic use. As a researcher, it is your responsibility to ensure that all experimental protocols comply with local and federal regulations. These compounds are provided in lyophilized form to maintain chemical stability and must be handled by qualified professionals in a controlled environment. Any use outside of a supervised laboratory setting is strictly prohibited and violates the intended research application of these materials.|||Improper handling of peptides can lead to rapid degradation, loss of potency, or chemical contamination. Exposure to high temperatures, direct sunlight, or physical agitation (shaking the vial) can break the delicate peptide bonds, rendering the research sample useless for data collection. Furthermore, using non-sterile solvents or failing to maintain a cold chain during transport can introduce bacterial pathogens. Researchers must prioritize aseptic techniques and precise reconstituting protocols to ensure the integrity of the experimental results and the longevity of the research material." }
    ],

    stacks: [
        { 
            id: 8, 
            stack_name: "The God Protocol", 
            slug: "the-god-protocol", 
            goal: "Peak Human Performance", 
            description: "The ultimate synergy of GH Secretagogues, Glucose Disposal, and Mitochondrial Repair. Designed for total body recomposition and anti-aging.", 
            rank: 0, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=The+God+Protocol",
            component_list: [
                { name: "Tesamorelin", slug: "tesamorelin", dosage: "2mg daily pre-bed (5/2 schedule)" },
                { name: "Ipamorelin", slug: "ipamorelin", dosage: "200mcg daily pre-bed" },
                { name: "MOTS-c", slug: "mots-c", dosage: "10mg weekly (Mitochondrial Energy)" },
                { name: "Tirzepatide", slug: "tirzepatide", dosage: "2.5mg weekly (Glucose Management)" }
            ]
        },
        { 
            id: 1, 
            stack_name: "The Quad-Pathway", 
            slug: "quad-pathway", 
            goal: "Maximum Weight Loss", 
            description: "Retatrutide + Cagrilintide. Targets GIP, GLP-1, Glucagon, and Amylin for record-breaking fat loss.", 
            rank: 1, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/protocol-holy-grail-stack/",
            component_list: [
                { name: "Retatrutide", slug: "retatrutide", dosage: "Titrated 1-12mg weekly" },
                { name: "Cagrilintide", slug: "cagrilintide", dosage: "0.3mg - 2.4mg weekly" }
            ]
        },
        { 
            id: 2, 
            stack_name: "Metabolic Advanced", 
            slug: "metabolic-advanced", 
            goal: "Weight Loss & Satiety", 
            description: "Tirzepatide + Cagrilintide. Superior appetite suppression compared to monotherapy.", 
            rank: 2, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/protocol-holy-grail-stack/",
            component_list: [
                { name: "Tirzepatide", slug: "tirzepatide", dosage: "2.5-15mg weekly" },
                { name: "Cagrilintide", slug: "cagrilintide", dosage: "0.3mg weekly starting" }
            ]
        },
        { 
            id: 3, 
            stack_name: "The Wolverine", 
            slug: "wolverine-stack", 
            goal: "Injury & Tissue Repair", 
            description: "BPC-157 + TB-500. The gold standard for localized and systemic recovery of ligaments and tendons.", 
            rank: 3, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/protocol-wolverine-stack/",
            component_list: [
                { name: "BPC-157", slug: "bpc-157", dosage: "250-500mcg daily" },
                { name: "TB-500", slug: "tb-500", dosage: "2.5mg twice weekly" }
            ]
        },
        { 
            id: 4, 
            stack_name: "Classic Recomp", 
            slug: "classic-recomp", 
            goal: "Fat Loss & Muscle Lean", 
            description: "CJC-1295 + Ipamorelin. Optimizes natural GH pulses for improved body composition and sleep.", 
            rank: 4, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/cjc-1295-protocol/",
            component_list: [
                { name: "CJC-1295", slug: "cjc-1295", dosage: "100mcg daily (5/2 schedule)" },
                { name: "Ipamorelin", slug: "ipamorelin", dosage: "200mcg daily" }
            ]
        },
        { 
            id: 5, 
            stack_name: "Visceral Shred", 
            slug: "visceral-shred", 
            goal: "Targeted Fat Loss", 
            description: "Tesamorelin + Ipamorelin. Clinically effective for reducing stubborn abdominal/visceral fat.", 
            rank: 5, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/tesamorelin-protocol/",
            component_list: [
                { name: "Tesamorelin", slug: "tesamorelin", dosage: "2mg daily (pre-bed)" },
                { name: "Ipamorelin", slug: "ipamorelin", dosage: "200mcg daily" }
            ]
        },
        { 
            id: 6, 
            stack_name: "Cognitive Focus", 
            slug: "cognitive-focus", 
            goal: "Mental Performance", 
            description: "Semax + Selank. Synergistic neuro-regulation for BDNF upregulation and stress management.", 
            rank: 6, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/protocol-limitless-stack/",
            component_list: [
                { name: "Semax", slug: "semax", dosage: "2-3 drops intranasal" },
                { name: "Selank", slug: "selank", dosage: "2-3 drops intranasal" }
            ]
        },
        { 
            id: 7, 
            stack_name: "Cellular Longevity", 
            slug: "longevity-reset", 
            goal: "Anti-Aging", 
            description: "Epitalon + MOTS-c + Thymosin Alpha-1. Focuses on telomeres, mitochondrial energy, and immune modulation.", 
            rank: 7, 
            forum_topic_url: "https://blog.minmaxmuscle.com/forum/topic/epitalon-protocol/",
            component_list: [
                { name: "Epitalon", slug: "epitalon", dosage: "10mg daily (10-day cycle)" },
                { name: "MOTS-c", slug: "mots-c", dosage: "10mg weekly" },
                { name: "Thymosin Alpha-1", slug: "thymosin-alpha-1", dosage: "1.5mg twice weekly" }
            ]
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
    // Redirect /stacks to the standalone DB page if not on index.html
    if (path === '/stacks' && !document.getElementById('view-stacks')) {
        window.location.href = '/stacksdb.html';
        return;
    }

    const routeData = ROUTES[path] || ROUTES['/'];
    if (!routeData) return;

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
    const navEl = document.getElementById(lid);
    if(navEl) navEl.classList.add('active');
    
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
    try {
        const res = await fetch('/api/peptides');
        if(res.ok) {
            const data = await res.json();
            if (data && data.peptides && data.peptides.length > 0) {
                console.log("Authoritative D1 Data Loaded:", data.peptides.length, "peptides");
                // OVERWRITE with D1 data to reflect actual database state
                DB.peptides = data.peptides;
                if (data.stacks) DB.stacks = data.stacks;
            }
        }
    } catch(e) {
        console.warn("D1 API Connection Failed, using internal archive", e);
    }
    
    // Ensure all entries have forum links (fallback to search if missing in D1)
    DB.peptides = DB.peptides.map(p => ({
        ...p,
        forum_topic_url: p.forum_topic_url || `https://blog.minmaxmuscle.com/forum/?forumaction=search&search_keywords=${encodeURIComponent(p.peptide_name)}`
    }));

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
             return s.component_list.some(c => c.slug === p.slug || (c.name && c.name.toLowerCase() === p.peptide_name.toLowerCase()));
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

    document.getElementById('modal-content').innerHTML = `
        <div class="grid md:grid-cols-12 min-h-[500px]">
            <div class="md:col-span-5 bg-[#050505] p-12 border-r border-white/5 flex flex-col justify-center">
                <span class="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-4 italic">Synergistic Matrix</span>
                <h2 class="text-7xl font-black italic leading-[0.85] uppercase mb-6">${s.stack_name}</h2>
                <p class="text-gray-400 font-medium leading-relaxed mb-8">${s.description}</p>
                
                ${s.forum_topic_url ? `
                <a href="${s.forum_topic_url}" target="_blank" class="p-6 bg-blue-600/10 border border-blue-600/20 rounded-2xl block hover:bg-blue-600/20 transition group">
                    <p class="text-[8px] text-blue-400 font-black uppercase mb-1 flex items-center gap-1">
                        <i data-feather="message-square" class="w-2 h-2"></i>
                        Protocol Archive
                    </p>
                    <p class="text-xs font-black italic text-white group-hover:text-blue-400 transition">Discuss this stack <i data-feather="external-link" class="inline w-2 h-2 ml-1"></i></p>
                </a>` : ''}
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
        const fallback = curr.includes('/peptide/') ? '/peptidesdb.html' : '/stacksdb.html';
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
