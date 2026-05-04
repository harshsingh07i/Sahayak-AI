"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Sparkles, Loader2, ArrowLeft } from "lucide-react";
import styles from "./AIToolRunner.module.css";

interface AIToolRunnerProps {
  toolName: string;
  toolType: string;
  placeholder: string;
  onBack: () => void;
}

export default function AIToolRunner({ toolName, toolType, placeholder, onBack }: AIToolRunnerProps) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, toolType }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate content");

      setResult(data.result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`glass ${styles.container}`}>
      <div className={styles.header}>
        <button onClick={onBack} className={styles.backBtn}><ArrowLeft size={20} /> Back</button>
        <h2 className={styles.title}><Sparkles className="text-gradient" size={24} /> {toolName}</h2>
      </div>

      <div className={styles.inputArea}>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className={styles.textarea}
          rows={4}
        />
        <button 
          onClick={handleGenerate} 
          disabled={loading || !prompt.trim()} 
          className="btn-primary"
          style={{ width: '100%', marginTop: '1rem' }}
        >
          {loading ? <><Loader2 className={styles.spin} /> Generating...</> : "Generate Magic"}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.resultArea}>
          <h3>Result</h3>
          <div className={`${styles.resultContent} ${styles.markdownBody}`}>
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
