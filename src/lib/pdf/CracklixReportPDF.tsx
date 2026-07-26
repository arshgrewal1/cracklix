'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

/**
 * @fileOverview Institutional PDF Template Engine v1.3.
 * FIXED: Migrated to high-availability TTF font nodes to prevent generation timeouts.
 */

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Regular.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Bold.ttf', fontWeight: 700 },
    { src: 'https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/inter/static/Inter-Black.ttf', fontWeight: 900 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Inter',
    color: '#071B4D',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 20,
  },
  logo: {
    width: 110,
    height: 'auto',
  },
  headerRight: {
    textAlign: 'right',
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: '#1677FF',
  },
  assessmentId: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 4,
    fontWeight: 700,
  },
  detailsSection: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailItem: {
    width: '33%',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: 700,
  },
  detailValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#071B4D',
    marginTop: 2,
  },
  rankCard: {
    backgroundColor: '#071B4D',
    borderRadius: 24,
    padding: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rankInfo: {
    flexDirection: 'column',
  },
  rankLabel: {
    color: '#60A5FA',
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1,
  },
  rankValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 900,
    marginTop: 8,
  },
  rankTotal: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8,
  },
  rankBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 700,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 900,
  },
  statLabel: {
    fontSize: 7,
    color: '#64748B',
    fontWeight: 700,
    marginTop: 4,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  col1: { flex: 3, fontSize: 9, fontWeight: 700 },
  col2: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: 'center' },
  col3: { flex: 1, fontSize: 9, fontWeight: 700, textAlign: 'right' },
  
  insightsSection: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  insightCard: {
    flex: 1,
    padding: 15,
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  insightTitle: {
    fontSize: 8,
    fontWeight: 900,
    marginBottom: 6,
    color: '#10B981',
  },
  insightText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#065F46',
    fontWeight: 700,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'column',
  },
  footerBrand: {
    fontSize: 10,
    fontWeight: 900,
    color: '#071B4D',
  },
  footerTagline: {
    fontSize: 8,
    color: '#64748B',
    marginTop: 4,
  },
  qrCode: {
    width: 60,
    height: 60,
    borderRadius: 8,
  }
});

interface CracklixReportProps {
  data: any;
  qrData: string;
}

export default function CracklixReportPDF({ data, qrData }: CracklixReportProps) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    accuracy, correct, wrong, skipped, total,
    grade, percentile,
    subjectAnalysis, date, attemptId, duration
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. HEADER */}
        <View style={styles.header}>
          <Image src="https://cracklix.vercel.app/logo/cracklix-logo-dark.png" style={styles.logo} />
          <View style={styles.headerRight}>
            <Text style={styles.reportTitle}>Performance Report</Text>
            <Text style={styles.assessmentId}>Ref: {attemptId?.slice(0, 16).toUpperCase()}</Text>
          </View>
        </View>

        {/* 2. CANDIDATE DETAILS */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Candidate Name</Text>
              <Text style={styles.detailValue}>{studentName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Test Vertical</Text>
              <Text style={styles.detailValue}>{examTitle}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{duration}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Attempts</Text>
              <Text style={styles.detailValue}>1 Verified node</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Registry Status</Text>
              <Text style={[styles.detailValue, { color: '#10B981' }]}>Verified</Text>
            </View>
          </View>
        </View>

        {/* 3. RANKING CARD */}
        <View style={styles.rankCard}>
          <View style={styles.rankInfo}>
            <Text style={styles.rankLabel}>Punjab State Rank</Text>
            <Text style={styles.rankValue}>#{rank}</Text>
            <Text style={styles.rankTotal}>Out of {totalCandidates?.toLocaleString()} Candidates</Text>
          </View>
          <View style={styles.rankBadge}>
            <Text>Verified Merit Standing</Text>
          </View>
        </View>

        {/* 4. SCORE SUMMARY */}
        <View style={styles.statsRow}>
           <View style={[styles.statBox, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.statValue, { color: '#10B981' }]}>{correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: '#FFF1F2' }]}>
              <Text style={[styles.statValue, { color: '#FF3366' }]}>{wrong}</Text>
              <Text style={styles.statLabel}>Wrong</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: '#F8FAFC' }]}>
              <Text style={[styles.statValue, { color: '#64748B' }]}>{skipped}</Text>
              <Text style={styles.statLabel}>Skipped</Text>
           </View>
           <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={[styles.statValue, { color: '#1677FF' }]}>{total}</Text>
              <Text style={styles.statLabel}>Total Qs</Text>
           </View>
        </View>

        {/* 5. PERFORMANCE OVERVIEW */}
        <View style={styles.statsRow}>
           <View style={styles.statBox}>
              <Text style={styles.statValue}>{accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
           </View>
           <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{grade}</Text>
              <Text style={styles.statLabel}>Grade</Text>
           </View>
           <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: '#1677FF' }]}>{score}</Text>
              <Text style={styles.statLabel}>Net Score</Text>
           </View>
           <View style={styles.statBox}>
              <Text style={styles.statValue}>{percentile}%</Text>
              <Text style={styles.statLabel}>Percentile</Text>
           </View>
        </View>

        {/* 6. SUBJECT MASTERY */}
        {subjectAnalysis && subjectAnalysis.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Subject Pillar</Text>
              <Text style={styles.col2}>Score</Text>
              <Text style={styles.col3}>Accuracy</Text>
            </View>
            {subjectAnalysis.map((s: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{s.name}</Text>
                <Text style={styles.col2}>{s.score}/{s.total}</Text>
                <Text style={styles.col3}>{s.accuracy}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* 7. INSIGHTS */}
        <View style={styles.insightsSection}>
           <View style={styles.insightCard}>
              <Text style={styles.insightTitle}>Institutional Insight</Text>
              <Text style={styles.insightText}>
                 {accuracy >= 80 ? 'Strong analytical understanding detected. Maintain current practice rhythm.' : 
                  accuracy >= 60 ? 'Consistent performance. Focus on reducing negative marking in difficult zones.' :
                  'Accuracy node below threshold. Revision of core subjects recommended.'}
              </Text>
           </View>
           <View style={[styles.insightCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
              <Text style={[styles.insightTitle, { color: '#1677FF' }]}>Next Action</Text>
              <Text style={[styles.insightText, { color: '#1E40AF' }]}>
                 Target {subjectAnalysis?.[0]?.name || 'Current Affairs'} for immediate score optimization.
              </Text>
           </View>
        </View>

        {/* 8. FOOTER */}
        <View style={styles.footer}>
          <View style={styles.footerInfo}>
            <Text style={styles.footerBrand}>Digitally Verified by Cracklix</Text>
            <Text style={styles.footerTagline}>Authentic Assessment Node • cracklix.in</Text>
          </View>
          <Image src={qrData} style={styles.qrCode} />
        </View>
      </Page>
    </Document>
  );
}
