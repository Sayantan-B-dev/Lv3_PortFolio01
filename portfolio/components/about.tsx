import { FadeIn, Parallax, WordReveal } from "@/components/motion";
import { languages } from "@/lib/resume";

const stats = [
  { value: "3", label: "Production builds" },
  { value: "40+", label: "API routes designed" },
  { value: "900+", label: "Projects managed" },
  { value: "9.2", label: "Diploma OGPA" },
];

const focus = [
  "Scalable REST APIs & clean architecture",
  "Secure session & token auth flows",
  "Responsive, user-focused product UIs",
  "WebGL / Canvas interactive effects",
];

export function About() {
  return (
    <section id="about" className="section-pad">
      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">01</span>
          <span className="eyebrow-row__center">About / Statement</span>
          <span className="eyebrow-row__right">Kolkata, India</span>
        </div>

        <div className="about-grid">
          {/* Left: giant statement */}
          <div className="about-statement">
            <h2 className="about-statement__title">
              <WordReveal
                text="Full stack developer who ships real products, not just scaffolds."
              />
            </h2>

            <Parallax from={30} to={-30} className="about-statement__lede">
              <p>
                I build full-stack MERN applications end-to-end: data models,
                secure authentication, REST APIs, Redis caching, and the
                pixel-level frontends people actually enjoy using. Clean
                architecture first, practical solutions always.
              </p>
            </Parallax>

            <div className="about-focus">
              {focus.map((point, i) => (
                <FadeIn key={point} delay={i * 0.08}>
                  <div className="about-focus__card">
                    <span className="about-focus__dot" />
                    <p className="about-focus__text">
                      {point}
                    </p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right: languages + portrait-ish block */}
          <div className="about-side">
            <Parallax from={-30} to={30}>
              <div className="about-lang">
                <p className="about-lang__label">
                  Languages
                </p>
                <ul className="about-lang__list">
                  {languages.map((lang) => (
                    <li
                      key={lang.name}
                      className="about-lang__row"
                    >
                      <span className="about-lang__name">{lang.name}</span>
                      <span className="about-lang__level">
                        {lang.level}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Parallax>

            <Parallax from={40} to={-40}>
              <p className="about-quote">
                “Outside code: music producer & sound engineer with 900+ client
                projects, and counting. Parallelism is a way of life.”
              </p>
            </Parallax>
          </div>
        </div>

        {/* Stats */}
        <div className="about-stats">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1} className="about-stat">
              <div className="about-stat__inner">
                <p className="about-stat__value">
                  {stat.value}
                </p>
                <p className="about-stat__label">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
