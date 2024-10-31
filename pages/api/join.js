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

    // First, check if the email already exists
    const { data: existingEntry } = await supabase
      .from('waitlist')
      .select('current_position, referral_code')
      .eq('email', email)
      .single();

    // If email exists, return their position without indicating it's a duplicate
    if (existingEntry) {
      return res.status(200).json({
        position: existingEntry.current_position,
        referralCode: existingEntry.referral_code
      });
    }

    // If email doesn't exist, proceed with insertion
    const { data: newEntry, error } = await supabase
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
      // Handle race condition where email was inserted between our check and insert
      if (error.code === '23505') {
        const { data: raceEntry } = await supabase
          .from('waitlist')
          .select('current_position, referral_code')
          .eq('email', email)
          .single();
          
        return res.status(200).json({
          position: raceEntry.current_position,
          referralCode: raceEntry.referral_code
        });
      }
      throw error;
    }

    return res.status(200).json({
      position: newEntry.current_position,
      referralCode: newEntry.referral_code
    });

  } catch (error) {
    console.error('Join error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}