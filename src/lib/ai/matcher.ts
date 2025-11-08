import { Candidate, JobAnalysis, MatchCandidate, ApiResponse } from '../types';
import { createLogger } from '../logger';

const logger = createLogger('Matcher');

export async function matchCandidates(
  candidates: Candidate[],
  job: JobAnalysis,
  options: {
    useAI?: boolean;
    minScore?: number;
    maxResults?: number;
  } = {}
): Promise<ApiResponse<MatchCandidate[]>> {
  const { useAI = false, minScore = 0, maxResults = 100 } = options;

  try {
    logger.info('Starting candidate matching', {
      candidatesCount: candidates.length,
      jobTitle: job.title,
    });

    const results: MatchCandidate[] = [];

    for (const candidate of candidates) {
      // Calculate skills match
      const candidateSkillsLower = candidate.skills.map(s => s.toLowerCase());
      const jobSkillsLower = job.required_skills.map(s => s.toLowerCase());

      const matchedSkills = candidate.skills.filter(skill =>
        jobSkillsLower.some(js => 
          skill.toLowerCase().includes(js) || 
          js.includes(skill.toLowerCase())
        )
      );

      const missingSkills = job.required_skills.filter(jobSkill =>
        !candidateSkillsLower.some(cs => 
          cs.includes(jobSkill.toLowerCase())
        )
      );

      // Calculate base score based on skills match
      const baseScore = job.required_skills.length > 0
        ? Math.round((matchedSkills.length / job.required_skills.length) * 100)
        : 50;

      // Bonus for experience
      const experienceBonus = candidate.years_of_experience >= job.min_experience ? 10 : 0;
      const score = Math.min(100, baseScore + experienceBonus);

      // Skip if below minimum score
      if (score < minScore) {
        continue;
      }

      // Determine tier
      let tier: 'A' | 'B' | 'C' | 'D';
      if (score >= 85) tier = 'A';
      else if (score >= 70) tier = 'B';
      else if (score >= 50) tier = 'C';
      else tier = 'D';

      const explanation = `Matched ${matchedSkills.length} of ${job.required_skills.length} required skills. ${
        experienceBonus > 0 ? 'Meets experience requirements.' : 'May need more experience.'
      }`;

      const matchCandidate: MatchCandidate = {
        candidate,
        overall_score: score,
        tier,
        matched_skills: matchedSkills,
        missing_skills: missingSkills,
        explanation,
        skills_score: baseScore,
        experience_score: experienceBonus > 0 ? 100 : 50,
        education_score: 50, // Basic scoring - can be enhanced
        location_score: 50, // Basic scoring - can be enhanced
      };

      results.push(matchCandidate);
    }

    // Sort by overall score (descending)
    results.sort((a, b) => b.overall_score - a.overall_score);

    // Limit results
    const limitedResults = results.slice(0, maxResults);

    logger.info('Matching completed', {
      totalMatches: limitedResults.length,
      topScore: limitedResults[0]?.overall_score || 0,
    });

    return {
      success: true,
      data: limitedResults,
      metadata: {
        timestamp: new Date().toISOString(),
        candidatesProcessed: candidates.length,
        matchesFound: limitedResults.length,
      },
    };
  } catch (error: any) {
    logger.error('Matching failed', error);
    
    return {
      success: false,
      error: error.message || 'Failed to match candidates',
    };
  }
}