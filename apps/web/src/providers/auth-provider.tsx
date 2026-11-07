import { createContext, useContext, useEffect, useState } from "react";
import { type ApiResponse } from "@DeparkHackaton/shared";
import { type MeResponseDto, type UserDto } from "@DeparkHackaton/dto";
import API from "@/lib/axios-wrapper";

type AuthContextState = {
  user: UserDto | null;
  setUser: (user: UserDto | null) => void;
  // true until the first /auth/me request has settled
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    API.get<ApiResponse<MeResponseDto>>("/auth/me")
      .then((response) => {
        if (!cancelled) setUser(response.data.data?.user ?? null);
      })
      .catch(() => {
        // not logged in (or token expired): stay anonymous
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined)
    throw new Error("useAuth must be used within an AuthProvider");

  return context;
};
