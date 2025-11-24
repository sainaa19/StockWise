import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type PortfolioRow = {
  id: number;
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  value: number;
  profitLoss: number;
  profitLossPerc: string;
};

const formatCurrency = (value: number) => {
  if (!value && value !== 0) return "₹0.00";
  return value.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Dashboard() {
  const [rows, setRows] = useState<PortfolioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase.from("portfolio").select("*");

      if (error) {
        console.error("Error fetching portfolio:", error);
      } else {
        setRows(data as PortfolioRow[]);
      }

      setLoading(false);
    };

    fetchPortfolio();
  }, []);

  // calculate totals
  const totalValue = rows.reduce((acc, row) => acc + row.value, 0);
  const totalCost = rows.reduce((acc, row) => acc + row.buyPrice * row.quantity, 0);
  const totalProfitLoss = totalValue - totalCost;
  const totalProfitLossPerc = (totalProfitLoss / totalCost) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-fade-in">
        <h2 className="text-3xl font-bold mb-6">Portfolio Dashboard</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-2">Total Value</p>
          <p className="text-3xl font-bold">{formatCurrency(totalValue)}</p>
        </Card>

        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-2">Total Investment</p>
          <p className="text-3xl font-bold">{formatCurrency(totalCost)}</p>
        </Card>

        <Card
          className={`p-6 shadow-card ${
            totalProfitLoss >= 0 ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <p className="text-sm text-muted-foreground mb-2">Total Profit / Loss</p>
          <p className="text-3xl font-bold">
            {formatCurrency(totalProfitLoss)} ({totalProfitLossPerc.toFixed(2)}%)
          </p>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4">Holdings</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Symbol</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Buy Price</th>
                <th className="py-2">Current</th>
                <th className="py-2">Value</th>
                <th className="py-2">P/L</th>
                <th className="py-2">P/L %</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 font-medium">{row.symbol}</td>
                  <td className="py-2">{row.quantity}</td>
                  <td className="py-2">₹{row.buyPrice}</td>
                  <td className="py-2">₹{row.currentPrice}</td>
                  <td className="py-2">₹{row.value}</td>
                  <td
                    className={`py-2 ${
                      row.profitLoss >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{row.profitLoss}
                  </td>
                  <td>{row.profitLossPerc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
