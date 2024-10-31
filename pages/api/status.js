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
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    const { data, error } = await supabase
      .from('waitlist')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;

    return res.status(200).json({
      position: data.current_position,
      referralCode: data.referral_code,
      referralCount: data.referral_count
    });
  } catch (error) {
    console.error('Status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}