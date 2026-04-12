"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import JSZip from "jszip";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Monitor,
  Loader2,
  Search,
  Sparkles,
  MapPin,
  Upload,
  FolderOpen,
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

export default function UploadCustomizePage() {
  const router = useRouter();

  const [htmlContent, setHtmlContent] = useState("");
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  async function processFiles(
    fileMap: Record<string, string>,
    imageMap: Record<string, string>,
    sourceName: string
  ) {
    let mainHtml = "";

    // Find the main HTML file (prefer index.html)
    for (const [path, content] of Object.entries(fileMap)) {
      if (
        (path.endsWith(".html") || path.endsWith(".htm")) &&
        (path.toLowerCase().includes("index") || !mainHtml)
      ) {
        mainHtml = content;
      }
    }

    if (!mainHtml) {
      toast.error("No HTML file found");
      return;
    }

    // Inline CSS files into the HTML
    let processedHtml = mainHtml;
    for (const [path, content] of Object.entries(fileMap)) {
      if (path.endsWith(".css")) {
        const cssFileName = path.split("/").pop();
        const linkRegex = new RegExp(
          `<link[^>]*href=["'][^"']*${cssFileName}["'][^>]*/?>`,
          "gi"
        );
        processedHtml = processedHtml.replace(
          linkRegex,
          `<style>${content}</style>`
        );
        if (!processedHtml.includes(content)) {
          processedHtml = processedHtml.replace(
            "</head>",
            `<style>${content}</style></head>`
          );
        }
      }
    }

    // Inline JS files into the HTML
    for (const [path, content] of Object.entries(fileMap)) {
      if (path.endsWith(".js") && !path.endsWith(".min.js.map")) {
        const jsFileName = path.split("/").pop();
        // Replace <script src="..."> tags with inline <script>
        const scriptRegex = new RegExp(
          `<script[^>]*src=["'][^"']*${jsFileName}["'][^>]*>\\s*</script>`,
          "gi"
        );
        processedHtml = processedHtml.replace(
          scriptRegex,
          `<script>${content}</script>`
        );
      }
    }

    // Handle lazy-loaded images: convert data-src to src
    processedHtml = processedHtml.replace(
      /(<img[^>]*)\bdata-src=(["'][^"']+["'])/gi,
      (match, before, src) => {
        // If there's already a src, keep it; add data-src value as src
        if (/\bsrc=["']/i.test(before)) {
          return match;
        }
        return `${before} src=${src}`;
      }
    );

    // Remove loading="lazy" so images load immediately in preview
    processedHtml = processedHtml.replace(/\bloading=["']lazy["']/gi, "");

    // Replace ALL local file references (images, videos) with data URIs
    for (const [path, dataUri] of Object.entries(imageMap)) {
      // Build every possible way this file could be referenced
      const segments = path.split("/");
      const possibleRefs: string[] = [];
      // Add all sub-paths: "folder/sub/img.jpg", "sub/img.jpg", "img.jpg"
      for (let i = 0; i < segments.length; i++) {
        const ref = segments.slice(i).join("/");
        possibleRefs.push(ref);
        possibleRefs.push(`./${ref}`);
        possibleRefs.push(`../${ref}`);
      }
      // Remove duplicates
      const uniqueRefs = [...new Set(possibleRefs)];

      // Sort by length descending so longer paths match first
      uniqueRefs.sort((a, b) => b.length - a.length);

      for (const ref of uniqueRefs) {
        processedHtml = processedHtml.split(ref).join(dataUri);
      }
    }

    setHtmlContent(processedHtml);
    setAllFiles(fileMap);
    setFileName(sourceName);
    toast.success(`Loaded ${Object.keys(fileMap).length} files from ${sourceName}`);
  }

  function readFileAsDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFileUpload(files: FileList) {
    const file = files[0];
    if (!file) return;

    if (file.name.endsWith(".zip")) {
      // Handle ZIP file
      try {
        const zip = await JSZip.loadAsync(file);
        const fileMap: Record<string, string> = {};
        const imageMap: Record<string, string> = {};

        for (const [path, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;
          if (/\.(html?|css|js|json|svg|txt)$/i.test(path)) {
            fileMap[path] = await zipEntry.async("string");
          } else if (/\.(png|jpg|jpeg|gif|webp|avif|ico)$/i.test(path)) {
            const ext = path.split(".").pop()?.toLowerCase() || "png";
            const mimeType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
            const base64 = await zipEntry.async("base64");
            imageMap[path] = `data:${mimeType};base64,${base64}`;
          } else if (/\.(mp4|webm|ogg)$/i.test(path)) {
            const ext = path.split(".").pop()?.toLowerCase() || "mp4";
            const base64 = await zipEntry.async("base64");
            imageMap[path] = `data:video/${ext};base64,${base64}`;
          }
        }

        await processFiles(fileMap, imageMap, file.name);
      } catch {
        toast.error("Failed to read ZIP file");
      }
    } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
      const content = await file.text();
      setHtmlContent(content);
      setFileName(file.name);
      setAllFiles({});
      toast.success("HTML file loaded");
    } else {
      toast.error("Please upload an HTML file, ZIP, or use the folder button");
    }
  }

  async function handleFolderUpload(files: FileList) {
    if (!files.length) return;

    const fileMap: Record<string, string> = {};
    const imageMap: Record<string, string> = {};

    toast.info(`Reading ${files.length} files...`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath || file.name;

      if (/\.(html?|css|js|json|txt)$/i.test(path)) {
        try {
          fileMap[path] = await file.text();
        } catch {
          // Skip
        }
      } else if (/\.(svg)$/i.test(path)) {
        // SVG can be both text and image — read as data URI for embedding
        try {
          imageMap[path] = await readFileAsDataUri(file);
        } catch {
          // Skip
        }
      } else if (/\.(png|jpg|jpeg|gif|webp|avif|ico)$/i.test(path)) {
        try {
          imageMap[path] = await readFileAsDataUri(file);
        } catch {
          // Skip
        }
      } else if (/\.(mp4|webm|ogg)$/i.test(path)) {
        // Videos can be very large — only embed if under 10MB
        if (file.size < 10 * 1024 * 1024) {
          try {
            imageMap[path] = await readFileAsDataUri(file);
          } catch {
            // Skip
          }
        }
      }
    }

    const folderName = files[0]?.webkitRelativePath?.split("/")[0] || "folder";
    await processFiles(fileMap, imageMap, folderName);
  }

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
    if (!businessData || !htmlContent) return;

    setGenerating(true);
    try {
      // Strip data URIs before sending to AI — they're huge and Claude can't process them.
      // Replace with placeholder tokens, then re-insert after AI modifies the HTML.
      const dataUriMap: Record<string, string> = {};
      let counter = 0;
      const strippedHtml = htmlContent.replace(
        /data:(image|video|audio)\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
        (match) => {
          const token = `__SITEFORGE_ASSET_${counter}__`;
          dataUriMap[token] = match;
          counter++;
          return token;
        }
      );

      console.log("Stripped HTML size:", strippedHtml.length, "chars");
      console.log("Assets stripped:", counter);

      if (strippedHtml.length > 100000) {
        toast.error(
          `Template is too large (${Math.round(strippedHtml.length / 1000)}KB). Try a simpler template.`
        );
        setGenerating(false);
        return;
      }

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          htmlContent: strippedHtml,
          businessData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to generate preview");
        return;
      }

      console.log("AI returned slug:", data.slug);
      console.log("AI HTML preview:", (data.html as string).slice(0, 500));

      // Re-insert data URIs into the AI-modified HTML
      let finalHtml = data.html as string;
      for (const [token, dataUri] of Object.entries(dataUriMap)) {
        finalHtml = finalHtml.split(token).join(dataUri);
      }

      setGeneratedHtml(finalHtml);
      setGeneratedSlug(data.slug);
      setGeneratedUrl(`${window.location.origin}/preview/${data.slug}`);

      // Save the full HTML (with data URIs) to the database for the preview page
      await fetch("/api/preview/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: data.slug, html: finalHtml }),
      });

      toast.success("Preview generated!");
    } catch (err) {
      console.error("Generate error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to generate preview"
      );
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

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Top bar */}
      <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="font-semibold text-foreground">
            Use Your Own Template
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-2 ${viewMode === "desktop" ? "bg-secondary" : ""}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-2 ${viewMode === "mobile" ? "bg-secondary" : ""}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[380px] bg-card border-r border-border overflow-y-auto shrink-0">
          <div className="p-4 space-y-4">
            {/* Step 1: Upload template */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                  1
                </div>
                <h2 className="text-sm font-semibold">Upload your template</h2>
              </div>
              {fileName ? (
                <div className="border border-green-300 bg-green-50 rounded-lg p-2 flex items-center gap-3 mt-2">
                  <FolderOpen className="w-5 h-5 text-green-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-400 truncate">
                      {fileName}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => {
                      setHtmlContent("");
                      setAllFiles({});
                      setFileName("");
                    }}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Folder upload */}
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary hover:bg-primary/5 transition-colors">
                    <FolderOpen className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-sm font-medium mb-1">
                      Upload project folder
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Select the folder containing your HTML, CSS, and JS files
                    </p>
                    <input
                      type="file"
                      /* @ts-expect-error webkitdirectory is not in the types */
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={(e) => {
                        if (e.target.files) handleFolderUpload(e.target.files);
                      }}
                      className="max-w-xs mx-auto text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">or</span>
                    <Separator className="flex-1" />
                  </div>

                  {/* Single file / ZIP upload */}
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a single .html or .zip file
                    </p>
                    <Input
                      type="file"
                      accept=".html,.htm,.zip"
                      onChange={(e) => {
                        if (e.target.files) handleFileUpload(e.target.files);
                      }}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Google Maps URL */}
            {htmlContent && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      2
                    </div>
                    <h2 className="text-sm font-semibold">
                      Paste Google Maps link
                    </h2>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={googleUrl}
                      onChange={(e) => setGoogleUrl(e.target.value)}
                      placeholder="https://maps.google.com/..."
                      className="flex-1 h-9 text-sm"
                    />
                    <Button
                      onClick={handleScrape}
                      disabled={scraping || !googleUrl.trim()}
                      className="bg-amber-500 hover:bg-amber-600 text-black h-9 w-9 p-0"
                      size="icon"
                    >
                      {scraping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/* Scraped data */}
            {businessData && (
              <>
                <div className="border border-green-700 bg-green-900/20 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-green-400 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {businessData.name}
                  </div>
                  {businessData.phone && <p className="text-green-400">{businessData.phone}</p>}
                  <p className="text-green-400 truncate">{businessData.address}</p>
                  {businessData.photos.length > 0 && (
                    <p className="text-green-400">{businessData.photos.length} photos</p>
                  )}
                </div>

                {/* Step 3: Generate */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-[#f59e0b] text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                      3
                    </div>
                    <h2 className="text-sm font-semibold">Generate with AI</h2>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black h-12 text-base"
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

            {/* Generated link */}
            {generatedUrl && (
              <>
                <Separator />
                <Card className="border-green-700 bg-green-900/20">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="font-semibold text-green-400">
                        Preview ready!
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={generatedUrl}
                        readOnly
                        className="text-xs"
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
              </>
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 p-6 flex items-start justify-center overflow-auto bg-secondary/50">
          <div
            className={`bg-card shadow-2xl rounded-lg overflow-hidden transition-all ${
              viewMode === "mobile" ? "w-[375px]" : "w-full max-w-[1200px]"
            }`}
          >
            {generatedHtml ? (
              <iframe
                key={generatedSlug || "generated"}
                srcDoc={generatedHtml}
                className="w-full h-[calc(100vh-8rem)] border-0"
                title="Generated preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : htmlContent ? (
              <iframe
                key="original"
                srcDoc={htmlContent}
                className="w-full h-[calc(100vh-8rem)] border-0"
                title="Template preview"
                sandbox="allow-same-origin allow-scripts"
              />
            ) : (
              <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">Upload a template to see it here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
