"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase";
import { DollarSign, TrendingUp, Clock, CreditCard, Loader2 } from "lucide-react";

interface EarningsSummary {
  totalEarnings: number;
  pendingPayout: number;
  completedPayouts: number;
  templateBreakdown: {
    templateName: string;
    sales: number;
    revenue: number;
  }[];
}

export default function EarningsPage() {
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingPayout: 0,
    completedPayouts: 0,
    templateBreakdown: [],
  });

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch purchases for this designer's templates
    const { data: templates } = await supabase
      .from("templates")
      .select("id, name")
      .eq("designer_id", user.id);

    if (!templates?.length) {
      setLoading(false);
      return;
    }

    const templateIds = templates.map((t) => t.id);
    const { data: purchases } = await supabase
      .from("purchases")
      .select("*")
      .in("template_id", templateIds);

    const breakdown = templates.map((template) => {
      const templatePurchases = (purchases || []).filter(
        (p) => p.template_id === template.id
      );
      const revenue = templatePurchases.reduce((sum, p) => sum + p.amount * 0.7, 0);
      return {
        templateName: template.name,
        sales: templatePurchases.length,
        revenue,
      };
    });

    const total = breakdown.reduce((sum, b) => sum + b.revenue, 0);

    setEarnings({
      totalEarnings: total,
      pendingPayout: total * 0.3, // Simulate 30% pending
      completedPayouts: total * 0.7,
      templateBreakdown: breakdown.filter((b) => b.sales > 0),
    });
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Earnings</h1>
        <p className="text-muted-foreground mt-1">
          Track your template sales and payouts
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-3xl font-bold mt-1">
                  €{earnings.totalEarnings.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payout</p>
                <p className="text-3xl font-bold mt-1">
                  €{earnings.pendingPayout.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed Payouts</p>
                <p className="text-3xl font-bold mt-1">
                  €{earnings.completedPayouts.toFixed(2)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#1B4FD8]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue by Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.templateBreakdown.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <h3 className="font-semibold mb-1">No sales yet</h3>
              <p className="text-sm text-muted-foreground">
                Revenue from template sales will appear here.
                You earn 70% of each sale.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Sales</TableHead>
                  <TableHead className="text-right">Revenue (70%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnings.templateBreakdown.map((item) => (
                  <TableRow key={item.templateName}>
                    <TableCell className="font-medium">
                      {item.templateName}
                    </TableCell>
                    <TableCell>{item.sales}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      €{item.revenue.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
