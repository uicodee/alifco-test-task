export interface JwtPayload {
  sub: string;
  sid: string;
}

export interface JwtRefreshPayload extends JwtPayload {
  jti: string;
}

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
}

export interface RefreshAuthenticatedUser extends AuthenticatedUser {
  refreshToken: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}
