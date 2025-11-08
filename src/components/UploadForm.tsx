import { useRef, useState } from 'react';

export default function UploadForm({ onParsed }: any) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  async function upload() {
    if (!fileRef.current?.files?.[0]) return;
    const file = fileRef.current.files[0];
    const form = new FormData();
    form.append('file', file);
    setLoading(true);
    setMsg('');
    const res = await fetch('/api/resumes/parse', { method: 'POST', body: form });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMsg(JSON.stringify(data));
    } else {
      setMsg('Parsed & saved');
      onParsed && onParsed(data.candidate);
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
      <label>Select resume (PDF/DOCX/TXT)</label><br />
      <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" />
      <div style={{ marginTop: 8 }}>
        <button onClick={upload} disabled={loading}>{loading ? 'Uploading...' : 'Add Talent Profile'}</button>
      </div>
      {msg && <div style={{ marginTop: 8 }}>{msg}</div>}
    </div>
  );
}
