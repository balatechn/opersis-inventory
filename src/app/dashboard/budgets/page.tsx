"use client";

import { useEffect, useState, useMemo } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Plus, Wallet, TrendingUp, AlertTriangle, Pencil, Trash2, IndianRupee } from "lucide-react";
import { formatCurrency, COMPANIES, DEPARTMENTS } from "@/lib/utils";

interface BudgetItem {
  id: string;
  name: string;
  company: string | null;
  department: string | null;
  category: string | null;
  period: string;
  month: number | null;
  year: number;
  amount: number;
  spent: number;
  alertAt: number;
  notes: string | null;
}

const CATEGORIES = ["OVERALL", "HARDWARE", "SOFTWARE", "NETWORKING", "CLOUD", "MAINTENANCE", "AMC", "OTHER"];
const MONTHS = ["", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState(String(currentYear));
  const [periodFilter, setPeriodFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<BudgetItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", company: "NCPL", department: "", category: "OVERALL",
    period: "MONTHLY", month: "", year: String(currentYear), amount: "", spent: "0", alertAt: "80", notes: "",
  });

  const fetchBudgets = () => {
    setLoading(true);
    fetch(`/api/budgets?year=${yearFilter}&period=${periodFilter}`)
      .then((r) => r.json())
      .then((d) => setBudgets(d.data || []))
      .catch(() => setBudgets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBudgets(); }, [yearFilter, periodFilter]);

  const totalBudget = useMemo(() => budgets.reduce((s, b) => s + b.amount, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((s, b) => s + b.spent, 0), [budgets]);
  const overBudgetCount = useMemo(() => budgets.filter((b) => b.spent > b.amount).length, [budgets]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", company: "NCPL", department: "", category: "OVERALL", period: "MONTHLY", month: "", year: String(currentYear), amount: "", spent: "0", alertAt: "80", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (b: BudgetItem) => {
    setEditItem(b);
    setForm({
      name: b.name, company: b.company || "NCPL", department: b.department || "",
      category: b.category || "OVERALL", period: b.period, month: b.month ? String(b.month) : "",
      year: String(b.year), amount: String(b.amount), spent: String(b.spent),
      alertAt: String(b.alertAt), notes: b.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name, company: form.company, department: form.department || null,
      category: form.category, period: form.period, month: form.month ? parseInt(form.month) : null,
      year: parseInt(form.year), amount: parseFloat(form.amount) || 0,
      spent: parseFloat(form.spent) || 0, alertAt: parseFloat(form.alertAt) || 80,
      notes: form.notes || null,
    };

    const url = editItem ? `/api/budgets/${editItem.id}` : "/api/budgets";
    const method = editItem ? "PUT" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSaving(false);
    setDialogOpen(false);
    fetchBudgets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this budget?")) return;
    await fetch(`/api/budgets/${id}`, { method: "DELETE" });
    fetchBudgets();
  };

  const getUsagePercent = (b: BudgetItem) => Math.min(100, Math.round((b.spent / b.amount) * 100));
  const getUsageColor = (b: BudgetItem) => {
    const pct = (b.spent / b.amount) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= b.alertAt) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-sm text-muted-foreground">Track monthly & yearly budgets</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus className="h-4 w-4" />Add Budget</Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><Wallet className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p><p className="text-xs text-muted-foreground">Total Budget</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><TrendingUp className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p><p className="text-xs text-muted-foreground">Total Spent</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div>
              <div><p className="text-2xl font-bold">{overBudgetCount}</p><p className="text-xs text-muted-foreground">Over Budget</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Period" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Periods</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Budget Table */}
        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">{[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Budget Name</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                    <TableHead className="text-right">Spent</TableHead>
                    <TableHead className="w-[160px]">Usage</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground"><Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" />No budgets found</TableCell></TableRow>
                  ) : (
                    budgets.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <div className="font-medium">{b.name}</div>
                          <div className="text-xs text-muted-foreground">{b.department || "All Depts"}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{b.company || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <Badge variant="outline" className="text-xs">{b.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{b.period}</div>
                          <div className="text-xs text-muted-foreground">{b.month ? MONTHS[b.month] + " " : ""}{b.year}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(b.amount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.spent)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={getUsagePercent(b)} className="h-2 flex-1" indicatorClassName={getUsageColor(b)} />
                            <span className="text-xs font-medium w-8 text-right">{getUsagePercent(b)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(b)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(b.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editItem ? "Edit Budget" : "Create Budget"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Budget Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. IT Monthly Budget" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Company</Label>
                  <Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COMPANIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Department</Label>
                  <Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}>
                    <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
                    <SelectContent>{DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Period</Label>
                  <Select value={form.period} onValueChange={(v) => setForm({ ...form, period: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                      <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                      <SelectItem value="YEARLY">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {form.period === "MONTHLY" && (
                  <div className="grid gap-2">
                    <Label>Month</Label>
                    <Select value={form.month} onValueChange={(v) => setForm({ ...form, month: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>{MONTHS.slice(1).map((m, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid gap-2">
                  <Label>Year</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label>Budget Amount (₹) *</Label>
                  <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Spent (₹)</Label>
                  <Input type="number" value={form.spent} onChange={(e) => setForm({ ...form, spent: e.target.value })} placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label>Alert at (%)</Label>
                  <Input type="number" value={form.alertAt} onChange={(e) => setForm({ ...form, alertAt: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.amount}>
                {saving ? "Saving..." : editItem ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
