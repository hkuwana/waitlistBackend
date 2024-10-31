const allowedOrigins = ['https://trysavoy.com', 'http://localhost:3000'];

export function setCors(req, res) {
  const origin = req.headers.origin;
  
  // Check if the origin is in our allowed list
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
}

// pages/api/join.js
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
