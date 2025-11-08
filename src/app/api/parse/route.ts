// src/app/api/parse/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/ai/parser';
import { saveCandidate } from '@/lib/db/candidates';
import { extractText } from '@/lib/fileExtractor';
import { detectResumeAuthenticity } from '@/lib/ai/fraud-detector';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ParseRoute');

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = file.name;
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const validExtensions = ['pdf', 'docx', 'txt'];
    
    if (!validExtensions.includes(fileExt)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Use PDF, DOCX, or TXT' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Extract text from file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let text: string;
    try {
      text = await extractText(buffer, fileExt);
    } catch (extractError: any) {
      logger.error('Text extraction failed', extractError);
      return NextResponse.json(
        { success: false, error: `Failed to extract text: ${extractError.message}` },
        { status: 400 }
      );
    }

    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { success: false, error: 'Extracted text is too short or empty' },
        { status: 400 }
      );
    }

    // Parse with AI
    const parseResult = await parseResume(text, fileName);
    
    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json(
        { 
          success: false, 
          error: parseResult.error || 'Failed to parse resume',
          details: 'AI parsing failed. Please ensure the resume has clear structure.'
        },
        { status: 500 }
      );
    }

    // ✅ FIXED: Run authenticity check
    let authenticityReport;
    try {
      authenticityReport = await detectResumeAuthenticity(
        text,
        parseResult.data
      );
      
      // ✅ FIXED: Add authenticity data to candidate
      parseResult.data = {
        ...parseResult.data,
        authenticity_score: authenticityReport.overallScore,
        authenticity_risk: authenticityReport.riskLevel,
        authenticity_report: JSON.stringify(authenticityReport),
        authenticity_checked_at: new Date().toISOString()
      };
    } catch (authError) {
      logger.error('Authenticity check failed', authError);
      // Continue without authenticity data
      parseResult.data = {
        ...parseResult.data,
        authenticity_score: null,
        authenticity_risk: null,
        authenticity_report: null,
        authenticity_checked_at: null
      };
    }

    // Save to database
    const saveResult = await saveCandidate(parseResult.data);
    
    if (!saveResult.success || !saveResult.data) {
      logger.error('Failed to save candidate', saveResult.error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save candidate to database',
          details: saveResult.error 
        },
        { status: 500 }
      );
    }

    logger.info('Candidate parsed and saved successfully', {
      id: saveResult.data.id,
      name: saveResult.data.name,
      confidence: saveResult.data.parse_confidence
    });

    return NextResponse.json({
      success: true,
      data: saveResult.data,
      authenticity: authenticityReport ? {
        score: authenticityReport.overallScore,
        riskLevel: authenticityReport.riskLevel,
        topIssues: authenticityReport.redFlags.slice(0, 3).map(f => f.flag)
      } : undefined,
      metadata: {
        fileName,
        fileSize: file.size,
        confidence: parseResult.data.parse_confidence,
        method: parseResult.data.parse_method,
        processingTime: parseResult.metadata?.duration_ms
      }
    });

  } catch (error: any) {
    logger.error('Parse route error', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error during parsing',
        details: error.message 
      },
      { status: 500 }
    );
  }
}