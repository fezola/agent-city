import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  ArrowLeft,
  RotateCcw,
  Clock,
  Users,
  Coins,
  AlertTriangle,
  Info,
  Database
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { DEFAULT_CONFIG } from '@/types/simulation';

export default function Settings() {
  const {
    worldState,
    agents,
    events,
    isProcessing,
    resetWorld,
    initializeWorld,
  } = useSimulationContext();

  const handleReset = async () => {
    await resetWorld();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Simulation configuration and controls
          </p>
        </div>
      </div>

      {/* Current Simulation Info */}
      {worldState && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              Current Simulation
            </CardTitle>
            <CardDescription>Active world information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">World ID</p>
                <p className="text-sm font-mono">{worldState.id.slice(0, 8)}...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Day</p>
                <p className="text-lg font-bold">{worldState.day}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={worldState.is_collapsed ? "destructive" : worldState.is_running ? "default" : "secondary"}>
                  {worldState.is_collapsed ? "Collapsed" : worldState.is_running ? "Running" : "Paused"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-lg font-bold">{events.length}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-sm">{new Date(worldState.created_at).toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Configuration (Read-only display) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4" />
            Simulation Configuration
          </CardTitle>
          <CardDescription>
            Default settings for new simulations (read-only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Day Duration</span>
                </div>
                <Badge variant="outline">{DEFAULT_CONFIG.dayDurationMs / 1000}s</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Initial Workers</span>
                </div>
                <Badge variant="outline">{DEFAULT_CONFIG.initialWorkers}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Initial Merchants</span>
                </div>
                <Badge variant="outline">{DEFAULT_CONFIG.initialMerchants}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Starting Balance</span>
                </div>
                <Badge variant="outline">{DEFAULT_CONFIG.startingBalance}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Starting Treasury</span>
                </div>
                <Badge variant="outline">{DEFAULT_CONFIG.startingTreasury.toLocaleString()}</Badge>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground">
              These settings are applied when creating a new simulation.
              Configuration editing will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Agent Counts */}
      {worldState && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agent Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.agent_type === 'governor').length}
                </p>
                <p className="text-sm text-muted-foreground">Governor</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.agent_type === 'worker' && a.is_alive).length}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{agents.filter(a => a.agent_type === 'worker').length}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">Workers (active/total)</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {agents.filter(a => a.agent_type === 'merchant' && a.is_alive).length}
                  <span className="text-sm text-muted-foreground font-normal">
                    /{agents.filter(a => a.agent_type === 'merchant').length}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">Merchants (active/total)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect your simulation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-md">
            <div>
              <h4 className="font-medium">Reset Simulation</h4>
              <p className="text-sm text-muted-foreground">
                Delete the current world and create a new one
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isProcessing}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset World
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the current simulation including all agents,
                    events, memories, and wagers. A new world will be created.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset}>
                    Yes, Reset World
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {!worldState && (
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <h4 className="font-medium">Create New World</h4>
                <p className="text-sm text-muted-foreground">
                  Initialize a new simulation
                </p>
              </div>
              <Button onClick={initializeWorld} disabled={isProcessing}>
                Create World
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About Agent City</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Agent City is an AI-powered economic simulation where autonomous agents
            compete to survive in a gated economy.
          </p>
          <p>
            Each agent (Governor, Workers, Merchants) makes decisions using AI,
            creating emergent economic dynamics and behaviors.
          </p>
          <div className="pt-2">
            <p className="text-xs">
              Built with React, TypeScript, Supabase, and AI-powered decision making.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
