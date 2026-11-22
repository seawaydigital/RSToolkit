/**
 * STRA Wizard - Guided assessment question tree for determining
 * whether research falls under Sensitive Technology Research Areas.
 *
 * Each question node has:
 *   - text: the question displayed to the user
 *   - type: "yesno" | "choice"
 *   - yes/no (for yesno) or options[] (for choice) pointing to next node IDs
 *
 * Each result node has:
 *   - type: "result"
 *   - title: summary heading
 *   - description: explanation text
 *   - riskLevel: "high" | "medium" | "low" | "none"
 *   - matchedCategories: array of STRA category IDs from straData.js
 *
 * Verified 2026-11-21 against the federal STRA list (dateModified 2026-10-06)
 * and straData.js. Every sub-category a result names is on the list, under
 * the category the result gives, and all 74 sub-categories can be reached.
 * The examples in a description are the list's own for that sub-category,
 * apart from a few plain-language glosses (for example drones, hydrogen
 * aircraft, hyperspectral imaging); a second category offered as "may also
 * intersect" is this site's reading, not the list's.
 *
 * The list has no levels of sensitivity, so no result ranks one area above
 * another. riskLevel only says how directly the answers match the list, and
 * the page shows it as "High likelihood", "Possible" or "Unlikely". Under the
 * STRAC Policy only the sub-categories count, except Advanced Weapons, which
 * has none: any grant that advances an advanced weapons technology is covered
 * (STRAC FAQ). tests/wizards.test.mjs checks the question graph and the ids.
 */

