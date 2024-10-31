import { createClient } from '@supabase/supabase-js';
import { setCors } from '../../utils/cors';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // Handle CORS
  if (setCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, referralCode } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const { data, error } = await supabase
      .from('waitlist')
      .insert([
        {
          email,
          referred_by: referralCode
        }
      ])
      .select('*')
      .single();

    if (error) {
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Email already registered' });
      }
      throw error;
    }

    return res.status(200).json({
      position: data.current_position,
      referralCode: data.referral_code
    });
  } catch (error) {
    console.error('Join error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}