import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Loader2 } from 'lucide-react';

export function Layout() {
  const { isProcessing, currentPhase } = useSimulationContext();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Processing indicator */}
        {isProcessing && currentPhase && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-primary/10 backdrop-blur-sm border-b border-primary/20">
            <div className="flex items-center justify-center gap-2 py-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-primary">{currentPhase}</span>
            </div>
          </div>
        )}

        {/* Header with sidebar trigger for mobile */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:hidden">
          <SidebarTrigger />
          <span className="font-semibold">Agent City</span>
        </header>

        {/* Main content */}
        <main className={isProcessing && currentPhase ? "pt-10" : ""}>
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
