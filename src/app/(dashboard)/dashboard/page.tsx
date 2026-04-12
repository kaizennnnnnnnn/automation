"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createClient } from "@/lib/supabase";
import { SAMPLE_TEMPLATES } from "@/lib/seed-data";
import { toast } from "sonner";
import JSZip from "jszip";
import { GithubIcon } from "@/components/icons/github";
import {
  Link2,
  Copy,
  ExternalLink,
  Sparkles,
  Eye,
  Loader2,
  Layers,
  Trash2,
  Search,
  MapPin,
  Check,
  Upload,
  FolderOpen,
  Monitor,
  Smartphone,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";

interface PreviewRow {
  id: string;
  slug: string;
  prospect_name: string | null;
  template_id: string;
  created_at: string;
  expires_at: string | null;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(true);

  const [htmlContent, setHtmlContent] = useState("");
  const [allFiles, setAllFiles] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");

  const [githubUrl, setGithubUrl] = useState("");
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubRepos, setGithubRepos] = useState<{ id: number; name: string; full_name: string; description: string | null; private: boolean; default_branch: string; updated_at: string; language: string | null }[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [showRepoList, setShowRepoList] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");

  const [googleUrl, setGoogleUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedSlug, setGeneratedSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    loadPreviews();
    checkGithubConnection();
  }, []);

  async function checkGithubConnection() {
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        const repos = await res.json();
        setGithubConnected(true);
        setGithubRepos(repos);
      }
    } catch {}
  }

  async function loadGithubRepos() {
    setLoadingRepos(true);
    try {
      const res = await fetch("/api/github/repos");
      if (res.ok) {
        setGithubRepos(await res.json());
        setGithubConnected(true);
      } else {
        setGithubConnected(false);
        toast.error("GitHub connection expired. Please reconnect.");
      }
    } catch {
      toast.error("Failed to load repos");
    } finally {
      setLoadingRepos(false);
    }
  }

  async function handleRepoSelect(repo: { full_name: string; default_branch: string }) {
    const [owner, repoName] = repo.full_name.split("/");
    setLoadingGithub(true);
    setShowRepoList(false);
    try {
      const res = await fetch("/api/github/contents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: repoName, branch: repo.default_branch }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Failed to import"); return; }
      setHtmlContent(data.html);
      setAllFiles(data.files);
      setFileName(data.fileName);
      toast.success(`Imported ${repo.full_name}`);
    } catch {
      toast.error("Failed to import from GitHub");
    } finally {
      setLoadingGithub(false);
    }
  }

  async function loadPreviews() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("previews")
      .select("id, slug, prospect_name, template_id, created_at, expires_at")
      .eq("caller_id", user.id)
      .order("created_at", { ascending: false });
    setPreviews(data || []);
    setLoadingPreviews(false);
  }

  function readFileAsDataUri(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function processFiles(fileMap: Record<string, string>, imageMap: Record<string, string>, sourceName: string) {
    let mainHtml = "";
    for (const [path, content] of Object.entries(fileMap)) {
      if ((path.endsWith(".html") || path.endsWith(".htm")) && (path.toLowerCase().includes("index") || !mainHtml)) {
        mainHtml = content;
      }
    }
    if (!mainHtml) { toast.error("No HTML file found"); return; }

    let processedHtml = mainHtml;
    for (const [path, content] of Object.entries(fileMap)) {
      if (path.endsWith(".css")) {
        const cssFileName = path.split("/").pop();
        const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${cssFileName}["'][^>]*/?>`, "gi");
        processedHtml = processedHtml.replace(linkRegex, `<style>${content}</style>`);
        if (!processedHtml.includes(content)) {
          processedHtml = processedHtml.replace("</head>", `<style>${content}</style></head>`);
        }
      }
    }
    for (const [path, content] of Object.entries(fileMap)) {
      if (path.endsWith(".js") && !path.endsWith(".min.js.map")) {
        const jsFileName = path.split("/").pop();
        const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${jsFileName}["'][^>]*>\\s*</script>`, "gi");
        processedHtml = processedHtml.replace(scriptRegex, `<script>${content}</script>`);
      }
    }
    processedHtml = processedHtml.replace(/(<img[^>]*)\bdata-src=(["'][^"']+["'])/gi, (match, before, src) => {
      if (/\bsrc=["']/i.test(before)) return match;
      return `${before} src=${src}`;
    });
    processedHtml = processedHtml.replace(/\bloading=["']lazy["']/gi, "");
    for (const [path, dataUri] of Object.entries(imageMap)) {
      const segments = path.split("/");
      const possibleRefs: string[] = [];
      for (let i = 0; i < segments.length; i++) {
        const ref = segments.slice(i).join("/");
        possibleRefs.push(ref, `./${ref}`, `../${ref}`);
      }
      const uniqueRefs = [...new Set(possibleRefs)].sort((a, b) => b.length - a.length);
      for (const ref of uniqueRefs) {
        processedHtml = processedHtml.split(ref).join(dataUri);
      }
    }
    setHtmlContent(processedHtml);
    setAllFiles(fileMap);
    setFileName(sourceName);
    toast.success(`Loaded ${Object.keys(fileMap).length + Object.keys(imageMap).length} files`);
  }

  async function handleFolderUpload(files: FileList) {
    if (!files.length) return;
    const fileMap: Record<string, string> = {};
    const imageMap: Record<string, string> = {};
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const path = file.webkitRelativePath || file.name;
      if (/\.(html?|css|js|json|txt)$/i.test(path)) {
        try { fileMap[path] = await file.text(); } catch {}
      } else if (/\.(svg)$/i.test(path)) {
        try { imageMap[path] = await readFileAsDataUri(file); } catch {}
      } else if (/\.(png|jpg|jpeg|gif|webp|avif|ico)$/i.test(path)) {
        try { imageMap[path] = await readFileAsDataUri(file); } catch {}
      } else if (/\.(mp4|webm|ogg)$/i.test(path) && file.size < 10 * 1024 * 1024) {
        try { imageMap[path] = await readFileAsDataUri(file); } catch {}
      }
    }
    const folderName = files[0]?.webkitRelativePath?.split("/")[0] || "folder";
    await processFiles(fileMap, imageMap, folderName);
  }

  async function handleFileUpload(files: FileList) {
    const file = files[0];
    if (!file) return;
    if (file.name.endsWith(".zip")) {
      try {
        const zip = await JSZip.loadAsync(file);
        const fileMap: Record<string, string> = {};
        const imageMap: Record<string, string> = {};
        for (const [path, zipEntry] of Object.entries(zip.files)) {
          if (zipEntry.dir) continue;
          if (/\.(html?|css|js|json|txt)$/i.test(path)) {
            fileMap[path] = await zipEntry.async("string");
          } else if (/\.(png|jpg|jpeg|gif|webp|avif|ico|svg)$/i.test(path)) {
            const ext = path.split(".").pop()?.toLowerCase() || "png";
            const mimeType = ext === "jpg" ? "image/jpeg" : ext === "svg" ? "image/svg+xml" : `image/${ext}`;
            const base64 = await zipEntry.async("base64");
            imageMap[path] = `data:${mimeType};base64,${base64}`;
          }
        }
        await processFiles(fileMap, imageMap, file.name);
      } catch { toast.error("Failed to read ZIP file"); }
    } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
      setHtmlContent(await file.text());
      setFileName(file.name);
      setAllFiles({});
      toast.success("HTML file loaded");
    }
  }

  async function handleGithubImport() {
    if (!githubUrl.trim()) return;
    setLoadingGithub(true);
    try {
      const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/tree\/([^/]+)\/?(.*)?)?/);
      if (!match) { toast.error("Invalid GitHub URL"); return; }
      const [, owner, repo, branch = "main", path = ""] = match;
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const res = await fetch(apiUrl);
      if (!res.ok) { toast.error("Could not access repository."); return; }
      const contents = await res.json();
      if (!Array.isArray(contents)) { toast.error("Invalid repository path"); return; }
      const fileMap: Record<string, string> = {};
      const imageMap: Record<string, string> = {};
      for (const item of contents) {
        if (item.type !== "file") continue;
        if (/\.(html?|css|js|json|txt|svg)$/i.test(item.name)) {
          const fileRes = await fetch(item.download_url);
          fileMap[item.path] = await fileRes.text();
        } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(item.name)) {
          imageMap[item.path] = item.download_url;
        }
      }
      for (const item of contents) {
        if (item.type !== "dir") continue;
        const subRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`);
        if (!subRes.ok) continue;
        const subContents = await subRes.json();
        if (!Array.isArray(subContents)) continue;
        for (const subItem of subContents) {
          if (subItem.type !== "file") continue;
          if (/\.(html?|css|js|json|txt|svg)$/i.test(subItem.name)) {
            const fileRes = await fetch(subItem.download_url);
            fileMap[subItem.path] = await fileRes.text();
          } else if (/\.(png|jpg|jpeg|gif|webp)$/i.test(subItem.name)) {
            imageMap[subItem.path] = subItem.download_url;
          }
        }
      }
      await processFiles(fileMap, imageMap, `${owner}/${repo}`);
    } catch { toast.error("Failed to import from GitHub"); }
    finally { setLoadingGithub(false); }
  }

  async function handleScrape() {
    if (!googleUrl.trim()) { toast.error("Paste a Google Maps URL"); return; }
    setScraping(true);
    setBusinessData(null);
    try {
      const res = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: googleUrl }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setBusinessData(data);
      toast.success(`Found: ${data.name}`);
    } catch { toast.error("Scraping failed"); }
    finally { setScraping(false); }
  }

  async function handleGenerate() {
    if (!businessData || !htmlContent) return;
    setGenerating(true);
    try {
      const dataUriMap: Record<string, string> = {};
      let counter = 0;
      const strippedHtml = htmlContent.replace(
        /data:(image|video|audio)\/[^;]+;base64,[A-Za-z0-9+/=]+/g,
        (match) => { const token = `__SITEFORGE_ASSET_${counter}__`; dataUriMap[token] = match; counter++; return token; }
      );
      const res = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ htmlContent: strippedHtml, businessData }) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      let finalHtml = data.html as string;
      for (const [token, dataUri] of Object.entries(dataUriMap)) {
        finalHtml = finalHtml.split(token).join(dataUri);
      }
      setGeneratedHtml(finalHtml);
      setGeneratedSlug(data.slug);
      setGeneratedUrl(`${window.location.origin}/preview/${data.slug}`);
      await fetch("/api/preview/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slug: data.slug, html: finalHtml }) });
      toast.success("Preview generated!");
      loadPreviews();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Generation failed");
    } finally { setGenerating(false); }
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/preview/${slug}`);
    toast.success("Link copied!");
  }
  function copyToClipboard() {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }
  async function deletePreview(id: string) {
    if (!confirm("Delete this preview?")) return;
    await supabase.from("previews").delete().eq("id", id);
    setPreviews((p) => p.filter((x) => x.id !== id));
    toast.success("Deleted");
  }
  function getTemplateName(id: string) {
    return SAMPLE_TEMPLATES.find((t) => t.id === id)?.name || "Custom";
  }
  function isExpired(d: string | null) {
    return d ? new Date(d) < new Date() : false;
  }
  function resetTemplate() {
    setHtmlContent(""); setAllFiles({}); setFileName(""); setBusinessData(null);
    setGeneratedHtml(null); setGeneratedUrl(null); setGeneratedSlug(null);
    setGoogleUrl(""); setGithubUrl("");
  }

  const activeCount = previews.filter((p) => !isExpired(p.expires_at)).length;

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* ── Top bar ── */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-10">
        <h1 className="text-base font-semibold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          {generatedHtml && (
            <div className="flex items-center border border-border rounded-lg overflow-hidden mr-2">
              <button onClick={() => setViewMode("desktop")} className={`p-1.5 ${viewMode === "desktop" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                <Monitor className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("mobile")} className={`p-1.5 ${viewMode === "mobile" ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}>
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}
          {githubConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-500/10 border border-green-500/20">
              <GithubIcon className="w-3.5 h-3.5 text-green-400" />
              <span className="text-[11px] text-green-400 font-medium">Connected</span>
            </div>
          ) : (
            <a href="/api/github/auth" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-secondary hover:bg-secondary/80 border border-border transition-colors text-sm">
              <GithubIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Connect GitHub</span>
            </a>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel — Workflow ── */}
        <div className="w-[380px] border-r border-border bg-card/40 overflow-y-auto shrink-0">
          <div className="p-5 space-y-5">

            {/* STEP 1 — Template */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${fileName ? "bg-green-500/20 text-green-400" : "bg-primary/15 text-primary"}`}>
                  {fileName ? <Check className="w-3.5 h-3.5" /> : "1"}
                </div>
                <span className="text-sm font-semibold tracking-tight">Choose template</span>
              </div>

              {fileName ? (
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-green-500/8 border border-green-500/15">
                  <FolderOpen className="w-4 h-4 text-green-400 shrink-0" />
                  <span className="text-sm text-green-300 truncate flex-1">{fileName}</span>
                  <button onClick={resetTemplate} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {/* Folder upload */}
                  <label className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group text-center">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <FolderOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Folder</p>
                      <p className="text-[10px] text-muted-foreground">HTML, CSS, JS</p>
                    </div>
                    <input type="file" className="hidden"
                      /* @ts-expect-error webkitdirectory */
                      webkitdirectory="" directory="" multiple
                      onChange={(e) => { if (e.target.files) handleFolderUpload(e.target.files); }}
                    />
                  </label>

                  {/* File upload */}
                  <label className="flex flex-col items-center gap-2 p-4 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 cursor-pointer transition-all group text-center">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">File</p>
                      <p className="text-[10px] text-muted-foreground">.html or .zip</p>
                    </div>
                    <input type="file" className="hidden" accept=".html,.htm,.zip"
                      onChange={(e) => { if (e.target.files) handleFileUpload(e.target.files); }}
                    />
                  </label>

                  {/* GitHub — spans full width */}
                  <div className="col-span-2 relative">
                    {githubConnected ? (
                      <button
                        onClick={() => { setShowRepoList(!showRepoList); if (!showRepoList) loadGithubRepos(); }}
                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 w-full text-left transition-all"
                        disabled={loadingGithub}
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#171515] flex items-center justify-center shrink-0">
                          {loadingGithub ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <GithubIcon className="w-5 h-5 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">{loadingGithub ? "Importing..." : "Import from GitHub"}</p>
                          <p className="text-[10px] text-muted-foreground">Browse your repositories</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showRepoList ? "rotate-180" : ""}`} />
                      </button>
                    ) : (
                      <a href="/api/github/auth"
                        className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 w-full text-left transition-all"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#171515] flex items-center justify-center shrink-0">
                          <GithubIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium">Connect GitHub</p>
                          <p className="text-[10px] text-muted-foreground">Sign in to browse repos</p>
                        </div>
                      </a>
                    )}

                    {showRepoList && githubConnected && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border rounded-xl shadow-2xl z-30 max-h-[280px] overflow-hidden flex flex-col">
                        <div className="p-2.5 border-b border-border">
                          <Input value={repoSearch} onChange={(e) => setRepoSearch(e.target.value)} placeholder="Search repos..." className="h-8 text-xs" autoFocus />
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {loadingRepos ? (
                            <div className="flex items-center justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
                          ) : (
                            githubRepos
                              .filter((r) => !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase()))
                              .map((repo) => (
                                <button key={repo.id} onClick={() => handleRepoSelect(repo)}
                                  className="flex items-center gap-3 px-3 py-2.5 w-full text-left hover:bg-secondary/50 transition-colors border-b border-border/30 last:border-0">
                                  <GithubIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{repo.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      {repo.language && <span className="text-[10px] text-muted-foreground">{repo.language}</span>}
                                      {repo.private && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">private</span>}
                                    </div>
                                  </div>
                                </button>
                              ))
                          )}
                          {!loadingRepos && githubRepos.filter((r) => !repoSearch || r.name.toLowerCase().includes(repoSearch.toLowerCase())).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-6">No repos found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>

            <Separator className="bg-border/40" />

            {/* STEP 2 — Prospect */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${businessData ? "bg-green-500/20 text-green-400" : htmlContent ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {businessData ? <Check className="w-3.5 h-3.5" /> : "2"}
                </div>
                <span className={`text-sm font-semibold tracking-tight ${htmlContent ? "" : "text-muted-foreground"}`}>Find prospect</span>
              </div>

              <div className="flex gap-2">
                <Input value={googleUrl} onChange={(e) => setGoogleUrl(e.target.value)}
                  placeholder="Paste Google Maps link..." className="h-9 text-xs" disabled={!htmlContent} />
                <Button onClick={handleScrape} disabled={scraping || !googleUrl.trim() || !htmlContent} size="icon" className="h-9 w-9 shrink-0">
                  {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
              </div>

              {businessData && (
                <div className="mt-3 p-3 rounded-xl bg-green-500/8 border border-green-500/15 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-300">
                    <MapPin className="w-4 h-4" />
                    {businessData.name}
                  </div>
                  <div className="text-[11px] text-green-400/60 space-y-0.5 pl-6">
                    {businessData.phone && <p>{businessData.phone}</p>}
                    <p className="truncate">{businessData.address}</p>
                    <p>{businessData.photos.length} photos &middot; {businessData.rating}/5 ({businessData.reviewCount})</p>
                  </div>
                </div>
              )}
            </section>

            <Separator className="bg-border/40" />

            {/* STEP 3 — Generate */}
            <section>
              <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${generatedUrl ? "bg-green-500/20 text-green-400" : businessData ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {generatedUrl ? <Check className="w-3.5 h-3.5" /> : "3"}
                </div>
                <span className={`text-sm font-semibold tracking-tight ${businessData ? "" : "text-muted-foreground"}`}>Generate</span>
              </div>

              <Button onClick={handleGenerate}
                className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-black text-sm font-medium shadow-lg shadow-amber-500/20"
                disabled={generating || !businessData || !htmlContent}>
                {generating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Generate Preview</>
                )}
              </Button>

              {generatedUrl && (
                <div className="mt-3 p-3 rounded-xl bg-green-500/8 border border-green-500/15 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-green-300">
                    <Check className="w-4 h-4" />Preview ready
                  </div>
                  <div className="flex gap-1.5">
                    <Input value={generatedUrl} readOnly className="h-8 text-[11px] bg-background/50 font-mono" />
                    <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={copyToClipboard}>
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                  </div>
                  <Button variant="outline" className="w-full h-8 text-xs" onClick={() => window.open(`/preview/${generatedSlug}`, "_blank")}>
                    <ExternalLink className="w-3.5 h-3.5 mr-1.5" />Open in new tab
                  </Button>
                </div>
              )}
            </section>

            {/* ── Recent previews ── */}
            {previews.length > 0 && (
              <>
                <Separator className="bg-border/40" />
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold tracking-tight">Recent previews</span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">{activeCount} active</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {previews.slice(0, 8).map((p) => (
                      <div key={p.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/40 transition-colors group">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${isExpired(p.expires_at) ? "bg-red-400/60" : "bg-green-400"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{p.prospect_name || "Unnamed"}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(p.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => copyLink(p.slug)} className="p-1 rounded hover:bg-secondary"><Copy className="w-3 h-3 text-muted-foreground" /></button>
                          <button onClick={() => window.open(`/preview/${p.slug}`, "_blank")} className="p-1 rounded hover:bg-secondary"><ExternalLink className="w-3 h-3 text-muted-foreground" /></button>
                          <button onClick={() => deletePreview(p.id)} className="p-1 rounded hover:bg-red-500/10"><Trash2 className="w-3 h-3 text-red-400/60" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>
        </div>

        {/* ── Right Panel — Preview ── */}
        <div className="flex-1 bg-background overflow-auto flex items-center justify-center p-6">
          <div className={`rounded-xl shadow-2xl shadow-black/30 overflow-hidden transition-all border border-border ${viewMode === "mobile" ? "w-[375px]" : "w-full max-w-[1200px]"}`}>
            {generatedHtml ? (
              <iframe key={generatedSlug || "gen"} srcDoc={generatedHtml} className="w-full h-[calc(100vh-7rem)] border-0 bg-white" sandbox="allow-same-origin allow-scripts" />
            ) : htmlContent ? (
              <iframe key="orig" srcDoc={htmlContent} className="w-full h-[calc(100vh-7rem)] border-0 bg-white" sandbox="allow-same-origin allow-scripts" />
            ) : (
              <div className="h-[calc(100vh-7rem)] flex items-center justify-center bg-card/50">
                <div className="text-center space-y-5 max-w-sm">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto">
                    <Sparkles className="w-10 h-10 text-primary/40" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-foreground/80">No template loaded</p>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                      Upload a folder, drop an HTML file, or import from GitHub to see a live preview here.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
