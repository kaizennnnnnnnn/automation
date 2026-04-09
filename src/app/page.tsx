import Link from "next/link";
import { Navbar } from "@/components/shared/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ArrowRight,
  Palette,
  MousePointer,
  Link2,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1B4FD8]/5 via-white to-[#6366F1]/5" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="mb-6 bg-[#1B4FD8]/10 text-[#1B4FD8] hover:bg-[#1B4FD8]/15 px-4 py-1.5 text-sm">
              Close more clients with cold outreach
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
              Send a{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B4FD8] to-[#6366F1]">
                personalized website
              </span>{" "}
              before the call
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Generate a custom website preview for your prospect in under 30
              seconds — with their name, phone, photos, and brand colors already
              applied. They see their own website before you even call.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-[#1B4FD8] hover:bg-[#1640b0] h-13 px-8 text-base"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-13 px-8 text-base"
                >
                  Browse Templates
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to create a personalized website preview that
              wows your prospect
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Palette,
                step: "01",
                title: "Pick a template",
                description:
                  "Browse our marketplace of premium templates designed for specific niches — restaurants, dentists, gyms, salons, and more.",
              },
              {
                icon: MousePointer,
                step: "02",
                title: "Customize in seconds",
                description:
                  "Fill in the prospect's business name, phone, address, and brand colors. Watch the live preview update in real time.",
              },
              {
                icon: Link2,
                step: "03",
                title: "Share the link",
                description:
                  "Generate a shareable preview link and send it to your prospect before calling. They see their own website instantly.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.step} className="border-0 shadow-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-14 h-14 bg-[#1B4FD8]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Icon className="w-7 h-7 text-[#1B4FD8]" />
                    </div>
                    <div className="text-sm font-bold text-[#1B4FD8] mb-2">
                      Step {item.step}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* For designers */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-[#6366F1]/10 text-[#6366F1] hover:bg-[#6366F1]/15">
                For Designers
              </Badge>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">
                Sell your templates, earn passive income
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Upload your website templates to the SiteForge marketplace and
                earn 70% of every sale. Your templates get used by hundreds of
                sales professionals every day.
              </p>
              <ul className="space-y-4">
                {[
                  "Upload once, earn forever",
                  "70% revenue share on every sale",
                  "Detailed analytics and earnings dashboard",
                  "Automatic payouts via Stripe Connect",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#1B4FD8]/10 rounded-2xl p-8 aspect-square flex items-center justify-center">
              <div className="text-center">
                <Palette className="w-16 h-16 text-[#6366F1] mx-auto mb-4" />
                <p className="text-2xl font-bold text-slate-900">
                  Design. Upload. Earn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-slate-600">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="border-2">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Freelancer</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€19</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Unlimited previews",
                    "Up to 5 saved templates",
                    "Shareable preview links",
                    "30-day link expiry",
                    "Email support",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#1B4FD8] relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-[#1B4FD8]">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold mb-2">Agency</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-bold">€79</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Everything in Freelancer",
                    "Unlimited saved templates",
                    "Bulk CSV mode",
                    "Team seats (up to 5)",
                    "Priority support",
                    "Custom branding",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button className="w-full bg-[#1B4FD8] hover:bg-[#1640b0]">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-[#1B4FD8] to-[#6366F1] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to close more clients?
          </h2>
          <p className="text-xl opacity-90 mb-10">
            Join thousands of web designers and agencies using SiteForge to
            personalize their cold outreach and win more business.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-[#1B4FD8] hover:bg-slate-100 h-13 px-8 text-base font-semibold"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1B4FD8] rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">SiteForge</span>
            </div>
            <div className="flex gap-8 text-sm">
              <Link
                href="/marketplace"
                className="hover:text-white transition-colors"
              >
                Marketplace
              </Link>
              <Link
                href="/signup"
                className="hover:text-white transition-colors"
              >
                Sign Up
              </Link>
              <Link
                href="/login"
                className="hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
            <p className="text-sm">
              &copy; 2024 SiteForge. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
