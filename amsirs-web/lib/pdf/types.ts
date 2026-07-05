/**
 * Shared PDF type definitions for AMSIRS document generation.
 * This module provides consistent typing across all PDF documents.
 */

// ==========================================
// Intake Sheet Data Model
// ==========================================

export interface VictimInfo {
  name: string;
  dateOfBirth: string;
  age: string;
  sex: string;
  gradeYearSection: string;
  adviser: string;
  motherInfo: string;   // "Name, Age, and Occupation"
  fatherInfo: string;   // "Name, Age, and Occupation"
  addressContact: string;
}

export interface ComplainantInfo {
  name: string;
  relationshipToVictim: string;
  addressContact: string;
}

export interface RespondentPersonnelInfo {
  name: string;
  dateOfBirth: string;
  age: string;
  sex: string;
  designation: string;
  addressContact: string;
}

export interface RespondentStudentInfo {
  name: string;
  dateOfBirth: string;
  age: string;
  sex: string;
  gradeYearSection: string;
  adviser: string;
  motherInfo: string;   // "Name, Age, Occupation, and Address/Contact Number"
  fatherInfo: string;   // "Name, Age, Occupation, and Address/Contact Number"
}

export interface IntakeSheetData {
  // Section I-A: Victim
  victim: VictimInfo;

  // Section I-B: Complainant
  complainant: ComplainantInfo;

  // Section I-C-1: Respondent (School Personnel)
  respondentPersonnel: RespondentPersonnelInfo;

  // Section I-C-2: Respondent (Student)
  respondentStudent: RespondentStudentInfo;

  // Section II: Details of the Case
  caseDetails: string;

  // Section III: Action Taken (up to 4 items)
  actionsTaken: [string, string, string, string];

  // Section IV: Recommendations (up to 3 items)
  recommendations: [string, string, string];

  // Sign-off
  preparedBy: string;
  designation: string;
  date: string;
}

// ==========================================
// Pre-fill Data (from server action)
// ==========================================

/** Data returned by the server action to pre-populate the modal */
export interface IntakeSheetPrefill {
  victim: Partial<VictimInfo>;
  respondentStudent: Partial<RespondentStudentInfo>;
  caseDetails: string;
  date: string;
}

// ==========================================
// Utility: Create empty intake sheet
// ==========================================

export function createEmptyIntakeSheet(): IntakeSheetData {
  return {
    victim: {
      name: '',
      dateOfBirth: '',
      age: '',
      sex: '',
      gradeYearSection: '',
      adviser: '',
      motherInfo: '',
      fatherInfo: '',
      addressContact: '',
    },
    complainant: {
      name: '',
      relationshipToVictim: '',
      addressContact: '',
    },
    respondentPersonnel: {
      name: '',
      dateOfBirth: '',
      age: '',
      sex: '',
      designation: '',
      addressContact: '',
    },
    respondentStudent: {
      name: '',
      dateOfBirth: '',
      age: '',
      sex: '',
      gradeYearSection: '',
      adviser: '',
      motherInfo: '',
      fatherInfo: '',
    },
    caseDetails: '',
    actionsTaken: ['', '', '', ''],
    recommendations: ['', '', ''],
    preparedBy: '',
    designation: '',
    date: new Date().toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  };
}
