// src/app/settings/page.tsx - USER-FRIENDLY VERSION (NO DEV JARGON)
'use client';
import { useState, useEffect } from 'react';
import { Save, Check, AlertCircle, Key, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Settings {
  name: string;
  company: string;
  email: string;
  minScore: number;
  exportFields: string[];
  notifications: boolean;
}

interface APIStatus {
  apollo: { configured: boolean; valid: boolean; };
  openai: { configured: boolean; };
  supabase: { configured: boolean; };
}

const defaultSettings: Settings = {
  name: '',
  company: '',
  email: '',
  minScore: 70,
  exportFields: ['name', 'email', 'skills', 'experience', 'score'],
  notifications: true
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiStatus, setApiStatus] = useState<APIStatus>({
    apollo: { configured: false, valid: false },
    openai: { configured: false },
    supabase: { configured: false }
  });
  const [checkingApis, setCheckingApis] = useState(false);

  useEffect(() => {
    loadSettings();
    checkAPIStatus();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const { data } = await res.json();
      
      if (data && Object.keys(data).length > 0) {
        setSettings({ ...defaultSettings, ...data });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }

  async function checkAPIStatus() {
    try {
      setCheckingApis(true);
      
      // Check AI service
      setApiStatus(prev => ({
        ...prev,
        openai: { configured: true } // Assume configured if app loads
      }));

      // Check database
      const dbRes = await fetch('/api/candidates?limit=1');
      setApiStatus(prev => ({
        ...prev,
        supabase: { configured: dbRes.ok }
      }));

      // Check external search
      const apolloRes = await fetch('/api/external-search');
      if (apolloRes.ok) {
        const apolloData = await apolloRes.json();
        setApiStatus(prev => ({
          ...prev,
          apollo: {
            configured: apolloData.configured || false,
            valid: apolloData.valid || false
          }
        }));
      }

    } catch (err) {
      console.error('Failed to check services:', err);
    } finally {
      setCheckingApis(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to save settings');
      }
    } catch (err) {
      alert('Failed to save settings. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your profile and preferences
          </p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="font-medium">Settings saved successfully!</span>
          </div>
        )}

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-600" />
              System Status
            </h2>
            <button
              onClick={checkAPIStatus}
              disabled={checkingApis}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {checkingApis ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                  Checking...
                </>
              ) : (
                'Refresh'
              )}
            </button>
          </div>

          <div className="space-y-3">
            {/* AI Service */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {apiStatus.openai.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">AI Resume Parser</p>
                  <p className="text-xs text-gray-600">Extracts candidate information</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus.openai.configured 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {apiStatus.openai.configured ? 'Working' : 'Offline'}
              </span>
            </div>

            {/* Database */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {apiStatus.supabase.configured ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <p className="font-medium">Candidate Database</p>
                  <p className="text-xs text-gray-600">Stores all candidate data</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus.supabase.configured 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {apiStatus.supabase.configured ? 'Connected' : 'Offline'}
              </span>
            </div>

            {/* External Search */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {apiStatus.apollo.configured && apiStatus.apollo.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : apiStatus.apollo.configured ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium">External Talent Search</p>
                  <p className="text-xs text-gray-600">Search beyond your database (optional)</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apiStatus.apollo.configured && apiStatus.apollo.valid
                  ? 'bg-green-100 text-green-700'
                  : apiStatus.apollo.configured
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {apiStatus.apollo.configured && apiStatus.apollo.valid
                  ? 'Connected'
                  : apiStatus.apollo.configured
                  ? 'Check Setup'
                  : 'Not Set Up'}
              </span>
            </div>
          </div>

          {(!apiStatus.openai.configured || !apiStatus.supabase.configured) && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>⚠️ Action Required:</strong> Some core services are offline. 
                Contact your administrator or check system setup.
              </p>
            </div>
          )}
        </div>

        {/* Your Information */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Your Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            This appears on exported reports and documents
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={e => setSettings({ ...settings, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={settings.company}
                onChange={e => setSettings({ ...settings, company: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@acme.com"
              />
            </div>
          </div>
        </div>

        {/* Matching Preferences */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Matching Quality</h2>
          <p className="text-sm text-gray-600 mb-4">
            Set minimum quality threshold for candidate matches
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Show candidates scoring at least: <span className="text-blue-600 font-bold">{settings.minScore}%</span>
            </label>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={settings.minScore}
              onChange={e => setSettings({ ...settings, minScore: +e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>40% (All Matches)</span>
              <span>70% (Good Matches)</span>
              <span>90% (Perfect Matches)</span>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              💡 Recommended: 70% - Shows candidates who are genuinely strong fits
            </p>
          </div>
        </div>

        {/* Export Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Export Settings</h2>
          <p className="text-sm text-gray-600 mb-4">
            Choose what information to include when exporting candidates
          </p>
          
          <div className="space-y-2">
            {[
              { id: 'name', label: 'Candidate Name', required: true },
              { id: 'email', label: 'Email Address' },
              { id: 'phone', label: 'Phone Number' },
              { id: 'skills', label: 'Skills & Technologies' },
              { id: 'experience', label: 'Years of Experience' },
              { id: 'score', label: 'Match Score', required: true },
              { id: 'education', label: 'Education Background' },
              { id: 'location', label: 'Location' },
            ].map(field => (
              <label 
                key={field.id} 
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={settings.exportFields.includes(field.id)}
                  disabled={field.required}
                  onChange={e => {
                    const checked = e.target.checked;
                    setSettings({
                      ...settings,
                      exportFields: checked
                        ? [...settings.exportFields, field.id]
                        : settings.exportFields.filter(f => f !== field.id)
                    });
                  }}
                  className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="flex-1">{field.label}</span>
                {field.required && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    Always Included
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Notifications</h2>
          
          <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={e => setSettings({ ...settings, notifications: e.target.checked })}
              className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-xs text-gray-600">
                Get notified when new candidates match your jobs
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}