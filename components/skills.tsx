import { FadeIn, LinesReveal, Parallax } from "@/components/motion";
import { Marquee } from "@/components/marquee";
import { skills } from "@/lib/resume";

const groups = [
  { label: "Frontend", items: skills.frontend, modifier: "skill-card__title--frontend" },
  { label: "Backend", items: skills.backend, modifier: "skill-card__title--backend" },
  { label: "Tools & Ops", items: skills.tools, modifier: "skill-card__title--tools" },
];

export function Skills() {
  return (
    <section id="skills" className="section-pad skills-section">
      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">03</span>
          <span className="eyebrow-row__center">Stack</span>
          <span className="eyebrow-row__right">MERN · Python · Cloud</span>
        </div>

        <div className="skills-head">
          <LinesReveal
            className="display-lines"
            lines={[
              <span key="a">A toolkit</span>,
              <span key="b">built to <em>scale</em>.</span>,
            ]}
          />
        </div>
      </div>



      {/* group grid */}
      <div className="skills-grid-wrap">
        <div className="skills-grid">
          {groups.map((group, gi) => (
            <FadeIn key={group.label} delay={gi * 0.12}>
              <div className="skill-card">
                <div className="skill-card__top">
                  <h3 className={`skill-card__title ${group.modifier}`}>{group.label}</h3>
                  <span className="skill-card__count">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>
                <Parallax from={12} to={-12} className="skill-card__pills">
                  <ul className="skill-card__pills">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="skill-card__pill"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </Parallax>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

            {/* counter-moving tech marquees */}
      <div className="skills-marquees">
        <Marquee
          speed={30}
          items={skills.frontend}
          className="skills-marquee--a"
        />
        <Marquee
          reverse
          speed={36}
          items={skills.backend}
          className="skills-marquee--b"
        />
        <Marquee
          speed={42}
          items={skills.tools}
          className="skills-marquee--c"
        />
      </div>
    </section>
  );
}
