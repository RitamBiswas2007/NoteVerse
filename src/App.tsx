import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { AppRoutes } from "./AppRoutes";
import { CommandMenu } from "@/components/features/CommandMenu";

const queryClient = new QueryClient();

import { WinterTheme } from "@/components/effects/WinterTheme";
import { ActivityProvider } from "@/hooks/useActivity";
import { QuestProvider } from "@/hooks/useQuests";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <SettingsProvider>
        <WinterTheme />
        <TooltipProvider>
          <Toaster />
          <Sonner position="bottom-right" duration={4000} closeButton />
          <BrowserRouter>
            <AuthProvider>
              <ActivityProvider>
                <QuestProvider>
                  <ErrorBoundary>
                    <AppRoutes />
                    <CommandMenu />
                  </ErrorBoundary>
                </QuestProvider>
              </ActivityProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </SettingsProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
