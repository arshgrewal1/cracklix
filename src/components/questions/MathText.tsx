
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
 * @fileOverview Precision High-Contrast Math Renderer v13.0.
 * Fixed: Robust fallback logic to ensure text is never empty or invisible.
 */
export default function MathText({ text, className }: MathTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!text || typeof text !== 'string') {
      containerRef.current.innerHTML = '';
      return;
    }

    try {
      const lines = text.split('\n');
      
      const renderedHtml = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<div class="h-4"></div>';

        // Normalize symbols for logic detection
        let processed = trimmed
          .replace(/×/g, '\\times')
          .replace(/÷/g, '\\div')
          .replace(/²/g, '^2')
          .replace(/³/g, '^3')
          .replace(/√\[?([^\]\s]+)\]?/g, '\\sqrt{$1}')
          .replace(/√/g, '\\sqrt');

        // Logic: Is this line a pure formula or text with math?
        const isPureFormula = /^[sabcxyz\d\s\+\-\*\/\=\(\)\\\^\sqrt{}]+$/i.test(trimmed) && trimmed.includes('=');
        const hasSymbols = /[√\\×÷²³≤≥]/.test(trimmed);

        if (isPureFormula || (hasSymbols && !/[a-z]{4,}/i.test(trimmed))) {
          try {
            return `<div class="py-2 overflow-x-auto no-scrollbar font-sans text-lg md:text-xl text-white">${katex.renderToString(processed, {
              throwOnError: false,
              displayMode: false,
              trust: true
            })}</div>`;
          } catch (e) {
            return `<div class="py-2 text-white">${trimmed}</div>`;
          }
        }

        // Descriptive text (e.g., "Total age = 300")
        if (trimmed.includes('=') && !/[a-z]{10,}/i.test(trimmed)) {
          const parts = trimmed.split('=');
          return `<div class="py-2 flex flex-wrap items-baseline gap-2 text-white">
            <span class="font-bold text-inherit uppercase tracking-wide">${parts[0].trim()}</span>
            <span class="text-inherit font-black">=</span>
            <span class="font-bold text-inherit">${parts[1].trim()}</span>
          </div>`;
        }

        // Standard neat text line
        return `<div class="py-1 text-inherit font-[700] leading-[1.8] antialiased text-white">${trimmed}</div>`;
      }).join('');

      containerRef.current.innerHTML = renderedHtml;
    } catch (err) {
      containerRef.current.textContent = text;
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={cn("whitespace-pre-wrap leading-relaxed h-auto overflow-visible text-white", className)} 
    />
  );
}
