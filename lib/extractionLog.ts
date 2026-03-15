import { supabase } from './supabase';

function inferSource(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
  return 'other';
}

export async function logExtraction(url: string, response: any, success: boolean): Promise<void> {
  try {
    await supabase.from('extraction_logs').insert({
      url,
      source: inferSource(url),
      response,
      success,
    });
  } catch (e) {
    console.warn('Failed to log extraction:', e);
  }
}
