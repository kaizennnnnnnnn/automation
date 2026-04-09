"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SAMPLE_TEMPLATES } from "@/lib/seed-data";
import { Star, Download, ArrowLeft, Eye, Palette } from "lucide-react";

export default function TemplateDetailPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = use(params);
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(false);

  const template = SAMPLE_TEMPLATES.find((t) => t.id === templateId);

  if (!template) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Template not found</h1>
          <Button onClick={() => router.push("/marketplace")}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  // Generate a demo preview with placeholders filled
  const demoHtml = template.html_content
    .replace(/\{\{BUSINESS_NAME\}\}/g, "Demo Business")
    .replace(/\{\{TAGLINE\}\}/g, "Your tagline here")
    .replace(/\{\{PHONE\}\}/g, "(555) 123-4567")
    .replace(/\{\{ADDRESS\}\}/g, "123 Main Street, City, ST 12345")
    .replace(/\{\{HOURS\}\}/g, "Mon-Sat: 9am - 9pm")
    .replace(/\{\{COLOR_PRIMARY\}\}/g, "#1B4FD8")
    .replace(/\{\{HERO_IMAGE\}\}/g, "https://placehold.co/1920x1080/1B4FD8/white?text=Hero+Image")
    .replace(/\{\{ABOUT_TEXT\}\}/g, "We are a passionate team dedicated to providing the best service in our industry. With years of experience and a commitment to excellence, we ensure every client receives personalized attention.");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.push("/marketplace")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview area */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {showPreview ? (
                <div className="relative">
                  <iframe
                    srcDoc={demoHtml}
                    className="w-full h-[600px] border-0"
                    title="Template preview"
                    sandbox="allow-same-origin"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4"
                    onClick={() => setShowPreview(false)}
                  >
                    Close Preview
                  </Button>
                </div>
              ) : (
                <div className="relative aspect-[16/10] bg-slate-100">
                  {template.preview_image_url ? (
                    <img
                      src={template.preview_image_url}
                      alt={template.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B4FD8]/10 to-[#6366F1]/10">
                      <span className="text-6xl font-bold text-[#1B4FD8]/20">
                        {template.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <Button
                    className="absolute bottom-4 right-4 bg-white/90 text-slate-900 hover:bg-white"
                    onClick={() => setShowPreview(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Live Preview
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Details sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Badge className="mb-3">{template.niche}</Badge>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  {template.name}
                </h1>
                {template.designer && (
                  <p className="text-muted-foreground mb-4">
                    by {template.designer.full_name}
                  </p>
                )}

                <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    {template.rating > 0 ? template.rating.toFixed(1) : "New"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" />
                    {template.downloads} uses
                  </span>
                </div>

                <Separator className="my-4" />

                <div className="text-3xl font-bold text-[#1B4FD8] mb-6">
                  {template.price === 0 ? "Free" : `€${template.price}`}
                </div>

                <Button
                  className="w-full bg-[#1B4FD8] hover:bg-[#1640b0] h-12 text-base"
                  onClick={() => router.push(`/customize/${template.id}`)}
                >
                  <Palette className="w-5 h-5 mr-2" />
                  Use This Template
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Customizable Fields</h3>
                <div className="space-y-2">
                  {template.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">{field.label}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {field.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
