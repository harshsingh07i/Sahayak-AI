"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";

interface WordsPullUpProps {
  text: string;
  className?: string;
  showAsterisk?: boolean;
}

export function WordsPullUp({ text, className, showAsterisk }: WordsPullUpProps) {
  const container = useRef<HTMLHeadingElement>(null);
  const isInView = useInView(container, { once: true, margin: "-10%" });
  
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <motion.h1
      ref={container}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={clsx("flex flex-wrap", className)}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.25em' }}
    >
      {words.map((word, i) => (
        <motion.span key={i} variants={itemVariants} style={{ display: 'inline-block', position: 'relative' }}>
          {word}
          {showAsterisk && i === words.length - 1 && word.includes('k') && (
            <span style={{ position: 'absolute', top: '0.1em', right: '-0.3em', fontSize: '0.31em' }}>*</span>
          )}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export function WordsPullUpMultiStyle({ segments, className }: { segments: {text: string, className?: string}[], className?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const isInView = useInView(container, { once: true, margin: "-10%" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  return (
    <motion.div
      ref={container}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.2em', justifyContent: 'center' }}
    >
      {segments.map((segment, segIndex) => (
        segment.text.split(" ").map((word, wordIndex) => (
          <motion.span key={`${segIndex}-${wordIndex}`} variants={itemVariants} className={segment.className} style={{ display: 'inline-block' }}>
            {word}
          </motion.span>
        ))
      ))}
    </motion.div>
  );
}
