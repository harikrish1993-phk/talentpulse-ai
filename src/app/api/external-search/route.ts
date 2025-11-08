// src/app/api/external-search/route.ts - PRODUCTION READY
import { NextRequest, NextResponse } from 'next/server';
import { parseResume } from '@/lib/ai/parser';
import { saveCandidate } from '@/lib/db/candidates';
import { createLogger } from '@/lib/logger';
import { Candidate, CandidateSource } from '@/lib/types'; 
import { withErrorHandler } from '@/lib/api/error-handler';
const logger = createLogger('ExternalSearch');

export const maxDuration = 300; // 5 minutes for external API calls

interface ApolloSearchParams {
  jobTitle: string;
  skills: string[];
  location: string;
  limit?: number;
}

interface ApolloPerson {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  organization?: {
    name?: string;
    industry?: string;
  };
  city?: string;
  state?: string;
  country?: string;
  headline?: string;
  summary?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { jobTitle, skills, location, limit = 10 }: ApolloSearchParams = await request.json();

    // Validation
    if (!jobTitle || !skills || skills.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Job title and skills are required'
      }, { status: 400 });
    }

    if (!location) {
      return NextResponse.json({
        success: false,
        error: 'Location is required'
      }, { status: 400 });
    }

    const apolloApiKey = process.env.APOLLO_API_KEY;
    if (!apolloApiKey || apolloApiKey === 'your_key_here') {
      return NextResponse.json({
        success: false,
        error: 'Apollo API key not configured. Please add APOLLO_API_KEY to your environment variables.',
        details: 'Configure in Settings or .env.local file'
      }, { status: 503 });
    }

    logger.info('Starting Apollo search', { jobTitle, location, limit });

    // Prepare Apollo API request
    const apolloPayload = {
      // Person filters
      person_titles: [jobTitle],
      q_keywords: skills.join(' OR '),
      
      // Location
      person_locations: [location],
      
      // Pagination
      page: 1,
      per_page: Math.min(limit, 25), // Apollo limit
      
      // Organization filters (optional - adjust based on needs)
      organization_num_employees_ranges: ['11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+'],
      
      // Contact info preference
      prospected_by_current_team: ['no']
    };

    // Call Apollo API
    const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey,
      },
      body: JSON.stringify(apolloPayload),
    });

    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text();
      logger.error('Apollo API error', { 
        status: apolloResponse.status, 
        error: errorText 
      });
      
      if (apolloResponse.status === 401) {
        return NextResponse.json({
          success: false,
          error: 'Apollo API key is invalid or expired',
          details: 'Please check your API key in Settings'
        }, { status: 401 });
      }
      
      if (apolloResponse.status === 429) {
        return NextResponse.json({
          success: false,
          error: 'Apollo API rate limit exceeded',
          details: 'Please try again in a few minutes or upgrade your Apollo plan'
        }, { status: 429 });
      }

      throw new Error(`Apollo API failed: ${errorText}`);
    }

    const apolloData = await apolloResponse.json();
    
    if (!apolloData.people || apolloData.people.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          added: 0,
          candidates: [],
          message: 'No candidates found matching your criteria'
        }
      });
    }

    logger.info('Apollo search successful', { 
      found: apolloData.people.length 
    });

    // Process and save each candidate
    const addedCandidates = [];
    const errors = [];

    for (const person of apolloData.people) {
      try {
        // Convert Apollo person to resume text format
        const resumeText = convertApolloPersonToResumeText(person);
        
        // Parse with AI
        const parseResult = await parseResume(resumeText, `${person.name}.txt`);
        
        if (!parseResult.success || !parseResult.data) {
          errors.push({
            name: person.name,
            error: 'Failed to parse'
          });
          continue;
        }


        // Save to database
        const candidateData: Omit<Candidate, 'id' | 'created_at' | 'updated_at'> = {
            ...parseResult.data!,
            source: 'apollo' as CandidateSource,
            source_url: person.linkedin_url || undefined,
            raw_text: resumeText,
          };
        const saveResult = await saveCandidate(candidateData);
        
        if (saveResult.success && saveResult.data) {
          addedCandidates.push(saveResult.data);
          logger.info('Candidate added from Apollo', { 
            name: saveResult.data.name 
          });
        } else {
          errors.push({
            name: person.name,
            error: 'Failed to save'
          });
        }
      } catch (err: any) {
        logger.error('Error processing Apollo person', { 
          name: person.name, 
          error: err.message 
        });
        errors.push({
          name: person.name,
          error: err.message
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        added: addedCandidates.length,
        total_found: apolloData.people.length,
        candidates: addedCandidates,
        errors: errors.length > 0 ? errors : undefined
      },
      metadata: {
        timestamp: new Date().toISOString(),
        search_params: { jobTitle, location, limit }
      }
    });

  } catch (error: any) {
    logger.error('External search failed', error);
    
    return NextResponse.json({
      success: false,
      error: 'External search failed',
      details: error.message
    }, { status: 500 });
  }
}

// Helper function to convert Apollo person to resume text
function convertApolloPersonToResumeText(person: ApolloPerson): string {
  const sections: string[] = [];

  // Header
  sections.push(`Name: ${person.name}`);
  
  if (person.title) {
    sections.push(`Current Title: ${person.title}`);
  }
  
  if (person.email) {
    sections.push(`Email: ${person.email}`);
  }
  
  if (person.phone) {
    sections.push(`Phone: ${person.phone}`);
  }

  // Location
  const locationParts = [person.city, person.state, person.country].filter(Boolean);
  if (locationParts.length > 0) {
    sections.push(`Location: ${locationParts.join(', ')}`);
  }

  if (person.linkedin_url) {
    sections.push(`LinkedIn: ${person.linkedin_url}`);
  }

  sections.push(''); // Blank line

  // Current Organization
  if (person.organization) {
    sections.push('CURRENT EXPERIENCE');
    sections.push(`Company: ${person.organization.name || 'Unknown'}`);
    if (person.title) {
      sections.push(`Position: ${person.title}`);
    }
    if (person.organization.industry) {
      sections.push(`Industry: ${person.organization.industry}`);
    }
    sections.push(''); // Blank line
  }

  // Summary/Headline
  if (person.headline || person.summary) {
    sections.push('PROFESSIONAL SUMMARY');
    sections.push(person.headline || person.summary || '');
    sections.push(''); // Blank line
  }

  // Note about source
  sections.push('---');
  sections.push('Source: Apollo.io Professional Database');
  sections.push(`Profile ID: ${person.id}`);

  return sections.join('\n');
}

// Validation endpoint
export async function GET(request: NextRequest) {
  try {
    const apolloApiKey = process.env.APOLLO_API_KEY;
    
    if (!apolloApiKey || apolloApiKey === 'your_key_here') {
      return NextResponse.json({
        success: false,
        configured: false,
        message: 'Apollo API key not configured'
      });
    }

    // Test Apollo API connection
    const testResponse = await fetch('https://api.apollo.io/v1/auth/health', {
      headers: {
        'X-Api-Key': apolloApiKey,
      },
    });

    const isValid = testResponse.ok;

    return NextResponse.json({
      success: true,
      configured: true,
      valid: isValid,
      message: isValid 
        ? 'Apollo API is configured and working' 
        : 'Apollo API key is configured but invalid'
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      configured: false,
      error: error.message
    }, { status: 500 });
  }
}