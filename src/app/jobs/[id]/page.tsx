// src/app/jobs/[id]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Edit2, Trash2, Play, Pause, X, MoreVertical,
  Building2, MapPin, DollarSign, Calendar, Users, Target,
  TrendingUp, Clock, Briefcase, CheckCircle, AlertCircle,
  Send, Eye, Star, Share2, Download, Plus, Search
} from 'lucide-react';

type Tab = 'overview' | 'candidates' | 'submissions' | 'activity';

interface Job {
  id: string;
  title: string;
  status: 'active' | 'draft' | 'on_hold' | 'closed';
  client: {
    id: string;
    name: string;
    contact_person: string;
    contact_email: string;
  };
  location: string;
  country: string;
  contract_type: 'freelance' | 'permanent';
  duration?: string;
  start_date: string;
  daily_rate?: string;
  salary_range?: string;
  num_positions: number;
  filled_positions: number;
  required_skills: string[];
  optional_skills: string[];
  experience_years: string;
  education_level: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  candidates_count: number;
  submissions_count: number;
  interviews_count: number;
  created_at: string;
  updated_at: string;
  assigned_to?: {
    id: string;
    name: string;
  };
  health_score: number;
  internal_notes: string;
}

// Will be replaced with API data
const PLACEHOLDER_JOB: Job = {
  id: '',
  title: 'Loading...',
  status: 'active',
  client: { id: '', name: '', contact_person: '', contact_email: '' },
  location: '',
  country: '',
  contract_type: 'freelance',
  start_date: '',
  num_positions: 1,
  filled_positions: 0,
  required_skills: [],
  optional_skills: [],
  experience_years: '',
  education_level: '',
  priority: 'medium',
  description: '',
  candidates_count: 0,
  submissions_count: 0,
  interviews_count: 0,
  created_at: '',
  updated_at: '',
  health_score: 0,
  internal_notes: ''
};

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showActions, setShowActions] = useState(false);

  // Replace with: const { data: job, loading } = useJob(params.id);
  const job = PLACEHOLDER_JOB;
  const loading = false;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      // await fetch(`/api/jobs/${params.id}`, { method: 'DELETE' });
      router.push('/jobs');
    } catch (error) {
      alert('Failed to delete job');
    }
  };

  const handleStatusChange = async (newStatus: Job['status']) => {
    try {
      // await fetch(`/api/jobs/${params.id}`, {
      //   method: 'PATCH',
      //   body: JSON.stringify({ status: newStatus })
      // });
      alert(`Job ${newStatus}`);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!job.id) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Jobs
          </button>

          <div className="bg-white rounded-xl shadow-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                  <StatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    <span>{job.client.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {job.start_date}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/match?jobId=${job.id}`)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Match Candidates
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>

                  {showActions && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-lg shadow-xl z-10">
                      <button
                        onClick={() => router.push(`/jobs/${job.id}/edit`)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Job
                      </button>
                      <button
                        onClick={() => handleStatusChange(job.status === 'active' ? 'on_hold' : 'active')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        {job.status === 'active' ? 'Pause Job' : 'Activate Job'}
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        Export
                      </button>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-2 text-sm text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Job
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
              <QuickStat label="Positions" value={`${job.filled_positions}/${job.num_positions}`} icon={Users} />
              <QuickStat label="Candidates" value={job.candidates_count} icon={Target} />
              <QuickStat label="Submissions" value={job.submissions_count} icon={Send} />
              <QuickStat label="Interviews" value={job.interviews_count} icon={Eye} />
              <QuickStat
                label="Health"
                value={`${job.health_score}%`}
                icon={TrendingUp}
                color={job.health_score >= 70 ? 'green' : job.health_score >= 40 ? 'yellow' : 'red'}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="flex border-b overflow-x-auto">
              <TabButton
                active={activeTab === 'overview'}
                onClick={() => setActiveTab('overview')}
                label="Overview"
              />
              <TabButton
                active={activeTab === 'candidates'}
                onClick={() => setActiveTab('candidates')}
                label="Candidates"
                badge={job.candidates_count}
              />
              <TabButton
                active={activeTab === 'submissions'}
                onClick={() => setActiveTab('submissions')}
                label="Submissions"
                badge={job.submissions_count}
              />
              <TabButton
                active={activeTab === 'activity'}
                onClick={() => setActiveTab('activity')}
                label="Activity"
              />
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab job={job} />}
        {activeTab === 'candidates' && <CandidatesTab job={job} />}
        {activeTab === 'submissions' && <SubmissionsTab job={job} />}
        {activeTab === 'activity' && <ActivityTab job={job} />}
      </div>
    </div>
  );
}

// Overview Tab
function OverviewTab({ job }: { job: Job }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.required_skills.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm border border-red-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {job.optional_skills.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Optional Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.optional_skills.map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              {job.experience_years && (
                <div>
                  <div className="text-sm text-gray-600">Experience</div>
                  <div className="font-medium text-gray-900">{job.experience_years}</div>
                </div>
              )}
              {job.education_level && (
                <div>
                  <div className="text-sm text-gray-600">Education</div>
                  <div className="font-medium text-gray-900 capitalize">{job.education_level.replace('_', ' ')}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Company</span>
              <span className="font-medium text-gray-900">{job.client.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contact Person</span>
              <span className="font-medium text-gray-900">{job.client.contact_person}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{job.client.contact_email}</span>
            </div>
          </div>
          <button
            onClick={() => window.location.href = `/clients/${job.client.id}`}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            View Client Profile
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Contract Details */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contract Details</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Type</span>
              <span className="font-medium text-gray-900 capitalize">{job.contract_type}</span>
            </div>
            {job.duration && (
              <div className="flex justify-between">
                <span className="text-gray-600">Duration</span>
                <span className="font-medium text-gray-900">{job.duration}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Start Date</span>
              <span className="font-medium text-gray-900">{job.start_date}</span>
            </div>
            {job.daily_rate && (
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate</span>
                <span className="font-medium text-gray-900">{job.daily_rate}</span>
              </div>
            )}
            {job.salary_range && (
              <div className="flex justify-between">
                <span className="text-gray-600">Salary</span>
                <span className="font-medium text-gray-900">{job.salary_range}</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filling Progress</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Positions Filled</span>
                <span className="font-semibold text-gray-900">
                  {job.filled_positions}/{job.num_positions}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${(job.filled_positions / job.num_positions) * 100}%` }}
                ></div>
              </div>
            </div>

            {job.assigned_to && (
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">Assigned To</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                    {job.assigned_to.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{job.assigned_to.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Internal Notes */}
        {job.internal_notes && (
          <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Internal Notes</h2>
            <p className="text-sm text-gray-700">{job.internal_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Candidates Tab
function CandidatesTab({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Linked Candidates</h2>
        <button
          onClick={() => window.location.href = `/match?jobId=${job.id}`}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Match Candidates
        </button>
      </div>

      <EmptyState
        icon={Users}
        title="No candidates yet"
        description="Use AI matching to find suitable candidates"
        actionLabel="Match Candidates"
        onAction={() => window.location.href = `/match?jobId=${job.id}`}
      />
    </div>
  );
}

// Submissions Tab
function SubmissionsTab({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Submissions</h2>
      </div>

      <EmptyState
        icon={Send}
        title="No submissions yet"
        description="Submit candidates to the client to get started"
      />
    </div>
  );
}

// Activity Tab
function ActivityTab({ job }: { job: Job }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
      
      <div className="space-y-4">
        <ActivityItem
          icon={CheckCircle}
          title="Job Created"
          description={`Job posted by ${job.assigned_to?.name || 'Admin'}`}
          timestamp={job.created_at}
          color="green"
        />
      </div>
    </div>
  );
}

// Helper Components
function TabButton({ active, onClick, label, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
          {badge}
        </span>
      )}
    </button>
  );
}

function QuickStat({ label, value, icon: Icon, color = 'blue' }: any) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  return (
    <div className="text-center">
      <Icon className={`w-5 h-5 mx-auto mb-1 ${colors[color]}`} />
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Job['status'] }) {
  const config = {
    active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-300' },
    draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700 border-gray-300' },
    on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    closed: { label: 'Closed', color: 'bg-blue-100 text-blue-700 border-blue-300' }
  };

  const { label, color } = config[status];

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${color}`}>
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Job['priority'] }) {
  const config = {
    low: { label: 'Low', color: 'bg-gray-100 text-gray-700' },
    medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
    high: { label: 'High', color: 'bg-orange-100 text-orange-700' },
    urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700' }
  };

  const { label, color } = config[priority];

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${color}`}>
      {label}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading job details...</p>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
        <p className="text-gray-600 mb-6">This job doesn't exist or has been deleted</p>
        <button
          onClick={() => window.location.href = '/jobs'}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Jobs
        </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: any) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function ActivityItem({ icon: Icon, title, description, timestamp, color }: any) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-${color}-100`}>
        <Icon className={`w-4 h-4 text-${color}-600`} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">{description}</div>
        <div className="text-xs text-gray-500 mt-1">
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}