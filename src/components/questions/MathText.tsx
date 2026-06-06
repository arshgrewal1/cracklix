
'use client';

import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { cn } from '@/lib/utils';

interface MathTextProps {
  text: string;
  className?: string;
}

/**
 * @fileOverview Precision Math Renderer v3.0.
 * Renders LaTeX blocks and converts plain text symbols to high-fidelity glyphs.
 * Ensures multi-line calculations remain vertically separated.
 */
export default function MathText({ text, className }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        const lines = text.split('\n');
        
        const renderedLines = lines.map(line => {
          if (!line.trim()) return '<div class="h-4"></div>'; // Preserve blank lines

          // Convert standard math symbols to LaTeX for KaTeX
          const processedLine = line
            .replace(/√/g, '\\sqrt')
            .replace(/×/g, '\\times')
            .replace(/÷/g, '\\div')
            .replace(/\^2|²/g, '^2')
            .replace(/\^3|³/g, '^3')
            .replace(/≤/g, '\\leq')
            .replace(/≥/g, '\\geq');

          // Check if line contains common math operators
          const hasMath = /[\\√×÷²³≤≥=+\-\/]/.test(processedLine);

          if (hasMath) {
            try {
              return `<div class="py-1">${katex.renderToString(processedLine, {
                throwOnError: false,
                displayMode: false,
                trust: true
              })}</div>`;
            } catch (e) {
              return `<div>${line}</div>`;
            }
          }
          
          return `<div>${line}</div>`;
        });

        containerRef.current.innerHTML = renderedLines.join('');
      } catch (err) {
        containerRef.current.textContent = text;
      }
    }
  }, [text]);

  return <div ref={containerRef} className={cn("whitespace-pre-wrap leading-relaxed", className)} />;
}
