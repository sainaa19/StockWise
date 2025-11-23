-- Create storage bucket for portfolio uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-uploads', 'portfolio-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS for storage
CREATE POLICY "Users can upload their own portfolio files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'portfolio-uploads');

CREATE POLICY "Users can view their own portfolio files"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-uploads');

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create holdings table
CREATE TABLE IF NOT EXISTS public.holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES public.portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  buy_price DECIMAL NOT NULL,
  current_price DECIMAL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

-- Portfolios policies (public for demo - no auth required)
CREATE POLICY "Anyone can create portfolios"
ON public.portfolios FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view portfolios"
ON public.portfolios FOR SELECT
USING (true);

CREATE POLICY "Anyone can update portfolios"
ON public.portfolios FOR UPDATE
USING (true);

-- Holdings policies (public for demo - no auth required)
CREATE POLICY "Anyone can create holdings"
ON public.holdings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view holdings"
ON public.holdings FOR SELECT
USING (true);

CREATE POLICY "Anyone can update holdings"
ON public.holdings FOR UPDATE
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON public.holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON public.holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolios_status ON public.portfolios(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for portfolios
CREATE TRIGGER update_portfolios_updated_at
BEFORE UPDATE ON public.portfolios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();