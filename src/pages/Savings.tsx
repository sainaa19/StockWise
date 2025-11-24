import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

type SavingsRow = {
  id: number;
  category: string;
  amount: number;
  goal: number;
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

export default function Savings() {
  const [rows, setRows] = useState<SavingsRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      const { data, error } = await supabase.from("savings").select("*");

      if (error) {
        console.error("Error fetching savings:", error);
      } else {
        setRows(data as SavingsRow[]);
      }

      setLoading(false);
    };

    fetchSavings();
  }, []);

  // calculations
  const totalSaved = rows.reduce((acc, row) => acc + row.amount, 0);
  const totalGoal = rows.reduce((acc, row) => acc + row.goal, 0);
  const progressPercent =
    totalGoal > 0 ? ((totalSaved / totalGoal) * 100).toFixed(2) : "0.00";

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">Savings Overview</h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-2">Total Saved</p>
          <p className="text-3xl font-bold">{formatCurrency(totalSaved)}</p>
        </Card>

        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-2">Savings Goal</p>
          <p className="text-3xl font-bold">{formatCurrency(totalGoal)}</p>
        </Card>

        <Card className="p-6 shadow-card">
          <p className="text-sm text-muted-foreground mb-2">Progress</p>
          <p className="text-3xl font-bold">{progressPercent}%</p>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="text-xl font-semibold mb-4">Savings Categories</h3>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Category</th>
                <th className="py-2">Saved</th>
                <th className="py-2">Goal</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-muted/30">
                  <td className="py-2 font-medium">{row.category}</td>
                  <td className="py-2">{formatCurrency(row.amount)}</td>
                  <td className="py-2">{formatCurrency(row.goal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
