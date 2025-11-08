-- ============================================
-- TalentPlus PRODUCTION Database Schema v1.1
-- CLEAN & OPTIMIZED FOR PRODUCTION
-- ============================================
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- USER SETTINGS TABLE 
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID, -- For future multi-user support
  settings JSONB NOT NULL DEFAULT '{
    "name": "",
    "company": "",
    "email": "",
    "minScore": 70,
    "exportFields": ["name", "email", "skills", "experience", "score"],
    "notifications": true
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Insert default settings
INSERT INTO user_settings (settings) 
VALUES ('{
  "name": "",
  "company": "",
  "email": "",
  "minScore": 70,
  "exportFields": ["name", "email", "skills", "experience", "score"],
  "notifications": true
}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MATCH HISTORY TABLE 
-- ============================================
CREATE TABLE IF NOT EXISTS match_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  match_count INTEGER DEFAULT 0,
  top_matches UUID[] DEFAULT '{}', -- Array of candidate IDs
  filters JSONB, -- Store search criteria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_match_history_created ON match_history(created_at DESC);

-- ============================================
-- CANDIDATES TABLE (ENHANCED)
-- ============================================
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Basic Info
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  location TEXT,
  -- Professional Info
  title TEXT,
  summary TEXT,
  years_of_experience INTEGER DEFAULT 0,
  -- Structured Data
  skills TEXT[] DEFAULT '{}',
  experience JSONB DEFAULT '[]',
  education JSONB DEFAULT '[]',
  certifications JSONB DEFAULT '[]',
  languages TEXT[] DEFAULT '{}',
  -- File Metadata
  raw_text TEXT,
  file_name TEXT,
  file_type TEXT,
  file_size INTEGER,
  content_hash TEXT,
  -- Parse Metadata
  parse_confidence INTEGER DEFAULT 0 CHECK (parse_confidence >= 0 AND parse_confidence <= 100),
  parse_method TEXT,
  parse_status TEXT DEFAULT 'pending' CHECK (parse_status IN ('pending', 'processing', 'completed', 'failed', 'needs_review')),
  parse_attempts INTEGER DEFAULT 0,
  -- Source Tracking
  source TEXT DEFAULT 'upload' CHECK (source IN ('upload', 'api', 'import', 'enriched', 'apollo')),
  source_url TEXT,
  -- Authenticity Detection
  authenticity_score INTEGER DEFAULT 0,
  authenticity_risk TEXT CHECK (authenticity_risk IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  authenticity_report JSONB,
  authenticity_checked_at TIMESTAMPTZ,
  -- Search
  search_vector tsvector,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);
-- Enhanced Indexes
CREATE INDEX IF NOT EXISTS idx_candidates_skills ON candidates USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_candidates_search ON candidates USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_parse_status ON candidates(parse_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_created_at ON candidates(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_confidence ON candidates(parse_confidence DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_candidates_source ON candidates(source);
CREATE INDEX IF NOT EXISTS idx_candidates_name ON candidates USING GIN(name gin_trgm_ops); -- For fuzzy search
CREATE INDEX IF NOT EXISTS idx_candidates_authenticity ON candidates(authenticity_score DESC) WHERE deleted_at IS NULL;

-- ============================================
-- JOBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  company TEXT,
  description TEXT NOT NULL,
  -- Parsed Requirements
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  min_experience INTEGER,
  max_experience INTEGER,
  education_level TEXT,
  location_type TEXT CHECK (location_type IN ('remote', 'hybrid', 'onsite', 'any')),
  locations TEXT[] DEFAULT '{}',
  seniority_level TEXT CHECK (seniority_level IN ('intern', 'junior', 'mid', 'senior', 'lead', 'executive')),
  -- Analysis
  analysis JSONB,
  analysis_confidence INTEGER,
  -- Metadata
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'draft')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status) WHERE deleted_at IS NULL;

-- ============================================
-- MATCH RESULTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS match_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  -- Scores
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  skills_score INTEGER,
  experience_score INTEGER,
  education_score INTEGER,
  location_score INTEGER,
  -- Analysis
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  strengths TEXT[] DEFAULT '{}',
  gaps TEXT[] DEFAULT '{}',
  explanation TEXT,
  recommendation TEXT,
  tier TEXT CHECK (tier IN ('A', 'B', 'C', 'D')),
  -- Interview
  suggested_questions JSONB DEFAULT '[]',
  -- Status
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected', 'interviewed', 'hired')),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_matches_candidate ON match_results(candidate_id);
CREATE INDEX IF NOT EXISTS idx_matches_job ON match_results(job_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON match_results(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_matches_tier ON match_results(tier);

-- ============================================
-- PARSE ATTEMPTS (MONITORING)
-- ============================================
CREATE TABLE IF NOT EXISTS parse_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE,
  file_name TEXT,
  method TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  processing_time_ms INTEGER,
  cost_usd DECIMAL(10, 4),
  confidence INTEGER,
  success BOOLEAN,
  error_message TEXT,
  response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_parse_candidate ON parse_attempts(candidate_id);
CREATE INDEX IF NOT EXISTS idx_parse_method ON parse_attempts(method);
CREATE INDEX IF NOT EXISTS idx_parse_created ON parse_attempts(created_at DESC);

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  user_id UUID,
  ip_address INET,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- ============================================
-- API RATE LIMITING TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  request_count INTEGER DEFAULT 0,
  reset_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset ON api_rate_limits(reset_time);
CREATE INDEX IF NOT EXISTS idx_rate_limits_endpoint ON api_rate_limits(endpoint);

-- ============================================
-- TRIGGERS
-- ============================================
-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_match_history_updated_at BEFORE UPDATE ON match_history
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_match_results_updated_at BEFORE UPDATE ON match_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update search vector
CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.summary, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(array_to_string(NEW.skills, ' '), '')), 'A');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_candidate_search BEFORE INSERT OR UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- ============================================
-- HELPER VIEWS
-- ============================================
CREATE OR REPLACE VIEW candidate_stats AS
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') as recent_week,
  COUNT(*) FILTER (WHERE parse_confidence >= 80) as high_quality,
  ROUND(AVG(parse_confidence)) as avg_confidence,
  COUNT(*) FILTER (WHERE source = 'apollo') as external_candidates,
  COUNT(*) FILTER (WHERE authenticity_score >= 75) as high_authenticity,
  COUNT(*) FILTER (WHERE authenticity_score < 50 AND authenticity_score IS NOT NULL) as suspicious
FROM candidates
WHERE deleted_at IS NULL;

-- ============================================
-- SECURITY & PERMISSIONS
-- ============================================
-- Create read-only role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'readonly_user') THEN
    CREATE ROLE readonly_user;
  END IF;
END
$$;

GRANT CONNECT ON DATABASE postgres TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- ============================================
-- DATA INTEGRITY
-- ============================================
-- Add constraints for data validation
ALTER TABLE candidates ADD CONSTRAINT check_skills_count 
  CHECK (array_length(skills, 1) IS NULL OR array_length(skills, 1) <= 100);

ALTER TABLE jobs ADD CONSTRAINT check_required_skills 
  CHECK (array_length(required_skills, 1) IS NULL OR array_length(required_skills, 1) <= 50);

-- ============================================
-- MIGRATION HELPER
-- ============================================
-- Function to migrate data from old schema to new schema
CREATE OR REPLACE FUNCTION migrate_schema()
RETURNS void AS $$
BEGIN
  -- Example migration step
  ALTER TABLE IF EXISTS candidates 
  ADD COLUMN IF NOT EXISTS authenticity_score INTEGER DEFAULT 0;
END;
$$ LANGUAGE plpgsql;