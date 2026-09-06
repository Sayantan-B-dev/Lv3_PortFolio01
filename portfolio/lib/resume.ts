export const profile = {
  name: "Sayantan Bharati",
  firstName: "Sayantan",
  lastName: "Bharati",
  role: "Full Stack Developer",
  stack: "(MERN, Python)",
  email: "sayantanbharati611@gmail.com",
  phone: "+91 8617563200",
  location: "Kolkata, India",
  linkedin: "https://linkedin.com/in/sayantan-bharati-6b1b77205/",
  github: "https://github.com/Sayantan-B-dev",
  summary:
    "Full Stack Web Developer with hands-on experience building production-ready MERN stack applications. Skilled in designing scalable REST APIs, implementing secure authentication flows, and delivering responsive, user-focused UIs. Focused on clean architecture, maintainable code, and practical solutions.",
};

export const projects = [
  {
    name: "Re-Docs",
    tagline: "Full-Stack Knowledge & Note Management Platform",
    github: "https://github.com/Sayantan-B-dev/Lv3_Re-Docs",
    live: "https://re-docs-pi.vercel.app/",
    tech: [
      "MongoDB",
      "Express.js",
      "React (Vite)",
      "Node.js",
      "Tailwind CSS",
      "Cloudinary",
      "Razorpay",
      "Passport.js",
      "mermaid.js",
      "KaTeX",
    ],
    features: [
      "Session-based auth (Passport local + Google OAuth) with profile & social features",
      "Markdown-supported notes with synchronized scroll, category/tag system, file uploads",
      "Public/private notes, exports, and a modern responsive UI",
    ],
  },
  {
    name: "BlueEye",
    tagline: "Artist Discovery & Booking Platform",
    github: "https://github.com/Sayantan-B-dev/lv3_BlueEye",
    live: "https://blueeyeentertainment.in/",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "MongoDB",
      "Redis",
      "NextAuth",
      "Tailwind CSS 4",
      "ImageKit",
      "WebGL / OGL",
    ],
    features: [
      "Custom WebGL/OGL visual effects and interactive backgrounds",
      "SEO: JSON-LD structured data, dynamic OG images, ISR caching, automated sitemaps",
      "Admin suite with full CRUD, bulk CSV import & OTP-verified bulk delete via Resend",
      "Multi-step booking with 30-min cooldown, Redis caching, direct WhatsApp contact",
    ],
  },
  {
    name: "LnkZoo",
    tagline: "Community Link Discovery Platform",
    github: "https://github.com/Sayantan-B-dev/Lv3_LnkZoo",
    live: "https://lnkzoo.vercel.app/",
    tech: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "PostgreSQL (Neon)",
      "D3.js",
      "JWT",
      "Cloudinary",
      "OpenRouter",
    ],
    features: [
      "Zero-dependency Canvas particle physics engine (5–300 particles, 60fps, mouse interaction)",
      "Recursive nested comments (10-level depth), hot-feed ranking, follow/block system",
      "OG/JSON-LD/oEmbed parsing, suggestive text generation via OpenRouter API",
      "JWT + Google OAuth, CSRF state, rate limiting, 100% parameterized SQL",
    ],
  },
];

export const education = [
  {
    degree: "Diploma in Computer Science & Technology",
    school: "Kingston Educational Institute",
    period: "2024 – 2026",
    detail: "OGPA: 9.2",
    status: "Completed",
  },
  {
    degree: "B.Tech in Computer Science and Engineering",
    school: "Brainware University",
    period: "2025 – 2029",
    detail: "",
    status: "Ongoing",
  },
];

export const experience = [
  {
    role: "Music Producer & Sound Engineer — Freelancer",
    company: "Remote",
    period: "2021 – 2025",
    points: [
      "Managed 900+ end-to-end client projects end to end.",
      "Project management, workflow optimization, and quality control under high-volume deadlines.",
      "Parallel task handling and deep requirement understanding with clients.",
    ],
  },
  {
    role: "Crew Member",
    company: "McDonald's · Kolkata, India",
    period: "2020 – 2021",
    points: [
      "Teamwork, client interaction, time management, and high-volume task handling.",
      "Clear communication in a fast-paced service environment.",
    ],
  },
];

export const certifications = [
  {
    name: "The Web Developer Bootcamp 2025",
    url: "http://ude.my/UC-522fc92e-484b-408d-acc9-514fd997ba5c",
  },
  {
    name: "The Complete Full-Stack Web Development Bootcamp",
    url: "http://ude.my/UC-b18c98f0-980b-464b-ad26-f2606cd64bc9",
  },
  {
    name: "Job Ready AI Powered Cohort: Web + DSA + Aptitude",
    url: "https://classroom.sheryians.com/certificate/1708853705220236",
  },
];

export const languages = [
  { name: "Bengali", level: "Native" },
  { name: "English", level: "Advanced" },
  { name: "Hindi", level: "Intermediate" },
];

export const skills = {
  frontend: [
    "HTML",
    "CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Tailwind CSS",
    "Vite",
    "D3.js",
    "WebGL / Canvas",
    "Framer Motion",
  ],
  backend: [
    "Node.js",
    "Express.js",
    "MongoDB",
    "PostgreSQL",
    "REST APIs",
    "Redis",
    "Passport.js",
    "JWT",
    "NextAuth",
    "Google OAuth",
  ],
  tools: [
    "Git",
    "GitHub",
    "Vercel",
    "ImageKit",
    "Render",
    "MongoDB Atlas",
    "Razorpay",
    "Nodemailer",
    "Python",
  ],
};

export const navLinks = [
  { label: "About", href: "#about" },
  { label: "Work", href: "#work" },
  { label: "Stack", href: "#skills" },
  { label: "Path", href: "#experience" },
  { label: "Contact", href: "#contact" },
];
