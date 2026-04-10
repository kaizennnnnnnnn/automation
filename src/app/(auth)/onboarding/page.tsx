"use client";

import { useActionState } from "react";
import { completeOnboarding } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(completeOnboarding, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-foreground">SiteForge</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">What&apos;s your name?</CardTitle>
            <CardDescription>We just need your name to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-6">
              {state?.error && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Your full name"
                  required
                />
              </div>

              {/* Hidden role field — everyone is "both" */}
              <input type="hidden" name="role" value="both" />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-90"
                disabled={pending}
              >
                {pending ? "Setting up..." : "Get started"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
