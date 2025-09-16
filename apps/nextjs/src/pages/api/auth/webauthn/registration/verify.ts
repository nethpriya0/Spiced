import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  verifyRegistrationResponse,
  type VerifyRegistrationResponseOpts,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { createHash, randomBytes } from 'crypto'
import { userChallenges, users, rpID, origin } from './begin'

// Generate a deterministic wallet address from email
function generateWalletAddress(email: string): `0x${string}` {
  const hash = createHash('sha256').update(email + 'spice_platform_seed').digest('hex')
  // Take first 20 bytes (40 chars) for Ethereum address format
  return `0x${hash.slice(0, 40)}`
}

// Convert Uint8Array to base64url for JSON serialization
function uint8ArrayToBase64url(buffer: Uint8Array): string {
  return Buffer.from(buffer).toString('base64url')
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, attResp } = req.body

    if (!email || !attResp) {
      return res.status(400).json({ error: 'Email and attestation response are required' })
    }

    // Get the stored challenge
    const expectedChallenge = userChallenges.get(email)
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for this email' })
    }

    // Check if user already exists
    if (users.has(email)) {
      return res.status(400).json({ error: 'User already exists' })
    }

    const opts: VerifyRegistrationResponseOpts = {
      response: attResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    }

    console.log('🔑 [WebAuthn] Verifying registration response for:', email)
    const verification = await verifyRegistrationResponse(opts)

    if (!verification.verified || !verification.registrationInfo) {
      console.log('❌ [WebAuthn] Registration verification failed for:', email)
      return res.status(400).json({ error: 'Registration verification failed' })
    }

    const { credential } = verification.registrationInfo
    const { id: credentialID, publicKey: credentialPublicKey, counter } = credential

    // Generate user ID and wallet address
    const userID = new Uint8Array(randomBytes(32))
    const walletAddress = generateWalletAddress(email)

    // Store the user and their credential
    users.set(email, {
      id: userID,
      email,
      name: req.body.name,
      credentials: [{
        id: isoBase64URL.toBuffer(credentialID),
        publicKey: credentialPublicKey,
        counter,
      }]
    })

    // Clean up the challenge
    userChallenges.delete(email)

    console.log(`✅ [WebAuthn] User registered successfully: ${email}`)
    console.log(`📋 [WebAuthn] Generated wallet address: ${walletAddress}`)

    res.status(200).json({
      verified: true,
      user: {
        id: uint8ArrayToBase64url(userID),
        email,
        name: req.body.name,
        address: walletAddress,
        createdAt: new Date().toISOString(),
      },
      credential: {
        id: credentialID,
        publicKey: uint8ArrayToBase64url(credentialPublicKey),
        counter,
      }
    })
  } catch (error) {
    console.error('❌ [WebAuthn] Registration verification error:', error)
    res.status(500).json({ error: 'Registration verification failed' })
  }
}