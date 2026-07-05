/**
 * Intake Sheet PDF Document
 * 
 * Renders the formal intake sheet following the institutional format:
 * I. Information (Victim, Complainant, Respondent)
 * II. Details of the Case
 * III. Action Taken
 * IV. Recommendations
 * + Sign-off Fields
 */

import React from 'react';
import { Document, Page, View } from '@react-pdf/renderer';
import { baseStyles } from './styles';
import {
  PDFHeader,
  SectionTitle,
  SubSectionTitle,
  SubSectionNote,
  FieldRow,
  NumberedBlankLines,
  SignatureBlock,
  HorizontalRule,
  Spacer,
  CaseDetailsBlock,
} from './components';
import type { IntakeSheetData } from './types';

// ==========================================
// Intake Sheet Document Component
// ==========================================

interface IntakeSheetDocumentProps {
  data: IntakeSheetData;
}

export default function IntakeSheetDocument({ data }: IntakeSheetDocumentProps) {
  const LABEL_WIDTH = 200;

  return (
    <Document
      title="Intake Sheet"
      author="AMSIRS - Cavite National High School"
      subject="Incident Intake Sheet"
    >
      <Page size="LETTER" style={baseStyles.page}>
        {/* ---- HEADER ---- */}
        <PDFHeader title="Intake Sheet" />

        {/* ==== SECTION I: INFORMATION ==== */}
        <SectionTitle number="I" title="Information" />

        {/* ---- A. Victim ---- */}
        <SubSectionTitle letter="A" title="Victim" />
        <FieldRow label="Name" value={data.victim.name} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Date of Birth" value={data.victim.dateOfBirth} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Age" value={data.victim.age} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Sex" value={data.victim.sex} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Gr./Yr and Section" value={data.victim.gradeYearSection} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Adviser" value={data.victim.adviser} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Mother's Name, Age, Occ." value={data.victim.motherInfo} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Father's Name, Age, Occ." value={data.victim.fatherInfo} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Address and Contact No." value={data.victim.addressContact} labelWidth={LABEL_WIDTH} />

        <Spacer />

        {/* ---- B. Complainant ---- */}
        <SubSectionTitle letter="B" title="Complainant" />
        <FieldRow label="Name" value={data.complainant.name} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Relationship to Victim" value={data.complainant.relationshipToVictim} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Address and Contact No." value={data.complainant.addressContact} labelWidth={LABEL_WIDTH} />

        <Spacer />

        {/* ---- C. Respondent ---- */}
        <SubSectionTitle letter="C" title="Respondent" />

        {/* C-1: School Personnel */}
        <SubSectionNote text="C-1. If respondent is a School Personnel:" />
        <FieldRow label="Name" value={data.respondentPersonnel.name} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Date of Birth" value={data.respondentPersonnel.dateOfBirth} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Age" value={data.respondentPersonnel.age} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Sex" value={data.respondentPersonnel.sex} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Designation/Position" value={data.respondentPersonnel.designation} labelWidth={LABEL_WIDTH} />
        <FieldRow label="Address and Contact No." value={data.respondentPersonnel.addressContact} labelWidth={LABEL_WIDTH} />

        <Spacer />

        {/* C-2: Student */}
        <View break>
          <SubSectionNote text="C-2. If respondent is a Student:" />
          <FieldRow label="Name" value={data.respondentStudent.name} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Date of Birth" value={data.respondentStudent.dateOfBirth} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Age" value={data.respondentStudent.age} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Sex" value={data.respondentStudent.sex} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Gr./Yr and Section" value={data.respondentStudent.gradeYearSection} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Adviser" value={data.respondentStudent.adviser} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Mother's Info" value={data.respondentStudent.motherInfo} labelWidth={LABEL_WIDTH} />
          <FieldRow label="Father's Info" value={data.respondentStudent.fatherInfo} labelWidth={LABEL_WIDTH} />
        </View>

        <HorizontalRule />

        {/* ==== SECTION II: DETAILS OF THE CASE ==== */}
        <SectionTitle number="II" title="Details of the Case" />
        <CaseDetailsBlock text={data.caseDetails} blankLineCount={10} />

        <HorizontalRule />

        {/* ==== SECTION III: ACTION TAKEN ==== */}
        <View break>
          <SectionTitle number="III" title="Action Taken" />
          <NumberedBlankLines count={4} values={data.actionsTaken} />

          <HorizontalRule />

          {/* ==== SECTION IV: RECOMMENDATIONS ==== */}
          <SectionTitle number="IV" title="Recommendations" />
          <NumberedBlankLines count={3} values={data.recommendations} />

          <Spacer height={20} />

          {/* ==== SIGN-OFF ==== */}
          <View wrap={false}>
            <SignatureBlock
              preparedBy={data.preparedBy}
              designation={data.designation}
              date={data.date}
            />
          </View>
        </View>
      </Page>
    </Document>
  );
}
