import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Holding {
  symbol: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  value: number;
  profitLoss: number;
  profitLossPercent: number;
}

interface Recommendation {
  symbol: string;
  percent: number | null; // null if not available
  allocation: number;
  action: "BUY" | "HOLD" | "SELL" | "EXIT" | "TRIM" | "TRACK" | "HIGH RISK";
  message: string;
}

const RecommendationsPage = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("portfolioHoldings");
      if (!stored) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      const holdingsFromStorage: any[] = JSON.parse(stored);

      const normalized: Holding[] = holdingsFromStorage.map((h) => {
        const quantity = Number(h.quantity ?? 0);
        const buyPrice = Number(h.price ?? h.buyPrice ?? 0);
        const currentPrice = Number(h.currentPrice ?? buyPrice);
        const value = Number(
          h.value ?? (quantity && currentPrice ? quantity * currentPrice : 0)
        );

        // If user didn't store P/L yet, compute a basic one
        let computedPL =
          typeof h.profitLoss === "number"
            ? h.profitLoss
            : (currentPrice - buyPrice) * quantity;

        if (!Number.isFinite(computedPL)) computedPL = 0;

        let computedPLPercent: number | null;
        if (typeof h.profitLossPercent === "number") {
          computedPLPercent = h.profitLossPercent;
        } else if (buyPrice !== 0) {
          computedPLPercent = ((currentPrice - buyPrice) / buyPrice) * 100;
        } else {
          computedPLPercent = null; // not available
        }

        return {
          symbol: String(h.symbol ?? ""),
          quantity,
          buyPrice,
          currentPrice,
          value,
          profitLoss: computedPL,
          profitLossPercent: computedPLPercent as number,
        };
      });

      setHoldings(normalized);
    } catch (error: any) {
      console.error("Recommendations load error:", error);
      toast({
        title: "Error loading recommendations",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const totalValue = holdings.reduce(
    (sum, h) => sum + (h.value ?? 0),
    0
  );

  const recommendations: Recommendation[] = [...holdings]
    .map((h) => {
      const rawPct =
        typeof h.profitLossPercent === "number"
          ? h.profitLossPercent
          : null;

      const hasPL = rawPct !== null && Number.isFinite(rawPct);
      const pct = hasPL ? (rawPct as number) : 0; // use 0 for logic if not available

      const allocation =
        totalValue > 0 ? ((h.value ?? 0) / totalValue) * 100 : 0;

      let action: Recommendation["action"] = "HOLD";
      const messageParts: string[] = [];

      // --- Allocation / concentration logic FIRST ---
      if (allocation >= 40) {
        action = "TRIM";
        messageParts.push(
          `This stock is ~${allocation.toFixed(
            1
          )}% of your total portfolio, which is a very high concentration. Avoid adding more and consider trimming gradually to reduce risk.`
        );
      } else if (allocation >= 20) {
        messageParts.push(
          `This holding is ~${allocation.toFixed(
            1
          )}% of your portfolio. Keep a close eye on it and avoid oversizing further.`
        );
      } else if (allocation > 0 && allocation <= 2) {
        action = "TRACK";
        messageParts.push(
          `This is a tiny position (~${allocation.toFixed(
            1
          )}% of portfolio). You can treat it as a tracking position and only increase size if you develop high conviction.`
        );
      }

      // --- Price level / penny-type risk ---
      if (h.currentPrice < 50) {
        if (allocation >= 10) {
          action = "HIGH RISK";
          messageParts.push(
            "This is a low-price stock with a meaningful weight in your portfolio. Be very careful with position size and avoid putting more capital here."
          );
        } else {
          messageParts.push(
            "The stock price is in the low range (small-cap / penny zone). Focus on risk management and avoid making it a huge chunk of your portfolio."
          );
        }
      }

      // --- P/L based logic (only if we actually have P/L data) ---
      if (hasPL) {
        if (pct >= 12) {
          action = action === "HIGH RISK" ? "HIGH RISK" : "SELL";
          messageParts.push(
            "You are sitting on strong gains. Consider booking partial profits instead of waiting for the absolute top."
          );
        } else if (pct >= 4) {
          if (action === "TRACK") {
            action = "HOLD";
          }
          messageParts.push(
            "Your position is in reasonable profit. Holding is fine; just monitor news and quarterly results."
          );
        } else if (pct <= -12) {
          action = "EXIT";
          messageParts.push(
            "The drawdown is deep. Re-check your original reason for buying this stock. If the thesis is broken, exiting may be safer than averaging down blindly."
          );
        } else if (pct <= -4) {
          if (action !== "TRIM" && action !== "HIGH RISK") {
            action = "BUY";
          }
          messageParts.push(
            "The stock is below your buy price. If fundamentals are still strong, you may consider averaging carefully with a clear stop-loss in mind."
          );
        } else {
          messageParts.push(
            "The price is close to your buy level. There is no urgent action required purely based on P/L."
          );
        }
      } else {
        // No P/L data
        messageParts.push(
          "P/L data is not available yet (no current price update). Treat this as a neutral position and focus mainly on your allocation and risk."
        );
      }

      // Fallback if somehow nothing got added
      if (messageParts.length === 0) {
        messageParts.push(
          "Review this stock periodically and align your decision with your risk profile, time horizon, and conviction."
        );
      }

      return {
        symbol: h.symbol,
        percent: hasPL ? pct : null,
        allocation,
        action,
        message: messageParts.join(" "),
      };
    })
    // sort by biggest importance: concentration + P/L move
    .sort(
      (a, b) =>
        Math.max(Math.abs(b.percent ?? 0), b.allocation) -
        Math.max(Math.abs(a.percent ?? 0), a.allocation)
    )
    .slice(0, 10);

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
          <Link to="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Recommendations</h2>
          <p className="text-muted-foreground">
            These suggestions use your position size, allocation and P/L%
            (when available). They are for learning and portfolio awareness,
            not direct investment advice.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : holdings.length === 0 ? (
          <Card className="p-6 shadow-card">
            <p className="text-muted-foreground">
              No portfolio found. Please upload your holdings first on
              the Upload page.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <Card
                key={rec.symbol}
                className="p-6 shadow-card flex flex-col gap-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {rec.symbol}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      P/L:{" "}
                      {rec.percent === null
                        ? "N/A"
                        : `${rec.percent.toFixed(2)}%`}{" "}
                      · Allocation: {rec.allocation.toFixed(1)}% of portfolio
                    </p>
                  </div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      rec.action === "BUY"
                        ? "bg-success/10 text-success"
                        : rec.action === "SELL" ||
                          rec.action === "EXIT" ||
                          rec.action === "TRIM" ||
                          rec.action === "HIGH RISK"
                        ? "bg-destructive/10 text-destructive"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {rec.action}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rec.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
