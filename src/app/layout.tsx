import '../styles/globals.css';
import type { Metadata } from 'next';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'TalentPlus – AI Resume Matcher for Recruiters',
  description: 'Match resumes to job descriptions in seconds. AI-powered, export-ready, recruiter-first.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navigation />
        <main className="min-h-screen pt-16"> {/* Added padding for fixed nav */}
          {children}
        </main>
      </body>
    </html>
  );
}