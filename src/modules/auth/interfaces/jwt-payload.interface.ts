export interface JwtPayload {
  sub: number; // User Id
  iat?: number;
  exp?: number;
}
