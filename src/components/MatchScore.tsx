// src/components/MatchScore.tsx
export default function MatchScore({ score, tier }: { score: number; tier: string }) {
  return (
    <div className="flex justify-between items-center mt-2">
      <span className={`px-2 py-1 rounded text-xs ${
        tier === 'A' ? 'bg-green-100 text-green-800' :
        tier === 'B' ? 'bg-blue-100 text-blue-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        Tier {tier}
      </span>
      <span className="font-bold">{score}%</span>
    </div>
  );
}