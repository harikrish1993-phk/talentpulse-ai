#!/bin/bash

# Create main project directory
cd talentpulse-ai

# Create root files
touch README.md
touch package.json
touch .env.example
touch next.config.js
touch tsconfig.json

# Create src/app structure and files
mkdir -p src/app/dashboard
mkdir -p src/app/library
mkdir -p src/app/match
mkdir -p src/app/results

touch src/app/dashboard/page.tsx
touch src/app/library/page.tsx
touch src/app/match/page.tsx
touch src/app/results/page.tsx

# Create src/components files
mkdir -p src/components
touch src/components/CandidateCard.tsx
touch src/components/ManualReviewPanel.tsx
touch src/components/UploadForm.tsx
touch src/components/MatchScore.tsx

# Create src/styles directory
mkdir -p src/styles

# Create src/lib structure and files
mkdir -p src/lib/ai
touch src/lib/ai/robustParser.ts
touch src/lib/ai/parsePrompts.ts
touch src/lib/ai/matchScorer.ts

mkdir -p src/lib/parsers
touch src/lib/parsers/pdfParser.ts
touch src/lib/parsers/docxParser.ts

mkdir -p src/lib/storage
touch src/lib/storage/supabaseClient.ts

mkdir -p src/lib/matching
touch src/lib/matching/intelligentMatcher.ts

mkdir -p src/lib/jobs
touch src/lib/jobs/worker.ts

mkdir -p src/lib/utils
touch src/lib/utils/hashing.ts
touch src/lib/utils/validation.ts
touch src/lib/utils/configLoader.ts

# Create src/pages/api structure and files
mkdir -p src/pages/api/resumes
mkdir -p src/pages/api/public-search
mkdir -p src/pages/api/share

touch src/pages/api/resumes/parse.ts
touch src/pages/api/resumes/index.ts
touch src/pages/api/match/index.ts
touch src/pages/api/public-search/github.ts
touch src/pages/api/share/generate.ts

# Create src/types files
mkdir -p src/types
touch src/types/index.ts

# Create config files
mkdir -p config
touch config/skills.json
touch config/industries.json
touch config/locations.json
touch config/matching.json

# Create database files
mkdir -p database
touch database/schema.sql

# Create tests structure
mkdir -p tests/sample_resumes
mkdir -p tests/integration

echo "talentpulse-ai project structure created successfully!"