import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Download } from "lucide-react";
import type { Template } from "@/lib/types";

interface TemplateCardProps {
  template: Template;
  showDesigner?: boolean;
}

export function TemplateCard({ template, showDesigner = true }: TemplateCardProps) {
  return (
    <Link href={`/marketplace/${template.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-border hover:border-primary/30">
        <div className="aspect-[16/10] bg-secondary relative overflow-hidden">
          {template.preview_image_url ? (
            <img
              src={template.preview_image_url}
              alt={template.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/10">
              <span className="text-4xl font-bold text-primary/20">
                {template.name.charAt(0)}
              </span>
            </div>
          )}
          <Badge className="absolute top-3 left-3 bg-card/90 text-foreground hover:bg-card">
            {template.niche}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {template.name}
          </h3>
          {showDesigner && template.designer && (
            <p className="text-sm text-muted-foreground mt-1">
              by {template.designer.full_name}
            </p>
          )}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {template.rating > 0 ? template.rating.toFixed(1) : "New"}
              </span>
              <span className="flex items-center gap-1">
                <Download className="w-3.5 h-3.5" />
                {template.downloads}
              </span>
            </div>
            <span className="font-semibold text-primary">
              {template.price === 0 ? "Free" : `€${template.price}`}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
