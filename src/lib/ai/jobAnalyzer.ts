// ============================================
// FILE: src/lib/ai/jobAnalyzer.ts
// Advanced Job Description Analyzer
// ============================================

import OpenAI from 'openai';
import { JobAnalysis, ApiResponse } from '../types';
import { config } from '../config';
import { createLogger } from '../logger';

const logger = createLogger('JobAnalyzer');
const openai = new OpenAI({ apiKey: config.ai.openai.apiKey });

const JOB_ANALYSIS_PROMPT = `You are an expert HR analyst. Analyze this job description and extract structured requirements.

RULES:
1. Return ONLY valid JSON
2. Extract ALL requirements comprehensively
3. Identify must-have vs nice-to-have requirements
4. Determine appropriate seniority level
5. Extract both hard and soft skills

REQUIRED JSON SCHEMA:
{
  "title": "string (job title)",
  "required_skills": ["string"] (must-have technical skills),
  "preferred_skills": ["string"] (nice-to-have skills),
  "min_experience": number (minimum years),
  "max_experience": number (maximum years, if specified),
  "education_level": "string | null (e.g., 'Bachelor's Degree', 'Master's Degree')",
  "location_type": "remote" | "hybrid" | "onsite" | "any",
  "locations": ["string"] (cities/regions if specified),
  "seniority_level": "intern" | "junior" | "mid" | "senior" | "lead" | "executive",
  "industry": "string | null",
  "key_responsibilities": ["string"] (main duties),
  "must_have_requirements": ["string"] (absolute requirements/deal-breakers),
  "nice_to_have": ["string"] (preferred but not required),
  "deal_breakers": ["string"] (things that would disqualify a candidate)
}

GUIDELINES:
- For seniority: intern (0-1yr), junior (1-3yrs), mid (3-5yrs), senior (5-8yrs), lead (8+yrs), executive (12+yrs)
- Extract BOTH technical skills (e.g., "Python", "AWS") and domain skills (e.g., "project management")
- Identify implicit requirements (e.g., if "lead team", add "leadership" to skills)
- Be conservative with deal-breakers - only absolute must-haves`;

export async function analyzeJobDescription(
  description: string
): Promise<ApiResponse<JobAnalysis>> {
  const startTime = Date.now();

  try {
    logger.info('Analyzing job description', { length: description.length });

    if (!description || description.length < 100) {
      return {
        success: false,
        error: 'Job description too short (minimum 100 characters)',
      };
    }

    const response = await openai.chat.completions.create({
      model: config.ai.openai.model,
      messages: [
        {
          role: 'system',
          content: JOB_ANALYSIS_PROMPT,
        },
        {
          role: 'user',
          content: `Job Description:\n\n${description.substring(0, 8000)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    const parsed = JSON.parse(content);
    
    // Validate and normalize
    const analysis: JobAnalysis = {
      title: parsed.title || 'Unknown Position',
      required_skills: Array.isArray(parsed.required_skills) ? parsed.required_skills : [],
      preferred_skills: Array.isArray(parsed.preferred_skills) ? parsed.preferred_skills : [],
      min_experience: Math.max(0, parsed.min_experience || 0),
      max_experience: parsed.max_experience || parsed.min_experience + 5,
      education_level: parsed.education_level,
      location_type: parsed.location_type || 'any',
      locations: Array.isArray(parsed.locations) ? parsed.locations : [],
      seniority_level: parsed.seniority_level || inferSeniorityFromExperience(parsed.min_experience),
      industry: parsed.industry,
      key_responsibilities: Array.isArray(parsed.key_responsibilities) ? parsed.key_responsibilities : [],
      must_have_requirements: Array.isArray(parsed.must_have_requirements) ? parsed.must_have_requirements : [],
      nice_to_have: Array.isArray(parsed.nice_to_have) ? parsed.nice_to_have : [],
      deal_breakers: Array.isArray(parsed.deal_breakers) ? parsed.deal_breakers : [],
    };

    const processingTime = Date.now() - startTime;

    logger.info('Job analysis successful', {
      title: analysis.title,
      requiredSkills: analysis.required_skills.length,
      processingTime,
    });

    return {
      success: true,
      data: analysis,
      metadata: {
        timestamp: new Date().toISOString(),
        duration_ms: processingTime,
        tokens_used: response.usage?.total_tokens,
      },
    };
  } catch (error: any) {
    logger.error('Job analysis failed', error);
    
    return {
      success: false,
      error: error.message || 'Failed to analyze job description',
    };
  }
}

function inferSeniorityFromExperience(years: number): string {
  if (years === 0) return 'intern';
  if (years <= 2) return 'junior';
  if (years <= 5) return 'mid';
  if (years <= 8) return 'senior';
  if (years <= 12) return 'lead';
  return 'executive';
}
