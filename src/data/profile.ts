export type Favorite = { kind: string; title: string; by: string; year: string; url: string; album?: string; youtube?: string }

export type Track = { title: string; artist: string; album: string; year: string; youtube: string; group?: string; note?: string }

// Every id is an official upload (artist channel or YouTube's label-supplied "Topic" channel) that allows embedding.
export const playlist: Track[] = [
  { title: 'Young Lust', artist: 'Pink Floyd', album: 'The Wall', year: '1979', youtube: 'GRsLPoNNV64', group: 'Rock' },
  { title: 'Comfortably Numb', artist: 'Pink Floyd', album: 'The Wall', year: '1979', youtube: '7f3EGjRxxNI', group: 'Rock' },
  { title: 'Have a Cigar', artist: 'Pink Floyd', album: 'Wish You Were Here', year: '1975', youtube: 'Eq8ZiZ9xiLw', group: 'Rock' },
  { title: 'Epitaph', artist: 'King Crimson', album: 'In the Court of the Crimson King', year: '1969', youtube: 'vXrpFxHfppI', group: 'Rock' },
  { title: 'Sweet Leaf', artist: 'Black Sabbath', album: 'Master of Reality', year: '1971', youtube: 'aXpKtZbHhQI', group: 'Rock' },
  { title: 'Planet Caravan', artist: 'Pantera', album: 'Far Beyond Driven', year: '1994', youtube: '5bcH-gZJlzQ', group: 'Rock' },
  { title: 'The Passenger', artist: 'Iggy Pop', album: 'Lust for Life', year: '1977', youtube: '-fWw7FE9tTo', group: 'Rock' },
  { title: 'Tarkus', artist: 'Emerson, Lake & Palmer', album: 'Tarkus', year: '1971', youtube: 'QQ1Zo6faTQY', group: 'Rock', note: 'The full 20-minute suite' },
  { title: 'C.R.E.A.M.', artist: 'Wu-Tang Clan', album: 'Enter the Wu-Tang (36 Chambers)', year: '1993', youtube: '4yNQ7_7I5aE', group: 'Hip hop' },
  { title: "Jazz (We've Got)", artist: 'A Tribe Called Quest', album: 'The Low End Theory', year: '1991', youtube: 'cxN4nKk2cfk', group: 'Hip hop' },
  { title: 'Electric Relaxation', artist: 'A Tribe Called Quest', album: 'Midnight Marauders', year: '1993', youtube: 'HbPf6G1DJlY', group: 'Hip hop' },
  { title: 'Nas Is Like', artist: 'Nas', album: 'I Am...', year: '1999', youtube: 'VC4ORS5n9Hg', group: 'Hip hop' },
  { title: 'Ms. Jackson', artist: 'Outkast', album: 'Stankonia', year: '2000', youtube: 'MYxAiK6VnXw', group: 'Hip hop' },
  { title: 'Doomsday', artist: 'MF DOOM', album: 'Operation: Doomsday', year: '1999', youtube: 'LMeluRz2wv4', group: 'Hip hop' },
  { title: 'Fancy Clown', artist: 'Madvillain', album: 'Madvillainy', year: '2004', youtube: 'yEYCCiXLPTw', group: 'Hip hop' },
  { title: 'Meat Grinder', artist: 'Madvillain', album: 'Madvillainy', year: '2004', youtube: 'FoasIcgem0w', group: 'Hip hop' },
  { title: 'Distant Land', artist: 'Madlib', album: 'Shades of Blue', year: '2003', youtube: 'y-W-Gbo0uMY', group: 'Hip hop' },
  { title: 'Mass Appeal', artist: 'Gang Starr', album: 'Hard to Earn', year: '1994', youtube: 'y9lNbNGbo24', group: 'Hip hop' },
  { title: 'Fall N Love', artist: 'Slum Village', album: 'Fantastic, Vol. 2', year: '2000', youtube: 'm_2G-wOjeDY', group: 'Hip hop', note: 'Produced by J Dilla' },
  { title: 'Climax', artist: 'Slum Village', album: 'Fantastic, Vol. 2', year: '2000', youtube: 'tdukDdtjL5E', group: 'Hip hop', note: 'Produced by J Dilla' },
  { title: 'Spill the Wine', artist: 'Eric Burdon & War', album: 'Eric Burdon Declares "War"', year: '1970', youtube: 'MYCRIykylOc', group: 'Soul & funk' },
  { title: 'The World Is a Ghetto', artist: 'War', album: 'The World Is a Ghetto', year: '1972', youtube: 'pCvH7Uf-7kw', group: 'Soul & funk' },
  { title: 'Dolphin Dance', artist: 'Ahmad Jamal', album: 'The Awakening', year: '1970', youtube: 'dxnTYFE0x1I', group: 'Jazz' },
  { title: 'I Love Music', artist: 'Ahmad Jamal', album: 'The Awakening', year: '1970', youtube: 'fW8NQgqYoVQ', group: 'Jazz' },
  { title: 'Swahililand', artist: 'Ahmad Jamal', album: 'Jamal Plays Jamal', year: '1974', youtube: 'iYwrhM304Ak', group: 'Jazz' },
  { title: 'Scenery', artist: 'Ryo Fukui', album: 'Scenery', year: '1976', youtube: 'sr4vIBaumiM', group: '70s Japanese jazz' },
  { title: 'It Could Happen to You', artist: 'Ryo Fukui', album: 'Scenery', year: '1976', youtube: '-yX4S7exMtU', group: '70s Japanese jazz' },
  { title: 'Aqua Marine', artist: 'Isao Suzuki Trio', album: 'Blow Up', year: '1973', youtube: 'd8MMn7EPsp4', group: '70s Japanese jazz' },
  { title: 'Cat', artist: 'Hiroshi Suzuki', album: 'Cat', year: '1975', youtube: 'ZeHFoBnhYPk', group: '70s Japanese jazz' },
  { title: 'Hip Seagull', artist: 'Terumasa Hino', album: 'May Dance', year: '1977', youtube: 'JKCDDE0E5bk', group: '70s Japanese jazz' },
  { title: 'Brasilian Skies', artist: 'Masayoshi Takanaka', album: 'Brasilian Skies', year: '1978', youtube: 'Ra4L_3EPHMc', group: '70s Japanese jazz' },
]

