import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  generateAuthenticationOptions,
  type GenerateAuthenticationOptionsOpts,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { userChallenges, users, rpID } from '../registration/begin'

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

    // Check if user exists
    const user = users.get(email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Get user's credentials (properly formatted for WebAuthn)
    const allowCredentials = user.credentials.map(cred => ({
      id: isoBase64URL.fromBuffer(cred.id), // Convert Uint8Array to base64url string
      type: 'public-key' as const,
    }))

    const opts: GenerateAuthenticationOptionsOpts = {
      rpID,
      allowCredentials,
      userVerification: 'preferred',
      timeout: 60000, // 60 seconds
    }

    console.log('🔑 [WebAuthn] Generating authentication options for:', email)
    const options = await generateAuthenticationOptions(opts)

    // Store the challenge for verification
    userChallenges.set(email, options.challenge)

    console.log(`✅ [WebAuthn] Generated authentication options for: ${email}`)
    
    res.status(200).json(options)
  } catch (error) {
    console.error('❌ [WebAuthn] Authentication options error:', error)
    res.status(500).json({ error: 'Failed to generate authentication options' })
  }
}