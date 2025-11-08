// src/components/UploadModal.tsx
'use client';
import { useState } from 'react';
import { X, Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function UploadModal({ onClose, onUploadSuccess }: { onClose: () => void; onUploadSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'File too large (max 10MB)' });
      return;
    }
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setMessage({ type: 'error', text: 'Invalid file type. Please upload PDF, DOCX, or TXT' });
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
      setMessage({ type: 'error', text: 'Upload failed. Please try again.' });
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
          <h3 className="text-xl font-bold">Upload Resume</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center m-6"
        >
          {uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
              <p className="text-gray-700">Processing...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 mb-2">Drop file or click below</p>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                className="hidden"
                id="modal-file"
              />
              <label
                htmlFor="modal-file"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer text-sm"
              >
                Choose File
              </label>
            </>
          )}
        </div>

        {message && (
          <div className={`mx-6 p-3 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.type === 'success' ? <CheckCircle className="w-4 h-4 inline mr-2" /> : <AlertCircle className="w-4 h-4 inline mr-2" />}
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}