import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/smooth-scroll";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
import { RouteLoader } from "@/components/route-loader";
import { GlowCursor } from "@/components/glow-cursor";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sayantan Bharati, Full Stack Developer",
  description:
    "Portfolio of Sayantan Bharati, a Full Stack Developer (MERN, Python) building production-ready web applications from Kolkata, India.",
  authors: [{ name: "Sayantan Bharati" }],
  keywords: [
    "Sayantan Bharati",
    "Full Stack Developer",
    "MERN",
    "React",
    "Next.js",
    "Node.js",
    "TypeScript",
    "Web Developer",
  ],
  openGraph: {
  title: "Sayantan Bharati, Full Stack Developer",
    description:
      "Full Stack Developer (MERN, Python) building production-ready web applications.",
    type: "website",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        {/* <GlowCursor
          color="#c4b5fd"
          secondaryColor="#8b5cf6"
          trailLength={10}
          trailWidth={6}
          trailTaper={0.6}
          followSpeed={0.85}
          glowIntensity={1.4}
          glowSpread={0.9}
          hotspot={0.6}
          brightness={1.2}
          opacity={1}
          pulseSpeed={1.4}
          noiseStrength={0.03}
          idleFade={true}
          idleTimeout={400}
          fadeDuration={450}
          blendMode="screen"
          maxDevicePixelRatio={1}
          className="glow-cursor--fullscreen"
        /> */}
        <SmoothScroll>
          <RouteLoader />
          <SiteHeader />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
