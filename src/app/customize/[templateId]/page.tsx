"use client";

import { use, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SAMPLE_TEMPLATES } from "@/lib/seed-data";
import { toast } from "sonner";
import {
  ArrowLeft,
  Link2,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Loader2,
  Search,
  Sparkles,
  MapPin,
} from "lucide-react";

interface BusinessData {
  name: string;
  phone: string;
  address: string;
  website: string;
  hours: string[];
  rating: number;
  reviewCount: number;
  photos: string[];
  category: string;
  description: string;
}

export default function CustomizePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();

  const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId);

  const [googleUrl, setGoogleUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  async function handleScrape() {
    if (!googleUrl.trim()) {
      toast.error("Please paste a Google Maps URL");
      return;
    }

    setScraping(true);
    setBusinessData(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: googleUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to scrape business data");
        return;
      }

      setBusinessData(data);
      toast.success(`Found: ${data.name}`);
    } catch {
      toast.error("Failed to connect to scraping service");
    } finally {
      setScraping(false);
    }
  }

  async function handleGenerate() {
    if (!businessData || !template) return;

    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: template.html_content,
          businessData,
          templateId: template.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to generate preview");
        return;
      }

      setGeneratedHtml(data.html);
      setGeneratedSlug(data.slug);
      setGeneratedUrl(`${window.location.origin}/preview/${data.slug}`);
      toast.success("Preview generated!");
    } catch {
      toast.error("Failed to generate preview");
    } finally {
      setGenerating(false);
    }
  }

  function copyToClipboard() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template not found</h1>
          <Button onClick={() => router.push("/marketplace")}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/marketplace/${templateId}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-semibold text-foreground">
            Customize: {template.name}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border border-border rounded-lg">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-2 ${viewMode === "desktop" ? "bg-background" : ""}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-2 ${viewMode === "mobile" ? "bg-background" : ""}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[400px] bg-card border-r border-border overflow-y-auto shrink-0">
          <div className="p-6 space-y-6">
            {/* Step 1: Google Maps URL */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-lg font-semibold">Paste Google Maps link</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3 ml-8">
                Find the business on Google Maps, copy the URL and paste it here.
              </p>
              <div className="flex gap-2">
                <Input
                  value={googleUrl}
                  onChange={(e) => setGoogleUrl(e.target.value)}
                  placeholder="https://maps.google.com/maps/place/..."
                  className="flex-1"
                />
                <Button
                  onClick={handleScrape}
                  disabled={scraping || !googleUrl.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {scraping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Scraped data preview */}
            {businessData && (
              <>
                <Separator />
                <Card className="border-green-700 bg-green-900/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-green-400">
                        Business found!
                      </span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Name:</strong> {businessData.name}
                      </p>
                      {businessData.phone && (
                        <p>
                          <strong>Phone:</strong> {businessData.phone}
                        </p>
                      )}
                      <p>
                        <strong>Address:</strong> {businessData.address}
                      </p>
                      {businessData.rating > 0 && (
                        <p>
                          <strong>Rating:</strong> {businessData.rating}/5 (
                          {businessData.reviewCount} reviews)
                        </p>
                      )}
                      {businessData.hours.length > 0 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-green-400 font-medium">
                            Opening hours
                          </summary>
                          <ul className="mt-1 ml-2 space-y-0.5 text-xs">
                            {businessData.hours.map((h, i) => (
                              <li key={i}>{h}</li>
                            ))}
                          </ul>
                        </details>
                      )}
                      {businessData.photos.length > 0 && (
                        <p className="text-green-400">
                          {businessData.photos.length} photos found
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Step 2: Generate */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-[#10b981] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <h2 className="text-lg font-semibold">
                      Generate with AI
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 ml-8">
                    AI will apply the business name, phone, address, photos, and
                    colors to your template automatically.
                  </p>
                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        AI is working...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Preview with AI
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* Step 3: Generated link */}
            {generatedUrl && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      3
                    </div>
                    <h2 className="text-lg font-semibold">Preview ready!</h2>
                  </div>

                  <Card className="border-green-700 bg-green-900/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={generatedUrl}
                          readOnly
                          className="text-xs bg-card"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={copyToClipboard}
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() =>
                          window.open(`/preview/${generatedSlug}`, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Preview
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right panel — Preview */}
        <div className="flex-1 p-6 flex items-start justify-center overflow-auto bg-secondary/50">
          <div
            className={`bg-card shadow-2xl rounded-lg overflow-hidden transition-all ${
              viewMode === "mobile" ? "w-[375px]" : "w-full max-w-[1200px]"
            }`}
          >
            {generatedHtml ? (
              <iframe
                srcDoc={generatedHtml}
                className="w-full h-[calc(100vh-8rem)] border-0"
                title="Generated preview"
                sandbox="allow-same-origin"
              />
            ) : (
              <iframe
                srcDoc={template.html_content}
                className="w-full h-[calc(100vh-8rem)] border-0"
                title="Template preview"
                sandbox="allow-same-origin"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
