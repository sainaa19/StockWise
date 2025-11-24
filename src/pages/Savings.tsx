import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SavingsPlanner() {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [returnRate, setReturnRate] = useState("");
  const [frequency, setFrequency] = useState("Monthly");

  const calculateSavings = () => {
    if (!monthlyIncome || !goalAmount || !timeline) return;

    // Convert values
    const months = Number(timeline);
    const monthlyContribution = Number(monthlyIncome) * 0.3; // Example rule: 30% savings
    const annualInterest = Number(returnRate) / 100;
    const monthlyRate = annualInterest / 12;

    // Compound interest formula
    const futureValue =
      monthlyContribution *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    alert(
      `Estimated Savings in ${months} months: ₹${futureValue
        .toFixed(2)
        .toLocaleString()}`
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Savings Planner</h1>
      <p className="text-sm mb-4">
        ⚠ Disclaimer: This is a planning tool for educational purposes only, not financial advice.
      </p>

      <Card className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Your Financial Details</h2>

        <div>
          <label className="block mb-1">Monthly Net Income (₹)</label>
          <Input
            type="number"
            placeholder="₹"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Savings Goal Amount (₹)</label>
          <Input
            type="number"
            placeholder="₹"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Target Timeline (Months)</label>
          <Input
            type="number"
            placeholder="24"
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Expected Annual Return (%)</label>
          <Input
            type="number"
            placeholder="4"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
          />
        </div>

        <div>
          <label className="block mb-1">Contribution Frequency</label>
          <select
            value={frequency}
            className="p-2 border rounded w-full"
            onChange={(e) => setFrequency(e.target.value)}
          >
            <option>Monthly</option>
            <option>Bi-Weekly</option>
            <option>Weekly</option>
          </select>
        </div>

        <Button onClick={calculateSavings} className="w-full">
          Calculate Projection
        </Button>
      </Card>
    </div>
  );
}
