import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Upload() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <Card className="max-w-xl w-full p-8 space-y-4">
        <h1 className="text-2xl font-semibold">
          Portfolio Upload (Disabled for this project)
        </h1>

        <p className="text-sm text-muted-foreground">
          For this version of <span className="font-medium">StockWise</span>,
          portfolio data is uploaded directly into the Supabase{" "}
          <code className="px-1 py-0.5 rounded bg-muted">portfolio</code> table
          using the Supabase dashboard (CSV import).
        </p>

        <p className="text-sm text-muted-foreground">
          The in-app upload &amp; processing flow has been turned off to avoid
          extra complexity with Storage, Edge Functions and row-level security.
        </p>

        <p className="text-sm">
          Your current holdings are already saved in the database. You can view
          analytics and performance on the dashboard.
        </p>

        <Button asChild className="mt-4">
          <Link to="/dashboard">
            Go to Dashboard
          </Link>
        </Button>
      </Card>
    </div>
  );
}
