import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // In a real application, you might want to:
    // 1. Invalidate any server-side sessions
    // 2. Log the logout event
    // 3. Clean up any temporary data
    
    console.log('📋 [WebAuthn] User logout requested')
    
    res.status(200).json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    console.error('❌ [WebAuthn] Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
}