import { NextRequest, NextResponse } from 'next/server';
import { createIntervention } from '@/app/student-support/actions';

/**
 * POST /api/student-support/interventions
 * 
 * Create a new counseling intervention for a student
 * 
 * Request Body:
 * {
 *   student_id: string (UUID)
 *   intervention_type: string (one of: Initial Counseling, Follow-up Session, Crystal Intervention, etc.)
 *   notes: string (max 5000 chars)
 *   follow_up_date: string (ISO date, must be in future)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data?: { interventionId: string },
 *   error?: { code, message, statusCode }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { student_id, intervention_type, notes, follow_up_date } = body;

    // Validate input
    if (!student_id || !intervention_type || !notes || !follow_up_date) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: student_id, intervention_type, notes, follow_up_date',
        },
        { status: 400 }
      );
    }

    // Call server action
    const result = await createIntervention(
      student_id,
      intervention_type,
      notes,
      follow_up_date
    );

    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 201 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('[POST /api/student-support/interventions]', error);

    const statusCode = error instanceof SyntaxError ? 400 : 500;
    const message = error instanceof SyntaxError
      ? 'Invalid JSON in request body'
      : error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: statusCode }
    );
  }
}
