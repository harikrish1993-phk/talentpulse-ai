// src/lib/ai/fraud-detector.ts
// ============================================
// DETECTS AI-GENERATED/MANIPULATED RESUMES
// ============================================

import OpenAI from 'openai';
import { createLogger } from '../logger';

const logger = createLogger('FraudDetector');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// ============================================
// AI AUTHENTICITY ANALYSIS
// ============================================

export interface AuthenticityReport {
  overallScore: number; // 0-100 (100 = genuine, 0 = likely fake)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  
  // Detection signals
  signals: {
    aiGeneratedProbability: number; // 0-100%
    overOptimization: number; // Too perfect keyword matching
    genericLanguage: number; // Generic AI phrases
    inconsistencies: number; // Logic errors in timeline
    verificationIssues: string[]; // Things that need checking
  };
  
  // Red flags
  redFlags: {
    flag: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }[];
  
  // Green flags (signs of authenticity)
  greenFlags: string[];
  
  // Recommended actions
  recommendations: {
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  
  // Interview questions to verify authenticity
  verificationQuestions: string[];
}

// ============================================
// FRAUD DETECTION ALGORITHM
// ============================================

export async function detectResumeAuthenticity(
  resumeText: string,
  candidateData: any,
  jobDescription?: string
): Promise<AuthenticityReport> {
  
  logger.info('Starting authenticity analysis');
  
  const signals = {
    aiGeneratedProbability: 0,
    overOptimization: 0,
    genericLanguage: 0,
    inconsistencies: 0,
    verificationIssues: [] as string[]
  };
  
  const redFlags: AuthenticityReport['redFlags'] = [];
  const greenFlags: string[] = [];
  const verificationQuestions: string[] = [];
  
  // ============================================
  // SIGNAL 1: AI-Generated Language Detection
  // ============================================
  
  const aiPhrases = [
    'results-driven professional',
    'proven track record',
    'extensive experience in',
    'strong communication skills',
    'team player',
    'detail-oriented',
    'self-motivated',
    'fast-paced environment',
    'exceeded expectations',
    'spearheaded initiatives',
    'synergy',
    'leverage',
    'stakeholders',
    'proactive approach'
  ];
  
  const aiPhraseCount = aiPhrases.filter(phrase => 
    resumeText.toLowerCase().includes(phrase.toLowerCase())
  ).length;
  
  if (aiPhraseCount > 5) {
    signals.genericLanguage = Math.min(100, aiPhraseCount * 10);
    redFlags.push({
      flag: 'Generic AI Language',
      severity: aiPhraseCount > 10 ? 'high' : 'medium',
      explanation: `Resume contains ${aiPhraseCount} generic AI phrases commonly used by ChatGPT`
    });
  } else if (aiPhraseCount === 0) {
    greenFlags.push('Uses specific, personal language instead of generic phrases');
  }
  
  // ============================================
  // SIGNAL 2: Job Description Over-Matching
  // ============================================
  
  if (jobDescription && candidateData.skills) {
    const jobWords = jobDescription.toLowerCase().split(/\s+/);
    const resumeWords = resumeText.toLowerCase().split(/\s+/);
    
    // Count how many job keywords appear in resume
    const matchingKeywords = jobWords.filter(word => 
      word.length > 4 && resumeWords.includes(word)
    );
    
    const matchRate = (matchingKeywords.length / jobWords.length) * 100;
    
    if (matchRate > 80) {
      signals.overOptimization = matchRate;
      redFlags.push({
        flag: 'Suspiciously High Keyword Match',
        severity: 'high',
        explanation: `Resume matches ${Math.round(matchRate)}% of job keywords - likely tailored with AI`
      });
      
      verificationQuestions.push(
        'Can you describe a specific project where you used these technologies together?',
        'What challenges did you face when working with [specific skill]?',
        'How did you learn [recently added skill]?'
      );
    }
  }
  
  // ============================================
  // SIGNAL 3: Timeline Consistency Check
  // ============================================
  
  if (candidateData.experience && Array.isArray(candidateData.experience)) {
    const experiences = candidateData.experience;
    
    // Check for overlapping dates
    for (let i = 0; i < experiences.length - 1; i++) {
      const current = experiences[i];
      const next = experiences[i + 1];
      
      if (current.start_date && next.start_date) {
        const currentStart = new Date(current.start_date);
        const nextStart = new Date(next.start_date);
        
        // Check if dates make sense
        if (currentStart > nextStart) {
          signals.inconsistencies += 20;
          redFlags.push({
            flag: 'Timeline Inconsistency',
            severity: 'medium',
            explanation: `Work history at ${current.company} starts after ${next.company}`
          });
        }
      }
      
      // Check for unrealistic durations
      if (current.start_date && current.end_date && current.end_date !== 'Present') {
        const start = new Date(current.start_date);
        const end = new Date(current.end_date);
        const months = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
        
        if (months < 2) {
          signals.verificationIssues.push(`Very short tenure at ${current.company} (${Math.round(months)} months)`);
        }
      }
    }
    
    // Check total experience vs claimed years
    const totalMonths = experiences.reduce((sum: number, exp: any) => {
      if (!exp.start_date || !exp.end_date) return sum;
      const start = new Date(exp.start_date);
      const end = exp.end_date === 'Present' ? new Date() : new Date(exp.end_date);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    }, 0);
    
    const calculatedYears = Math.floor(totalMonths / 12);
    const claimedYears = candidateData.years_of_experience || 0;
    
    if (Math.abs(calculatedYears - claimedYears) > 2) {
      signals.inconsistencies += 30;
      redFlags.push({
        flag: 'Experience Mismatch',
        severity: 'high',
        explanation: `Claims ${claimedYears} years but timeline shows ${calculatedYears} years`
      });
    } else {
      greenFlags.push('Work history timeline is consistent');
    }
  }
  
  // ============================================
  // SIGNAL 4: Skills Depth Analysis (via AI)
  // ============================================
  
  const skillsDepthPrompt = `Analyze this resume for AUTHENTIC technical depth vs superficial knowledge:

RESUME:
${resumeText.substring(0, 4000)}

CLAIMED SKILLS:
${candidateData.skills?.join(', ')}

Check for:
1. Specific versions/tools mentioned (e.g., "React 18" vs just "React")
2. Concrete metrics and results
3. Technical details that require actual experience
4. Project descriptions with real complexity

Return JSON:
{
  "hasSpecificDetails": boolean,
  "hasConcreteMetrics": boolean,
  "technicalDepth": "superficial" | "moderate" | "deep",
  "suspiciousPatterns": ["pattern1", "pattern2"],
  "authenticityScore": 0-100
}`;

  try {
    const aiAnalysis = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: skillsDepthPrompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
      max_tokens: 1000
    });
    
