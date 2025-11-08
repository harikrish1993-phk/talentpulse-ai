// src/app/api/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractText } from '@/lib/fileExtractor';
import { parseResume } from '@/lib/ai/parser';
import { saveCandidate } from '@/lib/db/candidates';
import { createLogger } from '@/lib/logger';

const logger = createLogger('BulkUpload');

export const maxDuration = 300; // 5 minutes for bulk

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files uploaded' }, { status: 400 });
    }

    if (files.length > 50) {
      return NextResponse.json({ success: false, error: 'Max 50 files allowed' }, { status: 400 });
    }

    const results = [];
    let successCount = 0;

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (!['pdf', 'docx', 'txt'].includes(fileExt || '')) {
          results.push({ file: file.name, status: 'error', error: 'Unsupported file type' });
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          results.push({ file: file.name, status: 'error', error: 'File too large' });
          continue;
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const text = await extractText(buffer, fileExt!);

        if (!text || text.length < 50) {
          results.push({ file: file.name, status: 'error', error: 'Could not extract text' });
          continue;
        }

        const parseResult = await parseResume(text, file.name);
        if (!parseResult.success || !parseResult.data) {
          results.push({ file: file.name, status: 'error', error: parseResult.error || 'Parse failed' });
          continue;
        }

        const saveResult = await saveCandidate(parseResult.data);
        if (!saveResult.success) {
          results.push({ file: file.name, status: 'error', error: 'Save failed' });
          continue;
        }

        results.push({ file: file.name, status: 'success', candidate: saveResult.data });
        successCount++;
      } catch (err: any) {
        logger.error(`Bulk upload error for ${file.name}`, err);
        results.push({ file: file.name, status: 'error', error: err.message || 'Unknown error' });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: files.length,
        succeeded: successCount,
        failed: files.length - successCount,
        results
      }
    });
  } catch (error: any) {
    logger.error('Bulk upload failed', error);
    return NextResponse.json({ success: false, error: 'Bulk upload failed' }, { status: 500 });
  }
}