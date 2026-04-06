"use client";

import { useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, BarChart3, FileText, Package, Building2, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#06b6d4", "#ec4899"];

// Demo data for reports
const monthlyExpenseData = [
  { month: "Oct 2025", hardware: 120000, software: 60000, cloud: 25000, other: 15000 },
  { month: "Nov 2025", hardware: 85000, software: 75000, cloud: 25000, other: 18000 },
  { month: "Dec 2025", hardware: 95000, software: 55000, cloud: 28000, other: 12000 },
  { month: "Jan 2026", hardware: 150000, software: 80000, cloud: 25000, other: 20000 },
  { month: "Feb 2026", hardware: 110000, software: 45000, cloud: 30000, other: 25000 },
  { month: "Mar 2026", hardware: 125000, software: 88500, cloud: 29500, other: 22000 },
];

const vendorSpend = [
  { name: "Dell", value: 395000 },
  { name: "Microsoft", value: 280000 },
  { name: "Adobe", value: 95000 },
  { name: "AWS", value: 175000 },
  { name: "HP", value: 120000 },
  { name: "Airtel", value: 72000 },
  { name: "Others", value: 85000 },
];

const departmentCost = [
  { name: "IT", value: 680000 },
  { name: "Finance", value: 120000 },
  { name: "HR", value: 85000 },
  { name: "Admin", value: 95000 },
  { name: "Marketing", value: 75000 },
  { name: "Sales", value: 65000 },
];

const softwareRenewals = [
  { name: "Adobe Creative Cloud", vendor: "Adobe", expiry: "15-Apr-2026", cost: 30000, status: "Expiring Soon" },
  { name: "Tally Prime", vendor: "Tally Solutions", expiry: "10-May-2026", cost: 90000, status: "Expiring Soon" },
  { name: "Microsoft 365", vendor: "Microsoft", expiry: "30-Jun-2026", cost: 75000, status: "Active" },
  { name: "Kaspersky Endpoint", vendor: "Kaspersky", expiry: "20-Aug-2026", cost: 64000, status: "Active" },
];

export default function ReportsPage() {
  const { companies, locations } = useSettings();
  const [dateFrom, setDateFrom] = useState("2025-10-01");
  const [dateTo, setDateTo] = useState("2026-03-31");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [locationFilter, setLocationFilter] = useState("ALL");

  const handleExport = (reportName: string) => {
    // Simplified export
    toast(`Exporting ${reportName}...`);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-sm text-muted-foreground">IT Asset & Expense Analytics</p>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="space-y-1">
                <Label className="text-xs">From</Label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full sm:w-[160px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">To</Label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full sm:w-[160px]" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Company</Label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Companies</SelectItem>
                    {companies.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Locations</SelectItem>
                    {locations.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="monthly" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0">
            <TabsTrigger value="monthly" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">
              <BarChart3 className="h-4 w-4 mr-1.5" />Monthly Expense
            </TabsTrigger>
            <TabsTrigger value="vendor" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">
              <Building2 className="h-4 w-4 mr-1.5" />Vendor Spend
            </TabsTrigger>
            <TabsTrigger value="department" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">
              <MapPin className="h-4 w-4 mr-1.5" />Department Cost
            </TabsTrigger>
            <TabsTrigger value="renewals" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">
              <Package className="h-4 w-4 mr-1.5" />Software Renewals
            </TabsTrigger>
            <TabsTrigger value="assets" className="data-[state=active]:bg-white data-[state=active]:shadow-sm border">
              <FileText className="h-4 w-4 mr-1.5" />Asset Register
            </TabsTrigger>
          </TabsList>

          {/* Monthly Expense Report */}
          <TabsContent value="monthly">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Monthly Expense Breakdown</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyExpenseData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <ReTooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Legend iconType="circle" iconSize={8} />
                      <Bar dataKey="hardware" name="Hardware" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="software" name="Software" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cloud" name="Cloud" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="other" name="Other" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vendor Spend */}
          <TabsContent value="vendor">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Vendor-wise Spending</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={vendorSpend} cx="50%" cy="50%" outerRadius={110} paddingAngle={3} dataKey="value">
                          {vendorSpend.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                        </Pie>
                        <ReTooltip formatter={(v: number) => formatCurrency(v)} />
                        <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <Table>
                      <TableHeader><TableRow><TableHead>Vendor</TableHead><TableHead className="text-right">Amount</TableHead><TableHead className="text-right">Share</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {vendorSpend.map((v) => {
                          const total = vendorSpend.reduce((s, x) => s + x.value, 0);
                          return (
                            <TableRow key={v.name}>
                              <TableCell className="font-medium">{v.name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(v.value)}</TableCell>
                              <TableCell className="text-right">{((v.value / total) * 100).toFixed(1)}%</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Department Cost */}
          <TabsContent value="department">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Department-wise IT Cost</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={departmentCost} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                      <YAxis type="category" dataKey="name" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <ReTooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Software Renewals */}
          <TabsContent value="renewals">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Upcoming Software Renewals</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Software</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead className="text-right">Annual Cost</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {softwareRenewals.map((sw) => (
                      <TableRow key={sw.name}>
                        <TableCell className="font-medium">{sw.name}</TableCell>
                        <TableCell>{sw.vendor}</TableCell>
                        <TableCell>{sw.expiry}</TableCell>
                        <TableCell className="text-right">{formatCurrency(sw.cost)}</TableCell>
                        <TableCell>
                          <Badge variant={sw.status === "Expiring Soon" ? "warning" : "success"}>
                            {sw.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Asset Register */}
          <TabsContent value="assets">
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Asset Register</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click Export to download the complete asset register as Excel/CSV.
                  Filters above will be applied to the export.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}

function toast(msg: string) {
  // This is a simple wrapper - the actual toast from sonner doesn't need import here
  // since we'd use it's named export. For demo, we'll keep it simple.
  if (typeof window !== "undefined") {
    import("sonner").then(({ toast: t }) => t(msg));
  }
}
