// src/app/candidate/[id]/page.tsx - COMPLETE CANDIDATE DETAIL VIEW
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Mail, Phone, MapPin, Briefcase, GraduationCap, 
  Award, Languages, Download, Edit2, Trash2, Star, Shield,
  Calendar, Building, TrendingUp, FileText, Link as LinkIcon
} from 'lucide-react';
import { Candidate } from '@/lib/types';

export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    loadCandidate();
  }, [params.id]);

  async function loadCandidate() {
    try {
      const res = await fetch(`/api/candidates/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setCandidate(data.data);
      }
    } catch (error) {
      console.error('Failed to load candidate:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this candidate?')) return;
    
    try {
      const res = await fetch(`/api/candidates/${params.id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        router.push('/library');
      }
    } catch (error) {
      alert('Failed to delete candidate');
    }
  }

  async function downloadResume() {
    if (!candidate) return;
    
    // Create a text file with resume content
    const content = candidate.raw_text || 'No resume text available';
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${candidate.name.replace(/\s+/g, '_')}_resume.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading candidate...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Candidate Not Found</h2>
          <button
            onClick={() => router.push('/library')}
            className="text-blue-600 hover:underline"
          >
            ← Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push('/library')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Library
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={downloadResume}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-white">
                {candidate.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{candidate.name}</h1>
              <p className="text-xl text-gray-600 mb-4">{candidate.title || 'No title specified'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {candidate.email && (
                  <div className="flex items-center text-gray-700">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`mailto:${candidate.email}`} className="hover:text-blue-600">
                      {candidate.email}
                    </a>
                  </div>
                )}
                {candidate.phone && (
                  <div className="flex items-center text-gray-700">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                      {candidate.phone}
                    </a>
                  </div>
                )}
                {candidate.location && (
                  <div className="flex items-center text-gray-700">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {candidate.location}
                  </div>
                )}
                <div className="flex items-center text-gray-700">
                  <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                  {candidate.years_of_experience} years experience
                </div>
              </div>

              {/* Metadata Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  candidate.parse_confidence >= 80
                    ? 'bg-green-100 text-green-800'
                    : candidate.parse_confidence >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  Parse Quality: {candidate.parse_confidence}%
                </span>
                
                {candidate.authenticity_score !== null && (
                  <button
                    onClick={() => router.push(`/candidate/${candidate.id}/authenticity`)}
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 hover:opacity-80 ${
                      candidate.authenticity_score >= 75
                        ? 'bg-green-100 text-green-800'
                        : candidate.authenticity_score >= 50
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    Authenticity: {candidate.authenticity_score}%
                  </button>
                )}
                
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Source: {candidate.source}
                </span>
                
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  Added {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Summary */}
          {candidate.summary && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 mb-2">Professional Summary</h3>
              <p className="text-gray-700 leading-relaxed">{candidate.summary}</p>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Skills ({candidate.skills.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-600" />
            Work Experience
          </h2>
          
          {candidate.experience.length === 0 ? (
            <p className="text-gray-500">No experience listed</p>
          ) : (
            <div className="space-y-6">
              {candidate.experience.map((exp, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{exp.title}</h3>
                      <div className="flex items-center text-gray-600 mb-1">
                        <Building className="w-4 h-4 mr-1" />
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {exp.start_date} - {exp.end_date || 'Present'}
                    </div>
                  </div>
                  
                  {exp.description && (
                    <p className="text-gray-700 mb-2">{exp.description}</p>
                  )}
                  
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {exp.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                  
                  {exp.skills_used && exp.skills_used.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {exp.skills_used.map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />
            Education
          </h2>
          
          {candidate.education.length === 0 ? (
            <p className="text-gray-500">No education listed</p>
          ) : (
            <div className="space-y-4">
              {candidate.education.map((edu, index) => (
                <div key={index} className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-lg text-gray-900">{edu.degree}</h3>
                  {edu.field_of_study && (
                    <p className="text-gray-600">{edu.field_of_study}</p>
                  )}
                  <div className="flex items-center text-gray-600 mt-1">
                    <Building className="w-4 h-4 mr-1" />
                    {edu.institution}
                    {edu.location && ` • ${edu.location}`}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {edu.start_year} - {edu.end_year || 'Present'}
                    {edu.gpa && ` • GPA: ${edu.gpa}`}
                  </div>
                  
                  {edu.achievements && edu.achievements.length > 0 && (
                    <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                      {edu.achievements.map((achievement, i) => (
                        <li key={i}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        {candidate.certifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-600" />
              Certifications
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidate.certifications.map((cert, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-bold text-gray-900">{cert.name}</h3>
                  <p className="text-gray-600 text-sm">{cert.issuer}</p>
                  {cert.issue_date && (
                    <p className="text-gray-500 text-xs mt-1">
                      Issued: {cert.issue_date}
                      {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                    </p>
                  )}
                  {cert.credential_url && (
                    <a
                      href={cert.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center mt-2"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      View Credential
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {candidate.languages.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Languages className="w-5 h-5 text-indigo-600" />
              Languages
            </h2>
            
            <div className="flex flex-wrap gap-2">
              {candidate.languages.map((language, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium border border-indigo-200"
                >
                  {language}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Parse Metadata */}
        <div className="bg-gray-50 rounded-2xl border p-6">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            System Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Parse Method:</span>
              <p className="font-medium text-gray-900">{candidate.parse_method}</p>
            </div>
            <div>
              <span className="text-gray-600">Status:</span>
              <p className="font-medium text-gray-900 capitalize">{candidate.parse_status}</p>
            </div>
            <div>
              <span className="text-gray-600">File Type:</span>
              <p className="font-medium text-gray-900">{candidate.file_type?.toUpperCase()}</p>
            </div>
            <div>
              <span className="text-gray-600">Last Updated:</span>
              <p className="font-medium text-gray-900">
                {new Date(candidate.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}