export const straWizard = {
  startQuestion: "q1",
  questions: {
    // ---------------------------------------------------------------
    // ENTRY QUESTIONS
    // ---------------------------------------------------------------
    q1: {
      text: "Does your research involve developing, advancing, or creating any form of technology, technical process, or technical knowledge?",
      type: "yesno",
      yes: "q2",
      no: "q1b",
    },
    q1b: {
      text: "Does your research generate fundamental knowledge (e.g. in physics, chemistry, biology, mathematics) that could directly enable the development of new technologies?",
      type: "yesno",
      yes: "q2",
      no: "result-not-stra",
    },
    q2: {
      text: "Does your research have potential military, intelligence, dual-use, or national security applications?",
      type: "yesno",
      yes: "q3-high",
      no: "q3",
    },

    // ---------------------------------------------------------------
    // HIGH-RISK PATH (military / dual-use flagged)
    // ---------------------------------------------------------------
    "q3-high": {
      text: "Which area best describes the military or dual-use dimension of your research?",
      type: "choice",
      options: [
        {
          label: "Weapons systems, directed energy, hypersonic, or autonomous weapons",
          next: "result-weapons",
        },
        {
          label: "Surveillance, reconnaissance, or intelligence-gathering technologies",
          next: "q4-sensing-military",
        },
        {
          label: "Cybersecurity, cryptography, or secure communications",
          next: "q4-digital-security",
        },
        {
          label: "Aerospace, propulsion, or space defence systems",
          next: "q4-aerospace-defence",
        },
        {
          label: "CBRN medical countermeasures (treatments, diagnostics)",
          next: "result-cbrn",
        },
        {
          label: "Other / not sure -- let me describe my research area instead",
          next: "q3",
        },
      ],
    },

    // ---------------------------------------------------------------
    // GENERAL DOMAIN SELECTION
    // ---------------------------------------------------------------
    q3: {
      text: "Which broad area best describes your research?",
      type: "choice",
      options: [
        {
          label: "Digital/Cyber (AI, cybersecurity, networking, microelectronics, data storage)",
          next: "q4-digital",
        },
        {
          label: "Materials/Manufacturing (advanced materials, 3D/4D printing, semiconductors, nanomaterials)",
          next: "q4-materials",
        },
        {
          label: "Life Sciences/Biotech (genomics, synthetic biology, medical devices, biotech)",
          next: "q4-life",
        },
        {
          label: "Energy (nuclear, batteries, energy storage, wireless power)",
          next: "q4-energy",
        },
        {
          label: "Aerospace/Space (propulsion, satellites, drones, space robotics)",
          next: "q4-aerospace",
        },
        {
          label: "Sensing/Surveillance (radar, sonar, biometrics, sensors, PNT)",
          next: "q4-sensing",
        },
        {
          label: "Robotics/Autonomous Systems (autonomous vehicles, service robots, molecular robotics)",
          next: "q4-robotics",
        },
        {
          label: "Human-Machine Integration (brain-computer interfaces, exoskeletons, VR/AR)",
          next: "q4-human-machine",
        },
        {
          label: "Quantum Science (quantum computing, quantum communications, quantum sensing)",
          next: "q4-quantum",
        },
        {
          label: "None of these areas",
          next: "result-unlikely",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 1: DIGITAL INFRASTRUCTURE
    // ---------------------------------------------------------------
    "q4-digital": {
      text: "Which digital technology area is most relevant to your research?",
      type: "choice",
      options: [
        {
          label: "Artificial intelligence, machine learning, or deep learning",
          next: "q5-ai",
        },
        {
          label: "Advanced communications (cognitive radio, massive MIMO, millimeter-wave, optical/photonic)",
          next: "result-digital-comms",
        },
        {
          label: "Cryptography, cybersecurity, or secure computing",
          next: "q4-digital-security",
        },
        {
          label: "Microelectronics, semiconductors, or chip design",
          next: "result-digital-micro",
        },
        {
          label: "Distributed ledger / blockchain technology",
          next: "result-digital-dlt",
        },
        {
          label: "Advanced data storage (DNA storage, 5D optical, novel storage)",
          next: "result-digital-storage",
        },
        {
          label: "High-performance or neuromorphic computing",
          next: "result-digital-computing",
        },
        {
          label: "Next-generation networks (5G, 6G and later) / Internet of Everything",
          next: "result-digital-network",
        },
      ],
    },
    "q5-ai": {
      text: "What aspect of AI does your research focus on?",
      type: "choice",
      options: [
        {
          label: "Machine learning models, deep learning, or neural networks",
          next: "result-ai-ml",
        },
        {
          label: "Computer vision or image/video analysis",
          next: "result-ai-vision",
        },
        {
          label: "Natural language processing (NLP), speech recognition, or chatbots",
          next: "result-ai-nlp",
        },
        {
          label: "AI chipsets or hardware accelerators for AI",
          next: "result-ai-chips",
        },
        {
          label: "Digital twins or AI-driven simulation",
          next: "result-ai-twin",
        },
        {
          label: "Data science, big data analytics, or predictive analytics",
          next: "result-ai-data",
        },
      ],
    },
    "q4-digital-security": {
      text: "Is your research focused on new encryption methods, such as post-quantum, homomorphic, biometric or DNA-based encryption?",
      type: "yesno",
      yes: "result-digital-security-high",
      no: "result-digital-security",
    },

    // ---------------------------------------------------------------
    // PATH 2: MATERIALS & MANUFACTURING
    // ---------------------------------------------------------------
    "q4-materials": {
      text: "Which materials or manufacturing area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Nanomaterials or nano-manufacturing",
          next: "result-materials-nano",
        },
        {
          label: "Metamaterials or auxetic materials",
          next: "result-materials-meta",
        },
        {
          label: "Smart/multifunctional materials or shape-memory materials",
          next: "result-materials-smart",
        },
        {
          label: "2D materials (graphene, silicene) or superconducting materials",
          next: "result-materials-2d",
        },
        {
          label: "High-entropy alloys or augmented conventional materials",
          next: "result-materials-alloys",
        },
        {
          label: "Additive manufacturing (3D printing) or 4D printing",
          next: "result-materials-additive",
        },
        {
          label: "Semiconductor manufacturing (EUV lithography, fabrication)",
          next: "result-materials-semiconductor",
        },
        {
          label: "Critical minerals extraction, processing, or recycling",
          next: "result-materials-critical",
        },
        {
          label: "Powder materials for additive manufacturing",
          next: "result-materials-powder",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 3: LIFE SCIENCES / BIOTECH
    // ---------------------------------------------------------------
    "q4-life": {
      text: "Which life science area is most relevant to your research?",
      type: "choice",
      options: [
        {
          label: "Genomics, gene editing (CRISPR), or genetic engineering",
          next: "result-life-genomics",
        },
        {
          label: "Synthetic biology or biomanufacturing",
          next: "result-life-synbio",
        },
        {
          label: "Gene therapy or gene-based treatments",
          next: "result-life-gene-therapy",
        },
        {
          label: "Nanomedicine or targeted drug delivery",
          next: "result-life-nanomed",
        },
        {
          label: "Tissue engineering, regenerative medicine, or stem cells",
          next: "result-life-tissue",
        },
        {
          label: "Proteomics or protein analysis",
          next: "result-life-proteomics",
        },
        {
          label: "CBRN medical countermeasures",
          next: "result-cbrn",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 4: ENERGY
    // ---------------------------------------------------------------
    "q4-energy": {
      text: "Which energy technology area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Advanced batteries, fuel cells, or supercapacitors",
          next: "result-energy-storage",
        },
        {
          label: "Nuclear fusion or small modular reactors",
          next: "result-energy-nuclear",
        },
        {
          label: "Wireless power transfer / wireless charging",
          next: "result-energy-wireless",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 5: AEROSPACE / SPACE
    // ---------------------------------------------------------------
    "q4-aerospace": {
      text: "Which aerospace or space technology area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Propulsion systems (electric, nuclear, pulse detonation)",
          next: "result-aerospace-propulsion",
        },
        {
          label: "Satellites, payloads, or space-based PNT",
          next: "result-aerospace-satellites",
        },
        {
          label: "Space stations or on-orbit servicing/assembly",
          next: "result-aerospace-space-ops",
        },
        {
          label: "Zero-emission or zero-fuel aircraft",
          next: "result-aerospace-zero-emission",
        },
        {
          label: "Wind tunnel technology or aerodynamic testing",
          next: "result-aerospace-wind-tunnel",
        },
        {
          label: "Autonomous/uncrewed aerial vehicles (drones, UAVs)",
          next: "result-robotics-vehicles",
        },
        {
          label: "Space robotics",
          next: "result-robotics-space",
        },
      ],
    },
    "q4-aerospace-defence": {
      text: "Is your research related to propulsion for missiles or military aircraft, or to military satellite systems?",
      type: "yesno",
      yes: "result-aerospace-defence-high",
      no: "q4-aerospace",
    },

    // ---------------------------------------------------------------
    // PATH 6: SENSING & SURVEILLANCE
    // ---------------------------------------------------------------
    "q4-sensing": {
      text: "Which sensing or surveillance area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Radar technologies (synthetic aperture, over-the-horizon, cognitive)",
          next: "result-sensing-radar",
        },
        {
          label: "Biometric recognition (facial, fingerprint, gait, voice)",
          next: "result-sensing-biometric",
        },
        {
          label: "Sonar systems (side scan sonar, synthetic aperture sonar)",
          next: "result-sensing-sonar",
        },
        {
          label: "Position, navigation and timing (PNT) or inertial navigation",
          next: "result-sensing-pnt",
        },
        {
          label: "Imaging, optical, infrared, or electromagnetic sensors",
          next: "result-sensing-imaging",
        },
        {
          label: "MEMS/NEMS (micro/nano electro-mechanical systems)",
          next: "result-sensing-mems",
        },
        {
          label: "Underwater sensor networks or acoustic sensors",
          next: "result-sensing-underwater",
        },
        {
          label: "Electric or magnetic field sensors",
          next: "result-sensing-fields",
        },
        {
          label: "Atomic interferometer sensors",
          next: "result-sensing-atomic",
        },
        {
          label: "Cross-cueing sensors (several sensors cueing one another)",
          next: "result-sensing-crosscueing",
        },
      ],
    },
    "q4-sensing-military": {
      text: "Does your surveillance or reconnaissance research involve radar, sonar, advanced imaging, or autonomous sensing platforms?",
      type: "yesno",
      yes: "result-sensing-military",
      no: "q4-sensing",
    },

    // ---------------------------------------------------------------
    // PATH 7: ROBOTICS & AUTONOMOUS SYSTEMS
    // ---------------------------------------------------------------
    "q4-robotics": {
      text: "Which robotics or autonomous systems area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Autonomous or uncrewed vehicles (aerial, ground, marine)",
          next: "result-robotics-vehicles",
        },
        {
          label: "Service robots or assistive robots",
          next: "result-robotics-service",
        },
        {
          label: "Molecular or nano robotics",
          next: "result-robotics-nano",
        },
        {
          label: "Space robotics",
          next: "result-robotics-space",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 8: HUMAN-MACHINE INTEGRATION
    // ---------------------------------------------------------------
    "q4-human-machine": {
      text: "Which human-machine integration area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Brain-computer interfaces (invasive or implanted)",
          next: "result-hmi-bci",
        },
        {
          label: "Wearable neurotechnology (non-invasive brain devices)",
          next: "result-hmi-neurotech",
        },
        {
          label: "Exoskeletons or powered suits",
          next: "result-hmi-exo",
        },
        {
          label: "Neuroprosthetic or cybernetic devices",
          next: "result-hmi-prosthetic",
        },
        {
          label: "Virtual reality, augmented reality, or mixed reality",
          next: "result-hmi-xr",
        },
      ],
    },

    // ---------------------------------------------------------------
    // PATH 9: QUANTUM
    // ---------------------------------------------------------------
    "q4-quantum": {
      text: "Which quantum science area is most relevant?",
      type: "choice",
      options: [
        {
          label: "Quantum computing (qubits, quantum processors)",
          next: "result-quantum-computing",
        },
        {
          label: "Quantum communications or quantum key distribution",
          next: "result-quantum-comms",
        },
        {
          label: "Quantum sensing or quantum radar",
          next: "result-quantum-sensing",
        },
        {
          label: "Quantum materials (topological insulators, Weyl semimetals)",
          next: "result-quantum-materials",
        },
        {
          label: "Quantum software or quantum algorithms",
          next: "result-quantum-software",
        },
      ],
    },

    // ===============================================================
    // RESULT NODES
    // ===============================================================

    // -- NOT STRA --
    "result-not-stra": {
      type: "result",
      title: "Not likely a Sensitive Technology Research Area",
      description:
        "Based on your responses, your research does not appear to involve developing or advancing technology and is unlikely to fall under the STRA list. However, you should still review the full STRA list if your research context changes.",
      riskLevel: "none",
      matchedCategories: [],
    },
    "result-unlikely": {
      type: "result",
      title: "Unlikely to be a Sensitive Technology Research Area",
      description:
        "Your research does not clearly map to any of the 11 STRA categories. However, the STRA list is broad and evolving. Consider reviewing the full list or consulting your institution's research security office if you are uncertain.",
      riskLevel: "low",
      matchedCategories: [],
    },

    // -- WEAPONS --
    "result-weapons": {
      type: "result",
      title: "Your research likely falls under Advanced Weapons",
      description:
        "Research involving directed energy weapons, hypersonic weapons, autonomous weapons, or enhancements to biological or chemical weapons is what the Advanced Weapons category of the STRA list describes. The category has no sub-categories: any grant that advances an advanced weapons technology falls under the STRAC Policy.",
      riskLevel: "high",
      matchedCategories: ["advanced-weapons"],
    },

    // -- CBRN --
    "result-cbrn": {
      type: "result",
      title: "Your research likely falls under CBRN Medical Countermeasures",
      description:
        "Research on medical countermeasures for chemical, biological, radiological or nuclear threats falls under the Life Science Technology category of the STRA list. The sub-category covers medical assets that prevent, identify or treat injuries and illnesses caused by CBRN threats, such as therapeutics and diagnostics. Other CBRN defence work is not named in it: check the rest of the list.",
      riskLevel: "high",
      matchedCategories: ["life-science"],
    },

    // -- DIGITAL / AI RESULTS --
    "result-digital-comms": {
      type: "result",
      title: "Your research likely falls under Advanced Communications Technology",
      description:
        "Research on adaptive, cognitive or intelligent radios, massive MIMO, millimeter-wave spectrum, open or virtualized radio access networks, optical or photonic communications, or wideband high-frequency communications falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-micro": {
      type: "result",
      title: "Your research likely falls under Microelectronics",
      description:
        "Research on semiconductor components, systems-on-chip, photonic integration, or memory-centric logic falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-dlt": {
      type: "result",
      title: "Your research likely falls under Distributed Ledger Technology",
      description:
        "Research on blockchain, cryptocurrencies, digital currencies, or non-fungible tokens falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-storage": {
      type: "result",
      title: "Your research likely falls under Data Storage Technology",
      description:
        "Research on 5D optical storage, DNA storage, or single-molecule magnets falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-computing": {
      type: "result",
      title: "Your research likely falls under Advanced Computing Technology",
      description:
        "Research on high-performance computing, neuromorphic computing, edge computing, or context-aware computing falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-network": {
      type: "result",
      title: "Your research likely falls under Next-Generation Network Technology",
      description:
        "Research on 5G/6G networks, integrated terrestrial/non-terrestrial networks, or Internet of Everything infrastructure falls under the Advanced Digital Infrastructure Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-security": {
      type: "result",
      title: "Your research likely falls under Cryptography and/or Cyber Security Technology",
      description:
        "Research on cyber defence tools, cross domain solutions or moving target defence falls under the Cyber Security Technology sub-category, and work on secure communications may fall under Cryptography. Both are part of the Advanced Digital Infrastructure Technology category of the STRA list. The Cyber Security Technology sub-category describes technologies that protect systems: if your work is on offensive capabilities, read it closely and ask your research security office.",
      riskLevel: "medium",
      matchedCategories: ["advanced-digital-infrastructure"],
    },
    "result-digital-security-high": {
      type: "result",
      title: "Your research likely falls under Cryptography",
      description:
        "Research on new encryption methods is what the Cryptography sub-category describes: the federal list names biometric encryption, DNA-based encryption, post-quantum cryptography, homomorphic encryption and optical stealth encryption as examples. It is part of the Advanced Digital Infrastructure Technology category. Quantum key distribution is listed separately, under Quantum Communications.",
      riskLevel: "high",
      matchedCategories: ["advanced-digital-infrastructure", "quantum-science"],
    },

    // -- AI RESULTS --
    "result-ai-ml": {
      type: "result",
      title: "Your research likely falls under Machine Learning",
      description:
        "Research on deep learning, neural networks, or evolutionary computation falls under the AI and Big Data Technology category of the STRA list. AI is considered cross-cutting, enabling developments in many other STRA areas.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data"],
    },
    "result-ai-vision": {
      type: "result",
      title: "Your research likely falls under Computer Vision",
      description:
        "Research on image classification, object detection, depth perception, or video analysis falls under the AI and Big Data Technology category. It may also intersect with Advanced Sensing and Surveillance.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data", "advanced-sensing-surveillance"],
    },
    "result-ai-nlp": {
      type: "result",
      title: "Your research likely falls under Natural Language Processing",
      description:
        "Research on speech recognition, text classification, sentiment analysis, machine translation, or virtual assistants falls under the AI and Big Data Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data"],
    },
    "result-ai-chips": {
      type: "result",
      title: "Your research likely falls under AI Chipsets",
      description:
        "Research on custom AI processors, neural processing units, or AI hardware accelerators falls under the AI and Big Data Technology category. It also intersects with Microelectronics under Advanced Digital Infrastructure.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data", "advanced-digital-infrastructure"],
    },
    "result-ai-twin": {
      type: "result",
      title: "Your research likely falls under Digital Twin Technology",
      description:
        "Research on digital twins, real-time simulation models, or metaverse infrastructure falls under the AI and Big Data Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data"],
    },
    "result-ai-data": {
      type: "result",
      title: "Your research likely falls under Data Science and Big Data Technology",
      description:
        "Research on big data analytics, data mining, predictive analytics, or AI-enabled data analysis falls under the AI and Big Data Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["ai-big-data"],
    },

    // -- MATERIALS RESULTS --
    "result-materials-nano": {
      type: "result",
      title: "Your research likely falls under Nanomaterials and/or Nano-Manufacturing",
      description:
        "Research on nanomaterials, nano-energetic materials, or scaled-up nanoscale manufacturing falls under the Advanced Materials and Manufacturing category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-meta": {
      type: "result",
      title: "Your research likely falls under Metamaterials and/or Auxetic Materials",
      description:
        "Research on metamaterials with unique electromagnetic or acoustic properties, or auxetic materials with negative Poisson's ratio, falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-smart": {
      type: "result",
      title: "Your research likely falls under Multifunctional/Smart Materials",
      description:
        "Research on shape memory alloys, magnetorheological fluids, self-assembled materials, or other stimulus-responsive materials falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-2d": {
      type: "result",
      title: "Your research likely falls under 2D Materials and/or Superconducting Materials",
      description:
        "Research on graphene, silicene, germanene, metal chalcogenides, or superconductors falls under the Advanced Materials and Manufacturing category. Large-scale production of 2D materials has a sub-category of its own, Two-Dimensional (2D) Materials Manufacturing. This work may also intersect with Quantum Science and Technology.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing", "quantum-science"],
    },
    "result-materials-alloys": {
      type: "result",
      title: "Your research likely falls under High-Entropy Materials or Augmented Conventional Materials",
      description:
        "Research on high-entropy alloys, high-entropy oxides, or augmented conventional materials with extraordinary properties falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-additive": {
      type: "result",
      title: "Your research likely falls under Additive Manufacturing (3D/4D Printing)",
      description:
        "Research on 3D printing processes, multi-material additive manufacturing, volumetric printing, or 4D printing with smart materials falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-semiconductor": {
      type: "result",
      title: "Your research likely falls under Advanced Semiconductor Manufacturing",
      description:
        "Research on EUV lithography, advanced deposition, doping techniques, or other semiconductor fabrication methods falls under the Advanced Materials and Manufacturing category. It also intersects with Advanced Digital Infrastructure.",
      riskLevel: "medium",
      matchedCategories: [
        "advanced-materials-manufacturing",
        "advanced-digital-infrastructure",
      ],
    },
    "result-materials-critical": {
      type: "result",
      title: "Your research likely falls under Critical Materials Manufacturing",
      description:
        "Research on extraction, processing, upgrading, or recycling of critical materials such as rare earth elements, scandium, or lithium falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },
    "result-materials-powder": {
      type: "result",
      title: "Your research likely falls under Powder Materials for Additive Manufacturing",
      description:
        "Research on novel metal, polymer, ceramic, or composite powders enabling 3D printing falls under the Advanced Materials and Manufacturing category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-materials-manufacturing"],
    },

    // -- LIFE SCIENCE RESULTS --
    "result-life-genomics": {
      type: "result",
      title: "Your research likely falls under Genomic Sequencing and Genetic Engineering",
      description:
        "Research on whole genome sequencing, CRISPR, next-generation sequencing, or direct genome manipulation falls under the Life Science Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["life-science"],
    },
    "result-life-synbio": {
      type: "result",
      title: "Your research likely falls under Synthetic Biology and/or Biomanufacturing",
      description:
        "Research on creating new biological entities, synthetic cells, biofuels, biocomputers, or industrial-scale biological production falls under the Life Science Technology category.",
      riskLevel: "medium",
      matchedCategories: ["life-science"],
    },
    "result-life-gene-therapy": {
      type: "result",
      title: "Your research likely falls under Gene Therapy",
      description:
        "Research on gene manipulation or modification in humans to prevent, treat, or cure disease falls under the Life Science Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["life-science"],
    },
    "result-life-nanomed": {
      type: "result",
      title: "Your research likely falls under Nanomedicine",
      description:
        "Research on nanoparticle drug delivery, smart imaging with nanomaterials, or nano-engineered implants falls under the Life Science Technology category. It also intersects with Advanced Materials.",
      riskLevel: "medium",
      matchedCategories: ["life-science", "advanced-materials-manufacturing"],
    },
    "result-life-tissue": {
      type: "result",
      title: "Your research likely falls under Tissue Engineering and Regenerative Medicine",
      description:
        "Research on regenerating cells, tissues, or organs, stem cell therapies, or tissue scaffolding falls under the Life Science Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["life-science"],
    },
    "result-life-proteomics": {
      type: "result",
      title: "Your research likely falls under Proteomics",
      description:
        "Research on large-scale protein analysis, proteome informatics, or species-level identification from biological samples falls under the Life Science Technology category.",
      riskLevel: "medium",
      matchedCategories: ["life-science"],
    },

    // -- ENERGY RESULTS --
    "result-energy-storage": {
      type: "result",
      title: "Your research likely falls under Advanced Energy Storage Technology",
      description:
        "Research on novel batteries (solid-state, lithium-air, graphene aluminium-ion), fuel cells, or supercapacitors falls under the Advanced Energy Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-energy"],
    },
    "result-energy-nuclear": {
      type: "result",
      title: "Your research likely falls under Advanced Nuclear Generation Technology",
      description:
        "Research on nuclear fusion or small modular reactors falls under the Advanced Energy Technology category of the STRA list. Both are named as examples of this sub-category.",
      riskLevel: "high",
      matchedCategories: ["advanced-energy"],
    },
    "result-energy-wireless": {
      type: "result",
      title: "Your research likely falls under Wireless Power Transfer Technology",
      description:
        "Research on wireless electricity transmission, recharging zones, or extended-distance wireless power falls under the Advanced Energy Technology category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["advanced-energy"],
    },

    // -- AEROSPACE RESULTS --
    "result-aerospace-propulsion": {
      type: "result",
      title: "Your research likely falls under Propulsion Technologies",
      description:
        "Research on electrified aircraft propulsion, solar electric propulsion, nuclear thermal/electric propulsion, or pulse detonation engines falls under the Aerospace, Space and Satellite Technology category.",
      riskLevel: "medium",
      matchedCategories: ["aerospace-space-satellite"],
    },
    "result-aerospace-satellites": {
      type: "result",
      title: "Your research likely falls under Satellites, Payloads, or Space-Based PNT",
      description:
        "Research on satellite design, payloads, GNSS improvements, or space-based positioning systems falls under the Aerospace, Space and Satellite Technology category.",
      riskLevel: "medium",
      matchedCategories: ["aerospace-space-satellite"],
    },
    "result-aerospace-space-ops": {
      type: "result",
      title: "Your research likely falls under Space Stations or On-Orbit Servicing",
      description:
        "Research on space stations, on-orbit servicing, space-based assembly, or space manufacturing falls under the Aerospace, Space and Satellite Technology category.",
      riskLevel: "medium",
      matchedCategories: ["aerospace-space-satellite"],
    },
    "result-aerospace-zero-emission": {
      type: "result",
      title: "Your research likely falls under Zero-Emission/Fuel Aircraft",
      description:
        "Research on electric aircraft, hydrogen-powered aircraft, or other zero-emission aviation technology falls under the Aerospace, Space and Satellite Technology category.",
      riskLevel: "medium",
      matchedCategories: ["aerospace-space-satellite"],
    },
    "result-aerospace-wind-tunnel": {
      type: "result",
      title: "Your research likely falls under Advanced Wind Tunnels",
      description:
        "Research on advanced wind tunnel infrastructure for subsonic, transonic, supersonic, or hypersonic testing falls under the Aerospace, Space and Satellite Technology category.",
      riskLevel: "medium",
      matchedCategories: ["aerospace-space-satellite"],
    },
    "result-aerospace-defence-high": {
      type: "result",
      title: "Your research likely falls under Propulsion Technologies and/or Satellites",
      description:
        "Research on propulsion for missiles or military aircraft, or on military satellite systems, falls under the Aerospace, Space and Satellite Technology category of the STRA list. Its Propulsion Technologies sub-category covers thrust for aircraft, spacecraft, rockets or missiles, and Satellites is a sub-category of its own. This work may also intersect with Advanced Weapons.",
      riskLevel: "high",
      matchedCategories: ["aerospace-space-satellite", "advanced-weapons"],
    },

    // -- SENSING RESULTS --
    "result-sensing-radar": {
      type: "result",
      title: "Your research likely falls under Advanced Radar Technologies",
      description:
        "Research on electronically-scanned arrays, cognitive radars, over-the-horizon radar, passive radar, or synthetic aperture radar falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-biometric": {
      type: "result",
      title: "Your research likely falls under Advanced Biometric Recognition Technologies",
      description:
        "Research on facial recognition, fingerprint analysis, gait recognition, voice biometrics, or AI-enhanced identification falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-sonar": {
      type: "result",
      title: "Your research likely falls under Side Scan Sonar or Synthetic Aperture Sonar",
      description:
        "Research on advanced sonar systems for underwater imaging, sea floor scanning, or acoustic sensing falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-pnt": {
      type: "result",
      title: "Your research likely falls under Position, Navigation and Timing (PNT) Technology",
      description:
        "Research on inertial navigation, atomic clocks, gravity-aided navigation, or GPS-denied positioning falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-imaging": {
      type: "result",
      title: "Your research likely falls under Imaging and Optical Devices and Sensors",
      description:
        "Research on advanced imaging beyond visible spectrum, infrared sensors, hyperspectral imaging, or advanced optics falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-mems": {
      type: "result",
      title: "Your research likely falls under Micro (or Nano) Electro-Mechanical Systems (M/NEMS)",
      description:
        "Research on MEMS, NEMS, smart dust, or miniaturized sensor systems falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-underwater": {
      type: "result",
      title: "Your research likely falls under Underwater (Wireless) Sensor Network",
      description:
        "Research on underwater acoustic communication, ocean sensor networks, or autonomous underwater vehicle networks falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-fields": {
      type: "result",
      title: "Your research likely falls under Electric or Magnetic Field Sensors",
      description:
        "Research on electric field sensors, magnetometers, or magnetic anomaly detection falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-atomic": {
      type: "result",
      title: "Your research likely falls under Atomic Interferometer Sensors",
      description:
        "Research on atom interferometry, quantum gas sensors, or gravimetric sensing falls under the Advanced Sensing and Surveillance category. It may also intersect with Quantum Science and Technology.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance", "quantum-science"],
    },
    "result-sensing-crosscueing": {
      type: "result",
      title: "Your research likely falls under Cross-Cueing Sensors",
      description:
        "Research on systems that let multiple sensors cue one another, for example in satellites for data validation, object tracking, enhanced reliability or earth observation, falls under the Advanced Sensing and Surveillance category.",
      riskLevel: "medium",
      matchedCategories: ["advanced-sensing-surveillance"],
    },
    "result-sensing-military": {
      type: "result",
      title: "Your research likely falls under Advanced Sensing and Surveillance",
      description:
        "Research on radar, sonar, advanced imaging, or autonomous sensing platforms for surveillance or reconnaissance falls under the Advanced Sensing and Surveillance category of the STRA list: check which of its sub-categories describes your work. If the sensing work enhances a weapon system, the Advanced Weapons category may apply as well.",
      riskLevel: "high",
      matchedCategories: ["advanced-sensing-surveillance", "advanced-weapons"],
    },

    // -- ROBOTICS RESULTS --
    "result-robotics-vehicles": {
      type: "result",
      title: "Your research likely falls under (Semi-)Autonomous/Uncrewed Aerial/Ground/Marine Vehicles",
      description:
        "Research on UAVs, UGVs, UUVs, drones, or autonomous vehicle systems falls under the Robotics and Autonomous Systems category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["robotics-autonomous-systems"],
    },
    "result-robotics-service": {
      type: "result",
      title: "Your research likely falls under Service Robots",
      description:
        "Research on semi or fully autonomous robots for human assistance, eldercare, or other service tasks falls under the Robotics and Autonomous Systems category.",
      riskLevel: "medium",
      matchedCategories: ["robotics-autonomous-systems"],
    },
    "result-robotics-nano": {
      type: "result",
      title: "Your research likely falls under Molecular (or Nano) Robotics",
      description:
        "Research on molecular-scale robots, nanobots, or programmable molecular machines falls under the Robotics and Autonomous Systems category.",
      riskLevel: "medium",
      matchedCategories: ["robotics-autonomous-systems"],
    },
    "result-robotics-space": {
      type: "result",
      title: "Your research likely falls under Space Robotics",
      description:
        "Research on orbital robots, space servicing devices, or planetary exploration robots falls under the Robotics and Autonomous Systems category. It also intersects with Aerospace, Space and Satellite Technology.",
      riskLevel: "medium",
      matchedCategories: [
        "robotics-autonomous-systems",
        "aerospace-space-satellite",
      ],
    },

    // -- HUMAN-MACHINE INTEGRATION RESULTS --
    "result-hmi-bci": {
      type: "result",
      title: "Your research likely falls under Brain-Computer Interfaces",
      description:
        "Research on invasive or implanted brain-computer interfaces for brain mapping, cognitive augmentation, or direct neural communication falls under the Human-Machine Integration category.",
      riskLevel: "medium",
      matchedCategories: ["human-machine-integration"],
    },
    "result-hmi-neurotech": {
      type: "result",
      title: "Your research likely falls under Wearable Neurotechnology",
      description:
        "Research on non-invasive wearable brain devices for health tracking, cognitive monitoring, or human optimization falls under the Human-Machine Integration category.",
      riskLevel: "medium",
      matchedCategories: ["human-machine-integration"],
    },
    "result-hmi-exo": {
      type: "result",
      title: "Your research likely falls under Exoskeletons",
      description:
        "Research on wearable robotic exoskeletons for physical augmentation or assistance falls under the Human-Machine Integration category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["human-machine-integration"],
    },
    "result-hmi-prosthetic": {
      type: "result",
      title: "Your research likely falls under Neuroprosthetic/Cybernetic Devices",
      description:
        "Research on implanted or worn devices interacting with the nervous system for sensory, motor, or cognitive restoration or enhancement falls under the Human-Machine Integration category.",
      riskLevel: "medium",
      matchedCategories: ["human-machine-integration"],
    },
    "result-hmi-xr": {
      type: "result",
      title: "Your research likely falls under Virtual/Augmented/Mixed Reality",
      description:
        "Research on VR, AR, MR, or metaverse technologies falls under the Human-Machine Integration category of the STRA list.",
      riskLevel: "medium",
      matchedCategories: ["human-machine-integration"],
    },

    // -- QUANTUM RESULTS --
    "result-quantum-computing": {
      type: "result",
      title: "Your research likely falls under Quantum Computing",
      description:
        "Research on qubits, quantum processors, or quantum error correction falls under the Quantum Science and Technology category. Quantum is considered cross-cutting across many STRA areas.",
      riskLevel: "high",
      matchedCategories: ["quantum-science"],
    },
    "result-quantum-comms": {
      type: "result",
      title: "Your research likely falls under Quantum Communications",
      description:
        "Research on quantum cryptography, quantum key distribution, or quantum-secure networking falls under the Quantum Science and Technology category.",
      riskLevel: "high",
      matchedCategories: ["quantum-science"],
    },
    "result-quantum-sensing": {
      type: "result",
      title: "Your research likely falls under Quantum Sensing",
      description:
        "Research on quantum sensors, quantum radar, or quantum-enhanced measurement devices falls under the Quantum Science and Technology category. It also intersects with Advanced Sensing and Surveillance.",
      riskLevel: "medium",
      matchedCategories: ["quantum-science", "advanced-sensing-surveillance"],
    },
    "result-quantum-materials": {
      type: "result",
      title: "Your research likely falls under Quantum Materials",
      description:
        "Research on superconductors, graphene, topological insulators, Weyl semimetals, metal chalcogenides, or other materials with unusual magnetic and electrical properties falls under the Quantum Science and Technology category. It also intersects with Advanced Materials.",
      riskLevel: "medium",
      matchedCategories: ["quantum-science", "advanced-materials-manufacturing"],
    },
    "result-quantum-software": {
      type: "result",
      title: "Your research likely falls under Quantum Software",
      description:
        "Research on quantum algorithms, quantum programming frameworks, or quantum computing optimization software falls under the Quantum Science and Technology category.",
      riskLevel: "medium",
      matchedCategories: ["quantum-science"],
    },
  },
};
