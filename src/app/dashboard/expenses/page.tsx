"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Receipt, Download, IndianRupee, TrendingUp } from "lucide-react";
import { formatCurrency, formatDate, COMPANIES } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

interface ExpenseItem {
  id: string;
  expenseDate: string;
  expenseType: string;
  vendorName: string | null;
  invoiceNumber: string | null;
  amount: number;
  gst: number | null;
  totalAmount: number;
  paymentStatus: string;
  company: string;
  department: string | null;
  description: string | null;
}

const EXPENSE_TYPES = ["HARDWARE", "SOFTWARE", "INTERNET", "AMC", "CLOUD", "LICENSING", "MAINTENANCE", "OTHER"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/expenses")
      .then((r) => r.json())
      .then((d) => setExpenses(d.data || d))
      .catch(() => {
        setExpenses([
          { id: "1", expenseDate: "2026-03-01", expenseType: "SOFTWARE", vendorName: "Microsoft", invoiceNumber: "MS-2026-001", amount: 75000, gst: 13500, totalAmount: 88500, paymentStatus: "PAID", company: "NCPL", department: "IT", description: "Microsoft 365 renewal" },
          { id: "2", expenseDate: "2026-03-05", expenseType: "HARDWARE", vendorName: "Dell", invoiceNumber: "DL-2026-045", amount: 125000, gst: 22500, totalAmount: 147500, paymentStatus: "PAID", company: "NCPL", department: "IT", description: "Dell XPS 15 Laptop" },
          { id: "3", expenseDate: "2026-03-10", expenseType: "CLOUD", vendorName: "AWS", invoiceNumber: "AWS-MAR-26", amount: 25000, gst: 4500, totalAmount: 29500, paymentStatus: "UNPAID", company: "NCPL", department: "IT", description: "AWS monthly charges" },
          { id: "4", expenseDate: "2026-03-15", expenseType: "INTERNET", vendorName: "Airtel", invoiceNumber: "AIR-2026-03", amount: 12000, gst: 2160, totalAmount: 14160, paymentStatus: "PAID", company: "RAINLAND_AUTO_CORP", department: "Admin", description: "Internet charges - Bangalore office" },
          { id: "5", expenseDate: "2026-03-20", expenseType: "AMC", vendorName: "HP Services", invoiceNumber: "HP-AMC-2026", amount: 45000, gst: 8100, totalAmount: 53100, paymentStatus: "UNPAID", company: "NCPL", department: "IT", description: "Printer AMC renewal" },
          { id: "6", expenseDate: "2026-02-15", expenseType: "SOFTWARE", vendorName: "Adobe", invoiceNumber: "AD-2026-012", amount: 30000, gst: 5400, totalAmount: 35400, paymentStatus: "PAID", company: "ISKY", department: "Marketing", description: "Adobe CC subscription" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch = !search ||
        e.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
        e.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || e.expenseType === typeFilter;
      const matchStatus = statusFilter === "ALL" || e.paymentStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [expenses, search, typeFilter, statusFilter]);

  const totalPaid = filtered.filter((e) => e.paymentStatus === "PAID").reduce((s, e) => s + e.totalAmount, 0);
  const totalUnpaid = filtered.filter((e) => e.paymentStatus === "UNPAID").reduce((s, e) => s + e.totalAmount, 0);
  const totalExpense = filtered.reduce((s, e) => s + e.totalAmount, 0);

  // Group by type for chart
  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.expenseType] = (map[e.expenseType] || 0) + e.totalAmount; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0) + name.slice(1).toLowerCase(), value }));
  }, [filtered]);

  const handleExport = () => {
    const csv = [
      ["Date", "Type", "Vendor", "Invoice", "Amount", "GST", "Total", "Status", "Company", "Department"],
      ...filtered.map((e) => [
        e.expenseDate, e.expenseType, e.vendorName || "", e.invoiceNumber || "",
        String(e.amount), String(e.gst || 0), String(e.totalAmount),
        e.paymentStatus, e.company, e.department || "",
      ]),
    ].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "expenses_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">IT Expense Tracker</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} expense records</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="h-4 w-4" />Export
            </Button>
            <Link href="/dashboard/expenses/new">
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Expense</Button>
            </Link>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><IndianRupee className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p><p className="text-xs text-muted-foreground">Total Expense</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><TrendingUp className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p><p className="text-xs text-muted-foreground">Paid</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><Receipt className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalUnpaid)}</p><p className="text-xs text-muted-foreground">Unpaid</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {byType.length > 0 && (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base">Expense by Category</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                    <ReTooltip formatter={(v: number) => [formatCurrency(v), "Amount"]} contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search vendor, invoice..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {EXPENSE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="UNPAID">Unpaid</SelectItem>
                  <SelectItem value="PARTIAL">Partial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">Vendor</TableHead>
                    <TableHead className="hidden lg:table-cell">Invoice</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="hidden md:table-cell text-right">GST</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground"><Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />No expenses found</TableCell></TableRow>
                  ) : (
                    filtered.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{formatDate(e.expenseDate)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.expenseType}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{e.vendorName || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs font-mono">{e.invoiceNumber || "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell text-right text-muted-foreground">{formatCurrency(e.gst)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(e.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={e.paymentStatus === "PAID" ? "success" : e.paymentStatus === "PARTIAL" ? "warning" : "destructive"}>
                            {e.paymentStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </PageTransition>
  );
}