export const profile = {
  name: 'Mohammed Nehad',
  handle: 'orgalorg7',
  role: 'AI & Machine Learning Engineer',
  headline: 'AI & Machine Learning Engineer · LLM Applications · Backend Software Engineer',
  cv: '/cv/Mohammad-Nehad-Moghrabi-CV.pdf',
  // From the CV (public/cv). Keep the two in sync.
  education: { school: 'Modern University for Technology and Information (MTI)', degree: 'BSc in Computer Science and Artificial Intelligence', when: 'Oct 2022 – Jun 2026', where: 'Cairo, Egypt', coursework: 'Machine Learning, Deep Learning, Computer Vision, Data Structures & Algorithms, Database Systems, Linear Algebra for Machine Learning' },
  experience: [
    {
      org: 'International Center for Agricultural Research in the Dry Areas (ICARDA)', title: 'Machine Learning Engineer Intern', when: 'Aug 2025 – Sep 2025',
      points: [
        'Built an end-to-end rainfall prediction pipeline using Random Forest regression in Google Earth Engine, improving R² by about 15% over baseline regressors.',
        'Developed, trained and evaluated XGBoost and TensorFlow deep neural network models for geospatial prediction with k-fold cross-validation and hyperparameter optimisation.',
        'Applied SHAP to quantify feature importance and produce model interpretability reports.',
        'Processed multispectral satellite imagery with NDVI, EVI, NDWI and LST indices for vegetation, water and land-temperature analysis.',
      ],
    },
  ],
  certifications: [
    'IBM Data Science Professional Certificate (IBM / Coursera)',
    'Data Scientist Professional Certificate (DataCamp)',
    'Linear Algebra for Machine Learning and Data Science (DeepLearning.AI / Coursera)',
    'GIS, Mapping, and Spatial Analysis Specialization (University of Toronto / Coursera)',
    'Cisco Certified Network Associate (CCNA)',
    'CompTIA Network+',
  ],
  spoken: 'Arabic (native) · English (fluent, professional)',
  cvSkills: {
    'AI & ML': 'Python, PyTorch, TensorFlow, scikit-learn, XGBoost, NumPy, Pandas, SHAP, model evaluation, k-fold CV, hyperparameter optimisation; geospatial ML with Google Earth Engine, GIS and satellite imagery',
    'LLMs & NLP': 'RAG, LLM agents, LangChain, Hugging Face Transformers/Diffusers, Qwen, FAISS, embeddings, BM25, reranking, guardrails, LoRA fine-tuning',
    'Backend': 'System design, clean architecture, FastAPI, NestJS, Fastify, Gin, Node.js, REST, OpenAPI, WebSockets, JWT/OTP, RBAC, BullMQ, Celery',
    'Data': 'SQL, PostgreSQL/PostGIS, SQLite, Redis, Prisma, S3-compatible storage, ETL, migrations',
    'Languages': 'Python, TypeScript, JavaScript, Go, Rust, C, x86-64 Assembly (NASM), SQL; React, Next.js, Vite, MapLibre GL',
    'DevOps & testing': 'AWS (EC2, S3), Docker, GitHub Actions, CI/CD, Linux, Vitest, Jest, Playwright, end-to-end testing',
    'Systems & security': 'TCP/IP, HTTP/1.1, BSD sockets, multithreading, SIMD (AVX2/FMA), static analysis, tree-sitter, graph algorithms, penetration testing, SSRF defences',
  } as Record<string, string>,
  location: 'Cairo, Egypt',
  timeZone: 'Africa/Cairo',
  statement: 'I design dependable backends, thoughtful interfaces, and geospatial systems.',
  // Shown on the homepage, résumé, About Me.txt, BIOS, DOS prompt and taskbar.
  openToWork: true,
  availability: 'Open to work: available for new roles and projects.',
  // Contact Me sends through `contactForm` (a Formspree-style endpoint that keeps your address private)
  // if set, otherwise opens a mailto: to `email`, otherwise copies the message and opens LinkedIn.
  email: 'nihadmog@hotmail.com',
  contactForm: '',
  github: 'https://github.com/orgalorg7',
  linkedin: 'https://www.linkedin.com/in/mohammed-nehad-moghrabi-9ba988248',
  team: { name: 'HammerLoad', url: 'https://hammerload.com', role: 'AI / Software Engineer' },
  stack: {
    Languages: ['TypeScript', 'Python', 'Go', 'Rust', 'C', 'x86-64 Assembly'],
    Backend: ['Node.js', 'NestJS', 'Fastify', 'Django', 'FastAPI', 'Redis', 'BullMQ'],
    Data: ['PostgreSQL', 'PostGIS', 'SQLite', 'Prisma', 'FAISS'],
    Frontend: ['React', 'Next.js', 'Vite', 'Tailwind', 'three.js', 'MapLibre'],
    AI: ['RAG', 'Qwen', 'Transformers', 'YOLO', 'Ollama'],
    Infra: ['Docker', 'NGINX', 'Caddy', 'AWS / S3', 'Cloudflare', 'GitHub Actions'],
  } as Record<string, string[]>,
  currently: [
    ['Building', 'Geospatial data workflows'],
    ['Refining', 'Domain boundaries & Go API contracts'],
    ['Focus', 'Maps, data & product interfaces'],
  ],
  favorites: [
    { kind: 'Album', title: 'The Wall', by: 'Pink Floyd', year: '1979', url: 'https://www.pinkfloyd.com/albums/the-wall/' },
    // `youtube` = an official upload that allows embedding; it plays inside the site's Media Player.
    { kind: 'Song', title: 'Epitaph', by: 'King Crimson', year: '1969', album: 'In the Court of the Crimson King', youtube: 'vXrpFxHfppI', url: 'https://en.wikipedia.org/wiki/Epitaph_(song)' },
    { kind: 'Film', title: 'Downfall', by: 'Oliver Hirschbiegel', year: '2004', url: 'https://en.wikipedia.org/wiki/Downfall_(2004_film)' },
  ] as Favorite[],
}

