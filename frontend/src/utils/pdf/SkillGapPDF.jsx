import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  subHeader: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 6,
    fontWeight: "bold",
  },
  text: {
    marginBottom: 4,
    lineHeight: 1.5,
  },
  badge: {
    marginBottom: 3,
  },
  step: {
    marginBottom: 8,
    lineHeight: 1.6,
  },
});

export const SkillGapPDF = ({ data, targetRole }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Skill Gap Analysis Report</Text>
      <Text style={styles.text}>Target Role: {targetRole}</Text>
      <Text style={styles.text}>
        Generated on: {new Date().toLocaleDateString()}
      </Text>

      {/* Present Skills */}
      <Text style={styles.subHeader}>Your Current Skills</Text>
      {data.present_skills?.length ? (
        data.present_skills.map((skill, idx) => (
          <Text key={idx} style={styles.badge}>• {skill}</Text>
        ))
      ) : (
        <Text style={styles.text}>No skills listed.</Text>
      )}

      {/* Required Skills */}
      <Text style={styles.subHeader}>Market Required Skills</Text>
      {data.required_skills?.map((skill, idx) => (
        <Text key={idx} style={styles.badge}>• {skill}</Text>
      ))}

      {/* Gap */}
      <Text style={styles.subHeader}>Skill Gap</Text>
      {data.gap?.length ? (
        data.gap.map((skill, idx) => (
          <Text key={idx} style={styles.badge}>• {skill}</Text>
        ))
      ) : (
        <Text style={styles.text}>No skill gap detected 🎉</Text>
      )}

      {/* Learning Path */}
      <Text style={styles.subHeader}>AI Learning Path</Text>
      {data.learning_path?.map((step, idx) => (
        <Text key={idx} style={styles.step}>
          {idx + 1}. {step}
        </Text>
      ))}
    </Page>
  </Document>
);