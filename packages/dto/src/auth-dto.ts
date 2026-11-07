export interface UserDto {
  id: string;
  email: string;
  userName: string;
  gender?: "male" | "female" | "other";
  age?: number;
}

export interface TokenPairDto {
  accessToken: string;
  refreshToken: string;
}

// data of POST /api/auth/register
export interface RegisterResponseDto {
  user: UserDto;
}

// data of POST /api/auth/login
export interface LoginResponseDto extends TokenPairDto {
  user: UserDto;
}

// data of POST /api/auth/refresh
export type RefreshResponseDto = TokenPairDto;

// data of GET /api/auth/me
export interface MeResponseDto {
  user: UserDto;
}
