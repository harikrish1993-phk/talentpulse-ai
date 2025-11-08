// src/app/candidate/[id]/authenticity/page.tsx - NEW FILE

'use client';
import { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AuthenticityPage({ params }: { params: { id: string } }) {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReport() {
      const res = await fetch(`/api/candidates/${params.id}/authenticity`);
      const data = await res.json();
      setReport(data.report);
      setLoading(false);
    }
    loadReport();
  }, [params.id]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Authenticity Report</h1>
              <p className="text-gray-600">AI-powered verification analysis</p>
            </div>
            <div className="text-right">
              <div className={`text-5xl font-bold mb-2 ${
                report.overallScore >= 75 ? 'text-green-600' :
                report.overallScore >= 50 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {report.overallScore}%
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                report.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' :
                report.riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {report.riskLevel} RISK
              </span>
            </div>
          </div>
        </div>

        {/* Red Flags */}
        {report.redFlags.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Issues Detected ({report.redFlags.length})
            </h2>
            <div className="space-y-3">
              {report.redFlags.map((flag: any, i: number) => (
                <div key={i} className={`p-4 rounded-lg border-l-4 ${
                  flag.severity === 'high' ? 'bg-red-50 border-red-500' :
                  flag.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-gray-50 border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      flag.severity === 'high' ? 'bg-red-200 text-red-900' :
                      flag.severity === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                      'bg-gray-200 text-gray-900'
                    }`}>
                      {flag.severity.toUpperCase()}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{flag.flag}</h3>
                      <p className="text-sm text-gray-700">{flag.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Green Flags */}
        {report.greenFlags.length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Positive Indicators ({report.greenFlags.length})
            </h2>
            <div className="space-y-2">
              {report.greenFlags.map((flag: string, i: number) => (
                <div key={i} className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Recommended Actions</h2>
          <div className="space-y-3">
            {report.recommendations.map((rec: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg ${
                rec.priority === 'high' ? 'bg-red-50 border border-red-200' :
                rec.priority === 'medium' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    rec.priority === 'high' ? 'bg-red-200 text-red-900' :
                    rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-900' :
                    'bg-blue-200 text-blue-900'
                  }`}>
                    {rec.priority.toUpperCase()}
                  </span>
                  <p className="flex-1 font-medium">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Questions */}
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Interview Questions to Verify Authenticity</h2>
          <p className="text-gray-600 mb-4">
            Ask these questions during the interview to validate the candidate's experience:
          </p>
          <div className="space-y-3">
            {report.verificationQuestions.map((q: string, i: number) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <span className="font-bold text-blue-600">Q{i + 1}:</span> {q}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}