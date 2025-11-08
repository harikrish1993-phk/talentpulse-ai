// src/lib/ai/parser.ts - PRODUCTION VERSION WITH VALIDATION
// ============================================
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Candidate, ApiResponse } from '../types';
import { createLogger } from '../logger';
import { validateResumeParse, createValidationSummary } from './validator';
import { AI_PROVIDERS, AI_STRATEGY, calculateCost } from './config';
const logger = createLogger('ProductionParser');
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY!,
  maxRetries: 2,
  timeout: 30000 // 30 second timeout
});
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ 
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxRetries: 1 
    })
  : null;
// ============================================
// PARSING PROMPT (PRODUCTION VERSION)
// ============================================
const PARSING_PROMPT = `You are an expert resume parser for a recruitment tool. Extract ALL information with maximum accuracy.
CRITICAL RULES:
1. Return ONLY valid JSON - no markdown, no explanations
2. Extract name EXACTLY as written - DO NOT invent or use "Unknown"
3. Extract ALL skills mentioned anywhere in resume
4. Include complete work history with exact job titles
5. If information is missing, use null (not placeholder text)
6. Be thorough - this data is used for job matching
REQUIRED JSON SCHEMA:
{
  "name": "string (EXACTLY as written on resume - REQUIRED)",
  "email": "string | null (exact format from resume)",
  "phone": "string | null (with country code if present)",
  "location": "string | null (city, state, country)",
  "title": "string | null (current/most recent job title)",
  "summary": "string (2-3 sentence professional summary)",
  "years_of_experience": number (total years - calculate from dates),
  "skills": ["string"] (ALL technical + soft skills - minimum 5),
  "experience": [
    {
      "title": "string (exact job title)",
      "company": "string (exact company name)",
      "location": "string | null",
      "start_date": "string (YYYY-MM format)",
      "end_date": "string | null (YYYY-MM or 'Present')",
      "duration": "string (e.g. '2 years 3 months')",
      "description": "string | null (brief description)",
      "achievements": ["string"] (quantified results),
      "skills_used": ["string"] (technologies used in this role)
    }
  ],
  "education": [
    {
      "degree": "string (e.g. 'Bachelor of Science in Computer Science')",
      "field_of_study": "string | null",
      "institution": "string (exact university name)",
      "location": "string | null",
      "start_year": "string | null (YYYY)",
      "end_year": "string | null (YYYY or 'Present')",
      "gpa": "string | null (e.g. '3.8/4.0')",
      "achievements": ["string"] (honors, awards, dean's list)
    }
  ],
  "certifications": [
    {
      "name": "string (full certification name)",
      "issuer": "string (issuing organization)",
      "issue_date": "string | null (YYYY-MM)",
      "expiry_date": "string | null (YYYY-MM)",
      "credential_id": "string | null",
      "credential_url": "string | null"
    }
  ],
  "languages": ["string"] (e.g. "English (Native)", "Spanish (Fluent)")
}
CRITICAL EXTRACTION RULES:
- Name: MUST be extracted - it's always at the top or in header
- Skills: Look in "Skills" section AND throughout experience descriptions
- Experience: Extract ALL jobs, internships, projects
- Dates: Convert all date formats to YYYY-MM (e.g. "Jan 2020" → "2020-01")
- Years of Experience: Calculate from work history dates (sum all durations)
- Achievements: Focus on quantifiable results (e.g. "Increased X by 40%")
QUALITY CHECKS:
- Name should be 2+ words (First Last)
- Skills should be 5+ items (if resume has any quality)
- At least 1 experience entry (unless fresh graduate)
- Email and/or phone should be present`;
// ============================================
// MAIN PARSE FUNCTION (WITH VALIDATION)
// ============================================
export async function parseResume(
  text: string,
  fileName: string
): Promise<ApiResponse<Omit<Candidate, 'id' | 'created_at' | 'updated_at'>>> {
  logger.info('Starting production parse', { 
    fileName, 
    textLength: text.length 
  });
  // Pre-validation
  if (!text || text.length < 50) {
    return {
      success: false,
      error: 'Resume text too short (minimum 50 characters required)'
    };
  }
  // Try parsing with fallback chain
  const strategy = AI_STRATEGY.resumeParsing;
  let bestResult: any = null;
  let bestValidation: any = null;
  for (const provider of [strategy.primary, ...strategy.fallback]) {
    if (provider === 'regex') {
      // Skip regex for now - use AI
      continue;
    }
    try {
      logger.info(`Attempting parse with ${provider}`);
      let result: any;
      if (provider === 'openai_gpt4_turbo') {
        result = await parseWithOpenAI(text, fileName, 'gpt-4-turbo-preview');
      } else if (provider === 'openai_gpt3_turbo') {
        result = await parseWithOpenAI(text, fileName, 'gpt-3.5-turbo-0125');
      } else if (provider === 'anthropic_opus' && anthropic) {
        result = await parseWithAnthropic(text, fileName);
      } else {
        continue;
      }
      if (!result.success || !result.candidate) {
        logger.warn(`Parse failed with ${provider}`, result.error);
        continue;
      }
      // ===== CRITICAL: VALIDATE OUTPUT =====
      const validation = validateResumeParse(text, result.candidate);
      logger.info(`Validation result for ${provider}`, {
        valid: validation.valid,
        confidence: validation.confidence,
        errors: validation.errors.length
      });
      // Keep track of best result
      if (!bestResult || validation.confidence > bestValidation.confidence) {
        bestResult = result;
        bestValidation = validation;
      }
      // If we got a good result, stop trying
      if (validation.valid && validation.confidence >= strategy.minConfidence) {
        logger.info(`Accepted result from ${provider}`, {
          confidence: validation.confidence
        });
        // Create validation summary for user
        const summary = createValidationSummary(validation, 'resume');
        return {
          success: true,
          data: {
            ...result.candidate,
            parse_confidence: validation.confidence,
            parse_status: summary.requiresReview ? 'needs_review' : 'completed',
            authenticity_score: null,
            authenticity_risk: null,
            authenticity_report: null,
            authenticity_checked_at: null
          },
          metadata: {
            validation: summary,
            provider,
            timestamp: new Date().toISOString(),
            duration_ms: result.processingTime,
            tokens_used: result.tokensUsed
          }
        };
      }
    } catch (error: any) {
      logger.error(`Parser ${provider} crashed`, error);
      continue;
    }
  }
  // If we got here, no provider met quality threshold
  if (bestResult && bestValidation) {
    const summary = createValidationSummary(bestValidation, 'resume');
    // Return best result with warning
    return {
      success: true,
      data: {
        ...bestResult.candidate,
        parse_confidence: bestValidation.confidence,
        parse_status: 'needs_review',
        authenticity_score: null,
        authenticity_risk: null,
        authenticity_report: null,
        authenticity_checked_at: null
      },
      metadata: {
        validation: summary,
        warning: 'Parse quality below optimal threshold - manual review recommended'
      }
    };
  }
  // Total failure
  return {
    success: false,
    error: 'All parsing methods failed. Please ensure resume is text-based (not scanned) and try again.'
  };
}
// ============================================
// OPENAI PARSER
// ============================================
async function parseWithOpenAI(
  text: string,
  fileName: string,
  model: string
): Promise<any> {
  const startTime = Date.now();
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: PARSING_PROMPT
        },
        {
          role: 'user',
          content: `Resume File: ${fileName}
Resume Text:
${text.substring(0, 14000)}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 4096
    });
    const processingTime = Date.now() - startTime;
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }
    const parsed = JSON.parse(content);
    // Basic validation
    if (!parsed.name) {
      throw new Error('No name extracted');
    }
    // Calculate cost
    const cost = calculateCost(
      model.includes('gpt-4') ? 'openai_gpt4_turbo' : 'openai_gpt3_turbo',
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0
    );
    logger.info('OpenAI parse completed', {
      model,
      cost: cost.estimatedCost,
      tokens: cost.totalTokens
    });
    const candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'> = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      location: parsed.location,
      title: parsed.title,
      summary: parsed.summary || '',
      years_of_experience: parsed.years_of_experience || 0,
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      education: parsed.education || [],
      certifications: parsed.certifications || [],
      languages: parsed.languages || [],
      raw_text: text,
      file_name: fileName,
      file_type: fileName.split('.').pop()?.toLowerCase(),
      file_size: text.length,
      parse_confidence: 0, // Will be set by validation
      parse_method: `openai-${model}`,
      parse_status: 'processing',
      parse_attempts: 1,
      source: 'upload',
      authenticity_score: null,
      authenticity_risk: null,
      authenticity_report: null,
      authenticity_checked_at: null
    };
    return {
      success: true,
      candidate,
      processingTime,
      tokensUsed: cost.totalTokens,
      cost: cost.estimatedCost
    };
  } catch (error: any) {
    logger.error('OpenAI parse failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}
// ============================================
// ANTHROPIC PARSER (FALLBACK)
// ============================================
async function parseWithAnthropic(
  text: string,
  fileName: string
): Promise<any> {
  if (!anthropic) {
    return {
      success: false,
      error: 'Anthropic not configured'
    };
  }
  const startTime = Date.now();
  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4096,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `${PARSING_PROMPT}
Resume File: ${fileName}
Resume Text:
${text.substring(0, 14000)}`
        }
      ]
    });
    const processingTime = Date.now() - startTime;
    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }
    // Extract JSON from response
    let jsonText = content.text;
    const jsonMatch = jsonText.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    const parsed = JSON.parse(jsonText);
    if (!parsed.name) {
      throw new Error('No name extracted');
    }
    const cost = calculateCost(
      'anthropic_opus',
      message.usage.input_tokens,
      message.usage.output_tokens
    );
    const candidate: Omit<Candidate, 'id' | 'created_at' | 'updated_at'> = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      location: parsed.location,
      title: parsed.title,
      summary: parsed.summary || '',
      years_of_experience: parsed.years_of_experience || 0,
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      education: parsed.education || [],
      certifications: parsed.certifications || [],
      languages: parsed.languages || [],
      raw_text: text,
      file_name: fileName,
      file_type: fileName.split('.').pop()?.toLowerCase(),
      file_size: text.length,
      parse_confidence: 0,
      parse_method: 'anthropic-opus',
      parse_status: 'processing',
      parse_attempts: 1,
      source: 'upload',
      authenticity_score: null,
      authenticity_risk: null,
      authenticity_report: null,
      authenticity_checked_at: null
    };
    return {
      success: true,
      candidate,
      processingTime,
      tokensUsed: cost.totalTokens,
      cost: cost.estimatedCost
    };
  } catch (error: any) {
    logger.error('Anthropic parse failed', error);
    return {
      success: false,
      error: error.message
    };
  }
}