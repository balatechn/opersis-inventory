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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Plus, Search, ShoppingCart, Clock, CheckCircle, AlertTriangle, XCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, COMPANIES, DEPARTMENTS } from "@/lib/utils";

interface PurchaseItem {
  id: string;
  productName: string;
  category: string;
  vendor: string | null;
  quantity: number;
  estimatedCost: number;
  actualCost: number | null;
  status: string;
  priority: string;
  requestedBy: string | null;
  approvedBy: string | null;
  company: string;
  department: string | null;
  justification: string | null;
  remarks: string | null;
  createdAt: string;
}

const PURCHASE_STATUSES = ["PENDING", "APPROVED", "PAYMENT_DUE", "COMPLETED", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const CATEGORIES = ["HARDWARE", "SOFTWARE", "NETWORKING", "PERIPHERALS", "CONSUMABLES", "FURNITURE", "OTHER"];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<PurchaseItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productName: "", category: "HARDWARE", vendor: "", quantity: "1",
    estimatedCost: "", actualCost: "", status: "PENDING", priority: "MEDIUM",
    requestedBy: "", company: "NCPL", department: "", justification: "", remarks: "",
  });

  const fetchPurchases = () => {
    setLoading(true);
    fetch("/api/purchases")
      .then((r) => r.json())
      .then((d) => setPurchases(d.data || d))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPurchases(); }, []);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch = !search ||
        p.productName?.toLowerCase().includes(search.toLowerCase()) ||
        p.vendor?.toLowerCase().includes(search.toLowerCase()) ||
        p.requestedBy?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchases, search, statusFilter]);

  const counts = useMemo(() => ({
    pending: purchases.filter((p) => p.status === "PENDING").length,
    approved: purchases.filter((p) => p.status === "APPROVED").length,
    paymentDue: purchases.filter((p) => p.status === "PAYMENT_DUE").length,
    completed: purchases.filter((p) => p.status === "COMPLETED").length,
  }), [purchases]);

  const openEdit = (p: PurchaseItem) => {
    setEditItem(p);
    setForm({
      productName: p.productName, category: p.category, vendor: p.vendor || "",
      quantity: String(p.quantity), estimatedCost: String(p.estimatedCost),
      actualCost: String(p.actualCost || ""), status: p.status, priority: p.priority,
      requestedBy: p.requestedBy || "", company: p.company, department: p.department || "",
      justification: p.justification || "", remarks: p.remarks || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/purchases/${editItem.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantity: parseInt(form.quantity) || 1,
        estimatedCost: parseFloat(form.estimatedCost) || 0,
        actualCost: form.actualCost ? parseFloat(form.actualCost) : null,
      }),
    });
    setSaving(false);
    setEditOpen(false);
    fetchPurchases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase request?")) return;
    await fetch(`/api/purchases/${id}`, { method: "DELETE" });
    fetchPurchases();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = { PENDING: "warning", APPROVED: "success", PAYMENT_DUE: "destructive", COMPLETED: "success", REJECTED: "destructive" };
    return <Badge variant={map[s] as any || "outline"}>{s.replace("_", " ")}</Badge>;
  };

  const priorityBadge = (p: string) => {
    const colors: Record<string, string> = { LOW: "bg-gray-100 text-gray-700", MEDIUM: "bg-blue-50 text-blue-600", HIGH: "bg-orange-50 text-orange-600", URGENT: "bg-red-50 text-red-700" };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[p] || ""}`}>{p}</span>;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Requests</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} purchase requests</p>
          </div>
          <Link href="/dashboard/purchases/new"><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New Request</Button></Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-yellow-50 text-yellow-600"><Clock className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{counts.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-green-50 text-green-600"><CheckCircle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{counts.approved}</p><p className="text-xs text-muted-foreground">Approved</p></div></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-50 text-red-600"><AlertTriangle className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{counts.paymentDue}</p><p className="text-xs text-muted-foreground">Payment Due</p></div></CardContent></Card>
          <Card className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><ShoppingCart className="h-5 w-5" /></div><div><p className="text-2xl font-bold">{counts.completed}</p><p className="text-xs text-muted-foreground">Completed</p></div></CardContent></Card>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search product, vendor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Status</SelectItem>{PURCHASE_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace("_", " ")}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Requested By</TableHead>
                    <TableHead className="hidden md:table-cell">Vendor</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />No purchase requests found</TableCell></TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.requestedBy || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">{p.vendor || "—"}</TableCell>
                        <TableCell className="text-right">{p.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(p.estimatedCost)}</TableCell>
                        <TableCell>{priorityBadge(p.priority)}</TableCell>
                        <TableCell>{statusBadge(p.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(p.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Purchase Request</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Product Name *</Label><Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Est. Cost (₹)</Label><Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Actual Cost (₹)</Label><Input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PURCHASE_STATUSES.map((s) => (<SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Priority</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Requested By</Label><Input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Company</Label><Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPANIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid gap-2"><Label>Justification</Label><Input value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving || !form.productName}>{saving ? "Saving..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
