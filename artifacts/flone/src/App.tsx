import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetUserProfile } from "@workspace/api-client-react";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Onboarding from "@/pages/onboarding";
import Home from "@/pages/home";
import Record from "@/pages/record";
import Result from "@/pages/result";
import Report from "@/pages/report";
import MyPage from "@/pages/my";

const queryClient = new QueryClient();

function AppRouter() {
  const [location, setLocation] = useLocation();
  const { data: profile, isLoading } = useGetUserProfile();

  useEffect(() => {
    if (isLoading) return;
    if (!profile) return;

    if (!profile.onboardingCompleted && location !== "/") {
      setLocation("/");
    } else if (profile.onboardingCompleted && location === "/") {
      setLocation("/home");
    }
  }, [profile, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background max-w-[390px] mx-auto">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full animate-pulse" style={{ background: "hsl(260 60% 82%)" }} />
          <p className="text-sm text-muted-foreground">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/home" component={Home} />
      <Route path="/record" component={Record} />
      <Route path="/result/:id" component={Result} />
      <Route path="/report" component={Report} />
      <Route path="/my" component={MyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div className="min-h-screen bg-[hsl(260,30%,96%)] flex justify-center">
            <div className="w-full max-w-[390px] relative" style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}>
              <AppRouter />
            </div>
          </div>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
