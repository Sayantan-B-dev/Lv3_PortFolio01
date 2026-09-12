import { ArrowUpRight } from "lucide-react";

import { GithubIcon } from "@/components/icons";
import { FadeIn, LinesReveal, Parallax } from "@/components/motion";
import { Marquee } from "@/components/marquee";
import { projects } from "@/lib/resume";

export function Projects() {
  return (
    <section id="work" className="section-pad">
      {/* ghost vertical words */}
      <Parallax from={80} to={-80} className="projects-ghost">
        <p>
          Selected Work
        </p>
      </Parallax>

      <div className="container-x">
        <div className="eyebrow-row">
          <span className="eyebrow-row__num">02</span>
          <span className="eyebrow-row__center">Selected Work</span>
          <span className="eyebrow-row__right">2024–2026</span>
        </div>

        <div className="projects-head">
          <LinesReveal
            className="display-lines"
            lines={[
              <span key="a">Projects that</span>,
              <span key="b">
                shipped, <em>not</em> stacked.
              </span>,
            ]}
          />
        </div>

        {/* Editorial list */}
        <div className="projects-list">
          {projects.map((project, i) => (
            <FadeIn key={project.name} delay={0.05} y={30}>
              <ProjectRow project={project} index={i} />
            </FadeIn>
          ))}
        </div>
      </div>

      {/* divider marquee */}
      <div className="projects-divider">
        <Marquee
          speed={38}
          items={["Re-Docs", "BlueEye", "LnkZoo", "MERN", "Next.js 16", "WebGL"]}
          className="projects-divider__marquee"
        />
      </div>
    </section>
  );
}

function ProjectRow({ project, index }: { project: (typeof projects)[number]; index: number }) {
  return (
    <div className="project-row group">
      <div className="project-row__glow" />
      <div className="project-row__main">
        {/* Left: index + big title */}
        <div className="project-row__left">
          <span className="project-row__index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <a
            href={project.live}
            target="_blank"
            rel="noreferrer"
            className="project-row__title"
          >
            {project.name}
          </a>
        </div>

        {/* Right: meta */}
        <div className="project-row__meta">
          <p className="project-row__tagline">
            {project.tagline}
          </p>

          <ul className="project-row__tech">
            {project.tech.slice(0, 6).map((tech) => (
              <li key={tech}>
                {tech}
              </li>
            ))}
          </ul>

          <div className="project-row__links">
            <a
              href={project.live}
              target="_blank"
              rel="noreferrer"
              className="project-row__link"
            >
              Live site
              <ArrowUpRight className="icon-4" aria-hidden="true" />
            </a>
            <a
              href={project.github}
              target="_blank"
              rel="noreferrer"
              className="project-row__link"
            >
              <GithubIcon className="icon-4" />
              Source
            </a>
          </div>
        </div>
      </div>

      {/* features revealed on hover (desktop) */}
      <div className="project-row__features">
        {project.features.map((feature) => (
          <p key={feature}>
            · {feature}
          </p>
        ))}
      </div>
    </div>
  );
}
