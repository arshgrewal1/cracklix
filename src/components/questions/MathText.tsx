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
 * @fileOverview Hardened Math Renderer.
 * FIXED: Handles null/undefined text and prevents KaTeX crashes on malformed inputs.
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

        const processed = trimmed
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

            return `<div class="py-1 overflow-x-auto no-scrollbar font-sans text-sm md:text-lg text-inherit">${katex.renderToString(mathContent, {
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
            <span class="font-bold text-inherit uppercase tracking-wide text-[11px] md:text-sm">${parts[0].trim()}</span>
            <span class="text-inherit font-black text-primary">=</span>
            <span class="font-bold text-inherit text-[11px] md:text-sm">${parts[1].trim()}</span>
          </div>`;
        }

        return `<div class="py-0.5 text-inherit font-[700] leading-[1.4] md:leading-[1.5] antialiased text-[13px] md:text-base">${trimmed}</div>`;
      }).join('');

      containerRef.current.innerHTML = renderedHtml;
    } catch (err) {
      containerRef.current.textContent = text;
    }
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={cn("whitespace-pre-wrap leading-relaxed h-auto overflow-hidden text-inherit w-full", className)} 
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
    <div class="my-3 overflow-x-auto rounded-lg border border-white/10 bg-white/5 shadow-xl w-full">
      <table class="w-full text-left border-collapse min-w-[280px]">
        <thead>
          <tr class="bg-[#F97316]/10 border-b border-white/10">
            ${header.map(col => `<th class="p-2 font-black uppercase text-[8px] md:text-xs tracking-tight text-[#F97316]">${col.trim()}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${dataRows.map(row => `
            <tr class="border-b border-white/5 hover:bg-white/5 transition-colors">
              ${row.map(cell => `<td class="p-2 font-bold text-[10px] md:text-sm text-inherit">${cell.trim()}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  const remainingText = lines.filter(l => !l.startsWith('|')).join('\n');
  return html + (remainingText ? `<div class="mt-2 font-[700] text-inherit leading-relaxed text-[12px] md:text-base">${remainingText}</div>` : "");
}