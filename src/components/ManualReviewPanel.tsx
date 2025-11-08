export default function ManualReviewPanel({ rawText, suggested, onApprove }: any) {
    return (
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h4>Raw</h4>
          <pre style={{ maxHeight: 400, overflow: 'auto' }}>{rawText}</pre>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Suggested</h4>
          <pre>{JSON.stringify(suggested, null, 2)}</pre>
          <button onClick={() => onApprove(suggested)}>Approve</button>
        </div>
      </div>
    );
  }
  