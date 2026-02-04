import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SimulationProvider } from "@/contexts/SimulationContext";
import { Layout } from "@/components/layout/Layout";

// Pages
import Dashboard from "./pages/Dashboard";
import Simulation from "./pages/Simulation";
import Governor from "./pages/Governor";
import Workers from "./pages/Workers";
import Merchants from "./pages/Merchants";
import Wagers from "./pages/Wagers";
import History from "./pages/History";
import Story from "./pages/Story";
import AgentDetail from "./pages/AgentDetail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SimulationProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/governor" element={<Governor />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/merchants" element={<Merchants />} />
              <Route path="/wagers" element={<Wagers />} />
              <Route path="/history" element={<History />} />
              <Route path="/story" element={<Story />} />
              <Route path="/agent/:id" element={<AgentDetail />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SimulationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
