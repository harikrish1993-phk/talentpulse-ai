// src/lib/types/index.ts - COMPLETE WITH AUTHENTICITY
export interface Candidate {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  title: string | null;
  summary: string;
  years_of_experience: number;
  skills: string[];
  experience: Experience[];
  education: Education[];
  certifications: Certification[];
  languages: string[];
  
  // Parsing metadata
  parse_confidence: number;
  parse_method: string;
  parse_status: ParseStatus;
  parse_attempts: number;
  
  // ✅ AUTHENTICITY FIELDS (NEW)
  authenticity_score: number | null;
  authenticity_risk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  authenticity_report: string | null; // JSON string
  authenticity_checked_at: string | null;
  
  // File metadata
  raw_text?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  content_hash?: string;
  
  // Source tracking
  source: CandidateSource;
  source_url?: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  last_viewed_at?: string;
  deleted_at?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date: string | null;
  duration?: string;
  description?: string;
  achievements?: string[];
  skills_used?: string[];
}

export interface Education {
  degree: string;
  field_of_study?: string;
  institution: string;
  location?: string;
  start_year?: string;
  end_year?: string;
  gpa?: string;
  achievements?: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  issue_date?: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export type ParseStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'needs_review';

export type CandidateSource = 
  | 'upload' 
  | 'api' 
  | 'import' 
  | 'enriched'
  | 'apollo';

export interface JobAnalysis {
  title: string;
  required_skills: string[];
  preferred_skills: string[];
  min_experience: number;
  max_experience: number;
  education_level?: string;
  location_type: LocationType;
  locations: string[];
  seniority_level: SeniorityLevel;
  industry?: string;
  key_responsibilities: string[];
  must_have_requirements: string[];
  nice_to_have: string[];
  deal_breakers: string[];
}

export type LocationType = 'remote' | 'hybrid' | 'onsite' | 'any';

export type SeniorityLevel = 
  | 'intern' 
  | 'junior' 
  | 'mid' 
  | 'senior' 
  | 'lead' 
  | 'executive';

export interface MatchResult {
  id?: string;
  candidate_id: string;
  job_id?: string;
  
  overall_score: number;
  skills_score: number;
  experience_score: number;
  education_score: number;
  location_score: number;
  
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  gaps: string[];
  
  explanation: string;
  recommendation: string;
  tier: MatchTier;
  suggested_questions: string[];
  
  candidate?: Candidate;
  
  status?: MatchStatus;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  
  created_at?: string;
  updated_at?: string;
}

export type MatchTier = 'A' | 'B' | 'C' | 'D';

export type MatchStatus = 
  | 'new' 
  | 'reviewed' 
  | 'shortlisted' 
  | 'rejected' 
  | 'interviewed' 
  | 'hired';

export interface ParseAttempt {
  id: string;
  candidate_id?: string;
  file_name: string;
  method: string;
  model?: string;
  tokens_used?: number;
  processing_time_ms: number;
  cost_usd?: number;
  confidence: number;
  success: boolean;
  error_message?: string;
  response?: Record<string, any>;
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
  metadata?: {
    timestamp?: string;
    duration_ms?: number;
    tokens_used?: number;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MatchCandidate {
  candidate: Candidate;
  overall_score: number;
  tier: MatchTier;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
  skills_score?: number;
  experience_score?: number;
  education_score?: number;
  location_score?: number;
}

// ✅ NEW: Dashboard Stats Interface
export interface DashboardStats {
  total: number;
  recentWeek: number;
  highQuality: number;
  avgConfidence: number;
  externalCandidates: number;
  highAuthenticity: number;
  suspiciousCandidates: number;
  bySource: Record<string, number>;
  byStatus: Record<string, number>;
}

// ✅ NEW: Authenticity Report Interface
export interface AuthenticityReport {
  overallScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  signals: {
    aiGeneratedProbability: number;
    overOptimization: number;
    genericLanguage: number;
    inconsistencies: number;
    verificationIssues: string[];
  };
  redFlags: {
    flag: string;
    severity: 'low' | 'medium' | 'high';
    explanation: string;
  }[];
  greenFlags: string[];
  recommendations: {
    action: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  verificationQuestions: string[];
}