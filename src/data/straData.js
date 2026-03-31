/**
 * Sensitive Technology Research Areas (STRA) Data
 * Source: Government of Canada - Innovation, Science and Economic Development Canada
 * This data is structured from the official STRA list for use in research security assessments.
 */

export const straData = {
  lastUpdated: "2025-05-07",
  sourceUrl:
    "https://science.gc.ca/site/science/en/safeguarding-your-research/guidelines-and-tools-implement-research-security/sensitive-technology-research-areas",
  categories: [
    {
      id: "advanced-digital-infrastructure",
      name: "Advanced Digital Infrastructure Technology",
      description:
        "Devices, systems and technologies that compute, process, store, transmit and secure information and data supporting an increasingly digital world.",
      subcategories: [
        {
          id: "advanced-communications",
          name: "Advanced Communications Technology",
          description:
            "Technologies enabling fast, secure and reliable wireless communication, including in remote or adverse conditions and spectrum-congested areas.",
          keywords: [
            "adaptive radio",
            "cognitive radio",
            "intelligent radio",
            "massive MIMO",
            "millimeter-wave",
            "open RAN",
            "virtualized RAN",
            "optical communications",
            "photonic communications",
            "wideband high frequency",
            "wireless communication",
          ],
        },
        {
          id: "advanced-computing",
          name: "Advanced Computing Technology",
          description:
            "Computing systems with high computational power for processing complex, data-intensive or compute-intensive calculations.",
          keywords: [
            "context-aware computing",
            "edge computing",
            "high performance computing",
            "HPC",
            "neuromorphic computing",
          ],
        },
        {
          id: "cryptography",
          name: "Cryptography",
          description:
            "Methods and technologies enabling secure communications by transforming, transmitting or storing data in secure formats.",
          keywords: [
            "biometric encryption",
            "DNA-based encryption",
            "post-quantum cryptography",
            "homomorphic encryption",
            "optical stealth encryption",
            "encryption",
            "cryptographic",
          ],
        },
        {
          id: "cyber-security",
          name: "Cyber Security Technology",
          description:
            "Technologies protecting the integrity, confidentiality and availability of internet-connected systems from unauthorized access or malicious activities.",
          keywords: [
            "cyber defence",
            "cyber defense",
            "cross domain solutions",
            "moving target defence",
            "moving target defense",
            "cybersecurity",
            "network security",
          ],
        },
        {
          id: "data-storage",
          name: "Data Storage Technology",
          description:
            "Methods, tools, platforms and infrastructure for storing data or information securely in digital format.",
          keywords: [
            "5D optical storage",
            "five-dimensional optical storage",
            "DNA storage",
            "single-molecule magnets",
            "data storage",
          ],
        },
        {
          id: "distributed-ledger",
          name: "Distributed Ledger Technology",
          description:
            "Digital ledgers or databases tracking assets or recording transactions in multiple locations with no centralized point of control.",
          keywords: [
            "blockchain",
            "cryptocurrency",
            "digital currency",
            "non-fungible token",
            "NFT",
            "distributed ledger",
            "DLT",
          ],
        },
        {
          id: "microelectronics",
          name: "Microelectronics",
          description:
            "Development and manufacturing of very small electronic designs on a substrate, incorporating semiconductors and photonic components.",
          keywords: [
            "semiconductor",
            "memory-centric logic",
            "multi-chip module",
            "systems-on-chip",
            "SoC",
            "stacked memory",
            "microelectronics",
            "photonic components",
          ],
        },
        {
          id: "next-gen-networks",
          name: "Next-Generation Network Technology",
          description:
            "Fifth and future generation communications networks enabling faster processing and transmission of larger data volumes.",
          keywords: [
            "5G",
            "6G",
            "next-generation network",
            "Internet of Everything",
            "IoE",
            "non-terrestrial network",
            "network technology",
          ],
        },
      ],
    },
    {
      id: "advanced-energy",
      name: "Advanced Energy Technology",
      description:
        "Technologies and processes enabling improved generation, storage and transmission of energy, including in remote or adverse environments.",
      subcategories: [
        {
          id: "advanced-energy-storage",
          name: "Advanced Energy Storage Technology",
          description:
            "Technologies that store energy with new or enhanced properties such as improved energy density, compact size and fast recharging.",
          keywords: [
            "fuel cell",
            "biodegradable battery",
            "graphene aluminium-ion battery",
            "lithium-air battery",
            "liquid-metal battery",
            "solid-state battery",
            "structural battery",
            "supercapacitor",
            "ultracapacitor",
            "energy storage",
            "novel battery",
          ],
        },
        {
          id: "advanced-nuclear",
          name: "Advanced Nuclear Generation Technology",
          description:
            "New reactors and technologies smaller than conventional nuclear reactors, developed to be less capital-intensive.",
          keywords: [
            "nuclear fusion",
            "small modular reactor",
            "SMR",
            "advanced nuclear",
            "nuclear generation",
          ],
        },
        {
          id: "wireless-power-transfer",
          name: "Wireless Power Transfer Technology",
          description:
            "Technologies enabling transmission of electricity without wire over extended distances up to several kilometres.",
          keywords: [
            "wireless power",
            "wireless charging",
            "recharging zone",
            "wireless energy transfer",
            "wireless electricity",
          ],
        },
      ],
    },
    {
      id: "advanced-materials-manufacturing",
      name: "Advanced Materials and Manufacturing",
      description:
        "High-value products, components or materials with new or enhanced properties, and the novel technologies used to develop and manufacture them.",
      subcategories: [
        {
          id: "augmented-conventional-materials",
          name: "Augmented Conventional Materials",
          description:
            "Conventional materials augmented to have unconventional or extraordinary properties such as improved durability or high temperature strength.",
          keywords: [
            "high strength steel",
            "aluminum alloy",
            "magnesium alloy",
            "corrosion resistance",
            "augmented materials",
            "enhanced alloy",
          ],
        },
        {
          id: "auxetic-materials",
          name: "Auxetic Materials",
          description:
            "Materials with a negative Poisson's ratio that expand when stretched and contract when compressed, with unique energy-absorption properties.",
          keywords: [
            "auxetic",
            "negative Poisson",
            "energy absorption material",
            "impact absorption",
          ],
        },
        {
          id: "high-entropy-materials",
          name: "High-Entropy Materials",
          description:
            "Special materials comprised of several elements or components that can enhance fracture toughness, strength, conductivity and other properties.",
          keywords: [
            "high-entropy alloy",
            "high-entropy oxide",
            "high-entropy compound",
            "multi-element alloy",
            "thermal barrier coating",
          ],
        },
        {
          id: "metamaterials",
          name: "Metamaterials",
          description:
            "Structured materials not found in nature, often with unique interactions with electromagnetic radiation or sound waves.",
          keywords: [
            "metamaterial",
            "electromagnetic metamaterial",
            "acoustic metamaterial",
            "optical metamaterial",
          ],
        },
        {
          id: "multifunctional-smart-materials",
          name: "Multifunctional/Smart Materials",
          description:
            "Materials that transform in response to external stimuli such as heat, water or light within a given time.",
          keywords: [
            "magnetorheological fluid",
            "shape memory alloy",
            "shape memory polymer",
            "self-assembled material",
            "smart material",
            "multifunctional material",
          ],
        },
        {
          id: "nanomaterials",
          name: "Nanomaterials",
          description:
            "Materials with dimensions less than 100 nanometers exhibiting unique properties such as increased durability or self-repair.",
          keywords: [
            "nanomaterial",
            "nano-energetic",
            "nanoparticle",
            "nanostructure",
            "nanoscale",
          ],
        },
        {
          id: "powder-materials-additive-manufacturing",
          name: "Powder Materials for Additive Manufacturing",
          description:
            "Metal, polymer, ceramic and composite powders that enable additive manufacturing (3D printing) processes.",
          keywords: [
            "powder material",
            "metal powder",
            "polymer powder",
            "ceramic powder",
            "composite powder",
            "3D printing powder",
          ],
        },
        {
          id: "superconducting-materials",
          name: "Superconducting Materials",
          description:
            "Materials that transmit electricity with no resistance, eliminating power losses associated with electrical resistivity.",
          keywords: [
            "superconductor",
            "superconducting",
            "zero resistance",
            "superconducting circuit",
          ],
        },
        {
          id: "two-dimensional-materials",
          name: "Two-Dimensional (2D) Materials",
          description:
            "Materials with a thickness of roughly one atomic layer, such as graphene, silicene and germanene.",
          keywords: [
            "graphene",
            "silicene",
            "germanene",
            "stantene",
            "metal chalcogenide",
            "2D material",
            "two-dimensional material",
          ],
        },
        {
          id: "additive-manufacturing",
          name: "Additive Manufacturing (3D Printing)",
          description:
            "Processes constructing solid three-dimensional objects using CAD software, including multi-material and volumetric approaches.",
          keywords: [
            "3D printing",
            "additive manufacturing",
            "rapid prototyping",
            "multi-material printing",
            "volumetric additive",
          ],
        },
        {
          id: "advanced-semiconductor-manufacturing",
          name: "Advanced Semiconductor Manufacturing",
          description:
            "Methods, materials and processes related to manufacturing semiconductor devices, including EUV lithography.",
          keywords: [
            "semiconductor manufacturing",
            "EUV lithography",
            "extreme ultraviolet",
            "deposition",
            "lithography",
            "ionization",
            "doping",
            "chip fabrication",
          ],
        },
        {
          id: "critical-materials-manufacturing",
          name: "Critical Materials Manufacturing",
          description:
            "Technologies to extract, process, upgrade and recycle critical materials such as rare earth elements, scandium and lithium.",
          keywords: [
            "critical minerals",
            "rare earth",
            "scandium",
            "lithium extraction",
            "critical materials",
            "mineral processing",
            "supply chain",
          ],
        },
        {
          id: "four-dimensional-printing",
          name: "Four-Dimensional (4D) Printing",
          description:
            "Production of 3D products using smart materials programmed to transform in response to external stimuli.",
          keywords: [
            "4D printing",
            "four-dimensional printing",
            "reversible printing",
            "stimulus-responsive printing",
          ],
        },
        {
          id: "nano-manufacturing",
          name: "Nano-Manufacturing",
          description:
            "Production and manufacture of nanoscale materials, structures, devices and systems in a scaled-up, reliable manner.",
          keywords: [
            "nano-manufacturing",
            "nanomanufacturing",
            "nanoscale production",
            "nanofabrication",
          ],
        },
        {
          id: "2d-materials-manufacturing",
          name: "Two-Dimensional (2D) Materials Manufacturing",
          description:
            "Standardized, scalable and cost-effective large-scale production of 2D materials.",
          keywords: [
            "2D materials manufacturing",
            "graphene production",
            "2D material fabrication",
            "two-dimensional manufacturing",
          ],
        },
      ],
    },
    {
      id: "advanced-sensing-surveillance",
      name: "Advanced Sensing and Surveillance",
      description:
        "Advanced technologies that detect, measure or monitor physical, chemical, biological or environmental conditions and generate data about them.",
      subcategories: [
        {
          id: "advanced-biometric-recognition",
          name: "Advanced Biometric Recognition Technologies",
          description:
            "Technologies identifying individuals based on distinctive physical or behavioural identifiers with AI integration.",
          keywords: [
            "biometric",
            "facial recognition",
            "fingerprint recognition",
            "DNA identification",
            "gait recognition",
            "voice recognition",
            "keystroke pattern",
          ],
        },
        {
          id: "advanced-radar",
          name: "Advanced Radar Technologies",
          description:
            "Radar systems with improved detection and surveillance across different environments and greater distances.",
          keywords: [
            "electronically-scanned array",
            "cognitive radar",
            "over-the-horizon radar",
            "passive radar",
            "synthetic aperture radar",
            "SAR",
            "advanced radar",
          ],
        },
        {
          id: "atomic-interferometer-sensors",
          name: "Atomic Interferometer Sensors",
          description:
            "Sensors performing sensitive interferometric measurements using the wave character of atomic particles and quantum gases.",
          keywords: [
            "atomic interferometer",
            "atom interferometry",
            "gravimetry",
            "quantum gas sensor",
            "inertial sensor",
          ],
        },
        {
          id: "cross-cueing-sensors",
          name: "Cross-Cueing Sensors",
          description:
            "Systems enabling multiple sensors to cue one another for data validation, object tracking and enhanced reliability.",
          keywords: [
            "cross-cueing",
            "cross cueing",
            "sensor fusion",
            "multi-sensor",
            "sensor network",
          ],
        },
        {
          id: "electric-field-sensors",
          name: "Electric Field Sensors",
          description:
            "Sensors detecting variations in electric fields using low power, useful for detecting power lines or lightning.",
          keywords: [
            "electric field sensor",
            "E-field sensor",
            "power line detection",
            "lightning detection",
          ],
        },
        {
          id: "imaging-optical-sensors",
          name: "Imaging and Optical Devices and Sensors",
          description:
            "Devices providing visual depiction of objects beyond typical consumer-grade imaging, including infrared sensors.",
          keywords: [
            "imaging sensor",
            "optical sensor",
            "infrared sensor",
            "electromagnetic imaging",
            "advanced optics",
            "hyperspectral",
            "multispectral",
          ],
        },
        {
          id: "magnetic-field-sensors",
          name: "Magnetic Field Sensors (Magnetometers)",
          description:
            "Sensors detecting or measuring changes in magnetic fields, their intensity or direction.",
          keywords: [
            "magnetometer",
            "magnetic field sensor",
            "magnetic sensing",
            "magnetic anomaly detection",
          ],
        },
        {
          id: "mems-nems",
          name: "Micro/Nano Electro-Mechanical Systems (M/NEMS)",
          description:
            "Miniaturized, lightweight electro-mechanical devices integrating mechanical and electrical functionality at microscopic or nano level.",
          keywords: [
            "MEMS",
            "NEMS",
            "micro electro-mechanical",
            "nano electro-mechanical",
            "smart dust",
            "microsensor",
          ],
        },
        {
          id: "pnt-technology",
          name: "Position, Navigation and Timing (PNT) Technology",
          description:
            "Systems enabling accurate calculation of positioning, navigation and timing, including GPS-denied environments.",
          keywords: [
            "PNT",
            "position navigation timing",
            "atomic clock",
            "gravity-aided navigation",
            "inertial navigation",
            "magnetic anomaly navigation",
            "GNSS",
          ],
        },
        {
          id: "side-scan-sonar",
          name: "Side Scan Sonar",
          description:
            "Active sonar systems using transducer arrays to send and receive acoustic pulses to scan large underwater areas.",
          keywords: [
            "side scan sonar",
            "side-scan sonar",
            "sonar imaging",
            "acoustic scanning",
          ],
        },
        {
          id: "synthetic-aperture-sonar",
          name: "Synthetic Aperture Sonar (SAS)",
          description:
            "Active sonar producing high-resolution images of the sea floor with greatly enhanced range and resolution.",
          keywords: [
            "synthetic aperture sonar",
            "SAS",
            "high-resolution sonar",
            "underwater imaging",
          ],
        },
        {
          id: "underwater-sensor-network",
          name: "Underwater (Wireless) Sensor Network",
          description:
            "Networks of sensors and autonomous underwater vehicles using acoustic waves for remote sensing, surveillance and ocean exploration.",
          keywords: [
            "underwater sensor",
            "underwater wireless",
            "acoustic communication",
            "ocean sensor",
            "underwater vehicle network",
            "AUV",
          ],
        },
      ],
    },
    {
      id: "advanced-weapons",
      name: "Advanced Weapons",
      description:
        "Emerging or improved weapons for defence and national security, including directed energy, hypersonic, autonomous and enhanced conventional weapons.",
      subcategories: [
        {
          id: "advanced-weapons-general",
          name: "Advanced Weapons",
          description:
            "Directed energy weapons, hypersonic weapons, autonomous weapons and enhancements enabled by nanotechnology, synthetic biology and AI.",
          keywords: [
            "directed energy weapon",
            "hypersonic weapon",
            "autonomous weapon",
            "biological weapon",
            "chemical weapon",
            "weapons technology",
            "defence weapon",
            "defense weapon",
            "dual-use",
          ],
        },
      ],
    },
    {
      id: "aerospace-space-satellite",
      name: "Aerospace, Space and Satellite Technology",
      description:
        "Technologies enabling aircraft and spacecraft design, production, testing and operation, as well as space travel, research and satellite capabilities.",
      subcategories: [
        {
          id: "advanced-wind-tunnels",
          name: "Advanced Wind Tunnels",
          description:
            "Technological advancements in wind tunnel infrastructure simulating subsonic, transonic, supersonic and hypersonic flight conditions.",
          keywords: [
            "wind tunnel",
            "subsonic",
            "transonic",
            "supersonic",
            "hypersonic",
            "aerodynamic testing",
          ],
        },
        {
          id: "on-orbit-servicing",
          name: "On-Orbit Servicing, Assembly and Manufacturing Systems",
          description:
            "Systems for space-based servicing, assembly and manufacturing to optimize space logistics and modernize space assets.",
          keywords: [
            "on-orbit servicing",
            "space assembly",
            "space manufacturing",
            "orbital servicing",
            "space logistics",
          ],
        },
        {
          id: "payloads",
          name: "Payloads",
          description:
            "Lower cost satellite payloads with increased performance, requiring improvements in apertures, antennas, sensors and imagers.",
          keywords: [
            "satellite payload",
            "light weight aperture",
            "satellite antenna",
            "optical sensor",
            "multi-spectral imager",
            "payload technology",
          ],
        },
        {
          id: "propulsion-technologies",
          name: "Propulsion Technologies",
          description:
            "Components and systems producing powerful thrust for aircraft, spacecraft, rockets or missiles with improved performance.",
          keywords: [
            "propulsion",
            "electrified aircraft propulsion",
            "solar electric propulsion",
            "pulse detonation engine",
            "nuclear thermal propulsion",
            "nuclear electric propulsion",
            "rocket propulsion",
          ],
        },
        {
          id: "satellites",
          name: "Satellites",
          description:
            "Artificial objects placed into orbit for remote sensing, communications and other purposes, including smaller and less costly designs.",
          keywords: [
            "satellite",
            "remote sensing satellite",
            "communications satellite",
            "small satellite",
            "CubeSat",
            "nanosatellite",
          ],
        },
        {
          id: "space-based-pnt",
          name: "Space-Based Positioning, Navigation and Timing Technology",
          description:
            "GNSS-based satellites and technologies improving the accuracy, agility and resilience of GNSS and GPS.",
          keywords: [
            "space-based PNT",
            "GNSS satellite",
            "GPS technology",
            "satellite navigation",
            "positioning satellite",
          ],
        },
        {
          id: "space-stations",
          name: "Space Stations",
          description:
            "Space-based facilities supporting extended human operations, assembly, manufacturing, research and vehicle docking.",
          keywords: [
            "space station",
            "orbital outpost",
            "life support system",
            "space habitat",
            "orbital facility",
          ],
        },
        {
          id: "zero-emission-aircraft",
          name: "Zero-Emission/Fuel Aircraft",
          description:
            "Aircraft powered by energy sources that do not emit polluting emissions or require fuel to fly.",
          keywords: [
            "zero-emission aircraft",
            "zero-fuel aircraft",
            "electric aircraft",
            "hydrogen aircraft",
            "sustainable aviation",
          ],
        },
      ],
    },
    {
      id: "ai-big-data",
      name: "Artificial Intelligence and Big Data Technology",
      description:
        "AI technologies simulating human intelligence using data and algorithms, and big data tools for processing large, complex datasets.",
      subcategories: [
        {
          id: "ai-chipsets",
          name: "AI Chipsets",
          description:
            "Custom-designed chips processing large amounts of data enabling AI algorithms to perform calculations more efficiently.",
          keywords: [
            "AI chip",
            "AI chipset",
            "neural processing unit",
            "NPU",
            "AI accelerator",
            "tensor processing",
            "AI hardware",
          ],
        },
        {
          id: "computer-vision",
          name: "Computer Vision",
          description:
            "AI field allowing computers to see and extract meaning from digital images, including classification, detection and depth perception.",
          keywords: [
            "computer vision",
            "image classification",
            "object detection",
            "depth perception",
            "image recognition",
            "visual AI",
          ],
        },
        {
          id: "data-science-big-data",
          name: "Data Science and Big Data Technology",
          description:
            "Technologies enabling autonomous or semi-autonomous analysis of large and complex data sets for insights and predictions.",
          keywords: [
            "data science",
            "big data",
            "data analytics",
            "data warehouse",
            "data mining",
            "data correlation",
            "predictive analytics",
          ],
        },
        {
          id: "digital-twin",
          name: "Digital Twin Technology",
          description:
            "Virtual representations of physical objects or systems combining real-time sensor data, big data and AI to predict behaviour.",
          keywords: [
            "digital twin",
            "virtual representation",
            "simulation model",
            "metaverse",
            "digital replica",
          ],
        },
        {
          id: "machine-learning",
          name: "Machine Learning (ML)",
          description:
            "AI branch where programs are trained using algorithms and data to improve decisions without explicit programming.",
          keywords: [
            "machine learning",
            "deep learning",
            "neural network",
            "evolutionary computation",
            "ML model",
            "training algorithm",
          ],
        },
        {
          id: "natural-language-processing",
          name: "Natural Language Processing",
          description:
            "AI enabling computers to process and interpret human language through speech recognition and text analysis.",
          keywords: [
            "natural language processing",
            "NLP",
            "speech recognition",
            "text classification",
            "sentiment analysis",
            "machine translation",
            "chatbot",
            "virtual assistant",
            "large language model",
            "LLM",
          ],
        },
      ],
    },
    {
      id: "human-machine-integration",
      name: "Human-Machine Integration",
      description:
        "Technologies pairing human operators with technology to enhance or optimize human capability, with varying degrees of invasiveness.",
      subcategories: [
        {
          id: "brain-computer-interfaces",
          name: "Brain-Computer Interfaces",
          description:
            "Interfaces allowing direct human-computer interaction via brain activity sensing for research, mapping or augmentation.",
          keywords: [
            "brain-computer interface",
            "BCI",
            "brain activity",
            "neural interface",
            "brain mapping",
            "cognitive augmentation",
          ],
        },
        {
          id: "exoskeletons",
          name: "Exoskeletons",
          description:
            "External wearable robotic devices that assist or augment physical and physiological performance of individuals.",
          keywords: [
            "exoskeleton",
            "wearable robot",
            "powered suit",
            "physical augmentation",
            "assistive exoskeleton",
          ],
        },
        {
          id: "neuroprosthetic-cybernetic",
          name: "Neuroprosthetic/Cybernetic Devices",
          description:
            "Implanted and worn devices interacting with the nervous system to enhance or restore motor, sensory and cognitive functions.",
          keywords: [
            "neuroprosthetic",
            "cybernetic",
            "prosthetic limb",
            "neural implant",
            "sensory restoration",
            "motor restoration",
          ],
        },
        {
          id: "virtual-augmented-mixed-reality",
          name: "Virtual/Augmented/Mixed Reality",
          description:
            "Immersive technologies combining virtual and real world elements for interactive experiences including metaverse applications.",
          keywords: [
            "virtual reality",
            "VR",
            "augmented reality",
            "AR",
            "mixed reality",
            "MR",
            "metaverse",
            "XR",
            "immersive technology",
          ],
        },
        {
          id: "wearable-neurotechnology",
          name: "Wearable Neurotechnology",
          description:
            "Non-invasive wearable brain-computer interfaces for medical tracking and non-medical human optimization applications.",
          keywords: [
            "wearable neurotech",
            "wearable brain device",
            "brain health tracking",
            "cognitive monitoring",
            "EEG wearable",
            "neurotechnology",
          ],
        },
      ],
    },
    {
      id: "life-science",
      name: "Life Science Technology",
      description:
        "Technologies enhancing living organisms, encompassing biotechnology and medical and healthcare technologies.",
      subcategories: [
        {
          id: "biomanufacturing",
          name: "Biomanufacturing",
          description:
            "Methods enabling industrial production of biological products through modification of biological organisms or systems.",
          keywords: [
            "biomanufacturing",
            "biomaterial",
            "biosensor",
            "biological production",
            "bioprocessing",
          ],
        },
        {
          id: "genomic-sequencing-genetic-engineering",
          name: "Genomic Sequencing and Genetic Engineering",
          description:
            "Technologies enabling whole genome sequencing and direct manipulation of genomes using DNA or genetic engineering.",
          keywords: [
            "genomic sequencing",
            "CRISPR",
            "genetic engineering",
            "next generation sequencing",
            "NGS",
            "genome editing",
            "gene editing",
          ],
        },
        {
          id: "proteomics",
          name: "Proteomics",
          description:
            "Large-scale experimental analysis of proteins, proteomes and proteome informatics for identification and characterization.",
          keywords: [
            "proteomics",
            "proteome",
            "protein analysis",
            "mass spectrometry",
            "protein identification",
          ],
        },
        {
          id: "synthetic-biology",
          name: "Synthetic Biology",
          description:
            "Combination of biology and engineering to create new biological entities or redesign existing systems with new functions.",
          keywords: [
            "synthetic biology",
            "synthetic cell",
            "biocomputer",
            "biofuel",
            "synthetic life",
            "synthetic food",
            "engineered organism",
          ],
        },
        {
          id: "cbrn-countermeasures",
          name: "Chemical, Biological, Radiological and Nuclear (CBRN) Medical Countermeasures",
          description:
            "Medical assets to prevent, identify or treat injuries caused by CBRN threats, whether naturally occurring or engineered.",
          keywords: [
            "CBRN",
            "chemical countermeasure",
            "biological countermeasure",
            "radiological countermeasure",
            "nuclear countermeasure",
            "medical countermeasure",
          ],
        },
        {
          id: "gene-therapy",
          name: "Gene Therapy",
          description:
            "Use of gene manipulation or modification in humans to prevent, treat or cure disease through gene replacement or insertion.",
          keywords: [
            "gene therapy",
            "gene manipulation",
            "gene modification",
            "gene replacement",
            "gene insertion",
          ],
        },
        {
          id: "nanomedicine",
          name: "Nanomedicine",
          description:
            "Use of nanomaterials to diagnose, monitor, prevent and treat disease, including targeted drug delivery and smart imaging.",
          keywords: [
            "nanomedicine",
            "nanoparticle drug delivery",
            "targeted drug delivery",
            "nano-engineered implant",
            "smart imaging",
          ],
        },
        {
          id: "tissue-engineering-regenerative-medicine",
          name: "Tissue Engineering and Regenerative Medicine",
          description:
            "Methods of regenerating or rebuilding cells, tissues or organs to restore normal biological functions.",
          keywords: [
            "tissue engineering",
            "regenerative medicine",
            "stem cell",
            "organ regeneration",
            "tissue regeneration",
            "self-healing",
          ],
        },
      ],
    },
    {
      id: "quantum-science",
      name: "Quantum Science and Technology",
      description:
        "New generation devices using quantum effects to significantly enhance performance in sensing, communications, computing and materials.",
      subcategories: [
        {
          id: "quantum-communications",
          name: "Quantum Communications",
          description:
            "Use of quantum physics for secure communications and data protection using quantum cryptography and key distribution.",
          keywords: [
            "quantum communications",
            "quantum cryptography",
            "quantum key distribution",
            "QKD",
            "quantum network",
          ],
        },
        {
          id: "quantum-computing",
          name: "Quantum Computing",
          description:
            "Use of quantum bits (qubits) to process information by exploiting quantum mechanical effects for vastly accelerated computation.",
          keywords: [
            "quantum computing",
            "qubit",
            "quantum processor",
            "quantum computer",
            "quantum algorithm",
            "quantum supremacy",
          ],
        },
        {
          id: "quantum-materials",
          name: "Quantum Materials",
          description:
            "Materials with unusual magnetic and electrical properties such as superconductors, graphene and topological insulators.",
          keywords: [
            "quantum material",
            "topological insulator",
            "Weyl semimetal",
            "quantum dot",
            "quantum wire",
          ],
        },
        {
          id: "quantum-sensing",
          name: "Quantum Sensing",
          description:
            "Devices using quantum systems or phenomena to measure physical quantities with increased precision and accuracy.",
          keywords: [
            "quantum sensing",
            "quantum sensor",
            "quantum radar",
            "quantum metrology",
            "quantum measurement",
          ],
        },
        {
          id: "quantum-software",
          name: "Quantum Software",
          description:
            "Software and algorithms running on or enabling the efficient operation, design and optimization of quantum computers.",
          keywords: [
            "quantum software",
            "quantum algorithm",
            "quantum programming",
            "quantum optimization",
            "quantum simulation",
          ],
        },
      ],
    },
    {
      id: "robotics-autonomous-systems",
      name: "Robotics and Autonomous Systems",
      description:
        "Machines or systems with varying degrees of autonomy that carry out activities with little to no human control by gathering environmental insights.",
      subcategories: [
        {
          id: "molecular-nano-robotics",
          name: "Molecular (or Nano) Robotics",
          description:
            "Development of robots at the molecular or nanoscale level by programming molecules to carry out particular tasks.",
          keywords: [
            "molecular robotics",
            "nano robotics",
            "nanobot",
            "molecular machine",
            "nanoscale robot",
          ],
        },
        {
          id: "uncrewed-vehicles",
          name: "(Semi-)Autonomous/Uncrewed Aerial/Ground/Marine Vehicles",
          description:
            "Vehicles functioning without onboard human intervention, controlled remotely or operating autonomously using AI and sensors.",
          keywords: [
            "UAV",
            "UGV",
            "UUV",
            "drone",
            "uncrewed vehicle",
            "autonomous vehicle",
            "unmanned vehicle",
            "remotely piloted",
          ],
        },
        {
          id: "service-robots",
          name: "Service Robots",
          description:
            "Semi or fully autonomous robots carrying out useful tasks for humans that may be tedious, dangerous or complement human behaviour.",
          keywords: [
            "service robot",
            "autonomous robot",
            "assistive robot",
            "eldercare robot",
            "humanoid robot",
          ],
        },
        {
          id: "space-robotics",
          name: "Space Robotics",
          description:
            "Devices performing various functions in orbit such as assembly, servicing and exploration to support or replace human explorers.",
          keywords: [
            "space robot",
            "orbital robot",
            "space servicing",
            "planetary exploration robot",
            "space assembly robot",
          ],
        },
      ],
    },
  ],
};
