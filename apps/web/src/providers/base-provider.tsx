import { createContext, useContext } from "react";
import { ThemeProvider } from "@providers/theme-provider.tsx";
import { AuthProvider } from "@providers/auth-provider";
import { AppProvider } from "@providers/app-provider";

type BaseProviderProps = {
  children: React.ReactNode;
};

type BaseProviderState = Record<string, never>;

const initialState: BaseProviderState = {};

const BaseProviderContext = createContext<BaseProviderState>(initialState);

export function BaseProvider({ children, ...props }: BaseProviderProps) {
  return (
    <BaseProviderContext.Provider {...props} value={initialState}>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </BaseProviderContext.Provider>
  );
}

export const useBase = () => {
  const context = useContext(BaseProviderContext);

  if (context === undefined)
    throw new Error("useBase must be used within a BaseProvider");

  return context;
};
