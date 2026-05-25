# Student Support Backend - Code Examples

Complete working examples for common operations.

---

## Example 1: Fetch Flagged Students (Component)

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getFlaggedStudents } from '@/app/student-support/actions';
import type { StudentRecord } from '@/app/student-support/types';

export function FlaggedStudentsList() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    riskLevel: undefined as string | undefined,
    filterType: 'all',
    search: '',
    page: 1,
  });

  useEffect(() => {
    loadStudents();
  }, [filters]);

  async function loadStudents() {
    setLoading(true);
    try {
      const result = await getFlaggedStudents(
        filters.riskLevel,
        filters.filterType,
        filters.search,
        filters.page,
        10
      );

      if (result.success) {
        setStudents(result.data);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to load students');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filters.riskLevel || ''}
          onChange={(e) =>
            setFilters({ ...filters, riskLevel: e.target.value || undefined, page: 1 })
          }
        >
          <option value="">All Risk Levels</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={filters.filterType}
          onChange={(e) =>
            setFilters({ ...filters, filterType: e.target.value, page: 1 })
          }
        >
          <option value="all">All Concerns</option>
          <option value="attendance">Attendance</option>
          <option value="behavior">Behavior</option>
        </select>

        <input
          type="text"
          placeholder="Search by name..."
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value, page: 1 })
          }
        />
      </div>

      {/* Loading/Error States */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      {/* Students List */}
      {!loading && students.length > 0 && (
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Grade</th>
              <th>Risk Level</th>
              <th>Absences (7d)</th>
              <th>Incidents (30d)</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.gradeSection}</td>
                <td>
                  <span className={`badge badge-${student.riskLevel.toLowerCase()}`}>
                    {student.riskLevel}
                  </span>
                </td>
                <td>{student.absenceCount}</td>
                <td>{student.incidentCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && students.length === 0 && (
        <div>No flagged students found.</div>
      )}
    </div>
  );
}
```

---

## Example 2: Create Intervention (Form + API)

```typescript
'use client';

import { useState } from 'react';
import { createIntervention } from '@/app/student-support/actions';
import type { InterventionType } from '@/app/student-support/types';

interface CreateInterventionFormProps {
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export function CreateInterventionForm({
  studentId,
  studentName,
  onSuccess,
}: CreateInterventionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    interventionType: 'Initial Counseling' as InterventionType,
    notes: '',
    followUpDate: '',
  });

  const interventionTypes: InterventionType[] = [
    'Initial Counseling',
    'Follow-up Session',
    'Crisis Intervention',
    'Academic Support',
    'Behavioral Intervention',
    'Parent Conference',
    'Referral to External Services',
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.notes.trim()) {
        throw new Error('Notes are required');
      }
      if (!formData.followUpDate) {
        throw new Error('Follow-up date is required');
      }

      // Check if date is in future
      if (new Date(formData.followUpDate) < new Date()) {
        throw new Error('Follow-up date must be in the future');
      }

      const result = await createIntervention(
        studentId,
        formData.interventionType,
        formData.notes,
        formData.followUpDate
      );

      if (result.success) {
        setFormData({
          interventionType: 'Initial Counseling',
          notes: '',
          followUpDate: '',
        });
        onSuccess();
      } else {
        setError(result.error?.message || 'Failed to create intervention');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Create Intervention for {studentName}</h3>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label>Intervention Type *</label>
        <select
          value={formData.interventionType}
          onChange={(e) =>
            setFormData({
              ...formData,
              interventionType: e.target.value as InterventionType,
            })
          }
        >
          {interventionTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Notes * (max 5000 characters)</label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData({
              ...formData,
              notes: e.target.value.slice(0, 5000),
            })
          }
          placeholder="Detailed notes from the counseling session..."
          rows={6}
        />
        <small>{formData.notes.length}/5000</small>
      </div>

      <div>
        <label>Follow-up Date *</label>
        <input
          type="date"
          value={formData.followUpDate}
          onChange={(e) =>
            setFormData({ ...formData, followUpDate: e.target.value })
          }
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Intervention'}
      </button>
    </form>
  );
}
```

---

## Example 3: Update Case Status (Modal)

```typescript
'use client';

import { useState } from 'react';
import { updateCaseStatus } from '@/app/student-support/actions';
import type { CaseStatus } from '@/app/student-support/types';