export const aboutTxt = `ABOUT.TXT
=========

Hi, I'm ${profile.name} (@${profile.handle}).
(Photo of me in 2005: C:\\My Documents\\My Pictures\\little_me_2005.jpg)
${profile.role} based in ${profile.location}.
${profile.openToWork ? `\n>>> STATUS: ${profile.availability.toUpperCase()} <<<\n` : ''}
${profile.statement}

I like the parts of software that have to be right: money that adds up
to the piastre, schedulers that never double-post, authorisation checked
before every single request, language models that refuse to invent law.
Then I like making the interface on top of all that feel effortless.

Some things I've built:
  * xray       - Google Maps for codebases (10 languages, PageRank search)
  * PotatoLM   - a language model trained and run in x86-64 assembly
  * ASTRA      - a falling-block game in pure asm, with a time-travel AI
  * ARGUS      - authorised-only security assessment platform
  * BioReza    - cosmetics commerce platform, live in Egypt

Currently
---------
${profile.currently.map(([k, v]) => `  ${k.padEnd(9)} ${v}`).join('\n')}

Stack
-----
${Object.entries(profile.stack).map(([k, v]) => `  ${k.padEnd(10)} ${v.join(', ')}`).join('\n')}

Team
----
  I'm the ${profile.team.role} at ${profile.team.name}, a small software
  studio in Cairo (${profile.team.url}).

Elsewhere
---------
  Email     ${profile.email}
  GitHub    ${profile.github}
  LinkedIn  ${profile.linkedin}

Favourites: The Wall (Pink Floyd), Epitaph (King Crimson), Downfall.

Tip: open "My Computer" > (C:) > Projects, or type HELP in the MS-DOS
Prompt. There may be a few things hidden in the Recycle Bin...
`
