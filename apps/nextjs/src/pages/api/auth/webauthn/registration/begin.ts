import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  generateRegistrationOptions,
  type GenerateRegistrationOptionsOpts,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { randomBytes } from 'crypto'

// In-memory storage for demo (use database in production)
const userChallenges = new Map<string, string>()
const users = new Map<string, {
  id: Uint8Array
  email: string
  name?: string
  credentials: Array<{
    id: Uint8Array
    publicKey: Uint8Array
    counter: number
  }>
}>()

// Configuration
const rpName = 'Spice Platform'
const rpID = process.env.NODE_ENV === 'production' 
  ? 'spiced3.vercel.app' 
  : 'localhost'
const origin = process.env.NODE_ENV === 'production'
  ? 'https://spiced3.vercel.app'
  : `http://localhost:3001`

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, name } = req.body

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Generate a unique user ID as Uint8Array (required by new WebAuthn spec)
    const userID = new Uint8Array(randomBytes(32))

    // Get existing credentials for this user (if any)
    const existingUser = users.get(email)
    const excludeCredentials = existingUser?.credentials.map(cred => ({
      id: isoBase64URL.fromBuffer(cred.id),
      type: 'public-key' as const,
    })) || []


    const opts: GenerateRegistrationOptionsOpts = {
      rpName,
      rpID,
      userID, // Now properly using Uint8Array
      userName: email,
      userDisplayName: name || email,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform', // Prefer platform authenticators
      },
      supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    }

    console.log('🔑 [WebAuthn] Generating registration options for:', email)
    const options = await generateRegistrationOptions(opts)

    // Store the challenge for verification
    userChallenges.set(email, options.challenge)

    console.log(`✅ [WebAuthn] Generated registration options for: ${email}`)
    
    res.status(200).json(options)
  } catch (error) {
    console.error('❌ [WebAuthn] Registration options error:', error)
    res.status(500).json({ error: 'Failed to generate registration options' })
  }
}

// Export helper data for other API routes
export { userChallenges, users, rpID, origin }