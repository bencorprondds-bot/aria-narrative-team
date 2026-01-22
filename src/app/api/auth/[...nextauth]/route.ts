import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Helper to refresh the access token
async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";

    console.log(`[NextAuth] Refreshing Token. Has RefreshToken? ${!!token.refreshToken}`);

    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: body,
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      console.error("[NextAuth] Refresh failed response:", refreshedTokens);
      throw refreshedTokens
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    }
  } catch (error) {
    console.error("[NextAuth] Error refreshing access token (Catch):", error)

    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.accessToken = token.accessToken;
      // @ts-ignore
      session.error = token.error;
      return session;
    },
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        console.log("JWT Callback: New Sign In. Access Token received.");
        return {
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_in as number * 1000),
          refreshToken: account.refresh_token,
          user: token.user,
        }
      }

      // Return previous token if the access token has not expired yet
      // Buffer of 1 minute
      if (Date.now() < (token.accessTokenExpires as number - 60000)) {
        return token
      }

      // Access token has expired, try to update it
      console.log("JWT Callback: Token expired, refreshing...");
      return await refreshAccessToken(token)
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
