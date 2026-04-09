"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/shared/navbar";
import { TemplateCard } from "@/components/shared/template-card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NICHES } from "@/lib/types";
import { SAMPLE_TEMPLATES } from "@/lib/seed-data";
import { Search } from "lucide-react";

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  const filtered = useMemo(() => {
    let result = SAMPLE_TEMPLATES.filter((t) => t.is_active);

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.niche.toLowerCase().includes(q)
      );
    }

    if (selectedNiche !== "all") {
      result = result.filter((t) => t.niche === selectedNiche);
    }

    switch (sortBy) {
      case "popular":
        result.sort((a, b) => b.downloads - a.downloads);
        break;
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }

    return result;
  }, [search, selectedNiche, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#1B4FD8] to-[#6366F1] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">Template Marketplace</h1>
          <p className="text-lg opacity-90 mb-8">
            Browse premium website templates designed for cold outreach. Customize
            them in seconds for any prospect.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search templates by name or niche..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 bg-white text-slate-900 border-0 text-base"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={selectedNiche === "all" ? "default" : "outline"}
              className={`cursor-pointer px-3 py-1.5 text-sm ${
                selectedNiche === "all"
                  ? "bg-[#1B4FD8] hover:bg-[#1640b0]"
                  : "hover:bg-slate-100"
              }`}
              onClick={() => setSelectedNiche("all")}
            >
              All
            </Badge>
            {NICHES.map((niche) => (
              <Badge
                key={niche}
                variant={selectedNiche === niche ? "default" : "outline"}
                className={`cursor-pointer px-3 py-1.5 text-sm ${
                  selectedNiche === niche
                    ? "bg-[#1B4FD8] hover:bg-[#1640b0]"
                    : "hover:bg-slate-100"
                }`}
                onClick={() => setSelectedNiche(niche)}
              >
                {niche}
              </Badge>
            ))}
          </div>

          <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No templates found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((template) => (
              <TemplateCard key={template.id} template={template} />
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-8">
          Showing {filtered.length} of {SAMPLE_TEMPLATES.length} templates
        </p>
      </div>
    </div>
  );
}
