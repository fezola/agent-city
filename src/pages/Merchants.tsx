import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { AgentCard } from '@/components/simulation/AgentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Coins,
  BarChart3,
  Scale
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Merchants() {
  const {
    worldState,
    agents,
    memories,
    events,
    balanceHistory,
    getAgentsByType,
  } = useSimulationContext();

  if (!worldState) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No simulation running</p>
        <Link to="/">
          <Button variant="link" className="p-0 mt-2">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const allMerchants = getAgentsByType('merchant');
  const aliveMerchants = allMerchants.filter(m => m.is_alive);

  // Calculate aggregate stats
  const avgBalance = aliveMerchants.length > 0
    ? aliveMerchants.reduce((sum, m) => sum + m.balance, 0) / aliveMerchants.length
    : 0;

  const avgPriceModifier = aliveMerchants.length > 0
    ? aliveMerchants.reduce((sum, m) => sum + (m.current_price_modifier || 1), 0) / aliveMerchants.length
    : 1;

  // Get merchant events
  const merchantEvents = events.filter(e => e.event_type === 'merchant_decision');

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
            <ShoppingCart className="h-8 w-8 text-green-500" />
            Merchants
          </h1>
          <p className="text-muted-foreground">
            {aliveMerchants.length} active merchants in the economy
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Active Merchants
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {aliveMerchants.length}
              <span className="text-sm text-muted-foreground font-normal">/{allMerchants.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Market Stability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worldState.merchant_stability}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Avg Balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgBalance.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Avg Price Modifier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(avgPriceModifier * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Merchant Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Merchant Profiles</h2>
          {allMerchants.map((merchant) => (
            <Link key={merchant.id} to={`/agent/${merchant.id}`}>
              <div className="mb-4">
                <AgentCard
                  agent={merchant}
                  memories={memories[merchant.id]}
                />
                {merchant.is_alive && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground px-2">
                    <span>Price Modifier:</span>
                    <Badge variant={
                      (merchant.current_price_modifier || 1) > 1 ? "default" :
                      (merchant.current_price_modifier || 1) < 1 ? "secondary" : "outline"
                    }>
                      {((merchant.current_price_modifier || 1) * 100).toFixed(0)}%
                    </Badge>
                    {(merchant.current_price_modifier || 1) > 1 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (merchant.current_price_modifier || 1) < 1 ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pricing History */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">City Health Over Time</CardTitle>
              <CardDescription>Market health indicator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={balanceHistory}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="day"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="city_health"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="City Health"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Pricing Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {merchantEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pricing decisions yet</p>
                ) : (
                  merchantEvents.slice(0, 10).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                    >
                      <Badge variant="outline" className="shrink-0">
                        Day {event.day}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
