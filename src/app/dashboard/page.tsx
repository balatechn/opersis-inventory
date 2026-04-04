"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Monitor,
  Package,
  Receipt,
  CreditCard,
  CalendarClock,
  TrendingUp,
  Plus,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { PageTransition } from "@/components/layout/page-transition";

interface DashboardData {
  totalAssets: number;
  totalSoftware: number;
  monthlyExpense: number;
  pendingPayments: number;
  upcomingRenewals: number;
  expenseTrend: { month: string; amount: number }[];
  expenseByCategory: { name: string; value: number }[];
  assetByLocation: { name: string; value: number }[];
  recentActivity: { id: string; action: string; entity: string; time: string }[];
}

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4"];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // Fallback mock data for demo
        setData({
          totalAssets: 68,
          totalSoftware: 33,
          monthlyExpense: 245000,
          pendingPayments: 5,
          upcomingRenewals: 8,
          expenseTrend: [
            { month: "Oct", amount: 180000 },
            { month: "Nov", amount: 220000 },
            { month: "Dec", amount: 195000 },
            { month: "Jan", amount: 240000 },
            { month: "Feb", amount: 210000 },
            { month: "Mar", amount: 245000 },
          ],
          expenseByCategory: [
            { name: "Hardware", value: 120000 },
            { name: "Software", value: 80000 },
            { name: "Cloud", value: 25000 },
            { name: "Internet", value: 12000 },
            { name: "AMC", value: 8000 },
          ],
          assetByLocation: [
            { name: "Bangalore", value: 28 },
            { name: "Ankola", value: 15 },
            { name: "Mumbai", value: 12 },
            { name: "Chickmagalur", value: 8 },
            { name: "Delhi", value: 5 },
          ],
          recentActivity: [
            { id: "1", action: "Asset Created", entity: "Laptop - Dell XPS 15", time: "2 hours ago" },
            { id: "2", action: "Software Renewed", entity: "Microsoft 365", time: "5 hours ago" },
            { id: "3", action: "Purchase Approved", entity: "HP Printer", time: "1 day ago" },
            { id: "4", action: "Expense Recorded", entity: "AWS Monthly", time: "1 day ago" },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      title: "Total Assets",
      value: data.totalAssets,
      icon: Monitor,
      color: "from-blue-500 to-blue-600",
      href: "/dashboard/systems",
    },
    {
      title: "Total Software",
      value: data.totalSoftware,
      icon: Package,
      color: "from-violet-500 to-purple-600",
      href: "/dashboard/software",
    },
    {
      title: "Monthly Expense",
      value: formatCurrency(data.monthlyExpense),
      icon: Receipt,
      color: "from-amber-500 to-orange-600",
      href: "/dashboard/expenses",
    },
    {
      title: "Pending Payments",
      value: data.pendingPayments,
      icon: CreditCard,
      color: "from-red-500 to-rose-600",
      href: "/dashboard/expenses",
    },
    {
      title: "Upcoming Renewals",
      value: data.upcomingRenewals,
      icon: CalendarClock,
      color: "from-teal-500 to-emerald-600",
      href: "/dashboard/software",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-muted-foreground">IT Asset & Expense Overview</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/systems/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </Link>
            <Link href="/dashboard/expenses/new">
              <Button size="sm" variant="outline" className="gap-1.5">
                <Receipt className="h-4 w-4" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {kpis.map((kpi) => (
            <motion.div key={kpi.title} variants={item}>
              <Link href={kpi.href}>
                <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer group border-0 shadow-sm">
                  <CardContent className="p-4 lg:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color} text-white shadow-sm`}
                      >
                        <kpi.icon className="h-5 w-5" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground mt-0.5">{kpi.title}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Expense Trend */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Monthly Expense Trend</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.expenseTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                      />
                      <ReTooltip
                        formatter={(value: number) => [formatCurrency(value), "Expense"]}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3b82f6"
                        strokeWidth={2.5}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Expense by Category */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Expense by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {data.expenseByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <ReTooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asset Distribution by Location */}
          <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">
                  Asset Distribution by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.assetByLocation}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis fontSize={12} tickLine={false} axisLine={false} />
                      <ReTooltip
                        contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Links & Activity */}
          <motion.div variants={item} initial="hidden" animate="show">
            <Card className="border-0 shadow-sm h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.recentActivity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 py-2 border-b last:border-0">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{act.entity}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {act.action}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{act.time}</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-2 grid grid-cols-2 gap-2">
                  <Link href="/dashboard/purchases/new">
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                      <Plus className="h-3 w-3" />
                      Request
                    </Button>
                  </Link>
                  <Link href="/dashboard/reports">
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Reports
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
