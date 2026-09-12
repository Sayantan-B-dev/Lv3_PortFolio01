export const profile = {
  name: "Sayantan Bharati",
  firstName: "Sayantan",
  lastName: "Bharati",
  role: "Full Stack Developer",
  stack: "(MERN, Python)",
  email: "sayantanbharati611@gmail.com",
  location: "Kolkata, India",
  linkedin: "https://www.linkedin.com/in/sayantanbharati/",
  github: "https://github.com/Sayantan-B-dev",
  summary:
    "Full Stack Web Developer with experience in the MERN stack and building responsive, user-friendly web applications. Focused on writing clean, maintainable code, creating efficient workflows, and developing practical solutions that make a real difference.",
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
      "Markdown + math notes with synchronized scroll, category/tag system, file uploads",
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
      "Mongoose",
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
      "Groq AI",
    ],
    features: [
      "Zero-dependency Canvas particle physics engine (5–300 particles, 60fps, mouse interaction)",
      "Recursive nested comments (10-level depth), hot-feed ranking, leaderboard, follow/block system",
      "OG/JSON-LD/oEmbed parsing, Groq AI tag suggestions, concurrent bulk upload, admin analytics",
      "JWT + Google OAuth, CSRF state, rate limiting, 100% parameterized SQL",
    ],
  },
];

export const education = [
  {
    degree: "Diploma in Computer Science & Technology",
    school: "Kingston Educational Institute",
    period: "2024 – 2026",
    detail: "OGPA 9.2: DSA, Python, Java, OS, DBMS, CN, AI/ML, IoT",
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
    role: "Freelance Music Producer & Sound Engineer",
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
    name: "Job Ready AI Powered Cohort: Web + DSA + Aptitude",
    url: "https://classroom.sheryians.com/certificate/1708853705220236",
    image: "/certifficates/Job Ready AI Powered Cohort Web  DSA  Aptitude.webp",
  },
  {
    name: "The Web Developer Bootcamp 2026",
    url: "https://www.udemy.com/certificate/UC-522fc92e-484b-408d-acc9-514fd997ba5c/",
    image: "/certifficates/The Web Developer Bootcamp 2026.webp",
  },
  {
    name: "The Complete Python Bootcamp: From Zero to Hero",
    url: "https://www.udemy.com/certificate/UC-c778160d-4e6e-4e6e-a664-f93c1f60d93e/",
    image: "/certifficates/The Complete Python Bootcamp From Zero to Hero in Python.webp",
  },
  {
    name: "The Complete Full-Stack Web Development Bootcamp",
    url: "https://www.udemy.com/certificate/UC-b18c98f0-980b-464b-ad26-f2606cd64bc9/",
    image: "/certifficates/The Complete Full-Stack Web Development Bootcamp.webp",
  },
  {
    name: "Master the Coding Interview: Data Structures + Algorithms",
    url: "https://www.udemy.com/certificate/UC-bfeb62ba-d794-4786-98b4-7eb78180aed8/",
    image: "/certifficates/Master the Coding Interview Data Structures Algorithms.webp",
  },
  {
    name: "JavaScript: Understanding the Weird Parts",
    url: "https://www.udemy.com/certificate/UC-4468e243-69e2-4161-a741-a271ac42bd57/",
    image: "/certifficates/JavaScript Understanding the Weird Parts.webp",
  },
  {
    name: "Complete Python with DSA: LeetCode Exercises",
    url: "https://www.udemy.com/certificate/UC-c2390189-1881-417a-a608-fea04cebf0a8/",
    image: "/certifficates/Complete Python With DSA Bootcamp LEETCODE Exercises.webp",
  },
  {
    name: "100 Days of Code: The Complete Python Pro Bootcamp",
    url: "https://www.udemy.com/certificate/UC-d913382c-396c-487e-ab2e-20d6807e1f00/",
    image: "/certifficates/100 Days of Code The Complete Python Pro Bootcamp.webp",
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
    "Resend",
    "Postman",
    "PHP",
    "MySQL",
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
