// src/app/match/history/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Eye, Trash2, Search, Calendar, Users, Target } from 'lucide-react';

interface MatchHistory {
  id: string;
  job_title: string;
  job_description: string;
  match_count: number;
  top_matches: string[]; // candidate IDs
  created_at: string;
}

export default function MatchHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      // Try to load from localStorage first (fallback)
      const stored = localStorage.getItem('talentplus_match_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }

      // Then try to load from API (if database is set up)
      const res = await fetch('/api/match/history');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setHistory(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteMatch(id: string) {
    if (!confirm('Delete this match history?')) return;

    try {
      // Remove from localStorage
      const stored = localStorage.getItem('talentplus_match_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered = parsed.filter((m: any) => m.id !== id);
        localStorage.setItem('talentplus_match_history', JSON.stringify(filtered));
      }

      // Remove from API (if available)
      await fetch(`/api/match/history/${id}`, { method: 'DELETE' });

      setHistory(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete', error);
    }
  }

  const filteredHistory = history.filter(match =>
    match.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading match history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Match History</h1>
          <p className="text-gray-600">View and re-run your previous job matches</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {history.length === 0 ? 'No match history yet' : 'No matches found'}
            </h2>
            <p className="text-gray-600 mb-6">
              {history.length === 0
                ? 'Start by creating your first match'
                : 'Try a different search term'}
            </p>
            {history.length === 0 && (
              <button
                onClick={() => router.push('/match')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create First Match
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map(match => (
              <div
                key={match.id}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {match.job_title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {match.match_count} matches
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(match.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2">
                      {match.job_description.substring(0, 200)}...
                    </p>
                  </div>

                  <div className="flex md:flex-col gap-2">
                    <button
                      onClick={() => {
                        // Navigate to match page with pre-filled data
                        sessionStorage.setItem('prefilled_job', match.job_description);
                        router.push('/match');
                      }}
                      className="flex-1 md:flex-initial px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center justify-center"
                    >
                      <Eye className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">View Results</span>
                    </button>
                    <button
                      onClick={() => deleteMatch(match.id)}
                      className="flex-1 md:flex-initial px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 md:mr-2" />
                      <span className="hidden md:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
