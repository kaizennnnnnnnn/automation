"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase";
import { extractPlaceholders } from "@/lib/preview-engine";
import { NICHES, type Template, type TemplateField } from "@/lib/types";
import { toast } from "sonner";
import {
  Plus,
  Upload,
  FileCode,
  Star,
  Download,
  DollarSign,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";

export default function DesignerDashboardPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Upload form state
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0");
  const [htmlContent, setHtmlContent] = useState("");
  const [detectedFields, setDetectedFields] = useState<TemplateField[]>([]);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("templates")
      .select("*")
      .eq("designer_id", user.id)
      .order("created_at", { ascending: false });

    setTemplates(data || []);
    setLoading(false);
  }

  function handleHtmlFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setHtmlContent(content);

      // Auto-detect fields
      const keys = extractPlaceholders(content);
      const fields: TemplateField[] = keys.map((key) => ({
        key,
        label: key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .toLowerCase()
          .replace(/^\w/, (c) => c.toUpperCase()),
        type: key.includes("COLOR")
          ? "color"
          : key.includes("IMAGE") || key.includes("PHOTO") || key.includes("LOGO")
          ? "image"
          : key.includes("TEXT") || key.includes("DESCRIPTION") || key.includes("ABOUT")
          ? "textarea"
          : "text",
        required: key === "BUSINESS_NAME" || key === "PHONE",
      }));
      setDetectedFields(fields);
    };
    reader.readAsText(file);
  }

  function updateFieldConfig(
    index: number,
    updates: Partial<TemplateField>
  ) {
    setDetectedFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  }

  async function handleSubmit() {
    if (!name || !niche || !htmlContent) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      let previewImageUrl = null;
      if (previewImageFile) {
        const ext = previewImageFile.name.split(".").pop();
        const path = `template-previews/${Date.now()}.${ext}`;
        const { data, error } = await supabase.storage
          .from("uploads")
          .upload(path, previewImageFile);
        if (!error && data) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("uploads").getPublicUrl(data.path);
          previewImageUrl = publicUrl;
        }
      }

      const { error } = await supabase.from("templates").insert({
        designer_id: user.id,
        name,
        niche,
        description,
        price: parseFloat(price) || 0,
        html_content: htmlContent,
        fields: detectedFields,
        preview_image_url: previewImageUrl,
      });

      if (error) {
        toast.error("Failed to upload template: " + error.message);
        return;
      }

      toast.success("Template uploaded successfully!");
      setDialogOpen(false);
      resetForm();
      loadTemplates();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName("");
    setNiche("");
    setDescription("");
    setPrice("0");
    setHtmlContent("");
    setDetectedFields([]);
    setPreviewImageFile(null);
  }

  async function toggleTemplate(templateId: string, isActive: boolean) {
    await supabase
      .from("templates")
      .update({ is_active: !isActive })
      .eq("id", templateId);
    loadTemplates();
    toast.success(isActive ? "Template deactivated" : "Template activated");
  }

  const totalDownloads = templates.reduce((sum, t) => sum + t.downloads, 0);
  const avgRating =
    templates.filter((t) => t.rating > 0).reduce((sum, t) => sum + t.rating, 0) /
      (templates.filter((t) => t.rating > 0).length || 1);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Templates</h1>
          <p className="text-muted-foreground mt-1">
            Upload and manage your website templates
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={<Button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90" />}
          >
            <Plus className="w-4 h-4 mr-2" />
            Upload Template
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload New Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Bella Cucina"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Niche *</Label>
                  <Select value={niche} onValueChange={(v) => v && setNiche(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select niche" />
                    </SelectTrigger>
                    <SelectContent>
                      {NICHES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this template is ideal for"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Price (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0 for free"
                />
              </div>

              <div className="space-y-2">
                <Label>Preview Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setPreviewImageFile(e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>HTML Template File *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <FileCode className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Upload an HTML file with {"{{PLACEHOLDER}}"} tags
                  </p>
                  <Input
                    type="file"
                    accept=".html,.htm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleHtmlFile(file);
                    }}
                    className="max-w-xs mx-auto"
                  />
                </div>
                {htmlContent && (
                  <p className="text-sm text-green-400">
                    HTML file loaded ({htmlContent.length} characters)
                  </p>
                )}
              </div>

              {/* Detected fields */}
              {detectedFields.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <Label className="text-base">
                    Detected Fields ({detectedFields.length})
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These placeholders were found in your HTML. Configure each
                    field below.
                  </p>
                  <div className="space-y-3">
                    {detectedFields.map((field, i) => (
                      <div
                        key={field.key}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg"
                      >
                        <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                          {`{{${field.key}}}`}
                        </code>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateFieldConfig(i, { label: e.target.value })
                          }
                          className="flex-1"
                          placeholder="Field label"
                        />
                        <Select
                          value={field.type}
                          onValueChange={(v) =>
                            v && updateFieldConfig(i, {
                              type: v as TemplateField["type"],
                            })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                          </SelectContent>
                        </Select>
                        <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateFieldConfig(i, {
                                required: e.target.checked,
                              })
                            }
                          />
                          Required
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Upload Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Templates</p>
                <p className="text-3xl font-bold mt-1">{templates.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileCode className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-3xl font-bold mt-1">{totalDownloads}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-3xl font-bold mt-1">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Templates table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <FileCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first template to start earning from the marketplace.
            </p>
            <Button
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Downloads</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{template.niche}</Badge>
                  </TableCell>
                  <TableCell>
                    {template.price === 0 ? "Free" : `€${template.price}`}
                  </TableCell>
                  <TableCell>{template.downloads}</TableCell>
                  <TableCell>
                    {template.rating > 0 ? (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {template.rating.toFixed(1)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={() =>
                        toggleTemplate(template.id, template.is_active)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/marketplace/${template.id}`)
                      }
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
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
