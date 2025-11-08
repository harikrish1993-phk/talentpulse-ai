// src/components/CandidateCard.tsx
import Link from 'next/link';

export default function CandidateCard({ candidate }: { candidate: any }) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md">
      <h3 className="font-bold">{candidate.name || 'Unknown'}</h3>
      <p className="text-sm text-gray-600">{candidate.email}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {(candidate.skills || []).slice(0, 5).map((skill: string) => (
          <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
            {skill}
          </span>
        ))}
      </div>
      <div className={`mt-2 text-xs px-2 py-1 rounded inline-block ${
        candidate.parse_confidence >= 80 ? 'bg-green-100 text-green-800' :
        candidate.parse_confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
        'bg-red-100 text-red-800'
      }`}>
        {candidate.parse_confidence}% confidence
      </div>
      <div className="mt-3 space-x-2">
        <Link href={`/manual-review/${candidate.id}`} className="text-sm text-blue-600">
          Review
        </Link>
      </div>
    </div>
  );
}