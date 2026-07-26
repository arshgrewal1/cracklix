
'use client';

import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';
import CracklixReportPDF from './CracklixReportPDF';

/**
 * @fileOverview Institutional PDF Orchestrator v1.0.
 * Handles async generation, blob conversion and secure download flow.
 */

export interface ReportData {
  studentName: string;
  examTitle: string;
  score: number;
  rank: number | string;
  totalCandidates: number;
  accuracy: number;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  grade: string;
  percentile: number;
  subjectAnalysis: any[];
  date: string;
  attemptId: string;
  duration: string;
}

export async function generateReport(data: ReportData) {
  try {
    // 1. Generate Verification QR Node
    const verificationUrl = `https://cracklix.in/results/view?id=${data.attemptId}`;
    const qrData = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 240,
      color: {
        dark: '#071B4D',
        light: '#FFFFFF',
      }
    });

    // 2. Generate PDF Blob
    const doc = React.createElement(CracklixReportPDF, { 
      data, 
      qrData 
    });
    
    const blob = await pdf(doc).toBlob();
    
    // 3. Trigger Secure Download
    const fileName = `Cracklix_Report_${data.studentName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    saveAs(blob, fileName);

    return { success: true };
  } catch (error: any) {
    console.error("[PDF_GENERATION_CRITICAL_FAILURE]:", error);
    throw new Error(error.message || "Institutional report generation failed.");
  }
}
