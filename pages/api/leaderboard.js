import { createClient } from '@supabase/supabase-js';
import { setCors } from '../../utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
  if (setCors(req, res)) return;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = parseInt(req.query.limit) || 10;

    const { data, error } = await supabase
      .from('waitlist')
      .select('email, referral_count, current_position')
      .order('referral_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return res.status(200).json({ leaderboard: data });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}