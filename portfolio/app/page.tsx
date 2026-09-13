import { About } from "@/components/about";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { CurvySeparator } from "@/components/curvy-separator";

export default function Home() {
  return (
    <>
      <main className="page-main">
        <div className="hero-shell">
          <Hero />
        </div>

        {/* tech ticker between hero and about */}
        <div className="ticker-band">
          <Marquee
            speed={26}
            items={[
              "React",
              "Next.js",
              "Node.js",
              "TypeScript",
              "MongoDB",
              "PostgreSQL",
              "Redis",
              "Tailwind CSS",
              "Three.js / WebGL",
              "Python",
            ]}
            className="ticker-mono"
          />
        </div>

        <About />
        <CurvySeparator seed={1} />
        <Projects />
        <CurvySeparator seed={2} />
        <Skills />
        <CurvySeparator seed={3} />
        <Experience />
        <CurvySeparator seed={4} />
        <Contact />
      </main>
    </>
  );
}
