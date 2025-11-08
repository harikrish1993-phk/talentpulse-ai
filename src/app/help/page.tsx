// src/app/help/page.tsx - USER-FOCUSED DOCUMENTATION
'use client';

import { 
  HelpCircle, Upload, Search, Target, Database, Zap, 
  CheckCircle, AlertTriangle, TrendingUp, Users, FileText,
  Sparkles, Shield, Clock, BarChart
} from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Help & User Guide
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know to find perfect candidates faster
          </p>
        </div>

        {/* Quick Start */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Zap className="w-7 h-7 text-yellow-500" />
            Quick Start Guide
          </h2>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl font-bold text-blue-600 flex-shrink-0">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Upload Resumes to Your Library</h3>
                <p className="text-gray-700 mb-2">
                  Go to <strong>Library</strong> → Click <strong>"Add Candidate"</strong> → Upload PDF, DOCX, or TXT files
                </p>
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                  <strong>💡 Pro Tip:</strong> Use "Bulk Upload" to process 10-50 resumes at once
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl font-bold text-purple-600 flex-shrink-0">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Create a Match</h3>
                <p className="text-gray-700 mb-2">
                  Go to <strong>Match</strong> → Paste your full job description → Click <strong>"Match Candidates"</strong>
                </p>
                <div className="bg-purple-50 p-3 rounded-lg text-sm">
                  <strong>💡 Pro Tip:</strong> Include specific skills, experience years, and must-have requirements for best results
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-xl font-bold text-green-600 flex-shrink-0">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Review Top Matches</h3>
                <p className="text-gray-700 mb-2">
                  Get instant results ranked by match score with detailed explanations
                </p>
                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <strong>💡 Pro Tip:</strong> Tier A (85-100%) = Excellent fit, Tier B (70-84%) = Strong fit
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Understanding Results */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <BarChart className="w-7 h-7 text-green-600" />
            Understanding Match Scores
          </h2>

          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">Tier A</span>
                <span className="font-semibold">85-100% Match</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Excellent candidate.</strong> Meets all major requirements. Recommend immediate interview.
              </p>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">Tier B</span>
                <span className="font-semibold">70-84% Match</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Strong candidate.</strong> Meets most requirements with minor gaps. Worth interviewing.
              </p>
            </div>

            <div className="border-l-4 border-yellow-500 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">Tier C</span>
                <span className="font-semibold">50-69% Match</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Potential candidate.</strong> Some skills match but has gaps. Consider if adjustable.
              </p>
            </div>

            <div className="border-l-4 border-gray-400 pl-4 py-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-bold">Tier D</span>
                <span className="font-semibold">Below 50% Match</span>
              </div>
              <p className="text-gray-700 text-sm">
                <strong>Not recommended.</strong> Significant gaps in requirements. Consider for different roles.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              How Scoring Works
            </h3>
            <ul className="text-sm text-blue-900 space-y-1 ml-5 list-disc">
              <li><strong>Skills (40%):</strong> Technical and domain expertise match</li>
              <li><strong>Experience (30%):</strong> Years of relevant experience</li>
              <li><strong>Education (15%):</strong> Degree and certification alignment</li>
              <li><strong>Location (10%):</strong> Geographic fit for role</li>
              <li><strong>Certifications (5%):</strong> Professional credentials</li>
            </ul>
          </div>
        </div>

        {/* Resume Upload Best Practices */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Upload className="w-7 h-7 text-orange-600" />
            Resume Upload Best Practices
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                ✓ Do This
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Use standard formats: PDF, DOCX, TXT</li>
                <li>✓ Ensure text is selectable (not scanned images)</li>
                <li>✓ Include clear sections: Experience, Education, Skills</li>
                <li>✓ Keep file size under 10MB</li>
                <li>✓ Use well-formatted, ATS-friendly resumes</li>
                <li>✓ Include contact information (email, phone)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                ✗ Avoid This
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✗ Scanned images or photos of resumes</li>
                <li>✗ Heavy graphics, charts, or infographics</li>
                <li>✗ Password-protected files</li>
                <li>✗ Files larger than 10MB</li>
                <li>✗ Unusual fonts or colors</li>
                <li>✗ Incomplete or vague information</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Low Confidence Score?</strong> If a resume gets below 70% confidence, it might have formatting issues. 
              Review the extracted data in the candidate profile and edit if needed.
            </p>
          </div>
        </div>

        {/* External Search */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Search className="w-7 h-7 text-teal-600" />
            Finding External Candidates
          </h2>

          <p className="text-gray-700 mb-4">
            Can't find the right candidate in your library? Use <strong>"Find External Candidates"</strong> 
            to search Apollo.io and other professional databases.
          </p>

          <div className="bg-teal-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">How It Works:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Paste your job description in the Match page</li>
              <li>Click "Find External Candidates"</li>
              <li>Enter location (e.g., "Remote", "London", "Belgium")</li>
              <li>Choose how many candidates to import (5-50)</li>
              <li>AI automatically adds them to your library and runs the match</li>
            </ol>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>💡 Setup Required:</strong> Contact your administrator to configure Apollo API access. 
              External search is billed separately through Apollo.io.
            </p>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-white rounded-2xl border shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Shield className="w-7 h-7 text-red-600" />
            Troubleshooting Common Issues
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">❓ "No matches found"</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Likely Cause:</strong> Your database might be empty or filters too strict.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Solution:</strong> Upload more resumes to your Library, or try "Find External Candidates"
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">❓ "Low confidence scores on uploads"</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Likely Cause:</strong> Resume has poor formatting or is a scanned image.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Solution:</strong> Request a text-based version from the candidate, or manually review and edit the profile
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">❓ "Parsing failed"</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Likely Cause:</strong> File is corrupted, password-protected, or unsupported format.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Solution:</strong> Re-export the resume as PDF or DOCX and try again
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">❓ "External search not working"</h3>
              <p className="text-gray-700 text-sm mb-2">
                <strong>Likely Cause:</strong> Apollo API key not configured or expired.
              </p>
              <p className="text-gray-700 text-sm">
                <strong>Solution:</strong> Check Settings → External Sources, or contact support
              </p>
            </div>
          </div>
        </div>

        {/* System Requirements */}
        <div className="bg-white rounded-2xl border shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Clock className="w-7 h-7 text-indigo-600" />
            System Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Supported File Formats</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• PDF (.pdf)</li>
                <li>• Microsoft Word (.docx)</li>
                <li>• Plain Text (.txt)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">File Limits</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Max size: 10MB per file</li>
                <li>• Bulk upload: 50 files max</li>
                <li>• Processing time: 5-10 seconds per resume</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Primary: OpenAI GPT-4</li>
                <li>• Fallback: Claude (Anthropic)</li>
                <li>• Final fallback: Regex parsing</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Data Storage</h3>
              <ul className="space-y-1 text-gray-700">
                <li>• Secure cloud database (Supabase)</li>
                <li>• Full-text search enabled</li>
                <li>• Automatic backups daily</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Still Need Help?</h3>
          <p className="mb-4">Our support team is here for you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@talentplus.ai" 
              className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Email Support
            </a>
            <a 
              href="/docs" 
              className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/30 transition"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}