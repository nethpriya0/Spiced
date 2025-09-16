import type { NextApiRequest, NextApiResponse } from 'next'
import { users } from '../registration/begin'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' })
    }

    const exists = users.has(email)
    
    console.log(`📋 [WebAuthn] User check for ${email}: ${exists ? 'exists' : 'not found'}`)
    
    res.status(200).json({ exists })
  } catch (error) {
    console.error('❌ [WebAuthn] User check error:', error)
    res.status(500).json({ error: 'Failed to check user' })
  }
}