    const analysis = JSON.parse(aiAnalysis.choices[0].message.content || '{}');
    
    if (analysis.technicalDepth === 'superficial') {
      signals.aiGeneratedProbability += 40;
      redFlags.push({
        flag: 'Lacks Technical Depth',
        severity: 'high',
        explanation: 'Resume mentions skills but lacks specific details that demonstrate real experience'
      });
      
      verificationQuestions.push(
        'Walk me through the architecture of your most complex project',
        'What specific challenges did you solve that required [claimed skill]?',
        'Explain a technical decision you made and why'
      );
    }
    
    if (!analysis.hasConcreteMetrics) {
      signals.aiGeneratedProbability += 20;
      redFlags.push({
        flag: 'No Quantifiable Results',
        severity: 'medium',
        explanation: 'Resume lacks specific metrics or measurable achievements'
      });
    } else {
      greenFlags.push('Includes specific, quantifiable achievements');
    }
    
    if (analysis.suspiciousPatterns.length > 0) {
      analysis.suspiciousPatterns.forEach((pattern: string) => {
        redFlags.push({
          flag: 'Suspicious Pattern',
          severity: 'medium',
          explanation: pattern
        });
      });
    }
    
  } catch (error) {
    logger.error('AI skills analysis failed', error);
  }
  
  // ============================================
  // SIGNAL 5: Contact Info Verification
  // ============================================
  
  if (!candidateData.email || !candidateData.phone) {
    signals.verificationIssues.push('Missing contact information');
  }
  
  if (candidateData.email) {
    const disposableEmailDomains = ['tempmail', 'guerrillamail', 'mailinator', '10minutemail'];
    const emailDomain = candidateData.email.split('@')[1]?.toLowerCase();
    
    if (disposableEmailDomains.some(domain => emailDomain?.includes(domain))) {
      redFlags.push({
        flag: 'Disposable Email',
        severity: 'high',
        explanation: 'Using temporary email service - red flag for authenticity'
      });
    }
  }
  
  // ============================================
  // SIGNAL 6: LinkedIn/GitHub Cross-Check
  // ============================================
  
  const hasLinkedIn = resumeText.toLowerCase().includes('linkedin.com');
  const hasGitHub = resumeText.toLowerCase().includes('github.com');
  const hasPortfolio = resumeText.toLowerCase().includes('portfolio') || 
                       resumeText.toLowerCase().includes('website');
  
  if (!hasLinkedIn && !hasGitHub && !hasPortfolio) {
    signals.verificationIssues.push('No online presence (LinkedIn/GitHub/Portfolio)');
    redFlags.push({
      flag: 'No Digital Footprint',
      severity: 'medium',
      explanation: 'No LinkedIn, GitHub, or portfolio links - harder to verify'
    });
  } else {
    greenFlags.push('Provides online profiles for verification');
  }
  
  // ============================================
  // CALCULATE OVERALL AUTHENTICITY SCORE
  // ============================================
  
  let overallScore = 100;
  
  // Deduct for red flags
  redFlags.forEach(flag => {
    if (flag.severity === 'high') overallScore -= 20;
    else if (flag.severity === 'medium') overallScore -= 10;
    else overallScore -= 5;
  });
  
  // Deduct for high AI signals
  overallScore -= signals.aiGeneratedProbability * 0.3;
  overallScore -= signals.overOptimization * 0.2;
  overallScore -= signals.genericLanguage * 0.2;
  overallScore -= signals.inconsistencies * 0.3;
  
  // Bonus for green flags
  overallScore += greenFlags.length * 5;
  
  overallScore = Math.max(0, Math.min(100, overallScore));
  
  // Determine risk level
  let riskLevel: AuthenticityReport['riskLevel'];
  if (overallScore >= 75) riskLevel = 'LOW';
  else if (overallScore >= 50) riskLevel = 'MEDIUM';
  else if (overallScore >= 25) riskLevel = 'HIGH';
  else riskLevel = 'CRITICAL';
  
  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================
  
  const recommendations: AuthenticityReport['recommendations'] = [];
  
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendations.push({
      action: '🚨 REQUIRE TECHNICAL SCREENING TEST before interview',
      priority: 'high'
    });
    
    recommendations.push({
      action: '📞 Verify employment history with previous employers',
      priority: 'high'
    });
  }
  
  if (signals.aiGeneratedProbability > 60) {
    recommendations.push({
      action: '💡 Ask for GitHub contributions or code samples',
      priority: 'high'
    });
  }
  
  if (signals.overOptimization > 80) {
    recommendations.push({
      action: '🔍 Request original version of resume (before tailoring)',
      priority: 'medium'
    });
  }
  
  if (!hasLinkedIn) {
    recommendations.push({
      action: '🔗 Request LinkedIn profile for background verification',
      priority: 'medium'
    });
  }
  
  recommendations.push({
    action: '✅ Use behavioral interview questions to verify real experience',
    priority: 'high'
  });
  
  // ============================================
  // RETURN COMPREHENSIVE REPORT
  // ============================================
  
  logger.info('Authenticity analysis complete', {
    overallScore,
    riskLevel,
    redFlagsCount: redFlags.length
  });
  
  return {
    overallScore: Math.round(overallScore),
    riskLevel,
    signals,
    redFlags,
    greenFlags,
    recommendations,
    verificationQuestions
  };
}

// ============================================
// QUICK CHECK FUNCTION (FOR UI)
// ============================================

export async function quickAuthenticityCheck(
  candidateData: any
): Promise<{
  score: number;
  riskLevel: string;
  topIssues: string[];
}> {
  const report = await detectResumeAuthenticity(
    candidateData.raw_text || '',
    candidateData
  );
  
  return {
    score: report.overallScore,
    riskLevel: report.riskLevel,
    topIssues: report.redFlags
      .slice(0, 3)
      .map(flag => flag.flag)
  };
}