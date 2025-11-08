// src/app/api/webhook/ats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/ai/parser';
import { saveCandidate } from '@/lib/db/candidates';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ATSWebhook');

// Optional: secure with shared secret
const WEBHOOK_SECRET = process.env.ATS_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Optional auth
    if (WEBHOOK_SECRET) {
      const authHeader = request.headers.get('x-webhook-secret');
      if (authHeader !== WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await request.json();

    // Expected format: { resume_text: string, file_name?: string, source?: string }
    const { resume_text, file_name = 'ats-resume.txt', source = 'ats' } = body;

    if (!resume_text || typeof resume_text !== 'string') {
      return NextResponse.json({ error: 'resume_text is required' }, { status: 400 });
    }

    const parseResult = await parseResume(resume_text, file_name);
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({ error: parseResult.error || 'Parse failed' }, { status: 400 });
    }

    // Override source
    const candidateToSave = { ...parseResult.data, source };

    const saveResult = await saveCandidate(candidateToSave);
    if (!saveResult.success) {
      return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
    if (!saveResult.data) {
      return NextResponse.json({ error: 'Failed to save candidate' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      candidate_id: saveResult.data.id,
      message: 'Candidate added from ATS'
    });
  } catch (error: any) {
    logger.error('ATS webhook error', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}