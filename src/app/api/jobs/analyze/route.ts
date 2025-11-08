import { NextRequest, NextResponse } from 'next/server';
import { analyzeJobDescription } from '@/lib/ai/jobAnalyzer';
import { createLogger } from '@/lib/logger';

const logger = createLogger('JobsAnalyze');

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    // Validation
    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Description is required' },
        { status: 400 }
      );
    }

    if (description.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Description too short (minimum 100 characters)' },
        { status: 400 }
      );
    }

    // ✅ CRITICAL FIX: Proper return logic
    const result = await analyzeJobDescription(description);

    if (!result.success || !result.data) {
      logger.error('Job analysis failed', result.error);
      return NextResponse.json(
        { success: false, error: result.error || 'Analysis failed' },
        { status: 500 }
      );
    }

    // ✅ Return success properly
    return NextResponse.json({
      success: true,
      data: result.data,
      metadata: result.metadata
    });

  } catch (error: any) {
    logger.error('Jobs analyze error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}