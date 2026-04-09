"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase";
import { renderTemplate, generateSlug } from "@/lib/preview-engine";
import { SAMPLE_TEMPLATES } from "@/lib/seed-data";
import { toast } from "sonner";
import {
  Plus,
  Link2,
  Copy,
  ExternalLink,
  Phone,
  Layers,
  Eye,
  Loader2,
  Upload,
  FileSpreadsheet,
  Download,
} from "lucide-react";

interface PreviewRow {
  id: string;
  slug: string;
  prospect_name: string | null;
  template_id: string;
  created_at: string;
  expires_at: string | null;
}

export default function CallerDashboardPage() {
  const router = useRouter();
  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkResults, setBulkResults] = useState<
    { name: string; link: string }[] | null
  >(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  useEffect(() => {
    loadPreviews();
  }, []);

  async function loadPreviews() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("previews")
      .select("id, slug, prospect_name, template_id, created_at, expires_at")
      .eq("caller_id", user.id)
      .order("created_at", { ascending: false });

    setPreviews(data || []);
    setLoading(false);
  }

  function copyLink(slug: string) {
    navigator.clipboard.writeText(`${window.location.origin}/preview/${slug}`);
    toast.success("Link copied!");
  }

  function getTemplateName(templateId: string) {
    return (
      SAMPLE_TEMPLATES.find((t) => t.id === templateId)?.name || "Custom Template"
    );
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  async function handleBulkUpload(file: File) {
    setBulkProcessing(true);
    setBulkResults(null);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      // Find the first restaurant template as default
      const template = SAMPLE_TEMPLATES[0];
      if (!template) {
        toast.error("No template available for bulk generation");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const results: { name: string; link: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length < 2) continue;

        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h] = values[idx] || "";
        });

        const fieldValues: Record<string, string> = {
          BUSINESS_NAME: row["business name"] || row["name"] || "",
          PHONE: row["phone"] || "",
          ADDRESS: `${row["address"] || ""} ${row["city"] || ""}`.trim(),
          COLOR_PRIMARY: "#1B4FD8",
          TAGLINE: "Welcome to our website",
          HERO_IMAGE:
            "https://placehold.co/1920x1080/1B4FD8/white?text=Hero+Image",
          ABOUT_TEXT: "",
          HOURS: "",
        };

        const slug = generateSlug();
        const htmlSnapshot = renderTemplate(template.html_content, fieldValues);

        await supabase.from("previews").insert({
          caller_id: user.id,
          template_id: template.id,
          slug,
          field_values: fieldValues,
          html_snapshot: htmlSnapshot,
          prospect_name: fieldValues.BUSINESS_NAME,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });

        results.push({
          name: fieldValues.BUSINESS_NAME,
          link: `${window.location.origin}/preview/${slug}`,
        });
      }

      setBulkResults(results);
      toast.success(`Generated ${results.length} preview links!`);
      loadPreviews();
    } catch {
      toast.error("Failed to process CSV file");
    } finally {
      setBulkProcessing(false);
    }
  }

  function downloadResultsCSV() {
    if (!bulkResults) return;
    const csv =
      "Business Name,Preview Link\n" +
      bulkResults.map((r) => `"${r.name}","${r.link}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "siteforge-previews.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Previews</h1>
          <p className="text-muted-foreground mt-1">
            Manage your generated preview links for prospects
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
            <DialogTrigger
              render={<Button variant="outline" />}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Bulk Upload CSV
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Bulk Generate Previews</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file with columns: <strong>Business Name</strong>,{" "}
                  <strong>Phone</strong>, <strong>Address</strong>,{" "}
                  <strong>City</strong>, <strong>Niche</strong>
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBulkUpload(file);
                  }}
                  disabled={bulkProcessing}
                />
                {bulkProcessing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing CSV...
                  </div>
                )}
                {bulkResults && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-green-600">
                        {bulkResults.length} previews generated
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadResultsCSV}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download CSV
                      </Button>
                    </div>
                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Business</TableHead>
                            <TableHead className="text-right">Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {bulkResults.map((r, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-sm">
                                {r.name}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(r.link);
                                    toast.success("Copied!");
                                  }}
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <Button
            className="bg-[#1B4FD8] hover:bg-[#1640b0]"
            onClick={() => router.push("/marketplace")}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Preview
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Previews</p>
                <p className="text-3xl font-bold mt-1">{previews.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-6 h-6 text-[#1B4FD8]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Templates Used</p>
                <p className="text-3xl font-bold mt-1">
                  {new Set(previews.map((p) => p.template_id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Layers className="w-6 h-6 text-[#6366F1]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Links</p>
                <p className="text-3xl font-bold mt-1">
                  {previews.filter((p) => !isExpired(p.expires_at)).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Previews table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : previews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Phone className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No previews yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first personalized preview to start closing more
              clients.
            </p>
            <Button
              className="bg-[#1B4FD8] hover:bg-[#1640b0]"
              onClick={() => router.push("/marketplace")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Browse Templates
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prospect</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {previews.map((preview) => (
                <TableRow key={preview.id}>
                  <TableCell className="font-medium">
                    {preview.prospect_name || "Unnamed"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {getTemplateName(preview.template_id)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(preview.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {isExpired(preview.expires_at) ? (
                      <Badge
                        variant="outline"
                        className="text-red-600 border-red-200"
                      >
                        Expired
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-200"
                      >
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(preview.slug)}
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`/preview/${preview.slug}`, "_blank")
                        }
                        title="Open preview"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
