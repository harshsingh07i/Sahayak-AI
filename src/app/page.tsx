"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { WordsPullUp, WordsPullUpMultiStyle } from "@/components/animations/WordsPullUp";
import { AnimatedLetter } from "@/components/animations/AnimatedLetter";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import styles from "./page.module.css";

function FadeInCard({ children, delay = 0, className = "", style = {} }: { children: React.ReactNode, delay?: number, className?: string, style?: any }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  return (
    <main style={{ backgroundColor: 'black' }}>
      {/* SECTION 1: HERO */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <video 
            className={styles.videoBg} 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4" 
            autoPlay loop muted playsInline 
          />
          <div className="noise-overlay" />
          <div className={styles.gradientOverlay} />

          <nav className={styles.navbar}>
            <Link href="/login" className={styles.navLink}>Login</Link>
            <Link href="#about" className={styles.navLink}>About</Link>
            <Link href="#features" className={styles.navLink}>Features</Link>
          </nav>

          <div className={styles.heroContent}>
            <div>
              <WordsPullUp text="Sahayak" className={styles.giantTitle} showAsterisk={true} />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.heroDesc}>
                Sahayak is a nationwide network of educators, students, and parents bound not by place, status or labels but by passion and hunger to unlock potential through our unique AI perspectives.
              </p>
              
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <motion.div 
                  className={styles.ctaPill}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  Join the lab
                  <div className={styles.ctaCircle}>
                    <ArrowRight size={20} />
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT */}
      <section id="about" className={styles.aboutSection}>
        <div className={styles.aboutCard}>
          <div className={styles.aboutLabel}>Educational AI</div>
          
          <WordsPullUpMultiStyle 
            segments={[
              { text: "We are Sahayak, ", className: "font-normal" },
              { text: "an AI-powered educational platform. ", className: styles.italicAccent },
              { text: "We have skills in lesson planning, grading, and tutoring.", className: "font-normal" }
            ]}
            className={styles.aboutHeading}
          />

          <div className={styles.aboutBody}>
            <AnimatedLetter text="Over the last year, we have worked with thousands of schools across the country to craft intelligent learning environments. Together, we have created an ecosystem that empowers teachers and inspires students to reach new heights." />
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" className={styles.featuresSection}>
        <div className="bg-noise" style={{ position: 'absolute', top:0, left:0, right:0, bottom:0, opacity: 0.15, pointerEvents: 'none' }} />
        
        <div className={styles.featuresHeader}>
          <WordsPullUpMultiStyle 
            segments={[
              { text: "Studio-grade workflows for visionary educators.", className: "text-main block mb-2 text-2xl md:text-4xl" },
            ]}
            className=""
          />
          <WordsPullUpMultiStyle 
            segments={[
              { text: "Built for pure vision. Powered by AI.", className: "text-muted block text-2xl md:text-4xl" },
            ]}
            className=""
          />
        </div>

        <div className={styles.featuresGrid}>
          {/* Card 1: Video */}
          <FadeInCard delay={0} className={styles.featureCard} style={{ padding: 0 }}>
            <video 
              className={styles.featureVideo} 
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_133058_0504132a-0cf3-4450-a370-8ea3b05c95d4.mp4" 
              autoPlay loop muted playsInline 
            />
            <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', color: '#E1E0CC', fontSize: '1.5rem', fontWeight: 600 }}>
              Your creative canvas.
            </div>
          </FadeInCard>

          {/* Card 2: Teacher Tools */}
          <FadeInCard delay={0.15} className={styles.featureCard}>
            <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171918_4a5edc79-d78f-4637-ac8b-53c43c220606.png&w=1280&q=85" className={styles.cardIcon} alt="Icon" />
            <div style={{ marginTop: 'auto' }}>
              <h3 className={styles.featureCardTitle}>01. Lesson Planner.</h3>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> AI-generated lesson modules</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Automated grading rubrics</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Quiz and exam generation</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Attendance tracking</li>
              </ul>
              <Link href="/login" className={styles.learnMore}>Learn more <ArrowRight size={16} className={styles.learnMoreIcon} /></Link>
            </div>
          </FadeInCard>

          {/* Card 3: Student Tools */}
          <FadeInCard delay={0.3} className={styles.featureCard}>
            <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171741_ed9845ab-f5b2-4018-8ce7-07cc01823522.png&w=1280&q=85" className={styles.cardIcon} alt="Icon" />
            <div style={{ marginTop: 'auto' }}>
              <h3 className={styles.featureCardTitle}>02. Smart Tutors.</h3>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Concept Explainer (ELI5)</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Essay structuring assistant</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> 24/7 personal AI doubt solver</li>
              </ul>
              <Link href="/login" className={styles.learnMore}>Learn more <ArrowRight size={16} className={styles.learnMoreIcon} /></Link>
            </div>
          </FadeInCard>

          {/* Card 4: Parent Portal */}
          <FadeInCard delay={0.45} className={styles.featureCard}>
            <img src="https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260405_171809_f56666dc-c099-4778-ad82-9ad4f209567b.png&w=1280&q=85" className={styles.cardIcon} alt="Icon" />
            <div style={{ marginTop: 'auto' }}>
              <h3 className={styles.featureCardTitle}>03. Synced Analytics.</h3>
              <ul className={styles.featureList}>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Live attendance tracking</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Real-time performance metrics</li>
                <li className={styles.featureItem}><Check size={18} className={styles.checkIcon}/> Instant fee notifications</li>
              </ul>
              <Link href="/login" className={styles.learnMore}>Learn more <ArrowRight size={16} className={styles.learnMoreIcon} /></Link>
            </div>
          </FadeInCard>
        </div>
      </section>
    </main>
  );
}
