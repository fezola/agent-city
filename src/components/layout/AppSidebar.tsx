import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Play,
  Crown,
  Hammer,
  ShoppingCart,
  Dices,
  Link2,
  ScrollText,
  BookOpen,
  Map,
  Settings,
  Pause,
  SkipForward,
  RotateCcw,
  Heart,
  Coins,
  Calendar,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { cn } from '@/lib/utils';

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/simulation', label: 'Simulation', icon: Play },
  { path: '/governor', label: 'Governor', icon: Crown },
  { path: '/workers', label: 'Workers', icon: Hammer },
  { path: '/merchants', label: 'Merchants', icon: ShoppingCart },
  { path: '/wagers', label: 'Wagers', icon: Dices },
  { path: '/transactions', label: 'Transactions', icon: Link2 },
  { path: '/story', label: 'Story', icon: BookOpen },
  { path: '/city', label: 'City', icon: Map },
  { path: '/history', label: 'History', icon: ScrollText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const {
    worldState,
    isProcessing,
    toggleSimulation,
    stepSimulation,
    resetWorld
  } = useSimulationContext();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Agent City</span>
            <span className="text-xs text-muted-foreground">Economy Simulation</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {worldState && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>World Status</SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="space-y-2 px-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Day</span>
                    </div>
                    <span className="font-medium">{worldState.day}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-3 w-3" />
                      <span>Treasury</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      worldState.treasury_balance < 3000 && "text-red-500"
                    )}>
                      {worldState.treasury_balance.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-3 w-3" />
                      <span>Health</span>
                    </div>
                    <span className={cn(
                      "font-medium",
                      worldState.city_health < 50 && "text-red-500",
                      worldState.city_health >= 70 && "text-green-500"
                    )}>
                      {worldState.city_health}%
                    </span>
                  </div>
                  {worldState.is_collapsed && (
                    <div className="mt-2 rounded-md bg-destructive/10 p-2 text-center text-xs text-destructive">
                      Economy Collapsed
                    </div>
                  )}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {worldState && !worldState.is_collapsed && (
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex gap-1 p-2">
            <Button
              variant={worldState.is_running ? "destructive" : "default"}
              size="sm"
              className="flex-1"
              onClick={toggleSimulation}
              disabled={isProcessing}
            >
              {worldState.is_running ? (
                <>
                  <Pause className="mr-1 h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-1 h-3 w-3" />
                  Start
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={stepSimulation}
              disabled={isProcessing || worldState.is_running}
              title="Step one day"
            >
              <SkipForward className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetWorld}
              disabled={isProcessing}
              title="Reset world"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
