import { createContext, useContext } from "react";
import { ThemeProvider } from "@providers/theme-provider.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@providers/auth-provider";
import { AppProvider } from "@providers/app-provider";

const queryClient = new QueryClient();

type BaseProviderProps = {
  children: React.ReactNode;
};

type BaseProviderState = Record<string, never>;

const initialState: BaseProviderState = {};

const BaseProviderContext = createContext<BaseProviderState>(initialState);

export function BaseProvider({ children, ...props }: BaseProviderProps) {
  return (
    <BaseProviderContext.Provider {...props} value={initialState}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AppProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BaseProviderContext.Provider>
  );
}

export const useBase = () => {
  const context = useContext(BaseProviderContext);

  if (context === undefined)
    throw new Error("useBase must be used within a BaseProvider");

  return context;
};
