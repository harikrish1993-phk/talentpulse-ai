import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CandidateInsights');
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

    const prompt = `Analyze this candidate profile and provide comprehensive career insights:

CANDIDATE PROFILE:
Name: ${candidate.name}
Title: ${candidate.title || 'Not specified'}
Experience: ${candidate.years_of_experience} years
Skills: ${candidate.skills?.join(', ') || 'None listed'}
Summary: ${candidate.summary || 'Not provided'}
Recent Position: ${candidate.experience?.[0]?.title || 'N/A'} at ${candidate.experience?.[0]?.company || 'N/A'}
Education: ${candidate.education?.map((e: any) => `${e.degree} from ${e.institution}`).join('; ') || 'Not specified'}

Provide insights in JSON:
{
  "strength_summary": "2-3 sentence overview of key strengths",
  "career_trajectory": "Assessment of career progression",
  "best_fit_roles": ["role1", "role2", "role3"],
  "skill_highlights": ["highlight1", "highlight2", "highlight3"],
  "growth_areas": ["area1", "area2"],
  "interview_focus_areas": ["area1", "area2", "area3"]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 1500
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No AI response');

    const insights = JSON.parse(content);

    return NextResponse.json({
      success: true,
      data: insights
    });

  } catch (error: any) {
    logger.error('Insights generation failed', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}