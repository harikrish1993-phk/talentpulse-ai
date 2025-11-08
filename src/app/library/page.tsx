// src/app/library/page.tsx - FINAL PRODUCTION VERSION
'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Upload, Search, Filter, Users, RefreshCw, Download,
  Eye, Trash2, MapPin, Clock, Star, CheckCircle,
  AlertCircle, Loader2, X, ChevronDown, ChevronUp, Shield, AlertTriangle
} from 'lucide-react';
import { Candidate } from '@/lib/types';

// Upload Modal Component
function UploadModal({ onClose, onUploadSuccess }: { onClose: () => void; onUploadSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large (max 10MB)' });
      return;
    }
    
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Use PDF, DOCX, or TXT' });
      return;
    }

    setUploading(true);
    setMessage(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/parse', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: `✓ ${data.data.name} added successfully!` });
        setTimeout(() => {
          onUploadSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Upload failed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold">Upload Candidate Resume</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center m-6 hover:border-blue-500 transition-colors"
        >
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-700 font-medium">Processing with AI...</p>
              <p className="text-sm text-gray-500">Extracting candidate information</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2 font-medium">Drop candidate resume here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400 mb-4">PDF, DOCX, or TXT (max 10MB)</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="modal-file"
              />
              <label
                htmlFor="modal-file"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 inline-block transition"
              >
                Choose File
              </label>
            </>
          )}
        </div>

        {message && (
          <div className={`mx-6 mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter');
  
  const [uploading, setUploading] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [authenticityFilter, setAuthenticityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCandidates();
    
    if (filterParam === 'suspicious') {
      setAuthenticityFilter('suspicious');
      setShowFilters(true);
    }
  }, [filterParam]);

  async function loadCandidates() {
    try {
      setLoading(true);
      const response = await fetch('/api/candidates');
      if (response.ok) {
        const data = await response.json();
        setCandidates(data.data || data.candidates || []);
      }
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 50) {
      alert('Maximum 50 files allowed');
      return;
    }
    
    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
  
    try {
      const res = await fetch('/api/bulk', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        alert(`Successfully uploaded ${data.data.succeeded} of ${data.data.total} files`);
        loadCandidates();
      } else {
        alert('Bulk upload failed: ' + data.error);
      }
    } catch (err) {
      alert('Network error during bulk upload');
    } finally {
      setUploading(false);
    }
  }

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    candidates.forEach(c => {
      c.skills?.forEach(skill => skills.add(skill));
    });
    return Array.from(skills).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    let filtered = candidates.filter(candidate => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          candidate.name.toLowerCase().includes(term) ||
          candidate.title?.toLowerCase().includes(term) ||
          candidate.email?.toLowerCase().includes(term) ||
          candidate.skills.some(s => s.toLowerCase().includes(term));
        
        if (!matchesSearch) return false;
      }

      if (selectedSkills.length > 0) {
        const hasAllSkills = selectedSkills.every(skill =>
          candidate.skills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        if (!hasAllSkills) return false;
      }

      if (statusFilter !== 'all' && candidate.parse_status !== statusFilter) {
        return false;
      }

      if (authenticityFilter !== 'all') {
        const score = candidate.authenticity_score ?? null;
        if (authenticityFilter === 'high' && (score === null || score < 75)) return false;
        if (authenticityFilter === 'medium' && (score === null || score < 50 || score >= 75)) return false;
        if (authenticityFilter === 'suspicious' && (score === null || score >= 50)) return false;
        if (authenticityFilter === 'unchecked' && score !== null) return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'confidence':
          comparison = a.parse_confidence - b.parse_confidence;
          break;
        case 'experience':
          comparison = a.years_of_experience - b.years_of_experience;
          break;
        case 'authenticity':
          comparison = (a.authenticity_score || 0) - (b.authenticity_score || 0);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [candidates, searchTerm, selectedSkills, statusFilter, authenticityFilter, sortBy, sortDirection]);

  const stats = useMemo(() => ({
    total: candidates.length,
    filtered: filteredCandidates.length,
    highQuality: candidates.filter(c => c.parse_confidence >= 80).length,
    needsReview: candidates.filter(c => c.parse_status === 'needs_review').length,
    avgConfidence: candidates.length > 0
      ? Math.round(candidates.reduce((sum, c) => sum + c.parse_confidence, 0) / candidates.length)
      : 0,
    highAuthenticity: candidates.filter(c => (c.authenticity_score || 0) >= 75).length,
    suspicious: candidates.filter(c => c.authenticity_score && c.authenticity_score < 50).length
  }), [candidates, filteredCandidates]);

  async function handleExport() {
    if (selectedCandidates.length === 0) {
      alert('Please select candidates to export');
      return;
    }

    try {
      const response = await fetch('/api/candidates/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedCandidates, format: 'csv' })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `candidates_export_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        setSelectedCandidates([]);
      }
    } catch (error) {
      alert('Export failed. Please try again.');
    }
  }

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setStatusFilter('all');
    setAuthenticityFilter('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading candidate library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-8xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Candidate Library
              </h1>
              <p className="text-gray-600 mt-2">
                {stats.filtered} of {stats.total} candidates
                {searchTerm || selectedSkills.length > 0 || authenticityFilter !== 'all' ? ' (filtered)' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => document.getElementById('bulk-upload')?.click()}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Bulk Upload'}
              </button>
              <input
                id="bulk-upload"
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleBulkUpload}
                className="hidden"
              />
              <button
                onClick={loadCandidates}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-md transition"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Candidate
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-600">High Quality</div>
              <div className="text-2xl font-bold text-green-600">{stats.highQuality}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-600">Avg Quality</div>
              <div className="text-2xl font-bold text-purple-600">{stats.avgConfidence}%</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-600">Needs Review</div>
              <div className="text-2xl font-bold text-orange-600">{stats.needsReview}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setAuthenticityFilter('high');
                setShowFilters(true);
              }}>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verified
              </div>
              <div className="text-2xl font-bold text-green-600">{stats.highAuthenticity}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition"
              onClick={() => {
                setAuthenticityFilter('suspicious');
                setShowFilters(true);
              }}>
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Flagged
              </div>
              <div className="text-2xl font-bold text-red-600">{stats.suspicious}</div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-sm text-gray-600">Showing</div>
              <div className="text-2xl font-bold text-indigo-600">{stats.filtered}</div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg border p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name, skills, or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">Most Recent</option>
              <option value="name">Name A-Z</option>
              <option value="confidence">Parse Quality</option>
              <option value="authenticity">Authenticity</option>
              <option value="experience">Experience</option>
            </select>

            <button
              onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-3 border rounded-lg hover:bg-gray-50 transition"
            >
              {sortDirection === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-3 border rounded-lg hover:bg-gray-50 transition"
            >
              <Filter className="w-5 h-5 mr-2" />
              Filters
              {(selectedSkills.length > 0 || statusFilter !== 'all' || authenticityFilter !== 'all') && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {selectedSkills.length + (statusFilter !== 'all' ? 1 : 0) + (authenticityFilter !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skills</label>
                <div className="flex flex-wrap gap-2">
                  {allSkills.slice(0, 15).map(skill => (
                    <button
                      key={skill}
                      onClick={() => toggleSkillFilter(skill)}
                      className={`px-3 py-1 rounded-full text-sm transition ${
                        selectedSkills.includes(skill)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                  {allSkills.length > 15 && (
                    <span className="px-3 py-1 text-sm text-gray-500">
                      +{allSkills.length - 15} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Parse Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="completed">Completed</option>
                    <option value="needs_review">Needs Review</option>
                    <option value="processing">Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Resume Authenticity</label>
                  <select
                    value={authenticityFilter}
                    onChange={(e) => setAuthenticityFilter(e.target.value)}
                    className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="all">All Levels</option>
                    <option value="high">High (75%+)</option>
                    <option value="medium">Medium (50-75%)</option>
                    <option value="suspicious">Suspicious (&lt;50%)</option>
                    <option value="unchecked">Not Checked</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium px-4 py-2"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Selected Actions */}
          {selectedCandidates.length > 0 && (
            <div className="mt-4 pt-4 border-t flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <strong>{selectedCandidates.length}</strong> candidate{selectedCandidates.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </button>
                <button
                  onClick={() => setSelectedCandidates([])}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Candidates Grid */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border p-16 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {candidates.length === 0 ? 'No candidates yet' : 'No matches found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {candidates.length === 0
                ? 'Upload candidate resumes to build your talent library'
                : 'Try adjusting your filters or search terms'}
            </p>
            <div className="flex justify-center gap-4">
              {candidates.length === 0 ? (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Upload First Resume
                </button>
              ) : (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                className={`bg-white rounded-2xl shadow-lg border p-6 hover:shadow-xl transition-all ${
                  selectedCandidates.includes(candidate.id) ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleCandidateSelection(candidate.id);
                    }}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1 mx-3">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{candidate.name}</h3>
                    <p className="text-sm text-gray-600">{candidate.title || 'No title specified'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{candidate.parse_confidence}%</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      candidate.parse_confidence >= 80
                        ? 'bg-green-100 text-green-800'
                        : candidate.parse_confidence >= 60
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {candidate.parse_confidence >= 80 ? 'A' : candidate.parse_confidence >= 60 ? 'B' : 'C'}
                    </span>
                  </div>
                </div>

                {candidate.location && (
                  <div className="flex items-center text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {candidate.location}
                  </div>
                )}

                {/* Authenticity Badge */}
                {candidate.authenticity_score !== null && candidate.authenticity_score !== undefined && (
                  <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className={`w-4 h-4 ${
                          candidate.authenticity_score >= 75 ? 'text-green-600' :
                          candidate.authenticity_score >= 50 ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                        <span className="text-xs font-medium text-gray-700">
                          Authenticity: {candidate.authenticity_score}%
                        </span>
                      </div>
                      <Link 
                        href={`/candidate/${candidate.id}/authenticity`}
                        className="text-xs text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Report →
                      </Link>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="text-xs font-medium text-gray-700 mb-2">Skills</div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.slice(0, 5).map(skill => (
                      <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {skill}
                      </span>
                    ))}
                    {candidate.skills.length > 5 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{candidate.skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(candidate.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/candidate/${candidate.id}`)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition"
                      title="View Full Profile"
                    >
                      <Eye className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={loadCandidates}
        />
      )}
    </div>
  );
}