import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  ArrowLeft,
  TrendingDown,
  Download,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Holding {
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  value: number;
  profitLoss: number;
  profitLossPercent: number;
}

const Dashboard = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const COLORS = [
    "hsl(220, 70%, 50%)",
    "hsl(160, 75%, 45%)",
    "hsl(280, 70%, 50%)",
    "hsl(40, 90%, 50%)",
    "hsl(10, 75%, 55%)",
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const stored = localStorage.getItem("portfolioHoldings");

      if (stored) {
        const holdingsFromStorage: any[] = JSON.parse(stored);

        // Make sure we always have safe numeric fields
        const normalized: Holding[] = holdingsFromStorage.map((h) => {
          const quantity = Number(h.quantity ?? 0);
          const buyPrice = Number(h.price ?? h.buyPrice ?? 0);
          const currentPrice = Number(h.currentPrice ?? buyPrice); // until we add live prices
          const value = Number(h.value ?? quantity * currentPrice);
          const profitLoss =
            Number(h.profitLoss) ??
            (currentPrice - buyPrice) * quantity;
          const profitLossPercent =
            Number(h.profitLossPercent) ??
            (buyPrice !== 0 ? ((currentPrice - buyPrice) / buyPrice) * 100 : 0);

          return {
            symbol: String(h.symbol ?? ""),
            quantity,
            buyPrice,
            currentPrice,
            value,
            profitLoss,
            profitLossPercent,
          };
        });

        console.log("Loaded holdings from localStorage:", normalized);
        setHoldings(normalized);
      } else {
        console.log("No portfolio data found in localStorage");
      }
    } catch (error: any) {
      console.error("Dashboard load error:", error);
      toast({
        title: "Error loading dashboard",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
    toast({
      title: "Refreshed!",
      description: "Portfolio data has been updated",
    });
  };

  // ---- AGGREGATIONS ----
  const totalValue = holdings.reduce((sum, h) => sum + (h.value ?? 0), 0);
  const totalProfitLoss = holdings.reduce(
    (sum, h) => sum + (h.profitLoss ?? 0),
    0
  );

  const investedAmount = totalValue - totalProfitLoss;
  const totalProfitLossPercent =
    investedAmount !== 0 ? (totalProfitLoss / investedAmount) * 100 : 0;

  const topGainers = [...holdings]
    .sort(
      (a, b) =>
        (b.profitLossPercent ?? 0) - (a.profitLossPercent ?? 0)
    )
    .slice(0, 3);

  const topLosers = [...holdings]
    .sort(
      (a, b) =>
        (a.profitLossPercent ?? 0) - (b.profitLossPercent ?? 0)
    )
    .slice(0, 3);

  // ---- SIMPLE RECOMMENDATIONS ----
  const recommendations = [...holdings]
    .map((h) => {
      const pct = h.profitLossPercent ?? 0;
      let action = "";
      let message = "";

      if (pct >= 10) {
        action = "SELL";
        message = "Strong gains — consider booking partial profits.";
      } else if (pct >= 3) {
        action = "HOLD";
        message = "Moderate gains — hold and monitor closely.";
      } else if (pct <= -10) {
        action = "EXIT";
        message =
          "Big drawdown — review fundamentals and your risk before continuing.";
      } else if (pct <= -3) {
        action = "BUY";
        message =
          "At a discount — consider accumulating more if fundamentals are strong.";
      } else {
        action = "HOLD";
        message =
          "Near your buy price — holding is fine unless news or fundamentals change.";
      }

      return {
        symbol: h.symbol,
        percent: pct,
        action,
        message,
      };
    })
    .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent))
    .slice(0, 3);

  const chartData = holdings.map((h) => ({
    name: h.symbol,
    value: h.value ?? 0,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">
            Loading portfolio...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background pb-16">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StockWise
            </h1>
          </Link>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Portfolio Summary */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-6">Portfolio Dashboard</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-2">
                Total Value
              </p>
              <p className="text-3xl font-bold">
                ₹
                {totalValue.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </Card>
            <Card
              className={`p-6 shadow-card ${
                totalProfitLoss >= 0
                  ? "bg-success/10"
                  : "bg-destructive/10"
              }`}
            >
              <p className="text-sm text-muted-foreground mb-2">
                Total P/L
              </p>
              <p
                className={`text-3xl font-bold ${
                  totalProfitLoss >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {totalProfitLoss >= 0 ? "+" : "−"}₹
                {Math.abs(totalProfitLoss).toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p
                className={`text-sm mt-1 ${
                  totalProfitLoss >= 0
                    ? "text-success"
                    : "text-destructive"
                }`}
              >
                {Number(totalProfitLossPercent).toFixed(2)}%
              </p>
            </Card>
            <Card className="p-6 shadow-card">
              <p className="text-sm text-muted-foreground mb-2">
                Holdings
              </p>
              <p className="text-3xl font-bold">{holdings.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Stocks
              </p>
            </Card>
          </div>
        </div>

        {/* Charts and Top Performers */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Allocation Chart */}
          <Card className="p-6 shadow-card animate-fade-in">
            <h3 className="text-xl font-bold mb-4">
              Portfolio Allocation
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${
                      percent != null ? (percent * 100).toFixed(0) : "0"
                    }%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) =>
                    `₹${value.toLocaleString("en-IN")}`
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Top Performers + Recommendations */}
          <div className="space-y-6">
            {/* Top Gainers */}
            <Card
              className="p-6 shadow-card animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Top Gainers
              </h3>
              <div className="space-y-3">
                {topGainers.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex justify-between items-center"
                  >
                    <span className="font-semibold">{stock.symbol}</span>
                    <span className="text-success">
                      +
                      {Number(stock.profitLossPercent ?? 0).toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                ))}
                {topGainers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No gainers yet. Upload or refresh your portfolio.
                  </p>
                )}
              </div>
            </Card>

            {/* Top Losers */}
            <Card
              className="p-6 shadow-card animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Top Losers
              </h3>
              <div className="space-y-3">
                {topLosers.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex justify-between items-center"
                  >
                    <span className="font-semibold">{stock.symbol}</span>
                    <span className="text-destructive">
                      {Number(stock.profitLossPercent ?? 0).toFixed(
                        2
                      )}
                      %
                    </span>
                  </div>
                ))}
                {topLosers.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No losers yet. Upload or refresh your portfolio.
                  </p>
                )}
              </div>
            </Card>

            {/* Recommendations */}
            <Card
              className="p-6 shadow-card animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xl font-bold mb-4">Recommendations</h3>

              {recommendations.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Upload a portfolio to see personalised suggestions.
                </p>
              ) : (
                <div className="space-y-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.symbol}
                      className="p-3 rounded border flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">
                          {rec.symbol}
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            rec.action === "BUY"
                              ? "bg-success/10 text-success"
                              : rec.action === "SELL" ||
                                rec.action === "EXIT"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {rec.action}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rec.percent.toFixed(2)}% · {rec.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Holdings Table */}
        <Card className="p-6 shadow-card animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">All Holdings</h3>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Buy Price</TableHead>
                  <TableHead className="text-right">
                    Current Price
                  </TableHead>
                  <TableHead className="text-right">
                    Total Value
                  </TableHead>
                  <TableHead className="text-right">P/L</TableHead>
                  <TableHead className="text-right">P/L %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holdings.map((holding) => (
                  <TableRow key={holding.symbol}>
                    <TableCell className="font-semibold">
                      {holding.symbol}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {Number(holding.quantity ?? 0).toFixed(0)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{Number(holding.buyPrice ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{Number(holding.currentPrice ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{Number(holding.value ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        (holding.profitLoss ?? 0) >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      ₹{Number(holding.profitLoss ?? 0).toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        (holding.profitLossPercent ?? 0) >= 0
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {Number(
                        holding.profitLossPercent ?? 0
                      ).toFixed(2)}
                      %
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
