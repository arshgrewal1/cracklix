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
 * @fileOverview Precision Math Renderer v3.5.
 * Hardened to prevent plain text labels from inheriting serif font styles.
 */
export default function MathText({ text, className }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        const lines = text.split('\n');
        
        const renderedLines = lines.map(line => {
          if (!line.trim()) return '<div class="h-4"></div>';

          // Standardize math symbols
          const processedLine = line
            .replace(/√/g, '\\sqrt')
            .replace(/×/g, '\\times')
            .replace(/÷/g, '\\div')
            .replace(/\^2|²/g, '^2')
            .replace(/\^3|³/g, '^3')
            .replace(/≤/g, '\\leq')
            .replace(/≥/g, '\\geq');

          // Narrow check: Only use KaTeX if specific math symbols are found, 
          // avoiding triggers on simple colons or slashes in labels.
          const hasSignificantMath = /[\\√×÷²³≤≥^]/.test(processedLine) || 
                                     (/[=]/.test(processedLine) && /\d/.test(processedLine));

          if (hasSignificantMath) {
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
