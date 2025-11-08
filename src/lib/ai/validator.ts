// src/lib/ai/validator.ts - CRITICAL QUALITY ASSURANCE
// ============================================
// This file ensures AI outputs are ACTUALLY correct
// ============================================

import { createLogger } from '../logger';
import { Candidate, JobAnalysis } from '../types';

const logger = createLogger('AIValidator');

// ============================================
// RESUME PARSE VALIDATION
// ============================================

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateResumeParse(
  rawText: string,
  parsedData: Partial<Candidate>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let confidence = 100;

  // ============================================
  // CRITICAL CHECKS (Must Pass)
  // ============================================

  // 1. Name Validation
  if (!parsedData.name || parsedData.name.length < 2) {
    errors.push('❌ CRITICAL: No name extracted');
    confidence -= 40;
  } else {
    // Check if name is realistic
    if (parsedData.name.toLowerCase().includes('unknown')) {
      errors.push('❌ CRITICAL: Name is placeholder ("Unknown")');
      confidence -= 30;
    }
    
    // Check name format (should have at least first and last)
    if (!/\s/.test(parsedData.name)) {
      warnings.push('⚠️ Name might be incomplete (missing last name?)');
      confidence -= 10;
    }

    // Verify name appears in raw text
    if (!rawText.toLowerCase().includes(parsedData.name.toLowerCase())) {
      errors.push('❌ CRITICAL: Extracted name not found in resume text');
      confidence -= 25;
    }
  }

  // 2. Skills Validation
  if (!parsedData.skills || parsedData.skills.length < 3) {
    errors.push('❌ CRITICAL: Insufficient skills extracted (minimum 3 required)');
    confidence -= 30;
  } else {
    // Check if skills are realistic (not gibberish)
    const suspiciousSkills = parsedData.skills.filter(skill => 
      skill.length < 2 || 
      skill.length > 50 || 
      !/^[a-zA-Z0-9\s\.\-\+\#]+$/.test(skill)
    );
    
    if (suspiciousSkills.length > 0) {
      warnings.push(`⚠️ Suspicious skills detected: ${suspiciousSkills.slice(0, 3).join(', ')}`);
      confidence -= 10;
    }

    // Check if ANY skill appears in raw text
    const verifiedSkills = parsedData.skills.filter(skill => 
      rawText.toLowerCase().includes(skill.toLowerCase())
    );
    
    if (verifiedSkills.length < parsedData.skills.length * 0.5) {
      warnings.push(`⚠️ Only ${verifiedSkills.length}/${parsedData.skills.length} skills verified in text`);
      confidence -= 15;
    }
  }

  // 3. Experience Validation
  if (!parsedData.experience || parsedData.experience.length === 0) {
    warnings.push('⚠️ No work experience extracted');
    confidence -= 15;
  } else {
    // Check each experience entry
    parsedData.experience.forEach((exp: any, index: number) => {
      if (!exp.title || exp.title.length < 2) {
        warnings.push(`⚠️ Experience #${index + 1}: Missing job title`);
        confidence -= 5;
      }
      
      if (!exp.company || exp.company.length < 2) {
        warnings.push(`⚠️ Experience #${index + 1}: Missing company name`);
        confidence -= 5;
      }

      // Check dates
      if (!exp.start_date) {
        warnings.push(`⚠️ Experience #${index + 1}: Missing start date`);
        confidence -= 3;
      }
    });
  }

  // 4. Contact Information Validation
  if (!parsedData.email && !parsedData.phone) {
    warnings.push('⚠️ No contact information extracted (email or phone)');
    confidence -= 10;
    suggestions.push('💡 Consider asking candidate to add contact info to resume');
  }

  // Email format validation
  if (parsedData.email && !isValidEmail(parsedData.email)) {
    errors.push('❌ CRITICAL: Invalid email format extracted');
    confidence -= 15;
  }

  // 5. Education Validation
  if (!parsedData.education || parsedData.education.length === 0) {
    warnings.push('⚠️ No education extracted');
    confidence -= 10;
  }

  // 6. Experience Years Validation
  if (parsedData.years_of_experience !== undefined) {
    if (parsedData.years_of_experience < 0 || parsedData.years_of_experience > 50) {
      errors.push(`❌ CRITICAL: Invalid years of experience (${parsedData.years_of_experience})`);
      confidence -= 20;
    }
  }

  // ============================================
  // CROSS-VALIDATION (AI vs Raw Text)
  // ============================================

  // Check if raw text is suspiciously short
  if (rawText.length < 100) {
    errors.push('❌ CRITICAL: Resume text too short (< 100 characters)');
    confidence -= 30;
  }

  // Check if AI extracted reasonable amount of data
  const totalDataPoints = 
    (parsedData.skills?.length || 0) +
    (parsedData.experience?.length || 0) +
    (parsedData.education?.length || 0) +
    (parsedData.certifications?.length || 0);
  
  if (totalDataPoints < 5) {
    warnings.push('⚠️ Very little data extracted - resume may be poorly formatted');
    confidence -= 15;
    suggestions.push('💡 Try uploading as a different format (PDF → DOCX or vice versa)');
  }

  // ============================================
  // FINAL VALIDATION DECISION
  // ============================================

  // Calculate final confidence
  confidence = Math.max(0, Math.min(100, confidence));
  
  // Determine if valid
  const valid = errors.length === 0 && confidence >= 70;

  // Generate suggestions based on issues
  if (!valid) {
    if (errors.some(e => e.includes('name'))) {
      suggestions.push('💡 Ensure resume has clear name at the top');
    }
    if (errors.some(e => e.includes('skills'))) {
      suggestions.push('💡 Add a "Skills" section with clear technical abilities');
    }
    if (confidence < 60) {
      suggestions.push('💡 Try re-exporting resume as a clean PDF from Word/Google Docs');
      suggestions.push('💡 Remove images, complex formatting, or tables');
    }
  }

  logger.info('Resume parse validation', {
    valid,
    confidence,
    errorsCount: errors.length,
    warningsCount: warnings.length
  });

  return {
    valid,
    confidence,
    errors,
    warnings,
    suggestions
  };
}

// ============================================
// JOB DESCRIPTION VALIDATION
// ============================================

export function validateJobAnalysis(
  jobText: string,
  analysis: Partial<JobAnalysis>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let confidence = 100;

  // 1. Title Validation
  if (!analysis.title || analysis.title.length < 3) {
    errors.push('❌ CRITICAL: No job title extracted');
    confidence -= 40;
  }

  // 2. Required Skills Validation
  if (!analysis.required_skills || analysis.required_skills.length < 3) {
    errors.push('❌ CRITICAL: Too few required skills extracted (minimum 3)');
    confidence -= 30;
    suggestions.push('💡 Add a clear "Requirements" or "Qualifications" section');
  } else {
    // Verify skills appear in job text
    const verifiedSkills = analysis.required_skills.filter(skill =>
      jobText.toLowerCase().includes(skill.toLowerCase())
    );
    
    if (verifiedSkills.length < analysis.required_skills.length * 0.7) {
      warnings.push('⚠️ Some extracted skills not clearly stated in job description');
      confidence -= 15;
    }
  }

  // 3. Experience Validation
  if (analysis.min_experience === undefined || analysis.min_experience < 0) {
    warnings.push('⚠️ No minimum experience requirement found');
    confidence -= 10;
  }

  if (analysis.min_experience !== undefined && analysis.min_experience > 30) {
    errors.push(`❌ CRITICAL: Unrealistic experience requirement (${analysis.min_experience} years)`);
    confidence -= 20;
  }

  // 4. Location Validation
  if (!analysis.location_type) {
    warnings.push('⚠️ Location type not specified (remote/hybrid/onsite)');
    confidence -= 5;
  }

  // 5. Seniority Level Validation
  if (!analysis.seniority_level) {
    warnings.push('⚠️ Seniority level not determined');
    confidence -= 5;
  }

  // Check text length
  if (jobText.length < 100) {
    errors.push('❌ CRITICAL: Job description too short (< 100 characters)');
    confidence -= 30;
  }

  confidence = Math.max(0, Math.min(100, confidence));
  const valid = errors.length === 0 && confidence >= 75;

  if (!valid) {
    suggestions.push('💡 Include clear sections: Requirements, Responsibilities, Qualifications');
    suggestions.push('💡 List specific technical skills (e.g., "Python", "AWS", not just "coding")');
  }

  logger.info('Job analysis validation', {
    valid,
    confidence,
    errorsCount: errors.length
  });

  return {
    valid,
    confidence,
    errors,
    warnings,
    suggestions
  };
}

// ============================================
// USER-FACING CONFIDENCE MESSAGES
// ============================================

export function generateUserFeedback(
  validation: ValidationResult,
  type: 'resume' | 'job'
): string {
  const { valid, confidence, errors, warnings, suggestions } = validation;

  let message = '';

  // Header with confidence indicator
  if (confidence >= 90) {
    message = `✅ **Excellent Quality** (${confidence}% confidence)\n\n`;
    message += `AI successfully understood the ${type === 'resume' ? 'resume' : 'job description'} with high accuracy. All key information extracted.\n\n`;
  } else if (confidence >= 75) {
    message = `✓ **Good Quality** (${confidence}% confidence)\n\n`;
    message += `AI extracted most information correctly, with minor issues:\n\n`;
  } else if (confidence >= 60) {
    message = `⚠️ **Acceptable Quality** (${confidence}% confidence)\n\n`;
    message += `AI had some difficulty. Review recommended:\n\n`;
  } else {
    message = `❌ **Poor Quality** (${confidence}% confidence)\n\n`;
    message += `AI could not reliably extract information. Action required:\n\n`;
  }

  // Add errors (critical issues)
  if (errors.length > 0) {
    message += `**Issues Found:**\n`;
    errors.forEach(error => message += `${error}\n`);
    message += '\n';
  }

  // Add warnings (non-critical)
  if (warnings.length > 0 && confidence >= 60) {
    message += `**Minor Issues:**\n`;
    warnings.slice(0, 3).forEach(warning => message += `${warning}\n`);
    message += '\n';
  }

  // Add suggestions
  if (suggestions.length > 0) {
    message += `**Suggestions for Improvement:**\n`;
    suggestions.forEach(suggestion => message += `${suggestion}\n`);
  }

  return message.trim();
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// EXPORT VALIDATION SUMMARY
// ============================================

export interface ValidationSummary {
  parseQuality: 'excellent' | 'good' | 'acceptable' | 'poor';
  readyForMatching: boolean;
  requiresReview: boolean;
  userMessage: string;
  technicalDetails: ValidationResult;
}

export function createValidationSummary(
  validation: ValidationResult,
  type: 'resume' | 'job'
): ValidationSummary {
  const { confidence, valid } = validation;
  
  let parseQuality: ValidationSummary['parseQuality'];
  if (confidence >= 90) parseQuality = 'excellent';
  else if (confidence >= 75) parseQuality = 'good';
  else if (confidence >= 60) parseQuality = 'acceptable';
  else parseQuality = 'poor';

  return {
    parseQuality,
    readyForMatching: valid && confidence >= 70,
    requiresReview: !valid || confidence < 75,
    userMessage: generateUserFeedback(validation, type),
    technicalDetails: validation
  };
}