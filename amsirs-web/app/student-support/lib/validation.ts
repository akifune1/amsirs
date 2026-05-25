/**
 * Validation schemas for Student Support module
 * Uses runtime validation without external dependencies
 */

import { ValidationError } from './errors';

// ==========================================
// Validation Schemas
// ==========================================

export interface InterventionInput {
  student_id: string;
  intervention_type: string;
  notes: string;
  follow_up_date: string;
}

export interface UpdateCaseStatusInput {
  case_status: string;
}

export interface FlaggedStudentsFilterInput {
  risk_level?: 'Low' | 'Medium' | 'High';
  search?: string;
  page?: number;
  limit?: number;
  filter_type?: 'all' | 'attendance' | 'behavior';
}

// ==========================================
// Validator Functions
// ==========================================

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function validateInterventionType(type: string): boolean {
  const validTypes = [
    'Initial Counseling',
    'Follow-up Session',
    'Crisis Intervention',
    'Academic Support',
    'Behavioral Intervention',
    'Parent Conference',
    'Referral to External Services',
  ];
  return validTypes.includes(type);
}

export function validateCaseStatus(status: string): boolean {
  const validStatuses = ['Active', 'Pending Review', 'Resolved', 'Escalated'];
  return validStatuses.includes(status);
}

export function validateDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export function validateFutureDate(dateString: string): boolean {
  if (!validateDate(dateString)) return false;
  const date = new Date(dateString);
  return date > new Date();
}

/**
 * Validate intervention creation input
 */
export function validateInterventionInput(input: Partial<InterventionInput>): AssertionError | null {
  if (!input.student_id) {
    throw new ValidationError('student_id is required');
  }

  if (!validateUUID(input.student_id)) {
    throw new ValidationError('student_id must be a valid UUID');
  }

  if (!input.intervention_type) {
    throw new ValidationError('intervention_type is required');
  }

  if (!validateInterventionType(input.intervention_type)) {
    throw new ValidationError(`intervention_type must be one of: Initial Counseling, Follow-up Session, Crisis Intervention, Academic Support, Behavioral Intervention, Parent Conference, Referral to External Services`);
  }

  if (!input.notes) {
    throw new ValidationError('notes is required');
  }

  if (typeof input.notes !== 'string' || input.notes.trim().length === 0) {
    throw new ValidationError('notes must be a non-empty string');
  }

  if (input.notes.length > 5000) {
    throw new ValidationError('notes cannot exceed 5000 characters');
  }

  if (!input.follow_up_date) {
    throw new ValidationError('follow_up_date is required');
  }

  if (!validateFutureDate(input.follow_up_date)) {
    throw new ValidationError('follow_up_date must be a valid future date');
  }

  return null;
}

/**
 * Validate case status update input
 */
export function validateUpdateCaseStatusInput(input: Partial<UpdateCaseStatusInput>): void {
  if (!input.case_status) {
    throw new ValidationError('case_status is required');
  }

  if (!validateCaseStatus(input.case_status)) {
    throw new ValidationError('case_status must be one of: Active, Pending Review, Resolved, Escalated');
  }
}

/**
 * Validate pagination parameters
 */
export function validatePaginationParams(page?: number, limit?: number): { page: number; limit: number } {
  let pageNum = page || 1;
  let limitNum = limit || 10;

  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 10;
  if (limitNum > 100) limitNum = 100;

  return { page: pageNum, limit: limitNum };
}

/**
 * Validate filter type
 */
export function validateFilterType(type?: string): 'all' | 'attendance' | 'behavior' {
  const validTypes = ['all', 'attendance', 'behavior'];
  return validTypes.includes(type as string) ? (type as 'all' | 'attendance' | 'behavior') : 'all';
}
