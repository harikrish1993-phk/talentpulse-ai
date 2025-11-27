// src/app/jobs/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2, Sparkles, ChevronRight, ChevronLeft, Check,
  MapPin, DollarSign, Calendar, Users, Briefcase, Globe,
  Plus, X, Loader2, AlertCircle
} from 'lucide-react';

type Step = 'source' | 'details' | 'requirements';

interface JobFormData {
  // Step 1: Source
  source_type: 'direct_client' | 'consultancy' | 'job_board' | '';
  client_id: string;
  client_name: string;
  client_contact: string;
  client_email: string;
  agency_id: string;
  agency_name: string;
  
  // Step 2: Details
  job_title: string;
  location: string;
  country: string;
  contract_type: 'freelance' | 'permanent' | '';
  num_positions: number;
  duration: string;
  start_date: string;
  daily_rate: string;
  annual_salary: string;
  currency: string;
  job_description: string;
  
  // Step 3: Requirements
  required_skills: string[];
  optional_skills: string[];
  experience_years: string;
  education_level: string;
  certifications: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to: string;
  internal_notes: string;
}

const INITIAL_FORM_DATA: JobFormData = {
  source_type: '',
  client_id: '',
  client_name: '',
  client_contact: '',
  client_email: '',
  agency_id: '',
  agency_name: '',
  job_title: '',
  location: '',
  country: '',
  contract_type: '',
  num_positions: 1,
  duration: '',
  start_date: '',
  daily_rate: '',
  annual_salary: '',
  currency: 'EUR',
  job_description: '',
  required_skills: [],
  optional_skills: [],
  experience_years: '',
  education_level: '',
  certifications: [],
  priority: 'medium',
  assigned_to: '',
  internal_notes: ''
};

