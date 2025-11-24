import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table";

// 🔹 HARD-CODED DEMO DATA – this will always show
const demoSummary = {
  totalInvestment: 50000,
  totalValue: 58000,
  profitLoss: 8000,
  profitLossPercent: 16,
};

const demoHoldings = [
  {
    symbol: "TCS",
    quantity: 10,
    buyPrice: 3500,
    currentPrice: 3800,
  },
  {
    symbol: "INFY",
    quantity: 5,
    buyPrice: 1400,
    currentPrice: 1500,
  },
];

// helper to compute row values
function getRowValues(h: (typeof demoHoldings)[number]) {
  const value = h.currentPrice * h.quantity;
  const invested = h.buyPrice * h.quantity;
  const pl = value - invested;
  const plPercent = invested === 0 ? 0 : (pl / invested) * 100;
  return { value, pl, plPercent };
}

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-semibold">Portfolio Dashboard</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Value</span>
              <TrendingUp className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{demoSummary.totalValue.toLocaleString("en-IN")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Investment</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{demoSummary.totalInvestment.toLocaleString("en-IN")}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Total Profit / Loss</span>
              <TrendingDown className="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            ₹{demoSummary.profitLoss.toLocaleString("en-IN")} (
            {demoSummary.profitLossPercent.toFixed(2)}%)
          </CardContent>
        </Card>
      </div>

      {/* Refresh button (just UI now) */}
      <button className="flex items-center gap-2 border px-3 py-1 rounded-md text-sm">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </button>

      {/* Holdings table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Buy Price</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>P/L</TableHead>
                <TableHead>P/L %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoHoldings.map((h) => {
                const { value, pl, plPercent } = getRowValues(h);
                return (
                  <TableRow key={h.symbol}>
                    <TableCell>{h.symbol}</TableCell>
                    <TableCell>{h.quantity}</TableCell>
                    <TableCell>₹{h.buyPrice}</TableCell>
                    <TableCell>₹{h.currentPrice}</TableCell>
                    <TableCell>₹{value}</TableCell>
                    <TableCell>₹{pl}</TableCell>
                    <TableCell>{plPercent.toFixed(2)}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
