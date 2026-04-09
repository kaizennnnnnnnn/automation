"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Link2,
  Copy,
  ExternalLink,
  Sparkles,
  Eye,
  Loader2,
  Layers,
} from "lucide-react";

interface PreviewRow {
  id: string;
  slug: string;
  prospect_name: string | null;
  template_id: string;
  created_at: string;
  expires_at: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(true);

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
      SAMPLE_TEMPLATES.find((t) => t.id === templateId)?.name ||
      "Custom Template"
    );
  }

  function isExpired(expiresAt: string | null) {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Previews</h1>
          <p className="text-muted-foreground mt-1">
            Your generated website previews for prospects
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-[#1B4FD8] to-[#6366F1] hover:opacity-90"
          onClick={() => router.push("/customize/upload")}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          New Preview
        </Button>
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

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : previews.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No previews yet</h3>
            <p className="text-muted-foreground mb-6">
              Upload your website template, paste a Google Maps link, and let AI
              generate a personalized preview in seconds.
            </p>
            <div className="flex justify-center gap-3">
              <Button
                className="bg-gradient-to-r from-[#1B4FD8] to-[#6366F1]"
                onClick={() => router.push("/customize/upload")}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Use Your Own Template
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/marketplace")}
              >
                Browse Marketplace
              </Button>
            </div>
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
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          window.open(`/preview/${preview.slug}`, "_blank")
                        }
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
