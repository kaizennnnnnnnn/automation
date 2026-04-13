"use client";

import { useActionState } from "react";
import { completeOnboarding } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/logo";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState(completeOnboarding, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo size="lg" />
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
                className="w-full bg-amber-500 hover:bg-amber-600 text-black"
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
