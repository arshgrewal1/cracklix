
'use client';

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

/**
 * @fileOverview Institutional Performance PDF Template Engine v1.0.
 * Strictly adheres to A4 Portrait (794px x 1123px equivalent) norms.
 */

// Register professional typography
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-EkCc.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-EkCc.woff2', fontWeight: 700 },
    { src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-EkCc.woff2', fontWeight: 900 },
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
    justifyContent: 'between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF2',
    paddingBottom: 20,
  },
  logo: {
    width: 120,
    height: 'auto',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 900,
    color: '#071B4D',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#1677FF',
    fontWeight: 700,
    textAlign: 'right',
    marginTop: 4,
  },
  tagline: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 6,
    fontWeight: 400,
  },
  candidateCard: {
    padding: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '30%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 11,
    fontWeight: 700,
    color: '#071B4D',
    marginTop: 2,
  },
  rankSection: {
    backgroundColor: '#071B4D',
    borderRadius: 24,
    padding: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  rankContent: {
    flexDirection: 'column',
  },
  rankLabel: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  rankValue: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: 900,
    marginVertical: 4,
  },
  rankTotal: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: 700,
  },
  badge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 700,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 900,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: 700,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  table: {
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5EAF2',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5EAF2',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  colSubject: { flex: 3, fontSize: 10, fontWeight: 700 },
  colScore: { flex: 1, fontSize: 10, fontWeight: 900, textAlign: 'center' },
  colAccuracy: { flex: 1, fontSize: 10, fontWeight: 900, textAlign: 'right' },
  
  bottomRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  insightBox: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
  },
  insightTitle: {
    fontSize: 10,
    fontWeight: 900,
    marginBottom: 10,
    textTransform: 'uppercase',
    color: '#1677FF',
  },
  insightItem: {
    fontSize: 9,
    marginBottom: 6,
    color: '#475569',
    fontWeight: 700,
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#E5EAF2',
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#94A3B8',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  qrCode: {
    width: 60,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5EAF2',
  }
});

interface Props {
  data: any;
  qrData: string;
}

export default function PerformancePDF({ data, qrData }: Props) {
  const {
    studentName, examTitle, score, rank, totalCandidates,
    accuracy, correct, wrong, skipped, total,
    grade, percentile, topScore, avgScore, avgAccuracy,
    subjectAnalysis, date, attemptId, duration
  } = data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Image src="/logo/cracklix-logo-dark.png" style={styles.logo} />
            <Text style={styles.tagline}>Smart Preparation. Better Results.</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>Performance Report</Text>
            <Text style={styles.headerSubtitle}>Verified Registry Node</Text>
          </View>
        </View>

        {/* CANDIDATE INFO */}
        <View style={styles.candidateCard}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Aspirant Name</Text>
              <Text style={styles.infoValue}>{studentName}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Test Vertical</Text>
              <Text style={styles.infoValue}>{examTitle}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Attempt Date</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Duration</Text>
              <Text style={styles.infoValue}>{duration}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Attempt ID</Text>
              <Text style={styles.infoValue}>#{attemptId.slice(0, 8)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Registry Status</Text>
              <Text style={[styles.infoValue, { color: '#10B981' }]}>Verified</Text>
            </View>
          </View>
        </View>

        {/* RANKING HERO */}
        <View style={styles.rankSection}>
          <View style={styles.rankContent}>
            <Text style={styles.rankLabel}>Punjab State Rank</Text>
            <Text style={styles.rankValue}>#{rank}</Text>
            <Text style={styles.rankTotal}>Out of {totalCandidates.toLocaleString()} Candidates</Text>
          </View>
          <View style={styles.badge}>
            <Text>Verified Standing</Text>
          </View>
        </View>

        {/* SCORE SUMMARY */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{correct}</Text>
            <Text style={[styles.statLabel, { color: '#10B981' }]}>Correct</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF1F2', borderColor: '#FFE4E6' }]}>
            <Text style={[styles.statValue, { color: '#FF3366' }]}>{wrong}</Text>
            <Text style={[styles.statLabel, { color: '#FF3366' }]}>Wrong</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F8FAFC', borderColor: '#E5EAF2' }]}>
            <Text style={[styles.statValue, { color: '#64748B' }]}>{skipped}</Text>
            <Text style={[styles.statLabel, { color: '#64748B' }]}>Skipped</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <Text style={[styles.statValue, { color: '#1677FF' }]}>{total}</Text>
            <Text style={[styles.statLabel, { color: '#1677FF' }]}>Total</Text>
          </View>
        </View>

        {/* PERFORMANCE OVERVIEW */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderColor: '#E5EAF2' }]}>
            <Text style={[styles.statValue, { color: '#071B4D' }]}>{accuracy}%</Text>
            <Text style={[styles.statLabel, { color: '#64748B' }]}>Accuracy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderColor: '#E5EAF2' }]}>
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{grade}</Text>
            <Text style={[styles.statLabel, { color: '#64748B' }]}>Grade</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderColor: '#E5EAF2' }]}>
            <Text style={[styles.statValue, { color: '#1677FF' }]}>{score}</Text>
            <Text style={[styles.statLabel, { color: '#64748B' }]}>Net Score</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFFFFF', borderColor: '#E5EAF2' }]}>
            <Text style={[styles.statValue, { color: '#071B4D' }]}>{percentile}%</Text>
            <Text style={[styles.statLabel, { color: '#64748B' }]}>Percentile</Text>
          </View>
        </View>

        {/* SUBJECT MASTERY */}
        {subjectAnalysis && subjectAnalysis.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.colSubject}>Subject Pillar</Text>
              <Text style={styles.colScore}>Score</Text>
              <Text style={styles.colAccuracy}>Accuracy</Text>
            </View>
            {subjectAnalysis.map((s: any, i: number) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.colSubject}>{s.name}</Text>
                <Text style={styles.colScore}>{s.score}/{s.total}</Text>
                <Text style={styles.colAccuracy}>{s.accuracy}%</Text>
              </View>
            ))}
          </View>
        )}

        {/* INSIGHTS & COMPETITION */}
        <View style={styles.bottomRow}>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Smart Insights</Text>
            <Text style={styles.insightItem}>• Strength: {accuracy >= 80 ? 'High Accuracy' : 'Speed Control'}</Text>
            <Text style={styles.insightItem}>• Weakness: {wrong > 5 ? 'Negative Marking' : 'Topic Depth'}</Text>
            <Text style={styles.insightItem}>• Recommendation: Practice more {subjectAnalysis?.[0]?.name || 'Mocks'}</Text>
          </View>
          <View style={styles.insightBox}>
            <Text style={styles.insightTitle}>Competition Snapshot</Text>
            <Text style={styles.insightItem}>Top Score: {topScore}</Text>
            <Text style={styles.insightItem}>Average Score: {avgScore.toFixed(1)}</Text>
            <Text style={styles.insightItem}>Average Accuracy: {avgAccuracy.toFixed(1)}%</Text>
            <Text style={styles.insightItem}>Topper Gap: {Math.max(0, topScore - score).toFixed(1)} Pts</Text>
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>Verified Digital Report</Text>
            <Text style={[styles.footerText, { color: '#071B4D', marginTop: 4 }]}>Generated by Cracklix Assessment Engine</Text>
            <Text style={[styles.footerText, { color: '#1677FF', marginTop: 4 }]}>cracklix.in</Text>
          </View>
          <Image src={qrData} style={styles.qrCode} />
        </View>
      </Page>
    </Document>
  );
}
