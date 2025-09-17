import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// In-memory session storage for demo (replace with proper session management)
interface UserSession {
  sessionId: string;
  walletAddress: string;
  userType: 'farmer' | 'buyer' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const sessions: Map<string, UserSession> = new Map();

// Helper to generate session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

// Helper to clean expired sessions
function cleanExpiredSessions() {
  const now = new Date();
  for (const [sessionId, session] of sessions.entries()) {
    if (session.expiresAt < now) {
      sessions.delete(sessionId);
    }
  }
}

export const authRouter = createTRPCRouter({
  // Create session after wallet connection
  createSession: publicProcedure
    .input(z.object({
      walletAddress: z.string(),
      signature: z.string(),
      message: z.string(),
      userType: z.enum(['farmer', 'buyer', 'admin']).default('buyer'),
    }))
    .mutation(async ({ input }) => {
      // TODO: Verify signature against message and wallet address
      // For now, we'll create the session directly

      cleanExpiredSessions();

      const sessionId = generateSessionId();
      const session: UserSession = {
        sessionId,
        walletAddress: input.walletAddress.toLowerCase(),
        userType: input.userType,
        isVerified: false, // Will be determined by farmer/user status
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };

      sessions.set(sessionId, session);

      return {
        success: true,
        sessionId,
        userType: session.userType,
        expiresAt: session.expiresAt,
      };
    }),

  // Get session info
  getSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .query(async ({ input }) => {
      cleanExpiredSessions();

      const session = sessions.get(input.sessionId);

      if (!session) {
        throw new Error("Session not found or expired");
      }

      return {
        sessionId: session.sessionId,
        walletAddress: session.walletAddress,
        userType: session.userType,
        isVerified: session.isVerified,
        expiresAt: session.expiresAt,
      };
    }),

  // Verify user (check if farmer is verified, etc.)
  verifyUser: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      // TODO: Check farmer verification status from farmers router
      // For now, mark as verified
      session.isVerified = true;
      sessions.set(input.sessionId, session);

      return {
        success: true,
        isVerified: session.isVerified,
      };
    }),

  // Refresh session
  refreshSession: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const session = sessions.get(input.sessionId);

      if (!session) {
        throw new Error("Session not found");
      }

      // Extend expiration by 24 hours
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      sessions.set(input.sessionId, session);

      return {
        success: true,
        expiresAt: session.expiresAt,
      };
    }),

  // End session
  logout: publicProcedure
    .input(z.object({
      sessionId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const deleted = sessions.delete(input.sessionId);

      return {
        success: deleted,
      };
    }),

  // Get authentication challenge message for wallet signing
  getChallenge: publicProcedure
    .input(z.object({
      walletAddress: z.string(),
      userType: z.enum(['farmer', 'buyer', 'admin']).default('buyer'),
    }))
    .query(async ({ input }) => {
      const timestamp = Date.now();
      const nonce = Math.random().toString(36).substr(2, 16);

      const message = `Welcome to Spice Platform!

Please sign this message to authenticate your wallet.

Wallet: ${input.walletAddress}
User Type: ${input.userType}
Timestamp: ${timestamp}
Nonce: ${nonce}

This request will not trigger a blockchain transaction or cost any gas fees.`;

      return {
        message,
        timestamp,
        nonce,
      };
    }),

  // Admin function to get all active sessions
  getActiveSessions: publicProcedure
    .input(z.object({
      adminSessionId: z.string(),
    }))
    .query(async ({ input }) => {
      const adminSession = sessions.get(input.adminSessionId);

      if (!adminSession || adminSession.userType !== 'admin') {
        throw new Error("Unauthorized: Admin access required");
      }

      cleanExpiredSessions();

      const activeSessions = Array.from(sessions.values()).map(session => ({
        sessionId: session.sessionId,
        walletAddress: session.walletAddress,
        userType: session.userType,
        isVerified: session.isVerified,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
      }));

      return {
        sessions: activeSessions,
        total: activeSessions.length,
      };
    }),
});