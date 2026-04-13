import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, FolderOpen, Search, Sparkles, Link2, CheckCircle2, GitBranch } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.1),transparent_50%)]" />
        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> AI-Powered Cold Outreach
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Turn any website into a{" "}
            <span className="text-amber-400">personalized pitch</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your template, paste a Google Maps link, and AI generates a custom website
            with the prospect&apos;s real name, photos, and details — in seconds.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-black text-base font-medium">
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="outline" size="lg" className="h-12 px-8 text-base border-border">Browse Templates</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-b border-border">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Three steps to close more clients</h2>
          <p className="text-center text-muted-foreground mb-16 max-w-xl mx-auto">No coding needed. Upload, paste, generate.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FolderOpen, step: "01", title: "Upload template", desc: "Drop your website folder, a .html file, or import directly from GitHub." },
              { icon: Search, step: "02", title: "Paste Google Maps link", desc: "AI scrapes the business name, phone, address, hours, and photos automatically." },
              { icon: Sparkles, step: "03", title: "Generate & share", desc: "AI applies everything to your template. Get a shareable link in seconds." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="bg-card/50 border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs font-bold text-primary mb-2">Step {item.step}</div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-b border-border">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Built for professionals</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: GitBranch, title: "GitHub Import", desc: "Import templates directly from any public GitHub repository." },
              { icon: Link2, title: "Shareable Links", desc: "Every preview gets a unique link your prospect can view on any device." },
              { icon: FolderOpen, title: "Any Format", desc: "Upload HTML folders, ZIP files, or single HTML pages — it all works." },
              { icon: Search, title: "Auto Scraping", desc: "AI extracts business name, phone, address, hours, and real photos from Google." },
              { icon: Sparkles, title: "AI Customization", desc: "Claude AI intelligently replaces text, images, and branding to match the prospect." },
              { icon: CheckCircle2, title: "Smart Image Swap", desc: "Facility photos get replaced with real ones. People photos stay untouched." },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex gap-4 p-4 rounded-xl hover:bg-card/50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 border-b border-border">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free, scale when ready.</p>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-1">Freelancer</h3>
                <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-bold">€19</span><span className="text-muted-foreground">/mo</span></div>
                <ul className="space-y-2.5 mb-6">
                  {["Unlimited previews", "Up to 5 templates", "GitHub import", "30-day link expiry"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{i}</li>
                  ))}
                </ul>
                <Link href="/signup"><Button variant="outline" className="w-full border-border">Start Free Trial</Button></Link>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-primary/30 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-medium">Popular</span>
              </div>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-1">Agency</h3>
                <div className="flex items-baseline gap-1 mb-6"><span className="text-3xl font-bold">€79</span><span className="text-muted-foreground">/mo</span></div>
                <ul className="space-y-2.5 mb-6">
                  {["Everything in Freelancer", "Unlimited templates", "Bulk CSV mode", "Team seats (5)", "Priority support"].map((i) => (
                    <li key={i} className="flex items-center gap-2 text-sm"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />{i}</li>
                  ))}
                </ul>
                <Link href="/signup"><Button className="w-full bg-amber-500 hover:bg-amber-600 text-black">Start Free Trial</Button></Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to close more clients?</h2>
          <p className="text-lg text-muted-foreground mb-10">Join web designers using SiteForge to personalize every cold outreach.</p>
          <Link href="/signup">
            <Button size="lg" className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-black text-base">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-amber-500 rounded-md flex items-center justify-center font-black text-black text-[9px]">S</div>
            <span className="font-semibold text-sm">SiteForge</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground transition-colors">Templates</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
          <p className="text-xs text-muted-foreground">&copy; 2026 SiteForge</p>
        </div>
      </footer>
    </div>
  );
}
