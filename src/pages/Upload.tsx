import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrendingUp, Upload as UploadIcon, FileText, Image, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Upload = () => {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [holdings, setHoldings] = useState<
    { symbol: string; quantity: number; price: number; value: number }[]
  >([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = ["text/csv", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or image file (JPG, PNG)",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    if (file.name.toLowerCase().endsWith(".csv")) {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const [header, ...rows] = lines;

      const parsed = rows.map((line) => {
        const [symbol, quantityStr, priceStr] = line.split(",");
        const quantity = Number(quantityStr?.trim());
        const price = Number(priceStr?.trim());
        return {
          symbol: symbol?.trim(),
          quantity,
          price,
          value: quantity * price,
        };
      });

      setHoldings(parsed);

      try {
        localStorage.setItem("portfolioHoldings", JSON.stringify(parsed));
      } catch (err) {
        console.error("Failed to save portfolio to localStorage:", err);
      }
    } else {
      setHoldings([]);
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data, error } = await supabase.functions.invoke(
        "process-portfolio",
        {
          body: { filePath, fileType: file.type },
        }
      );

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Portfolio uploaded and processed successfully",
      });

      navigate(`/dashboard?portfolio=${data.portfolioId}`);
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload portfolio.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const validTypes = ["text/csv", "image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(droppedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a CSV or image file",
          variant: "destructive",
        });
        return;
      }
      setFile(droppedFile);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
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
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Upload Your Portfolio
            </h2>
            <p className="text-lg text-muted-foreground">
              Upload a CSV file or screenshot of your portfolio holdings
            </p>
          </div>

          <Card className="p-8 shadow-card animate-fade-in">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                file
                  ? "border-success bg-success/5"
                  : "border-border hover:border-primary bg-accent/30"
              }`}
            >
              <UploadIcon
                className={`h-16 w-16 mx-auto mb-4 ${
                  file ? "text-success" : "text-muted-foreground"
                }`}
              />

              {file ? (
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-success">
                    File selected!
                  </p>
                  <p className="text-muted-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-lg font-semibold mb-2">
                    Drag and drop your file here
                  </p>
                  <p className="text-muted-foreground mb-4">or</p>
                </>
              )}

              <input
                type="file"
                id="file-upload"
                accept=".csv,image/jpeg,image/png,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </div>

            {/* Upload button */}
            <div className="mt-8">
              <Button
                onClick={handleUpload}
                disabled={!file || uploading}
                size="lg"
                className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              >
                {uploading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-5 w-5" />
                    Upload and Analyze
                  </>
                )}
              </Button>
            </div>
          </Card>

          {true && (
            <Card className="mt-8">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Personalised Portfolio (from your CSV)
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 pr-2">Symbol</th>
                      <th className="text-right py-2 pr-2">Quantity</th>
                      <th className="text-right py-2 pr-2">Price</th>
                      <th className="text-right py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map((h, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-2 pr-2">{h.symbol}</td>
                        <td className="py-2 pr-2 text-right">{h.quantity}</td>
                        <td className="py-2 pr-2 text-right">
                          ₹{h.price.toFixed(2)}
                        </td>
                        <td className="py-2 text-right">
                          ₹{h.value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
};

export default Upload;
