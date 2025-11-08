// src/app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CandidateDetail');

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await db
      .from('candidates')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { success: false, error: 'Candidate not found' },
        { status: 404 }
      );
    }

    // Update last_viewed_at
    await db
      .from('candidates')
      .update({ last_viewed_at: new Date().toISOString() })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    logger.error('Get candidate error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch candidate' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const updates = await request.json();

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.created_at;
    delete updates.updated_at;

    const { data, error } = await db
      .from('candidates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Update candidate error', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update candidate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    logger.error('Update candidate error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update candidate' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Soft delete
    const { error } = await db
      .from('candidates')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error('Delete candidate error', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete candidate' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Candidate deleted successfully'
    });

  } catch (error: any) {
    logger.error('Delete candidate error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete candidate' },
      { status: 500 }
    );
  }
}

// src/app/api/candidates/insights/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(request: NextRequest) {
  try {
    const { candidate } = await request.json();

    if (!candidate) {
      return NextResponse.json(
        { success: false, error: 'Candidate data required' },
        { status: 400 }
      );
    }

    const prompt = `Analyze this candidate profile and provide insights:

CANDIDATE PROFILE:
Name: ${candidate.name}
Title: ${candidate.title || 'Not specified'}
Experience: ${candidate.years_of_experience} years
Skills: ${candidate.skills?.join(', ') || 'None listed'}
Recent Position: ${candidate.experience?.[0]?.title || 'N/A'} at ${candidate.experience?.[0]?.company || 'N/A'}
Education: ${candidate.education?.map((e: any) => `${e.degree} from ${e.institution}`).join('; ') || 'Not specified'}

Provide a comprehensive analysis in JSON format:
{
  "strength_summary": "2-3 sentence overview of candidate's key strengths",
  "career_trajectory": "Assessment of career progression and growth",
  "best_fit_roles": ["role1", "role2", "role3"] (3-5 roles this candidate would excel in),
  "skill_highlights": ["highlight1", "highlight2", "highlight3"] (top 3-5 standout skills/experiences),
  "growth_areas": ["area1", "area2"] (areas for potential development),
  "interview_focus_areas": ["question_area1", "question_area2", "question_area3"] (3 areas to probe in interviews)
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1000
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No AI response');
    }

    const insights = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error: any) {
    logger.error('AI insights error', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}