interface UpdateCaseStatusModalProps {
  interventionId: string;
  currentStatus: CaseStatus;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UpdateCaseStatusModal({
  interventionId,
  currentStatus,
  isOpen,
  onClose,
  onSuccess,
}: UpdateCaseStatusModalProps) {
  const [newStatus, setNewStatus] = useState<CaseStatus>(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statuses: CaseStatus[] = ['Active', 'Pending Review', 'Resolved', 'Escalated'];

  async function handleUpdate() {
    setLoading(true);
    setError(null);

    try {
      const result = await updateCaseStatus(interventionId, newStatus);

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error?.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Update Case Status</h2>

        {error && (
          <div className="alert alert-error">{error}</div>
        )}

        <div className="form-group">
          <label>New Status</label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <label key={status} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={status}
                  checked={newStatus === status}
                  onChange={(e) => setNewStatus(e.target.value as CaseStatus)}
                  disabled={loading}
                />
                <span>{status}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Example 4: Student Case Details (View Details)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { getStudentCaseDetails } from '@/app/student-support/actions';
import type { StudentCaseDetails } from '@/app/student-support/types';

interface StudentCaseDetailsViewProps {
  studentId: string;
}

export function StudentCaseDetailsView({ studentId }: StudentCaseDetailsViewProps) {
  const [details, setDetails] = useState<StudentCaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDetails();
  }, [studentId]);

  async function loadDetails() {
    try {
      const result = await getStudentCaseDetails(studentId);
      if (result.success) {
        setDetails(result.data);
      } else {
        setError(result.error?.message || 'Failed to load details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!details) return <div>No data found</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold">{details.studentName}</h1>
        <p className="text-gray-600">Student ID: {details.studentId}</p>
        <p className="text-gray-600">Grade: {details.gradeSection}</p>
      </div>

      {/* Risk Level */}
      <div className="card">
        <h2 className="text-lg font-semibold">Current Status</h2>
        <div className="mt-3">
          <span className={`badge badge-${details.riskLevel.toLowerCase()}`}>
            {details.riskLevel} Risk
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Guardian Contact: {details.guardianContact}
        </p>
      </div>

      {/* Attendance Stats */}
      <div className="card">
        <h2 className="text-lg font-semibold">Attendance Summary</h2>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div className="text-2xl font-bold">{details.attendanceStats.totalAbsences}</div>
            <div className="text-sm text-gray-600">Total Absences</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{details.attendanceStats.lateRecords}</div>
            <div className="text-sm text-gray-600">Late Records</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{details.attendanceStats.attendancePercentage}%</div>
            <div className="text-sm text-gray-600">Attendance Rate</div>
          </div>
        </div>
      </div>

      {/* Recent Incidents */}
      <div className="card">
        <h2 className="text-lg font-semibold">Recent Incidents</h2>
        {details.recentIncidents.length > 0 ? (
          <div className="space-y-3 mt-4">
            {details.recentIncidents.map((incident) => (
              <div key={incident.id} className="border-l-4 border-orange-500 pl-3">
                <p className="font-semibold">{incident.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(incident.date).toLocaleDateString()} · {incident.reporter}
                </p>
                <span className={`badge badge-${incident.severity.toLowerCase()}`}>
                  {incident.severity}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No incidents recorded</p>
        )}
      </div>

      {/* Counseling History */}
      <div className="card">
        <h2 className="text-lg font-semibold">Counseling History</h2>
        {details.counselingHistory.length > 0 ? (
          <div className="space-y-4 mt-4">
            {details.counselingHistory.map((record, idx) => (
              <div key={idx} className="border rounded p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{record.type}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString()} · {record.counselor}
                    </p>
                  </div>
                  <span className={`badge badge-${record.caseStatus?.toLowerCase()}`}>
                    {record.caseStatus}
                  </span>
                </div>
                <p className="text-sm mt-2">{record.notes}</p>
                {record.followUpDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Follow-up: {new Date(record.followUpDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No counseling sessions recorded</p>
        )}
      </div>
    </div>
  );
}
```

---

## Example 5: API Client Hook

```typescript
'use client';

import { useCallback, useState } from 'react';
import type { StudentRecord } from '@/app/student-support/types';

interface UseApiOptions {
  autoFetch?: boolean;
}

export function useFlaggedStudents(options: UseApiOptions = {}) {
  const [data, setData] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  const fetch = useCallback(
    async (
      riskLevel?: string,
      filterType?: string,
      search?: string,
      page: number = 1,
      limit: number = 10
    ) => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (riskLevel) params.append('risk_level', riskLevel);
        if (filterType) params.append('filter_type', filterType);
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await fetch(`/api/student-support/flagged?${params}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error.message);
        }

        setData(result.data);
        setPagination({ page, limit, total: result.data.length });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, error, pagination, fetch };
}

// Usage:
// const { data, loading, fetch } = useFlaggedStudents();
// useEffect(() => fetch('High', 'all', '', 1, 10), []);
```

---

## Example 6: Error Boundary

```typescript
'use client';

import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class StudentSupportErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('[StudentSupport Error]', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-lg font-semibold text-red-800">
            Error Loading Student Support Module
          </h2>
          <p className="text-red-600 mt-2">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## Example 7: Server Action with Revalidation

```typescript
// app/student-support/actions-with-revalidation.ts
'use server';

import { createIntervention as baseCreateIntervention } from './actions';
import { revalidatePath } from 'next/cache';

export async function createInterventionWithRevalidation(
  studentId: string,
  interventionType: string,
  notes: string,
  followUpDate: string
) {
  const result = await baseCreateIntervention(
    studentId,
    interventionType,
    notes,
    followUpDate
  );

  if (result.success) {
    // Revalidate affected pages
    revalidatePath('/student-support');
    revalidatePath(`/student-support/student/${studentId}`);
  }

  return result;
}
```

---

## Example 8: Toast Notification Integration

```typescript
'use client';

import { useState } from 'react';
import { createIntervention } from '@/app/student-support/actions';
import { useToast } from '@/app/hooks/useToast'; // Your toast provider

export function CreateInterventionWithToast({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleCreate(data: {
    interventionType: string;
    notes: string;
    followUpDate: string;
  }) {
    setLoading(true);
    try {
      const result = await createIntervention(
        studentId,
        data.interventionType,
        data.notes,
        data.followUpDate
      );

      if (result.success) {
        showToast(
          `Intervention created for ${studentName}`,
          'success'
        );
      } else {
        showToast(result.error?.message || 'Failed to create intervention', 'error');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Unknown error',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }

  return <div>{/* form component */}</div>;
}
```

These examples cover the most common use cases. Adapt them to your specific UI framework and styling preferences.
