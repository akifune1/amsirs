import { NextRequest, NextResponse } from 'next/server';
import { updateCaseStatus } from '@/app/student-support/actions';

/**
 * PATCH /api/student-support/interventions/[id]
 * 
 * Update the case status of an intervention
 * 
 * Route Parameters:
 * - id: string (UUID of the intervention)
 * 
 * Request Body:
 * {
 *   case_status: string (one of: Active, Pending Review, Resolved, Escalated)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   error?: { code, message, statusCode }
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: interventionId } = await params;

    if (!interventionId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Intervention ID is required',
            statusCode: 400,
          },
        },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { case_status } = body;

    // Call server action
    const result = await updateCaseStatus(interventionId, case_status);

    // Return response
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('[PATCH /api/student-support/interventions/[id]]', error);

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
