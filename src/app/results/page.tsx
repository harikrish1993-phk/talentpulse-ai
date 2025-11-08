// src/app/results/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/GlassCard';
import MatchScore from '@/components/MatchScore';

export default function ResultsPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    const saved = sessionStorage.getItem('matchResults');
    if (saved) {
      try {
        setMatches(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing match results:', e);
        router.push('/match');
      }
    } else {
      router.push('/match');
    }
  }, [router]);

  if (matches.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Match Results</h1>
          <p className="text-lg text-gray-600">
            Found {matches.length} candidate{matches.length !== 1 ? 's' : ''} matching your job description
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match) => (
            <div key={match.candidateId} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{match.candidateName || 'Unknown'}</h3>
                <MatchScore score={match.matchScore} tier={match.tier} />
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{match.explanation}</p>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2">Matched Skills</div>
                <div className="flex flex-wrap gap-1">
                  {(match.matchedSkills || []).slice(0, 5).map((s: string) => (
                    <span key={s} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {(match.missingSkills || []).length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Missing Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {match.missingSkills.slice(0, 3).map((s: string) => (
                      <span key={s} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}