
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
 * @fileOverview Precision High-Contrast Renderer v17.0.
 * Supports Markdown Tables and KaTeX.
 * Optimized: Scaled down font sizes to reduce vertical sprawl and scrolling.
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
      const hasTable = text.includes('|') && text.includes('--');
      
      if (hasTable) {
        containerRef.current.innerHTML = renderMarkdownTable(text);
        return;
      }

      const lines = text.split('\n');
      
      const renderedHtml = lines.map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<div class="h-2"></div>';

        let processed = trimmed
          .replace(/×/g, '\\times')
          .replace(/÷/g, '\\div')
          .replace(/²/g, '^2')
          .replace(/³/g, '^3')
          .replace(/√\[?([^\]\s]+)\]?/g, '\\sqrt{$1}')
          .replace(/√/g, '\\sqrt');

        const isPureFormula = /^[sabcxyz\d\s\+\-\*\/\=\(\)\\\^\sqrt{}]+$/i.test(trimmed) && trimmed.includes('=');
        const hasMathSymbols = /[√\\×÷²³≤≥]/.test(trimmed) || trimmed.includes('$');

        if (isPureFormula || (hasMathSymbols && !/[a-z]{5,}/i.test(trimmed))) {
          try {
            const mathContent = processed.startsWith('$') && processed.endsWith('$') 
              ? processed.slice(1, -1) 
              : processed;

            return `<div class="py-1 overflow-x-auto no-scrollbar font-sans text-base md:text-lg text-inherit">${katex.renderToString(mathContent, {
              throwOnError: false,
              displayMode: false,
              trust: true
            })}</div>`;
          } catch (e) {
            return `<div class="py-1 text-inherit">${trimmed}</div>`;
          }
        }

        if (trimmed.includes('=') && !/[a-z]{12,}/i.test(trimmed)) {
          const parts = trimmed.split('=');
          return `<div class="py-1 flex flex-wrap items-baseline gap-2 text-inherit">
            <span class="font-bold text-inherit uppercase tracking-wide text-xs md:text-sm">${parts[0].trim()}</span>
            <span class="text-inherit font-black text-primary">=</span>
            <span class="font-bold text-inherit text-xs md:text-sm">${parts[1].trim()}</span>
          </div>`;
        }

        return `<div class="py-0.5 text-inherit font-[700] leading-[1.5] antialiased">${trimmed}</div>`;
      }).join('');

      containerRef.current.innerHTML = renderedHtml;
    } catch (err) {
      containerRef.current.textContent = text;
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={cn("whitespace-pre-wrap leading-relaxed h-auto overflow-visible text-inherit", className)} 
    />
  );
}

function renderMarkdownTable(rawText: string): string {
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const tableRows = lines.filter(l => l.startsWith('|') && l.endsWith('|'));
  
  if (tableRows.length < 2) return rawText.replace(/\n/g, '<br/>');

  const header = tableRows[0].split('|').filter(c => c.trim().length >= 0).slice(1, -1);
  const dataRows = tableRows.slice(2).map(r => r.split('|').filter(c => c.trim().length >= 0).slice(1, -1));

  const html = `
    <div class="my-4 overflow-x-auto rounded-xl border border-white/10 bg-white/5 shadow-2xl">
      <table class="w-full text-left border-collapse min-w-[400px]">
        <thead>
          <tr class="bg-[#F97316]/10 border-b border-white/10">
            ${header.map(col => `<th class="p-3 font-black uppercase text-[10px] md:text-xs tracking-[0.1em] text-[#F97316]">${col.trim()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${dataRows.map(row => `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
              ${row.map(cell => `<td class="p-3 font-bold text-[12px] md:text-sm text-inherit">${cell.trim()}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const remainingText = lines.filter(l => !l.startsWith('|')).join('\n');
  return html + (remainingText ? `<div class="mt-2 font-[700] text-inherit leading-relaxed text-sm md:text-base">${remainingText}</div>` : "");
}
