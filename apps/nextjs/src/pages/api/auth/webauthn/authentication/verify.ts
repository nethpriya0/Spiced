import type { NextApiRequest, NextApiResponse } from 'next'
import { 
  verifyAuthenticationResponse,
  type VerifyAuthenticationResponseOpts,
} from '@simplewebauthn/server'
import { isoBase64URL } from '@simplewebauthn/server/helpers'
import { createHash } from 'crypto'
import { userChallenges, users, rpID, origin } from '../registration/begin'

// Generate a deterministic wallet address from email (same as registration)
function generateWalletAddress(email: string): `0x${string}` {
  const hash = createHash('sha256').update(email + 'spice_platform_seed').digest('hex')
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
    const { email, authResp } = req.body

    if (!email || !authResp) {
      return res.status(400).json({ error: 'Email and authentication response are required' })
    }

    // Get the stored challenge
    const expectedChallenge = userChallenges.get(email)
    if (!expectedChallenge) {
      return res.status(400).json({ error: 'No challenge found for this email' })
    }

    // Get user
    const user = users.get(email)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Find the credential being used (compare raw credential ID from authResp)
    const credentialID = new Uint8Array(Buffer.from(authResp.id, 'base64url'))
    const credential = user.credentials.find(cred => {
      // Compare Uint8Arrays properly
      return cred.id.length === credentialID.length && 
             cred.id.every((byte, index) => byte === credentialID[index])
    })
    
    if (!credential) {
      return res.status(400).json({ error: 'Credential not found' })
    }

    const opts: VerifyAuthenticationResponseOpts = {
      response: authResp,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: isoBase64URL.fromBuffer(credential.id),
        publicKey: credential.publicKey,
        counter: credential.counter,
      },
      requireUserVerification: true,
    }

    console.log('🔑 [WebAuthn] Verifying authentication response for:', email)
    const verification = await verifyAuthenticationResponse(opts)

    if (!verification.verified) {
      console.log('❌ [WebAuthn] Authentication verification failed for:', email)
      return res.status(400).json({ error: 'Authentication verification failed' })
    }

    // Update the counter
    credential.counter = verification.authenticationInfo.newCounter

    // Clean up the challenge
    userChallenges.delete(email)

    const walletAddress = generateWalletAddress(email)

    console.log(`✅ [WebAuthn] User authenticated successfully: ${email}`)
    console.log(`📋 [WebAuthn] Wallet address: ${walletAddress}`)

    res.status(200).json({
      verified: true,
      user: {
        id: uint8ArrayToBase64url(user.id),
        email: user.email,
        name: user.name,
        address: walletAddress,
        createdAt: new Date().toISOString(),
      },
      credential: {
        id: uint8ArrayToBase64url(credential.id),
        publicKey: uint8ArrayToBase64url(credential.publicKey),
        counter: credential.counter,
      }
    })
  } catch (error) {
    console.error('❌ [WebAuthn] Authentication verification error:', error)
    res.status(500).json({ error: 'Authentication verification failed' })
  }
}