// src/app/match/page.tsx - PRODUCTION READY
'use client';
import { useState, useEffect } from 'react';
import { Target, Loader2, AlertCircle, Search, CheckCircle, Sparkles } from 'lucide-react';

interface MatchCandidate {
  candidate: any;
  overall_score: number;
  tier: string;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}
// Add proper tier colors type
const tierColors: Record<string, string> = {
  A: 'bg-green-100 text-green-800 border-green-300',
  B: 'bg-blue-100 text-blue-800 border-blue-300',
  C: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  D: 'bg-gray-100 text-gray-800 border-gray-300'
};
interface MatchResult {
  candidate: any;
  overall_score: number;
  tier: string;
  matched_skills: string[];
  missing_skills: string[];
  explanation: string;
}

export default function MatchPage() {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [showExternal, setShowExternal] = useState(false);
  const [extLoading, setExtLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  
  // External search state
  const [extLocation, setExtLocation] = useState('');
  const [extLimit, setExtLimit] = useState(10);

  async function handleMatch() {
    if (!jobDescription.trim() || jobDescription.length < 100) {
      setError('Please enter a detailed job description (minimum 100 characters)');
      return;
    }

    setLoading(true);
    setError('');
    setProgress(0);
    setProgressStage('Initializing...');

    try {
      // Stage 1: Analyzing job
      setProgress(25);
      setProgressStage('Analyzing job requirements with AI...');
      
      const res = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription })
      });

      // Stage 2: Matching candidates
      setProgress(50);
      setProgressStage('Searching candidate database...');
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Stage 3: Scoring
      setProgress(75);
      setProgressStage('Scoring and ranking matches...');
      
      const data = await res.json();
      
      // Stage 4: Complete
      setProgress(100);
      setProgressStage('Complete!');

      if (data.success) {
        setResults(data.data);
        
        // Save to history
        const history = JSON.parse(localStorage.getItem('talentplus_match_history') || '[]');
        history.unshift({
          id: Date.now().toString(),
          job_title: data.data.jobAnalysis?.title || 'Untitled Position',
          job_description: jobDescription,
          match_count: data.data.matches?.length || 0,
          top_matches: data.data.matches?.slice(0, 5).map((m: any) => m.candidate_id) || [],
          created_at: new Date().toISOString()
        });
        localStorage.setItem('talentplus_match_history', JSON.stringify(history.slice(0, 20)));
      } else {
        setError(data.error || 'Matching failed. Please try again.');
      }
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.');
      console.error('Match error:', err);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  }

  async function handleExternalSearch() {
    if (!extLocation.trim()) {
      alert('Please enter a location');
      return;
    }

    setExtLoading(true);
    
    try {
      // Extract skills from job description first
      const skillsRes = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: jobDescription })
      });
      
      const skillsData = await skillsRes.json();
      
      if (!skillsData.success) {
        throw new Error('Failed to analyze job for external search');
      }

      // Search external sources (Apollo)
      const searchRes = await fetch('/api/external-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: skillsData.data.title,
          skills: skillsData.data.required_skills,
          location: extLocation,
          limit: extLimit
        })
      });

      const searchData = await searchRes.json();
      
      if (searchData.success) {
        alert(`Successfully added ${searchData.data.added} candidates from external sources!`);
        setShowExternal(false);
        
        // Optionally re-run match with new candidates
        setTimeout(() => handleMatch(), 500);
      } else {
        throw new Error(searchData.error || 'External search failed');
      }
    } catch (err: any) {
      alert(`External search failed: ${err.message}`);
      console.error('External search error:', err);
    } finally {
      setExtLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Target className="w-8 h-8 text-purple-600" />
            AI-Powered Candidate Matching
          </h1>
          <p className="text-gray-600">Paste a job description to find your top matches instantly</p>
        </div>

        {!results ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the complete job description here...

Example:
We're looking for a Senior Full-Stack Developer with 5+ years experience in React, Node.js, and PostgreSQL. Must have experience with AWS, Docker, and CI/CD pipelines. Strong communication skills required. Remote position available."
              className="w-full h-80 md:h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-gray-900 font-mono text-sm"
            />

            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className={`${jobDescription.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                  {jobDescription.length} characters
                </span>
                {jobDescription.length >= 100 && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => setShowExternal(true)}
                  disabled={!jobDescription || jobDescription.length < 100}
                  className="flex-1 md:flex-initial px-4 py-3 border-2 border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                >
                  <Search className="w-5 h-5" />
                  Find External Candidates
                </button>
                
                <button
                  onClick={handleMatch}
                  disabled={loading || jobDescription.length < 100}
                  className="flex-1 md:flex-initial px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Matching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Match Candidates
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress Indicator */}
            {loading && (
              <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-12 h-12 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">Processing Your Match</h3>
                    <p className="text-sm text-gray-600">{progressStage}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={progress >= 25 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Analyzing Job Description
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={progress >= 50 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Searching Candidates
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={progress >= 75 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Scoring & Ranking
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <span className={progress >= 100 ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Complete
                    </span>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-gray-600 mt-2">{Math.round(progress)}% Complete</p>
              </div>
            )}

            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <ResultsView results={results} onNewSearch={() => setResults(null)} />
        )}

        {/* External Search Modal */}
        {showExternal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Search className="w-6 h-6 text-blue-600" />
                Search External Talent Databases
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Connect to Apollo.io and other sources to find candidates beyond your database
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    placeholder="e.g., London, Remote, Belgium"
                    value={extLocation}
                    onChange={e => setExtLocation(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Results
                  </label>
                  <select
                    value={extLimit}
                    onChange={e => setExtLimit(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 candidates</option>
                    <option value={10}>10 candidates</option>
                    <option value={20}>20 candidates</option>
                    <option value={50}>50 candidates</option>
                  </select>
                </div>
                
                <button
                  onClick={handleExternalSearch}
                  disabled={extLoading || !extLocation.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {extLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find {extLimit} Candidates
                    </>
                  )}
                </button>
              </div>
              
              <button 
                onClick={() => setShowExternal(false)} 
                className="mt-4 text-gray-500 hover:text-gray-700 underline w-full text-center"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsView({ results, onNewSearch }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {results.matches?.length || 0} Matches Found
        </h2>
        <button
          onClick={onNewSearch}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
        >
          New Search
        </button>
      </div>

      {results.jobAnalysis && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Job Requirements Identified
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Experience Required:</span>
              <p className="font-medium">{results.jobAnalysis.min_experience}+ years</p>
            </div>
            <div>
              <span className="text-gray-600">Seniority:</span>
              <p className="font-medium capitalize">{results.jobAnalysis.seniority_level}</p>
            </div>
            <div>
              <span className="text-gray-600">Skills Needed:</span>
              <p className="font-medium">{results.jobAnalysis.required_skills?.length || 0}</p>
            </div>
            <div>
              <span className="text-gray-600">Work Type:</span>
              <p className="font-medium capitalize">{results.jobAnalysis.location_type}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {results.matches?.map((match: MatchCandidate, index: number) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
                  #{index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{match.candidate?.name || 'Unknown'}</h3>
                  <p className="text-gray-600">{match.candidate?.title}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600 mb-1">{match.overall_score}%</div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  tierColors[match.tier] || tierColors.D
                }`}>
                  Tier {match.tier}
                </span>
              </div>
            </div>

            <p className="text-gray-700 mb-4">{match.explanation}</p>

            {match.matched_skills?.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">✓ Matched Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {match.matched_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {match.missing_skills?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">✗ Missing Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {match.missing_skills.map((skill: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}