// src/app/api/candidates/export/route.ts - COMPLETE EXPORT FUNCTIONALITY
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ExportAPI');

export async function POST(request: NextRequest) {
  try {
    const { ids, format = 'csv' } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No candidates selected' },
        { status: 400 }
      );
    }

    logger.info('Exporting candidates', { count: ids.length, format });

    // Fetch candidates
    const { data: candidates, error } = await db
      .from('candidates')
      .select('*')
      .in('id', ids)
      .is('deleted_at', null);

    if (error || !candidates || candidates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch candidates' },
        { status: 500 }
      );
    }

    if (format === 'csv') {
      const csv = generateCSV(candidates);
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="candidates_${Date.now()}.csv"`
        }
      });
    } else if (format === 'pdf') {
      // For PDF, we'll create a simple HTML that can be printed to PDF
      const html = generatePDF(candidates);
      
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `inline; filename="candidates_${Date.now()}.html"`
        }
      });
    } else if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: candidates,
        count: candidates.length
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid format' },
      { status: 400 }
    );

  } catch (error: any) {
    logger.error('Export failed', error);
    return NextResponse.json(
      { success: false, error: 'Export failed' },
      { status: 500 }
    );
  }
}

function generateCSV(candidates: any[]): string {
  // CSV Headers
  const headers = [
    'Name',
    'Email',
    'Phone',
    'Location',
    'Title',
    'Years of Experience',
    'Skills',
    'Education',
    'Parse Confidence',
    'Authenticity Score',
    'Source',
    'Added Date'
  ];

  // CSV Rows
  const rows = candidates.map(c => [
    escapeCsv(c.name),
    escapeCsv(c.email || ''),
    escapeCsv(c.phone || ''),
    escapeCsv(c.location || ''),
    escapeCsv(c.title || ''),
    c.years_of_experience || 0,
    escapeCsv(c.skills?.join('; ') || ''),
    escapeCsv(c.education?.map((e: any) => `${e.degree} from ${e.institution}`).join('; ') || ''),
    c.parse_confidence || 0,
    c.authenticity_score || 'N/A',
    c.source || 'upload',
    new Date(c.created_at).toLocaleDateString()
  ]);

  // Combine
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

function escapeCsv(value: string): string {
  if (!value) return '';
  
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  
  return value;
}

function generatePDF(candidates: any[]): string {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Candidate Export - TalentPlus</title>
  <style>
    @media print {
      body { margin: 0; }
      .page-break { page-break-before: always; }
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #3b82f6;
    }
    
    .header h1 {
      margin: 0;
      color: #1e40af;
      font-size: 32px;
    }
    
    .header p {
      color: #6b7280;
      margin: 10px 0 0 0;
    }
    
    .candidate {
      margin-bottom: 40px;
      padding: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      background: #f9fafb;
    }
    
    .candidate-header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      margin-bottom: 15px;
      padding-bottom: 15px;
      border-bottom: 1px solid #d1d5db;
    }
    
    .candidate-name {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
      margin: 0 0 5px 0;
    }
    
    .candidate-title {
      color: #6b7280;
      font-size: 16px;
      margin: 0;
    }
    
    .score-badge {
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 18px;
    }
    
    .score-high { background: #dcfce7; color: #166534; }
    .score-medium { background: #fef3c7; color: #92400e; }
    .score-low { background: #fee2e2; color: #991b1b; }
    
    .contact-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      color: #4b5563;
      font-size: 14px;
    }
    
    .contact-item strong {
      margin-right: 8px;
      color: #111827;
    }
    
    .section {
      margin-top: 20px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .skills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .skill-tag {
      padding: 4px 12px;
      background: #dbeafe;
      color: #1e40af;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .experience-item {
      margin-bottom: 15px;
      padding-left: 15px;
      border-left: 3px solid #3b82f6;
    }
    
    .experience-title {
      font-weight: bold;
      color: #111827;
      margin-bottom: 3px;
    }
    
    .experience-company {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 3px;
    }
    
    .experience-dates {
      color: #9ca3af;
      font-size: 13px;
      font-style: italic;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    
    @media print {
      .candidate { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 TalentPlus Candidate Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}</p>
    <p><strong>${candidates.length}</strong> candidates selected</p>
  </div>

  ${candidates.map((candidate, index) => `
    ${index > 0 ? '<div class="page-break"></div>' : ''}
    
    <div class="candidate">
      <div class="candidate-header">
        <div>
          <h2 class="candidate-name">${escapeHtml(candidate.name)}</h2>
          <p class="candidate-title">${escapeHtml(candidate.title || 'No title specified')}</p>
        </div>
        <div class="score-badge ${
          candidate.parse_confidence >= 80 ? 'score-high' : 
          candidate.parse_confidence >= 60 ? 'score-medium' : 
          'score-low'
        }">
          ${candidate.parse_confidence}% Match
        </div>
      </div>

      <div class="contact-info">
        ${candidate.email ? `
          <div class="contact-item">
            <strong>📧 Email:</strong> ${escapeHtml(candidate.email)}
          </div>
        ` : ''}
        ${candidate.phone ? `
          <div class="contact-item">
            <strong>📱 Phone:</strong> ${escapeHtml(candidate.phone)}
          </div>
        ` : ''}
        ${candidate.location ? `
          <div class="contact-item">
            <strong>📍 Location:</strong> ${escapeHtml(candidate.location)}
          </div>
        ` : ''}
        <div class="contact-item">
          <strong>💼 Experience:</strong> ${candidate.years_of_experience} years
        </div>
      </div>

      ${candidate.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${escapeHtml(candidate.summary)}</p>
        </div>
      ` : ''}

      ${candidate.skills && candidate.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Skills</div>
          <div class="skills">
            ${candidate.skills.map((skill: string) => `
              <span class="skill-tag">${escapeHtml(skill)}</span>
            `).join('')}
          </div>
        </div>
      ` : ''}

      ${candidate.experience && candidate.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Work Experience</div>
          ${candidate.experience.slice(0, 3).map((exp: any) => `
            <div class="experience-item">
              <div class="experience-title">${escapeHtml(exp.title)}</div>
              <div class="experience-company">${escapeHtml(exp.company)}${exp.location ? ` • ${escapeHtml(exp.location)}` : ''}</div>
              <div class="experience-dates">${escapeHtml(exp.start_date)} - ${escapeHtml(exp.end_date || 'Present')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${candidate.education && candidate.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${candidate.education.map((edu: any) => `
            <div class="experience-item">
              <div class="experience-title">${escapeHtml(edu.degree)}</div>
              <div class="experience-company">${escapeHtml(edu.institution)}${edu.location ? ` • ${escapeHtml(edu.location)}` : ''}</div>
              <div class="experience-dates">${escapeHtml(edu.start_year || '')} - ${escapeHtml(edu.end_year || 'Present')}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${candidate.authenticity_score ? `
        <div class="section">
          <div class="section-title">Verification</div>
          <div style="padding: 10px; background: ${
            candidate.authenticity_score >= 75 ? '#dcfce7' : 
            candidate.authenticity_score >= 50 ? '#fef3c7' : 
            '#fee2e2'
          }; border-radius: 6px;">
            <strong>Authenticity Score:</strong> ${candidate.authenticity_score}% 
            (${candidate.authenticity_risk || 'Not assessed'} risk)
          </div>
        </div>
      ` : ''}
    </div>
  `).join('')}

  <div class="footer">
    <p>Generated by TalentPlus AI Resume Matcher</p>
    <p>This document contains confidential candidate information</p>
  </div>

  <script>
    // Auto-print on load (optional)
    // window.onload = () => window.print();
  </script>
</body>
</html>
  `;

  return html;
}

function escapeHtml(text: string): string {
  if (!text) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, m => map[m]);
}