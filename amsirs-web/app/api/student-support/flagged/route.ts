import { NextRequest, NextResponse } from 'next/server';
import {
  getFlaggedStudents as getFlaggedStudentsAction,
} from '@/app/student-support/actions';

/**
 * GET /api/student-support/flagged
 * 
 * Fetch flagged (at-risk) students with optional filtering and pagination
 * 
 * Query Parameters:
 * - risk_level: 'Low' | 'Medium' | 'High' (optional)
 * - filter_type: 'all' | 'attendance' | 'behavior' (optional, default: 'all')
 * - search: string to search by name (optional)
 * - page: number (optional, default: 1)
 * - limit: number per page (optional, default: 10, max: 100)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: StudentRecord[],
 *   error?: { code, message, statusCode }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Call server action
    const result = await getFlaggedStudentsAction();

    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('[GET /api/student-support/flagged]', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
