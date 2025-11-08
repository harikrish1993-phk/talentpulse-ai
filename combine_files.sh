#!/bin/bash

# Output file
output_file="test.txt"

# Folders to include (relative to current directory)
include_dirs=("src" "data" "scripts" "database" "config" "public")

# Specific files in the current directory to include
include_files=(
  "package.json"
  "next-env.d.ts"
  "next.config.js"
  "postcss.config.js"
  "tailwind.config.js"
  "tsconfig.json"
  ".env.local"
  "setup-talentpulse.sh"
  "middleware.js"
)

# Clear previous output
> "$output_file"

# --- Function to process files in a given directory ---
process_directory() {
    local dir="$1"
    find "$dir" -type f
}

# --- 1️⃣ Include specific files from the current directory ---
echo "📂 Including specific root files..."
for file in "${include_files[@]}"; do
    if [ -f "$file" ]; then
        echo "File: ./$file" >> "$output_file"
        echo "Content:" >> "$output_file"
        cat "$file" >> "$output_file"
        echo -e "\n-----------------------------\n" >> "$output_file"
    else
        echo "⚠️ File not found: $file"
    fi
done

# --- 2️⃣ Include all files from specified subdirectories ---
for dir in "${include_dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo "📂 Processing directory: $dir"
        process_directory "$dir" | while read -r file; do
            echo "File: $file" >> "$output_file"
            echo "Content:" >> "$output_file"
            cat "$file" >> "$output_file"
            echo -e "\n-----------------------------\n" >> "$output_file"
        done
    else
        echo "⚠️ Directory not found: $dir"
    fi
done

echo "✅ Combined file created: $output_file"
