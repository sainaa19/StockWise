import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Upload, BarChart3, FileText, Shield, Zap, PiggyBank, Lightbulb } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              StockWise
            </h1>
          </div>
          <nav className="flex gap-2">
            <Link to="/dashboard">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link to="/savings">
              <Button variant="ghost">Savings</Button>
            </Link>
            <Link to="/recommendations">
              <Button variant="ghost">AI Insights</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Your Personal Stock Portfolio Assistant
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your portfolio data and instantly get live analysis, profit/loss tracking, 
            and smart investment recommendations — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/upload">
              <Button size="lg" className="bg-gradient-primary hover:opacity-90 transition-opacity">
                <Upload className="mr-2 h-5 w-5" />
                Upload Portfolio
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">
                <BarChart3 className="mr-2 h-5 w-5" />
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in">
            <Upload className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Upload</h3>
            <p className="text-muted-foreground">
              Upload CSV files or screenshots. Our OCR technology extracts your holdings automatically.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <TrendingUp className="h-12 w-12 text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">Live Market Data</h3>
            <p className="text-muted-foreground">
              Real-time stock prices and automatic profit/loss calculations for your entire portfolio.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <BarChart3 className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Visual Analytics</h3>
            <p className="text-muted-foreground">
              Beautiful charts showing allocation, top performers, and detailed breakdowns.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Shield className="h-12 w-12 text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Recommendations</h3>
            <p className="text-muted-foreground">
              Get personalized investment suggestions based on your risk profile and goals.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <FileText className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Export Reports</h3>
            <p className="text-muted-foreground">
              Download professional PDF or Excel reports of your portfolio analysis anytime.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Zap className="h-12 w-12 text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Get instant analysis and insights without any complex setup or configuration.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <PiggyBank className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">Savings Planner</h3>
            <p className="text-muted-foreground">
              Calculate monthly savings required to reach your financial goals with smart projections.
            </p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-hover transition-shadow animate-fade-in" style={{ animationDelay: "0.7s" }}>
            <Lightbulb className="h-12 w-12 text-success mb-4" />
            <h3 className="text-xl font-bold mb-2">AI Recommendations</h3>
            <p className="text-muted-foreground">
              Get actionable buy/sell/hold suggestions powered by technical analysis and market trends.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-3xl mx-auto p-12 bg-gradient-primary shadow-hover">
          <h3 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-primary-foreground/90 mb-8 text-lg">
            Upload your portfolio now and see your investments come to life with real-time insights.
          </p>
          <Link to="/upload">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Upload className="mr-2 h-5 w-5" />
              Upload Your Portfolio
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 StockWise. Built for smart investors.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
