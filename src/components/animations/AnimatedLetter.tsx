"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function AnimatedLetter({ text, className }: { text: string, className?: string }) {
  const containerRef = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.8', 'end 0.2'],
  });

  const chars = text.split("");

  return (
    <p ref={containerRef} className={className} style={{ display: 'inline' }}>
      {chars.map((char, i) => {
        const charProgress = i / chars.length;
        const start = Math.max(0, charProgress - 0.1);
        const end = Math.min(1, charProgress + 0.05);
        
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const opacity = useTransform(scrollYProgress, [start, end], [0.2, 1]);
        
        return (
          <motion.span key={i} style={{ opacity }}>
            {char}
          </motion.span>
        );
      })}
    </p>
  );
}