export default function JobCreationWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('source');
  const [formData, setFormData] = useState<JobFormData>(INITIAL_FORM_DATA);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = [
    { key: 'source', label: 'Source', icon: Building2 },
    { key: 'details', label: 'Job Details', icon: Briefcase },
    { key: 'requirements', label: 'Requirements', icon: Users }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);

  const validateStep = (step: Step): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 'source') {
      if (!formData.source_type) {
        newErrors.source_type = 'Please select a source';
      }
      if (formData.source_type === 'direct_client' && !formData.client_id && !formData.client_name) {
        newErrors.client = 'Please select or add a client';
      }
      if (formData.source_type === 'consultancy' && !formData.agency_id && !formData.agency_name) {
        newErrors.agency = 'Please select or add an agency';
      }
    }

    if (step === 'details') {
      if (!formData.job_title) newErrors.job_title = 'Job title is required';
      if (!formData.location) newErrors.location = 'Location is required';
      if (!formData.contract_type) newErrors.contract_type = 'Contract type is required';
      if (!formData.job_description || formData.job_description.length < 100) {
        newErrors.job_description = 'Job description must be at least 100 characters';
      }
    }

    if (step === 'requirements') {
      if (formData.required_skills.length === 0) {
        newErrors.required_skills = 'Add at least one required skill';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      const nextIndex = currentStepIndex + 1;
      if (nextIndex < steps.length) {
        setCurrentStep(steps[nextIndex].key as Step);
      }
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key as Step);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep('requirements')) return;

    setSaving(true);
    try {
      // API call will go here
      // const response = await fetch('/api/jobs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
      
      router.push('/jobs');
    } catch (error) {
      alert('Failed to create job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/jobs')}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Jobs
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
          <p className="text-gray-600 mt-1">Complete the form to add a new position</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isCompleted
                          ? 'bg-green-600 border-green-600 text-white'
                          : isCurrent
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-medium mt-2 ${
                        isCurrent ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg border">
          <div className="p-6 md:p-8">
            {currentStep === 'source' && (
              <SourceStep formData={formData} setFormData={setFormData} errors={errors} />
            )}
            {currentStep === 'details' && (
              <DetailsStep formData={formData} setFormData={setFormData} errors={errors} />
            )}
            {currentStep === 'requirements' && (
              <RequirementsStep formData={formData} setFormData={setFormData} errors={errors} />
            )}
          </div>

          {/* Navigation */}
          <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStepIndex === 0}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>

            {currentStepIndex < steps.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Create Job
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Source Selection
function SourceStep({ formData, setFormData, errors }: any) {
  const [showClientForm, setShowClientForm] = useState(false);
  const [showAgencyForm, setShowAgencyForm] = useState(false);

  const sources = [
    {
      value: 'direct_client',
      label: 'Direct Client',
      icon: Building2,
      description: 'Job from your client company'
    },
    {
      value: 'consultancy',
      label: 'Consultancy/Agency',
      icon: Users,
      description: 'Job from another agency'
    },
    {
      value: 'job_board',
      label: 'Job Board',
      icon: Globe,
      description: 'LinkedIn, Indeed, etc.'
    }
  ];

  // Mock data - will be replaced with API
  const mockClients = [
    { id: '1', name: 'TechCorp Solutions', contact: 'John Smith', email: 'john@tech.com' },
    { id: '2', name: 'DataFlow Inc', contact: 'Sarah Lee', email: 'sarah@data.com' }
  ];

  const mockAgencies = [
    { id: '1', name: 'Randstad Belgium', contact: 'Anna Wilson', email: 'anna@randstad.be' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Where is this job from?</h2>
        <p className="text-gray-600">Select the source to determine required information</p>
      </div>

      {/* Source Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sources.map(({ value, label, icon: Icon, description }) => (
          <button
            key={value}
            onClick={() => setFormData({ ...formData, source_type: value })}
            className={`p-6 rounded-lg border-2 text-left transition-all ${
              formData.source_type === value
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <Icon
              className={`w-8 h-8 mb-3 ${
                formData.source_type === value ? 'text-blue-600' : 'text-gray-400'
              }`}
            />
            <div className="font-semibold text-gray-900 mb-1">{label}</div>
            <div className="text-sm text-gray-600">{description}</div>
          </button>
        ))}
      </div>
      {errors.source_type && <ErrorMessage message={errors.source_type} />}

      {/* Client Selection */}
      {formData.source_type === 'direct_client' && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Select Client</h3>
          
          {!showClientForm ? (
            <div className="space-y-3">
              {mockClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      client_id: client.id,
                      client_name: client.name,
                      client_contact: client.contact,
                      client_email: client.email
                    })
                  }
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    formData.client_id === client.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-900">{client.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {client.contact} • {client.email}
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => setShowClientForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 text-blue-600 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Client
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                label="Company Name"
                required
                value={formData.client_name}
                onChange={(val: string) => setFormData({ ...formData, client_name: val })}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Contact Person"
                  value={formData.client_contact}
                  onChange={(val: string) => setFormData({ ...formData, client_contact: val })}
                />
                <FormField
                  label="Email"
                  type="email"
                  value={formData.client_email}
                  onChange={(val: string) => setFormData({ ...formData, client_email: val })}
                />
              </div>
              <button
                onClick={() => setShowClientForm(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to client list
              </button>
            </div>
          )}
          {errors.client && <ErrorMessage message={errors.client} />}
        </div>
      )}

      {/* Agency Selection */}
      {formData.source_type === 'consultancy' && (
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Select Agency</h3>
          
          {!showAgencyForm ? (
            <div className="space-y-3">
              {mockAgencies.map((agency) => (
                <button
                  key={agency.id}
                  onClick={() =>
                    setFormData({
                      ...formData,
                      agency_id: agency.id,
                      agency_name: agency.name
                    })
                  }
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    formData.agency_id === agency.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="font-medium text-gray-900">{agency.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {agency.contact} • {agency.email}
                  </div>
                </button>
              ))}
              
              <button
                onClick={() => setShowAgencyForm(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 text-purple-600 font-medium flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New Agency
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <FormField
                label="Agency Name"
                required
                value={formData.agency_name}
                onChange={(val: string) => setFormData({ ...formData, agency_name: val })}
              />
              <button
                onClick={() => setShowAgencyForm(false)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to agency list
              </button>
            </div>
          )}
          {errors.agency && <ErrorMessage message={errors.agency} />}
        </div>
      )}
    </div>
  );
}

// Step 2: Job Details
function DetailsStep({ formData, setFormData, errors }: any) {
  const [extracting, setExtracting] = useState(false);

  const handleAIExtract = async () => {
    if (formData.job_description.length < 100) {
      alert('Please enter at least 100 characters for AI extraction');
      return;
    }

    setExtracting(true);
    try {
      // API call will go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock AI extraction
      setFormData({
        ...formData,
        job_title: 'Senior Full Stack Developer',
        location: 'Remote (EU)',
        required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL']
      });
    } catch (error) {
      alert('AI extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Job Details</h2>
        <p className="text-gray-600">Provide complete job information</p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Job Title"
          required
          value={formData.job_title}
          onChange={(val: string) => setFormData({ ...formData, job_title: val })}
          error={errors.job_title}
          placeholder="e.g., Senior Full Stack Developer"
        />
        <FormField
          label="Location"
          required
          value={formData.location}
          onChange={(val: string) => setFormData({ ...formData, location: val })}
          error={errors.location}
          placeholder="e.g., Remote, Brussels, Hybrid"
        />
        <FormField
          label="Number of Positions"
          type="number"
          value={formData.num_positions}
          onChange={(val: number) => setFormData({ ...formData, num_positions: val })}
          min={1}
        />
        <FormSelect
          label="Country"
          value={formData.country}
          onChange={(val: string) => setFormData({ ...formData, country: val })}
          options={[
            { value: '', label: 'Select country...' },
            { value: 'BE', label: 'Belgium' },
            { value: 'NL', label: 'Netherlands' },
            { value: 'LU', label: 'Luxembourg' },
            { value: 'DE', label: 'Germany' },
            { value: 'FR', label: 'France' }
          ]}
        />
      </div>

      {/* Contract Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Contract Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormData({ ...formData, contract_type: 'freelance' })}
            className={`p-4 rounded-lg border-2 ${
              formData.contract_type === 'freelance'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Briefcase className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Freelance/Contract</div>
          </button>
          <button
            onClick={() => setFormData({ ...formData, contract_type: 'permanent' })}
            className={`p-4 rounded-lg border-2 ${
              formData.contract_type === 'permanent'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <Building2 className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium">Permanent</div>
          </button>
        </div>
        {errors.contract_type && <ErrorMessage message={errors.contract_type} />}
      </div>

      {/* Contract-specific fields */}
      {formData.contract_type === 'freelance' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Duration"
            value={formData.duration}
            onChange={(val: string) => setFormData({ ...formData, duration: val })}
            placeholder="e.g., 6 months"
          />
          <FormField
            label="Start Date"
            value={formData.start_date}
            onChange={(val: string) => setFormData({ ...formData, start_date: val })}
            placeholder="e.g., ASAP, January 2025"
          />
          <FormField
            label="Daily Rate"
            value={formData.daily_rate}
            onChange={(val: string) => setFormData({ ...formData, daily_rate: val })}
            placeholder="e.g., €600-700"
          />
        </div>
      )}

      {formData.contract_type === 'permanent' && (
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Start Date"
            value={formData.start_date}
            onChange={(val: string) => setFormData({ ...formData, start_date: val })}
            placeholder="e.g., February 2025"
          />
          <FormField
            label="Annual Salary"
            value={formData.annual_salary}
            onChange={(val: string) => setFormData({ ...formData, annual_salary: val })}
            placeholder="e.g., €50,000-60,000"
          />
        </div>
      )}

      {/* Job Description with AI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Job Description <span className="text-red-500">*</span>
          </label>
          <button
            onClick={handleAIExtract}
            disabled={extracting || formData.job_description.length < 100}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2"
          >
            {extracting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI Extract
              </>
            )}
          </button>
        </div>
        <textarea
          value={formData.job_description}
          onChange={(e) => setFormData({ ...formData, job_description: e.target.value })}
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="Paste complete job description here..."
        />
        <div className="flex justify-between mt-2 text-xs">
          <span className={formData.job_description.length >= 100 ? 'text-green-600' : 'text-gray-500'}>
            {formData.job_description.length} characters
            {formData.job_description.length < 100 && ' (minimum 100)'}
          </span>
        </div>
        {errors.job_description && <ErrorMessage message={errors.job_description} />}
      </div>
    </div>
  );
}

// Step 3: Requirements
function RequirementsStep({ formData, setFormData, errors }: any) {
  const [newSkill, setNewSkill] = useState('');

  const addSkill = (type: 'required' | 'optional') => {
    if (!newSkill.trim()) return;
    
    const field = type === 'required' ? 'required_skills' : 'optional_skills';
    if (!formData[field].includes(newSkill.trim())) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (type: 'required' | 'optional', skill: string) => {
    const field = type === 'required' ? 'required_skills' : 'optional_skills';
    setFormData({
      ...formData,
      [field]: formData[field].filter((s: string) => s !== skill)
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Requirements & Skills</h2>
        <p className="text-gray-600">Define what you're looking for</p>
      </div>

      {/* Required Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Required Skills <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.required_skills.map((skill: string) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-300 flex items-center gap-2"
            >
              {skill}
              <button onClick={() => removeSkill('required', skill)}>
                <X className="w-3.5 h-3.5 hover:text-red-900" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('required'))}
            placeholder="Type skill and press Enter"
            className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => addSkill('required')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
          >
            Add
          </button>
        </div>
        {errors.required_skills && <ErrorMessage message={errors.required_skills} />}
      </div>

      {/* Optional Skills */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optional Skills (Nice to Have)
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {formData.optional_skills.map((skill: string) => (
            <span
              key={skill}
              className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-300 flex items-center gap-2"
            >
              {skill}
              <button onClick={() => removeSkill('optional', skill)}>
                <X className="w-3.5 h-3.5 hover:text-blue-900" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('optional'))}
            placeholder="Type skill and press Enter"
            className="flex-1 p-2.5 border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => addSkill('optional')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      {/* Other Requirements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Experience Required"
          value={formData.experience_years}
          onChange={(val: string) => setFormData({ ...formData, experience_years: val })}
          placeholder="e.g., 5+ years, 3-5 years"
        />
        <FormSelect
          label="Education Level"
          value={formData.education_level}
          onChange={(val: string) => setFormData({ ...formData, education_level: val })}
          options={[
            { value: '', label: 'Not specified' },
            { value: 'high_school', label: 'High School' },
            { value: 'bachelor', label: "Bachelor's Degree" },
            { value: 'master', label: "Master's Degree" },
            { value: 'phd', label: 'PhD' }
          ]}
        />
      </div>

      {/* Internal Settings */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-900 mb-4">Internal Settings</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            label="Priority"
            value={formData.priority}
            onChange={(val: string) => setFormData({ ...formData, priority: val })}
            options={[
              { value: 'low', label: '🟢 Low' },
              { value: 'medium', label: '🟡 Medium' },
              { value: 'high', label: '🟠 High' },
              { value: 'urgent', label: '🔴 Urgent' }
            ]}
          />
          <FormSelect
            label="Assign To"
            value={formData.assigned_to}
            onChange={(val: string) => setFormData({ ...formData, assigned_to: val })}
            options={[
              { value: '', label: 'Unassigned' },
              { value: 'team_it', label: 'IT Team' },
              { value: 'sarah', label: 'Sarah Johnson' }
            ]}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Internal Notes
          </label>
          <textarea
            value={formData.internal_notes}
            onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
            rows={3}
            placeholder="Private notes for your team..."
          />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function FormField({ label, value, onChange, type = 'text', required = false, error, placeholder = '', min }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        min={min}
        className={`w-full p-2.5 border rounded-lg text-sm ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
        } focus:ring-2`}
      />
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
      <AlertCircle className="w-3 h-3" />
      <span>{message}</span>
    </div>
  );
}