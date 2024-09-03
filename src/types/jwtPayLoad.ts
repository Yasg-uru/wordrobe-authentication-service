export interface Jwtpayload {
  username: string;
  email: string;
  isVerified: boolean;
  id: string;
}
export interface JWT_Decoded {
  username: string;
  email: string;
  id: string;
  isVerified: string;
  iat: number;
  exp: number;
}
