/**
 * Shared PDF stylesheet for AMSIRS document generation.
 * All PDF documents should import and extend these base styles.
 */

import { StyleSheet } from '@react-pdf/renderer';

// ==========================================
// Design Tokens
// ==========================================

export const PDF_COLORS = {
  black: '#000000',
  darkGray: '#333333',
  mediumGray: '#666666',
  lightGray: '#999999',
  borderGray: '#CCCCCC',
  lineGray: '#AAAAAA',
  backgroundGray: '#F5F5F5',
  white: '#FFFFFF',
  maroon: '#800000',
} as const;

export const PDF_FONTS = {
  base: 10,
  small: 9,
  xs: 8,
  label: 9,
  sectionTitle: 12,
  subSectionTitle: 11,
  documentTitle: 16,
  schoolName: 14,
} as const;

// ==========================================
// Base Stylesheet
// ==========================================

export const baseStyles = StyleSheet.create({
  // Page
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 50,
    fontFamily: 'Times-Roman',
    fontSize: PDF_FONTS.base,
    color: PDF_COLORS.black,
    lineHeight: 1.4,
  },

  // Header
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: PDF_COLORS.black,
  },
  schoolName: {
    fontSize: PDF_FONTS.schoolName,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: 2,
  },
  schoolSubtitle: {
    fontSize: PDF_FONTS.small,
    color: PDF_COLORS.mediumGray,
    marginBottom: 6,
  },
  documentTitle: {
    fontSize: PDF_FONTS.documentTitle,
    fontFamily: 'Times-Bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 2,
    marginTop: 6,
  },

  // Section Titles (I, II, III, IV)
  sectionTitle: {
    fontSize: PDF_FONTS.sectionTitle,
    fontFamily: 'Times-Bold',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase' as const,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.borderGray,
  },

  // Subsection Titles (A, B, C)
  subSectionTitle: {
    fontSize: PDF_FONTS.subSectionTitle,
    fontFamily: 'Times-Bold',
    marginTop: 10,
    marginBottom: 6,
  },

  // Subsection Note (e.g., "If respondent is a School Personnel:")
  subSectionNote: {
    fontSize: PDF_FONTS.small,
    fontFamily: 'Times-BoldItalic',
    color: PDF_COLORS.darkGray,
    marginTop: 6,
    marginBottom: 4,
  },

  // Field Rows
  fieldRow: {
    flexDirection: 'row' as const,
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  fieldLabel: {
    fontSize: PDF_FONTS.label,
    fontFamily: 'Times-Bold',
    width: 180,
    color: PDF_COLORS.darkGray,
  },
  fieldValue: {
    flex: 1,
    fontSize: PDF_FONTS.base,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.lineGray,
    paddingBottom: 2,
    minHeight: 14,
  },

  // Blank line (for case details, etc.)
  blankLine: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.lineGray,
    minHeight: 18,
    marginBottom: 4,
  },

  // Numbered items (for actions taken, recommendations)
  numberedRow: {
    flexDirection: 'row' as const,
    marginBottom: 6,
    alignItems: 'flex-end',
  },
  numberLabel: {
    fontSize: PDF_FONTS.base,
    fontFamily: 'Times-Bold',
    width: 24,
    color: PDF_COLORS.darkGray,
  },
  numberedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.lineGray,
    paddingBottom: 2,
    minHeight: 14,
  },

  // Paragraph text (for case details section)
  paragraph: {
    fontSize: PDF_FONTS.base,
    lineHeight: 1.6,
    marginBottom: 8,
    textAlign: 'justify' as const,
  },

  // Signature Block
  signatureSection: {
    marginTop: 40,
    width: '50%',
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.black,
    marginBottom: 4,
    minHeight: 24,
    paddingBottom: 2,
  },
  signatureLabel: {
    fontSize: PDF_FONTS.xs,
    color: PDF_COLORS.mediumGray,
    textAlign: 'center' as const,
    marginBottom: 12,
  },
  signatureValue: {
    fontSize: PDF_FONTS.base,
    textAlign: 'center' as const,
    marginBottom: 2,
  },

  // Horizontal Rule
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: PDF_COLORS.borderGray,
    marginVertical: 12,
  },

  // Spacer
  spacer: {
    height: 12,
  },
});
