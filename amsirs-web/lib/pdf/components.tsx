/**
 * Reusable PDF component primitives for AMSIRS document generation.
 * These building blocks are shared across all PDF document types.
 */

import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { baseStyles } from './styles';

// ==========================================
// PDF Header (School + Document Title)
// ==========================================

interface PDFHeaderProps {
  title: string;
  subtitle?: string;
}

export function PDFHeader({ title, subtitle }: PDFHeaderProps) {
  return (
    <View style={baseStyles.headerContainer}>
      <Text style={baseStyles.schoolName}>Cavite National High School</Text>
      <Text style={baseStyles.schoolSubtitle}>Cavite City, Philippines</Text>
      <Text style={baseStyles.documentTitle}>{title}</Text>
      {subtitle && (
        <Text style={[baseStyles.schoolSubtitle, { marginTop: 4 }]}>{subtitle}</Text>
      )}
    </View>
  );
}

// ==========================================
// Section Title (I, II, III, IV)
// ==========================================

interface SectionTitleProps {
  number: string;
  title: string;
}

export function SectionTitle({ number, title }: SectionTitleProps) {
  return (
    <Text style={baseStyles.sectionTitle}>
      {number}. {title}
    </Text>
  );
}

// ==========================================
// Subsection Title (A, B, C)
// ==========================================

interface SubSectionTitleProps {
  letter: string;
  title: string;
}

export function SubSectionTitle({ letter, title }: SubSectionTitleProps) {
  return (
    <Text style={baseStyles.subSectionTitle}>
      {letter}. {title}
    </Text>
  );
}

// ==========================================
// Subsection Note (italic descriptor)
// ==========================================

interface SubSectionNoteProps {
  text: string;
}

export function SubSectionNote({ text }: SubSectionNoteProps) {
  return <Text style={baseStyles.subSectionNote}>{text}</Text>;
}

// ==========================================
// Field Row (Label + Value/Blank Line)
// ==========================================

interface FieldRowProps {
  label: string;
  value?: string;
  labelWidth?: number;
}

export function FieldRow({ label, value, labelWidth }: FieldRowProps) {
  return (
    <View style={baseStyles.fieldRow}>
      <Text style={[baseStyles.fieldLabel, labelWidth ? { width: labelWidth } : {}]}>
        {label}:
      </Text>
      <Text style={baseStyles.fieldValue}>{value || ''}</Text>
    </View>
  );
}

// ==========================================
// Numbered Blank Lines (for Actions/Recommendations)
// ==========================================

interface NumberedBlankLinesProps {
  count: number;
  values?: string[];
}

export function NumberedBlankLines({ count, values = [] }: NumberedBlankLinesProps) {
  return (
    <View>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={baseStyles.numberedRow}>
          <Text style={baseStyles.numberLabel}>{i + 1}.</Text>
          <Text style={baseStyles.numberedLine}>{values[i] || ''}</Text>
        </View>
      ))}
    </View>
  );
}

// ==========================================
// Signature Block
// ==========================================

interface SignatureBlockProps {
  preparedBy?: string;
  designation?: string;
  date?: string;
}

export function SignatureBlock({ preparedBy, designation, date }: SignatureBlockProps) {
  return (
    <View style={baseStyles.signatureSection}>
      {/* Prepared By */}
      <View>
        {preparedBy ? (
          <Text style={baseStyles.signatureValue}>{preparedBy}</Text>
        ) : null}
        <View style={baseStyles.signatureLine} />
        <Text style={baseStyles.signatureLabel}>Name over Printed Name</Text>
      </View>

      {/* Designation */}
      <View>
        {designation ? (
          <Text style={baseStyles.signatureValue}>{designation}</Text>
        ) : null}
        <View style={baseStyles.signatureLine} />
        <Text style={baseStyles.signatureLabel}>Designation</Text>
      </View>

      {/* Date */}
      <View>
        {date ? (
          <Text style={baseStyles.signatureValue}>{date}</Text>
        ) : null}
        <View style={baseStyles.signatureLine} />
        <Text style={baseStyles.signatureLabel}>Date</Text>
      </View>
    </View>
  );
}

// ==========================================
// Horizontal Rule
// ==========================================

export function HorizontalRule() {
  return <View style={baseStyles.hr} />;
}

// ==========================================
// Spacer
// ==========================================

interface SpacerProps {
  height?: number;
}

export function Spacer({ height }: SpacerProps) {
  return <View style={height ? { height } : baseStyles.spacer} />;
}

// ==========================================
// Case Details Block (paragraph or blank area)
// ==========================================

interface CaseDetailsBlockProps {
  text?: string;
  blankLineCount?: number;
}

export function CaseDetailsBlock({ text, blankLineCount = 8 }: CaseDetailsBlockProps) {
  if (text && text.trim()) {
    return <Text style={baseStyles.paragraph}>{text}</Text>;
  }

  // Render blank lines for handwriting
  return (
    <View>
      {Array.from({ length: blankLineCount }, (_, i) => (
        <View key={i} style={baseStyles.blankLine} />
      ))}
    </View>
  );
}
