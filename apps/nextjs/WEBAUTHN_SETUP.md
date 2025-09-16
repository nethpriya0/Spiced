# WebAuthn Email Authentication Setup

This document explains the new WebAuthn email-based authentication system that has been implemented in the Spice Platform.

## Overview

The WebAuthn authentication system allows users to register and login using their email address and biometric authentication (passkeys) including:
- Face ID / Touch ID (iOS/macOS)
- Windows Hello (Windows)
- Android biometrics
- Hardware security keys (FIDO2)

## Features

### ✅ Implemented Features

1. **Email-based Registration** - Users can create accounts using just their email
2. **Passkey Authentication** - Uses device biometrics for secure login
3. **Automatic Wallet Creation** - Generates deterministic blockchain wallet addresses
4. **Seamless Integration** - Works alongside existing Web3Auth system
5. **Fallback Support** - Gracefully falls back to Web3Auth or MockAuth
6. **Recovery Options** - Email-based account recovery

### 🔧 Technical Implementation

- **Frontend**: `EmailAuth` component with full registration/login flow
- **Backend**: Complete WebAuthn API endpoints using `@simplewebauthn` library
- **Storage**: In-memory user storage (production should use database)
- **Security**: HTTPS required, secure credential storage

## How to Use

### For Users

1. **Registration**:
   - Go to `/login` page
   - Select your role (Farmer/Buyer)
   - Choose "Email & Passkey" authentication
   - Enter your email and name
   - Click "Create Account with Passkey"
   - Follow browser prompts for biometric setup

2. **Login**:
   - Go to `/login` page
   - Select your role
   - Choose "Email & Passkey" authentication
   - Enter your email
   - Click "Sign In with Passkey"
   - Use biometric authentication

### For Developers

#### Using the WebAuthn Service

```typescript
import { webAuthnService } from '@/lib/auth/WebAuthnService'

// Register a new user
const result = await webAuthnService.register('user@example.com', 'John Doe')

// Login existing user
const result = await webAuthnService.login('user@example.com')

// Check if user is connected
const connected = await webAuthnService.isConnected()

// Get user info
const userInfo = await webAuthnService.getUserInfo()
```

#### Using the Updated AuthService

```typescript
import { authService } from '@/lib/auth/AuthService'

// Set preferred auth method
authService.setPreferredAuthMethod('webauthn')

// Use email-based registration
const result = await authService.registerWithEmail('user@example.com', 'John Doe')

// Use email-based login
const result = await authService.loginWithEmail('user@example.com')
```

## Browser Support

WebAuthn is supported on:
- **iOS**: Safari 16.4+ (iOS 16+)
- **macOS**: Safari 16.4+ (macOS Monterey+)
- **Windows**: Chrome/Edge 67+, Firefox 60+ (Windows 10+)
- **Android**: Chrome 70+, Firefox 68+ (Android 9+)
- **Linux**: Chrome 67+, Firefox 60+

## Security Features

1. **Device-bound Credentials**: Private keys never leave the user's device
2. **Biometric Protection**: Credentials protected by device biometrics
3. **Phishing Resistance**: Credentials are origin-bound
4. **No Passwords**: Eliminates password-related vulnerabilities
5. **Deterministic Wallets**: Same email always generates same wallet address

## Production Considerations

### Required Changes for Production

1. **Database Integration**:
   ```typescript
   // Replace in-memory storage with database
   // Update: registration/begin.ts, registration/verify.ts, authentication/begin.ts, authentication/verify.ts
   ```

2. **HTTPS Configuration**:
   ```javascript
   // Update rpID and origin in API endpoints
   const rpID = 'yourdomain.com'
   const origin = 'https://yourdomain.com'
   ```

3. **Session Management**:
   ```typescript
   // Implement proper session handling
   // Add JWT tokens or session storage
   ```

4. **Rate Limiting**:
   ```typescript
   // Add rate limiting to API endpoints
   // Prevent brute force attacks
   ```

### Environment Variables

Add these to your `.env.local` for production:

```env
WEBAUTHN_RP_ID=yourdomain.com
WEBAUTHN_RP_NAME="Your App Name"
WEBAUTHN_ORIGIN=https://yourdomain.com
```

## Testing

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Open Browser**: Navigate to `http://localhost:3001/login`

3. **Test Registration**:
   - Select a role
   - Choose "Email & Passkey"
   - Register with a test email
   - Complete biometric setup

4. **Test Login**:
   - Use the same email
   - Authenticate with biometrics

## Troubleshooting

### Common Issues

1. **"WebAuthn not supported"**:
   - Use a modern browser
   - Ensure HTTPS in production
   - Check browser compatibility

2. **"Authentication failed"**:
   - Verify email is correct
   - Ensure you're using the same device/browser
   - Check if user exists (registration vs login)

3. **"User already exists"**:
   - Use login instead of registration
   - Or use a different email

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('webauthn_debug', 'true')
```

## Migration from Web3Auth

Users can seamlessly switch between authentication methods:

1. **Existing Web3Auth users**: Continue using Web3Auth
2. **New users**: Can choose WebAuthn for better UX
3. **Switching**: Users can create new WebAuthn accounts alongside Web3Auth

## API Endpoints

- `POST /api/auth/webauthn/registration/begin` - Start registration
- `POST /api/auth/webauthn/registration/verify` - Complete registration
- `POST /api/auth/webauthn/authentication/begin` - Start authentication
- `POST /api/auth/webauthn/authentication/verify` - Complete authentication
- `POST /api/auth/webauthn/user/check` - Check if user exists
- `POST /api/auth/webauthn/logout` - Logout user

## Next Steps

1. **Database Integration**: Replace in-memory storage with persistent database
2. **Advanced Recovery**: Implement multiple recovery factors
3. **Cross-device Support**: Allow users to register multiple devices
4. **Admin Dashboard**: Add user management interface
5. **Analytics**: Track adoption and usage patterns