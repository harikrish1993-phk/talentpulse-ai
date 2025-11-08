// src/lib/ai/config.ts - FIXED VERSION
// src/lib/ai/config.ts - PRODUCTION AI STRATEGY
// ============================================
// CRITICAL: Defines AI provider strategy, costs, and fallbacks
// ============================================

export interface AIProvider {
    name: string;
    model: string;
    costPer1kTokens: number; // USD
    maxTokens: number;
    temperature: number;
    strengths: string[];
    useCase: 'parsing' | 'analysis' | 'matching' | 'all';
  }
  
  // ============================================
  // RECOMMENDED AI PROVIDER STRATEGY
  // ============================================
  
  export const AI_PROVIDERS: Record<string, AIProvider> = {
    // PRIMARY: OpenAI GPT-4 Turbo (Best for Resume Parsing)
    // ✅ Highest accuracy for structured data extraction
    // ✅ Best JSON adherence
    // ✅ Handles complex formatting
    // ⚠️ Cost: $0.01 input / $0.03 output per 1K tokens
    openai_gpt4_turbo: {
      name: 'OpenAI GPT-4 Turbo',
      model: 'gpt-4-turbo-preview',
      costPer1kTokens: 0.02, // Average
      maxTokens: 4096,
      temperature: 0.1,
      strengths: ['structured_extraction', 'json_output', 'resume_parsing'],
      useCase: 'parsing'
    },
  
    // SECONDARY: OpenAI GPT-3.5 Turbo (Fast & Cheap for Job Analysis)
    // ✅ 10x cheaper than GPT-4
    // ✅ Fast response times
    // ✅ Good for job description analysis
    // ⚠️ Cost: $0.0005 input / $0.0015 output per 1K tokens
    openai_gpt3_turbo: {
      name: 'OpenAI GPT-3.5 Turbo',
      model: 'gpt-3.5-turbo-0125',
      costPer1kTokens: 0.001,
      maxTokens: 4096,
      temperature: 0.2,
      strengths: ['speed', 'cost_effective', 'job_analysis'],
      useCase: 'analysis'
    },
  
    // ALTERNATIVE: Anthropic Claude 3 Opus (Premium Quality)
    // ✅ Excellent reasoning
    // ✅ Better at nuanced understanding
    // ⚠️ Cost: $0.015 input / $0.075 output per 1K tokens
    // ⚠️ Requires separate API key
    anthropic_opus: {
      name: 'Anthropic Claude 3 Opus',
      model: 'claude-3-opus-20240229',
      costPer1kTokens: 0.045, // Average
      maxTokens: 4096,
      temperature: 0.1,
      strengths: ['reasoning', 'context_understanding', 'matching'],
      useCase: 'matching'
    },
  
    // FALLBACK: OpenAI GPT-3.5 (Emergency Only)
    fallback: {
      name: 'Fallback',
      model: 'gpt-3.5-turbo',
      costPer1kTokens: 0.001,
      maxTokens: 2048,
      temperature: 0.3,
      strengths: ['availability'],
      useCase: 'all'
    }
  };
  
  // ============================================
  // PRODUCTION STRATEGY
  // ============================================
  
  export const AI_STRATEGY = {
    // Resume Parsing: Use best model for accuracy
    resumeParsing: {
      primary: 'openai_gpt4_turbo',      // 95%+ accuracy
      fallback: ['openai_gpt3_turbo', 'anthropic_opus', 'regex'], // If primary fails
      validationRequired: true,          // CRITICAL: Validate output
      minConfidence: 70,                 // Reject below this
      maxRetries: 2
    },
  
    // Job Analysis: Use cheaper model, good enough
    jobAnalysis: {
      primary: 'openai_gpt3_turbo',      // Fast & accurate enough
      fallback: ['openai_gpt4_turbo'],   // If extraction fails
      validationRequired: true,
      minConfidence: 75
    },
  
    // Matching Algorithm: Hybrid approach
    matching: {
      useAI: false,                      // Start with rule-based for speed
      aiEnhanced: true,                  // Use AI for explanations only
      provider: 'openai_gpt3_turbo',     // Cheap for summaries
      fallback: ['rule_based']           // Always have non-AI fallback
    },
  
    // Cost Management
    costLimits: {
      maxCostPerParse: 0.05,             // USD - Reject expensive parses
      maxCostPerMatch: 0.02,             // USD
      dailyBudget: 10.00,                // USD - Total daily limit
      alertThreshold: 8.00               // USD - Send warning
    },
  
    // Performance Targets
    performance: {
      maxParseTime: 10000,               // ms - 10 seconds max
      maxAnalysisTime: 5000,             // ms - 5 seconds max
      maxMatchTime: 3000,                // ms - 3 seconds max
      timeoutRetry: true
    }
  };
  
  // ============================================
  // VALIDATION SCHEMAS (CRITICAL!)
  // ============================================
  
  export const VALIDATION_RULES = {
    // Resume Parse Output MUST have:
    resumeParse: {
      required: ['name', 'skills', 'experience'],
      minSkills: 3,                      // At least 3 skills
      minExperience: 0,                  // Can be 0 for fresh grads
      namePattern: /^[A-Z][a-z]+ [A-Z]/  // First Last name format
    },
  
    // Job Analysis Output MUST have:
    jobAnalysis: {
      required: ['title', 'required_skills', 'min_experience'],
      minRequiredSkills: 3,              // At least 3 must-have skills
      minExperience: 0,
      maxExperience: 50                  // Sanity check
    },
  
    // Match Output MUST have:
    matchResult: {
      required: ['overall_score', 'explanation', 'tier'],
      scoreRange: [0, 100],
      validTiers: ['A', 'B', 'C', 'D']
    }
  };
  
  // ============================================
  // COST TRACKING
  // ============================================
  
  export interface CostTracker {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
    provider: string;
    timestamp: Date;
  }
  
  export function calculateCost(
    provider: string,
    inputTokens: number,
    outputTokens: number
  ): CostTracker {
    const config = AI_PROVIDERS[provider];
    
    // OpenAI pricing (different for input/output)
    let cost = 0;
    if (provider.includes('openai_gpt4')) {
      cost = (inputTokens / 1000) * 0.01 + (outputTokens / 1000) * 0.03;
    } else if (provider.includes('openai_gpt3')) {
      cost = (inputTokens / 1000) * 0.0005 + (outputTokens / 1000) * 0.0015;
    } else if (provider.includes('anthropic')) {
      cost = (inputTokens / 1000) * 0.015 + (outputTokens / 1000) * 0.075;
    } else {
      cost = ((inputTokens + outputTokens) / 1000) * config.costPer1kTokens;
    }
  
    return {
      totalTokens: inputTokens + outputTokens,
      inputTokens,
      outputTokens,
      estimatedCost: Number(cost.toFixed(4)),
      provider,
      timestamp: new Date()
    };
  }
  
  // ============================================
  // VALIDATION FUNCTIONS
  // ============================================
  
  export function validateResumeParseOutput(output: any): {
    valid: boolean;
    confidence: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let confidence = 100;
  
    // Check required fields
    if (!output.name || output.name.length < 2) {
      errors.push('Missing or invalid name');
      confidence -= 30;
    }
  
    if (!output.skills || !Array.isArray(output.skills) || output.skills.length < 3) {
      errors.push('Insufficient skills extracted (need at least 3)');
      confidence -= 20;
    }
  
    if (!output.experience || !Array.isArray(output.experience)) {
      errors.push('Missing experience array');
      confidence -= 15;
    }
  
    // Validate name format
    if (output.name && !/^[A-Z][a-z]+\s+[A-Z]/.test(output.name)) {
      errors.push('Name format suspicious (expected: First Last)');
      confidence -= 10;
    }
  
    // Check for placeholder values
    if (output.name?.toLowerCase().includes('unknown') || 
        output.name?.toLowerCase().includes('candidate')) {
      errors.push('Name appears to be placeholder');
      confidence -= 20;
    }
  
    return {
      valid: errors.length === 0 && confidence >= 70,
      confidence: Math.max(0, confidence),
      errors
    };
  }
  
  export function validateJobAnalysisOutput(output: any): {
    valid: boolean;
    confidence: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let confidence = 100;
  
    if (!output.title || output.title.length < 3) {
      errors.push('Missing or invalid job title');
      confidence -= 30;
    }
  
    if (!output.required_skills || output.required_skills.length < 3) {
      errors.push('Insufficient required skills (need at least 3)');
      confidence -= 25;
    }
  
    if (output.min_experience === undefined || output.min_experience < 0) {
      errors.push('Invalid minimum experience');
      confidence -= 15;
    }
  
    return {
      valid: errors.length === 0 && confidence >= 75,
      confidence: Math.max(0, confidence),
      errors
    };
  }
  
  // ============================================
  // HUMAN-LIKE CONFIRMATION (USER FACING)
  // ============================================
  
  export function generateConfidenceReport(
    parseResult: any,
    validationResult: any
  ): string {
    const { valid, confidence, errors } = validationResult;
  
    if (confidence >= 90) {
      return `✅ **Excellent Quality** (${confidence}%)\n\nAI successfully extracted all key information with high accuracy. This resume is ready for matching.`;
    }
    
    if (confidence >= 75) {
      return `✓ **Good Quality** (${confidence}%)\n\nAI extracted most information accurately. Minor details may need review:\n${errors.map((e: string) => `• ${e}`).join('\n')}`;
    }
    
    if (confidence >= 60) {
      return `⚠️ **Acceptable Quality** (${confidence}%)\n\nAI had some difficulty with this resume. Please review:\n${errors.map((e: string) => `• ${e}`).join('\n')}\n\nConsider re-uploading as a cleaner PDF or DOCX file.`;
    }
    
    return `❌ **Low Quality** (${confidence}%)\n\nAI could not reliably extract information from this resume:\n${errors.map((e: string) => `• ${e}`).join('\n')}\n\n**Action Required:** This resume needs manual review or a better quality file.`;
  }
  
  // ============================================
  // EXPORT RECOMMENDATION
  // ============================================
  
  export const RECOMMENDED_SETUP = {
    message: `
  🎯 **Recommended AI Setup for TalentPlus**
  
  **For Best Results:**
  
  1️⃣ **Resume Parsing** → OpenAI GPT-4 Turbo
     - Highest accuracy (95%+ success rate)
     - Cost: ~$0.01-0.03 per resume
     - Expected: $3-5 for 100 resumes
  
  2️⃣ **Job Analysis** → OpenAI GPT-3.5 Turbo
     - Fast & accurate enough (90%+ success)
     - Cost: ~$0.001 per job description
     - Expected: $0.10 for 100 jobs
  
  3️⃣ **Matching** → Rule-based + AI Explanations
     - Fast rule-based scoring (free)
     - AI-generated explanations (GPT-3.5)
     - Cost: ~$0.001 per match
     - Expected: $1 for 1000 matches
  
  📊 **Monthly Budget Estimate:**
     - 500 resumes: ~$15-25
     - 100 jobs: ~$0.10
     - 5000 matches: ~$5
     - **Total: ~$20-30/month**
  
  💡 **Cost Optimization:**
     - Use GPT-3.5 for bulk operations
     - Cache job analyses (don't re-analyze)
     - Batch process when possible
     - Set daily budget limits ($10/day recommended)
    `
  };