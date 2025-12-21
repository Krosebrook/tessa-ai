import React from "react";
import ParticleBackground from "./components/tessa/ParticleBackground";

export default function Layout({ children }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Inter:wght@300;400&display=swap');
        
        :root {
          --background-dark: #0f0618;
          --glow-purple: #a855f7;
          --glow-rose: #f472b6;
          --text-primary: #f3e8ff;
          --text-secondary: #d8b4fe;
          --border-color: rgba(168, 85, 247, 0.2);
        }

        body {
          background: linear-gradient(135deg, #0f0618 0%, #1e0b2e 100%);
          color: var(--text-primary);
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        h1, h2, h3 {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
      <div className="relative min-h-screen w-full">
        <ParticleBackground />
        <main className="relative z-10">{children}</main>
      </div>
    </>
  );
}