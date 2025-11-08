// src/app/api/match/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // This is optional - only if you want to store in database
    // For MVP, localStorage in the component is sufficient
    
    const { data, error } = await db
      .from('match_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Return empty array if table doesn't exist yet
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      data: []
    });
  }
}
