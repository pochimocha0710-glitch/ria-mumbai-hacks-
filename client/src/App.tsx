import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Leaderboard from "@/pages/Leaderboard";
import HowItWorks from "@/pages/HowItWorks";
import Agent from "@/pages/Agent";
import Dashboard from "@/pages/Dashboard";
import SignIn from "@/pages/SignIn";
import PostureCheck from "@/components/PostureCheck";
import MoodDetector from "@/components/MoodDetector";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Homepage has its own navigation */}
      <Route path="/" component={Home} />
      <Route path="/signin" component={SignIn} />

      {/* All other pages use Layout with global header */}
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/leaderboard">
        <Layout>
          <Leaderboard />
        </Layout>
      </Route>
      <Route path="/how-it-works">
        <Layout>
          <HowItWorks />
        </Layout>
      </Route>
      <Route path="/agent">
        <Layout>
          <Agent />
        </Layout>
      </Route>
      <Route path="/posture-check">
        <Layout>
          <PostureCheck />
        </Layout>
      </Route>
      <Route path="/mood-detector">
        <Layout>
          <MoodDetector />
        </Layout>
      </Route>
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}

import { useState, useEffect } from "react";
import { AgenticLoader } from "@/components/ui/AgenticLoader";

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          {loading ? (
            <AgenticLoader onComplete={() => setLoading(false)} />
          ) : (
            <Router />
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
