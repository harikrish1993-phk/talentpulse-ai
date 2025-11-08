import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('SettingsRoute');

export async function GET() {
  try {
    const { data, error } = await db
      .from('user_settings')
      .select('*')
      .limit(1);
    
    if (error) {
      logger.warn('No settings found, returning defaults');
      return NextResponse.json({ success: true, data: {} });
    }
    
    return NextResponse.json({ 
      success: true, 
      data: data?.[0]?.settings || {} 
    });
  } catch (err: any) {
    logger.error('Settings fetch error:', err);
    return NextResponse.json({ success: true, data: {} });
  }
}

export async function POST(req: NextRequest) {
  try {
    const settings = await req.json();
    
    const { data, error } = await db
      .from('user_settings')
      .upsert({ 
        settings,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'id' 
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data?.[0] });
  } catch (err: any) {
    logger.error('Settings save error:', err);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save settings' 
    });
  }
}