import { NextRequest, NextResponse } from 'next/server';
import { getStudentCaseDetails } from '@/app/student-support/actions';

/**
 * GET /api/student-support/history/[studentId]
 * 
 * Fetch comprehensive support history for a student including:
 * - Attendance summary (absences, lates)
 * - Recent incident records
 * - Counseling history
 * - Current risk level
 * 
 * Route Parameters:
 * - studentId: string (UUID of the student)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: StudentCaseDetails,
 *   error?: { code, message, statusCode }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Student ID is required',
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Call server action
    const result = await getStudentCaseDetails(studentId);

    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('[GET /api/student-support/history/[studentId]]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
