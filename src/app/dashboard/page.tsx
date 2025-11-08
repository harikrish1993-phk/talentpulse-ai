// src/app/dashboard/page.tsx - PRODUCTION READY
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, Upload, Users, BarChart3, TrendingUp, 
  Clock, AlertCircle, CheckCircle, Sparkles, Database 
} from 'lucide-react';

interface Stats {
  total: number;
  recentWeek: number;
  highQuality: number;
  avgConfidence: number;
  externalCandidates?: number;
}

interface MatchHistory {
  id: string;
  job_title: string;
  match_count: number;
  created_at: string;
}

interface SystemHealth {
  parseAccuracy: number;
  tierABRate: number;
  topSource: string;
  hasRealData: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({ 
    total: 0, 
    recentWeek: 0, 
    highQuality: 0, 
    avgConfidence: 0,
    externalCandidates: 0
  });
  const [recentMatches, setRecentMatches] = useState<MatchHistory[]>([]);
  const [health, setHealth] = useState<SystemHealth>({
    parseAccuracy: 0,
    tierABRate: 0,
    topSource: 'upload',
    hasRealData: false
  });
  const [loading, setLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      
      // Load stats
      try {
        const statsRes = await fetch('/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.data || statsData);
        }
      } catch (err) {
        console.log('Stats API not available during build');
      }

      // Load recent matches
      try{
        const historyRes = await fetch('/api/match/history');
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          setRecentMatches(historyData.data?.slice(0, 5) || []);
        }
      }catch (err) {
        console.log('Reent Match API not available during build');
      }


      // Load system health
      const healthRes = await fetch('/api/dashboard/performance');
      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const res = await fetch('/api/parse', {
          method: 'POST',
          body: formData
        });
        
        if (res.ok) {
          alert('Resume uploaded successfully!');
          loadDashboardData(); // Refresh stats
        }
      } catch (err) {
        alert('Upload failed. Please try again.');
      }
    }
  };

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-6 pb-24 md:pb-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Welcome to TalentPlus
            </h1>
            <p className="text-gray-600 mt-1">
              Your AI-powered recruitment dashboard
            </p>
          </div>
          <button
            onClick={() => router.push('/match')}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Target className="w-5 h-5" />
            New Match
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-8 h-8 text-blue-600 opacity-70" />
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats.total > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {stats.total > 0 ? 'Active' : 'Empty'}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Candidates</p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-green-600 opacity-70" />
              <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                This Week
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.recentWeek}</p>
            <p className="text-sm text-gray-600">New Additions</p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-purple-600 opacity-70" />
              <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                Quality
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.highQuality}</p>
            <p className="text-sm text-gray-600">High Confidence</p>
          </div>

          <div className="bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-8 h-8 text-orange-600 opacity-70" />
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                stats.avgConfidence >= 80 ? 'bg-green-100 text-green-700' :
                stats.avgConfidence >= 70 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {stats.avgConfidence >= 80 ? 'Excellent' : stats.avgConfidence >= 70 ? 'Good' : 'Review'}
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.avgConfidence}%</p>
            <p className="text-sm text-gray-600">Avg Confidence</p>
          </div>
        </div>

        {/* System Health */}
        {health.hasRealData && (
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              System Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">{health.parseAccuracy}%</div>
                <p className="text-sm text-blue-700">Parsing Accuracy</p>
                <p className="text-xs text-blue-600 mt-1">AI extraction precision</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">{health.tierABRate}%</div>
                <p className="text-sm text-green-700">Tier A+B Matches</p>
                <p className="text-xs text-green-600 mt-1">High-quality match rate</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900 capitalize">{health.topSource}</div>
                <p className="text-sm text-purple-700">Top Candidate Source</p>
                <p className="text-xs text-purple-600 mt-1">Most effective channel</p>
              </div>
            </div>
          </div>
        )}

        {/* External Source Stats */}
        {stats.externalCandidates && stats.externalCandidates > 0 && (
          <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">External Candidates</h3>
                <p className="text-sm opacity-90">Sourced from Apollo and other platforms</p>
              </div>
              <div className="text-4xl font-bold">{stats.externalCandidates}</div>
            </div>
          </div>
        )}

        {/* Quick Upload */}
        <div 
          className={`bg-white rounded-xl border-2 p-6 transition-all ${
            dragActive ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="font-semibold text-gray-900 mb-2">Quick Resume Upload</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag & drop a resume here or{' '}
              <button 
                onClick={() => router.push('/library')} 
                className="text-blue-600 hover:underline font-medium"
              >
                browse from Library
              </button>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/library')}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 font-medium"
              >
                <Users className="w-4 h-4 inline mr-2" />
                Go to Library
              </button>
              <button
                onClick={() => router.push('/match')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Target className="w-4 h-4 inline mr-2" />
                Start Matching
              </button>
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <section className="bg-white rounded-xl border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-purple-600" />
              Recent Matches
            </h2>
            <button
              onClick={() => router.push('/match/history')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          {recentMatches.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-4">
                Upload resumes and create your first job match
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/library')}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Upload Resumes
                </button>
                <button
                  onClick={() => router.push('/match')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Match
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map(match => (
                <div 
                  key={match.id} 
                  className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => router.push('/match/history')}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{match.job_title}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-600">
                        <Users className="w-4 h-4 inline mr-1" />
                        {match.match_count} matches
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDate(match.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-blue-100 text-blue-800 text-sm rounded-lg font-medium hover:bg-blue-200 transition">
                    View Results →
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={() => router.push('/match')} 
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl hover:shadow-lg transition flex flex-col items-center justify-center"
          >
            <Target className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">New Match</span>
          </button>
          <button 
            onClick={() => router.push('/library')} 
            className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg hover:border-blue-300 transition flex flex-col items-center justify-center"
          >
            <Users className="w-8 h-8 mb-2 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Library</span>
          </button>
          <button 
            onClick={() => router.push('/match/history')} 
            className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg hover:border-purple-300 transition flex flex-col items-center justify-center"
          >
            <Clock className="w-8 h-8 mb-2 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">History</span>
          </button>
          <button 
            onClick={() => router.push('/help')} 
            className="bg-white border-2 border-gray-200 p-6 rounded-xl hover:shadow-lg hover:border-green-300 transition flex flex-col items-center justify-center"
          >
            <AlertCircle className="w-8 h-8 mb-2 text-gray-700" />
            <span className="text-sm font-medium text-gray-700">Help</span>
          </button>
        </div>

        {/* Getting Started Guide (for new users) */}
        {stats.total === 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
            <h3 className="text-lg font-bold text-purple-900 mb-4">
              🚀 Getting Started with TalentPlus
            </h3>
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">1</span>
                <span><strong>Upload Resumes:</strong> Go to Library → Click "Add Candidate" → Upload PDF/DOCX files</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">2</span>
                <span><strong>Create a Match:</strong> Go to Match → Paste your job description → Click "Match Candidates"</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xs">3</span>
                <span><strong>Review Results:</strong> Get instant AI-ranked candidates with match scores and explanations</span>
              </li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}