"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Plus, Search, Receipt, Download, IndianRupee, TrendingUp, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { BulkUpload } from "@/components/ui/bulk-upload";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

interface ExpenseItem {
  id: string; description: string; date: string; type: string; vendor: string | null;
  invoiceNumber: string | null; amount: number; gst: number | null; totalAmount: number;
  paymentStatus: string; company: string; department: string | null; remarks: string | null;
}

const EXPENSE_TYPES = ["HARDWARE", "SOFTWARE", "INTERNET_TELECOM", "AMC", "CLOUD_SERVICES", "LICENSING", "MAINTENANCE", "CONSUMABLES", "NETWORKING", "OTHER"];

export default function ExpensesPage() {
  const { companies, departments } = useSettings();
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ExpenseItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    description: "", type: "OTHER", vendor: "", invoiceNumber: "",
    amount: "", gst: "", date: "", paymentStatus: "UNPAID",
    company: "NCPL", department: "", remarks: "",
  });

  const fetchExpenses = () => {
    setLoading(true);
    fetch("/api/expenses").then((r) => r.json()).then((d) => setExpenses(d.data || d)).catch(() => setExpenses([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchExpenses(); }, []);

  const filtered = useMemo(() => {
    let result = expenses.filter((e) => {
      const matchSearch = !search || e.vendor?.toLowerCase().includes(search.toLowerCase()) || e.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || e.description?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || e.type === typeFilter;
      const matchStatus = statusFilter === "ALL" || e.paymentStatus === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [expenses, search, typeFilter, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const totalPaid = filtered.filter((e) => e.paymentStatus === "PAID").reduce((s, e) => s + e.totalAmount, 0);
  const totalUnpaid = filtered.filter((e) => e.paymentStatus === "UNPAID").reduce((s, e) => s + e.totalAmount, 0);
  const totalExpense = filtered.reduce((s, e) => s + e.totalAmount, 0);

  const byType = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.forEach((e) => { map[e.type] = (map[e.type] || 0) + e.totalAmount; });
    return Object.entries(map).map(([name, value]) => ({ name: name.charAt(0) + name.slice(1).toLowerCase().replace(/_/g, " "), value }));
  }, [filtered]);

  const handleExport = () => {
    const csv = [["Date","Type","Vendor","Invoice","Amount","GST","Total","Status","Company"], ...filtered.map((e) => [e.date, e.type, e.vendor || "", e.invoiceNumber || "", String(e.amount), String(e.gst || 0), String(e.totalAmount), e.paymentStatus, e.company])].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "expenses.csv"; link.click(); URL.revokeObjectURL(url);
  };

  const openEdit = (e: ExpenseItem) => {
    setEditItem(e);
    setForm({ description: e.description, type: e.type, vendor: e.vendor || "", invoiceNumber: e.invoiceNumber || "", amount: String(e.amount), gst: String(e.gst || 0), date: e.date ? e.date.split("T")[0] : "", paymentStatus: e.paymentStatus, company: e.company, department: e.department || "", remarks: e.remarks || "" });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/expenses/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, amount: parseFloat(form.amount) || 0, gst: parseFloat(form.gst) || 0 }) });
    setSaving(false); setEditOpen(false); fetchExpenses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this expense record?")) return;
    await fetch(`/api/expenses/${id}`, { method: "DELETE" }); fetchExpenses();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">IT Expense Tracker</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} expense records</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <BulkUpload
              entityName="Expenses"
              sampleHeaders={["description","type","vendor","amount","gst","date","invoiceNumber","company","department","paymentStatus","remarks"]}
              sampleRow={["Laptop Purchase","HARDWARE","Dell India","75000","13500","2024-06-15","INV-2024-001","NCPL","IT Department","PAID","For new developer"]}
              apiEndpoint="/api/expenses/bulk"
              onComplete={fetchExpenses}
            />
            <Link href="/dashboard/expenses/new"><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Expense</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><IndianRupee className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{formatCurrency(totalExpense)}</p><p className="text-xs text-muted-foreground">Total Expense</p></div></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-green-50 text-green-600"><TrendingUp className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p><p className="text-xs text-muted-foreground">Paid</p></div></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-50 text-red-600"><Receipt className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{formatCurrency(totalUnpaid)}</p><p className="text-xs text-muted-foreground">Unpaid</p></div></CardContent></Card>
        </div>

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

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search vendor, invoice..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Types</SelectItem>{EXPENSE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Payment" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All</SelectItem><SelectItem value="PAID">Paid</SelectItem><SelectItem value="UNPAID">Unpaid</SelectItem><SelectItem value="PARTIAL">Partial</SelectItem></SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader label="Date" sortKey="date" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Type" sortKey="type" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Vendor" sortKey="vendor" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden lg:table-cell">Invoice</TableHead>
                      <TableHead className="text-right"><SortableHeader label="Amount" sortKey="amount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="hidden md:table-cell text-right">GST</TableHead>
                      <TableHead className="text-right"><SortableHeader label="Total" sortKey="totalAmount" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead><SortableHeader label="Status" sortKey="paymentStatus" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />No expenses found</TableCell></TableRow>
                    ) : paginated.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell className="text-xs">{formatDate(e.date)}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{e.type}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{e.vendor || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs font-mono">{e.invoiceNumber || "—"}</TableCell>
                        <TableCell className="text-right">{formatCurrency(e.amount)}</TableCell>
                        <TableCell className="hidden md:table-cell text-right text-muted-foreground">{formatCurrency(e.gst)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(e.totalAmount)}</TableCell>
                        <TableCell><Badge variant={e.paymentStatus === "PAID" ? "success" : e.paymentStatus === "PARTIAL" ? "warning" : "destructive"}>{e.paymentStatus}</Badge></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(e)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(e.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <TablePagination currentPage={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </>
          )}
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Expense</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Description *</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{EXPENSE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Payment Status</Label><Select value={form.paymentStatus} onValueChange={(v) => setForm({ ...form, paymentStatus: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PAID">Paid</SelectItem><SelectItem value="UNPAID">Unpaid</SelectItem><SelectItem value="PARTIAL">Partial</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Invoice No.</Label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div>
                <div className="grid gap-2"><Label>GST (₹)</Label><Input type="number" value={form.gst} onChange={(e) => setForm({ ...form, gst: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Company</Label><Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{companies.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Department</Label><Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid gap-2"><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving || !form.description}>{saving ? "Saving..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
