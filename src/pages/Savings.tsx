import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, ArrowLeft, Calendar, DollarSign, TrendingDown, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface SavingsSchedule {
  date: string;
  contribution: number;
  projectedBalance: number;
}

interface SavingsPlan {
  monthlyRequired: number;
  percentOfIncome: number;
  totalContributions: number;
  projectedReturns: number;
  schedule: SavingsSchedule[];
  alternativePlans?: {
    longer: { months: number; monthly: number };
    higherReturn: { return: number; monthly: number };
  };
}

const Savings = () => {
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [targetMonths, setTargetMonths] = useState("24");
  const [expectedReturn, setExpectedReturn] = useState("4");
  const [frequency, setFrequency] = useState("monthly");
  const [riskProfile, setRiskProfile] = useState("medium");
  const [calculating, setCalculating] = useState(false);
  const [plan, setPlan] = useState<SavingsPlan | null>(null);
  const [adjustedMonths, setAdjustedMonths] = useState(24);
  const [adjustedReturn, setAdjustedReturn] = useState(4);
  const { toast } = useToast();

  const calculatePlan = async () => {
    if (!monthlyIncome || !goalAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setCalculating(true);
    try {
      // Calculate monthly savings required using FV formula
      const goal = parseFloat(goalAmount);
      const months = parseInt(targetMonths);
      const annualRate = parseFloat(expectedReturn) / 100;
      const monthlyRate = annualRate / 12;
      
      // FV = PMT * [(1 + r)^n - 1] / r
      // Solving for PMT: PMT = FV * r / [(1 + r)^n - 1]
      let monthlyRequired;
      if (monthlyRate === 0) {
        monthlyRequired = goal / months;
      } else {
        monthlyRequired = goal * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
      }

      const income = parseFloat(monthlyIncome);
      const percentOfIncome = (monthlyRequired / income) * 100;

      // Generate schedule
      const schedule: SavingsSchedule[] = [];
      let balance = 0;
      const startDate = new Date();
      
      for (let i = 1; i <= months; i++) {
        balance = balance * (1 + monthlyRate) + monthlyRequired;
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        
        schedule.push({
          date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
          contribution: monthlyRequired,
          projectedBalance: balance,
        });
      }

      // Calculate alternative plans if too expensive
      let alternativePlans;
      if (percentOfIncome > 50) {
        const longerMonths = months + 12;
        const longerMonthly = goal * monthlyRate / (Math.pow(1 + monthlyRate, longerMonths) - 1);
        
        const higherRate = (annualRate + 0.02) / 12;
        const higherReturnMonthly = goal * higherRate / (Math.pow(1 + higherRate, months) - 1);
        
        alternativePlans = {
          longer: { months: longerMonths, monthly: longerMonthly },
          higherReturn: { return: (annualRate + 0.02) * 100, monthly: higherReturnMonthly },
        };
      }

      setPlan({
        monthlyRequired,
        percentOfIncome,
        totalContributions: monthlyRequired * months,
        projectedReturns: goal - (monthlyRequired * months),
        schedule,
        alternativePlans,
      });

      toast({
        title: "Plan Calculated!",
        description: "Your savings plan has been generated",
      });
    } catch (error: any) {
      console.error('Calculation error:', error);
      toast({
        title: "Calculation Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  const recalculateWithAdjustments = () => {
    setTargetMonths(adjustedMonths.toString());
    setExpectedReturn(adjustedReturn.toString());
    calculatePlan();
  };

  const exportPlan = () => {
    toast({
      title: "Export Started",
      description: "Your savings plan report is being generated",
    });
    // In production, this would call an edge function to generate PDF/Excel
  };

  const chartData = plan?.schedule.slice(0, 24).map((item, idx) => ({
    month: item.date,
    balance: Math.round(item.projectedBalance),
    contributions: Math.round((idx + 1) * (plan.monthlyRequired)),
  })) || [];

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
          <Link to="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8 animate-fade-in">
          <h2 className="text-3xl font-bold mb-2">Savings Planner</h2>
          <p className="text-muted-foreground">
            Plan your financial goals with smart savings calculations and projections
          </p>
        </div>

        {/* Disclaimer */}
        <Alert className="mb-6 animate-fade-in border-warning/50 bg-warning/10">
          <AlertCircle className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning-foreground">
            <strong>Disclaimer:</strong> This is a planning tool for educational purposes only, not financial advice. 
            Consult with a certified financial advisor for personalized guidance.
          </AlertDescription>
        </Alert>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="p-6 shadow-card animate-fade-in">
            <h3 className="text-xl font-bold mb-6">Your Financial Details</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Net Income ($)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="5000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="goal">Savings Goal Amount ($)</Label>
                <Input
                  id="goal"
                  type="number"
                  placeholder="60000"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="months">Target Timeline (Months)</Label>
                <Input
                  id="months"
                  type="number"
                  placeholder="24"
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="return">Expected Annual Return (%)</Label>
                <Input
                  id="return"
                  type="number"
                  step="0.1"
                  placeholder="4.0"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="frequency">Contribution Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger id="frequency" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="risk">Risk Profile</Label>
                <Select value={riskProfile} onValueChange={setRiskProfile}>
                  <SelectTrigger id="risk" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Conservative</SelectItem>
                    <SelectItem value="medium">Medium - Balanced</SelectItem>
                    <SelectItem value="high">High - Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={calculatePlan} 
                disabled={calculating}
                className="w-full bg-gradient-primary"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Calculate Savings Plan
              </Button>
            </div>
          </Card>

          {/* Results */}
          {plan && (
            <Card className="p-6 shadow-card animate-fade-in">
              <h3 className="text-xl font-bold mb-6">Your Savings Plan</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Monthly Required</p>
                    <p className="text-2xl font-bold text-primary">
                      ${plan.monthlyRequired.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-accent rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">% of Income</p>
                    <p className={`text-2xl font-bold ${plan.percentOfIncome > 50 ? 'text-destructive' : 'text-success'}`}>
                      {plan.percentOfIncome.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {plan.percentOfIncome > 50 && plan.alternativePlans && (
                  <Alert className="border-warning/50 bg-warning/10">
                    <TrendingDown className="h-4 w-4 text-warning" />
                    <AlertDescription>
                      <p className="font-semibold text-warning-foreground mb-2">
                        This plan requires {plan.percentOfIncome.toFixed(0)}% of your income. Consider these alternatives:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Longer Timeline:</strong> ${plan.alternativePlans.longer.monthly.toFixed(2)}/month 
                          over {plan.alternativePlans.longer.months} months
                        </div>
                        <div>
                          <strong>Higher Returns:</strong> ${plan.alternativePlans.higherReturn.monthly.toFixed(2)}/month 
                          at {plan.alternativePlans.higherReturn.return.toFixed(1)}% return
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Interactive Adjustments */}
                <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-semibold">Adjust Your Plan</h4>
                  <div>
                    <Label>Timeline: {adjustedMonths} months</Label>
                    <Slider
                      value={[adjustedMonths]}
                      onValueChange={(val) => setAdjustedMonths(val[0])}
                      min={6}
                      max={120}
                      step={6}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label>Expected Return: {adjustedReturn}%</Label>
                    <Slider
                      value={[adjustedReturn]}
                      onValueChange={(val) => setAdjustedReturn(val[0])}
                      min={0}
                      max={15}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={recalculateWithAdjustments}
                    className="w-full"
                  >
                    Recalculate with Adjustments
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Contributions</p>
                    <p className="font-semibold">${plan.totalContributions.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Projected Returns</p>
                    <p className="font-semibold text-success">${plan.projectedReturns.toFixed(2)}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full" onClick={exportPlan}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Plan (PDF/Excel)
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Savings Timeline Chart */}
        {plan && chartData.length > 0 && (
          <Card className="p-6 shadow-card mt-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-6">Savings Growth Timeline</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value: number) => `₹${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  name="Projected Balance"
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="contributions" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  name="Total Contributions"
                  dot={false}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Savings Schedule Table */}
        {plan && plan.schedule.length > 0 && (
          <Card className="p-6 shadow-card mt-6 animate-fade-in">
            <h3 className="text-xl font-bold mb-6">Detailed Savings Schedule</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Contribution</TableHead>
                    <TableHead className="text-right">Projected Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plan.schedule.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.date}</TableCell>
                      <TableCell className="text-right">${item.contribution.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        ${item.projectedBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Savings;
