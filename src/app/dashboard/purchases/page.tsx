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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Plus, Search, ShoppingCart, MoreHorizontal, Pencil, Trash2, CheckCircle, XCircle, Clock, CreditCard, Truck, AlertTriangle } from "lucide-react";
import { BulkUpload } from "@/components/ui/bulk-upload";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface PurchaseItem {
  id: string; productName: string; category: string; vendor?: string; vendorName?: string;
  quantity: number; estimatedCost: number | null; actualCost: number | null;
  status: string; priority: string; requestedBy: string; approvedBy: string | null;
  approvalDate: string | null; company: string; department: string | null;
  justification: string | null; remarks: string | null; date: string; createdAt: string;
  quotationReceived: boolean; purchaseOrderSent: boolean; paymentDone: boolean; delivered: boolean;
  invoiceNumber: string | null; vendorContact: string | null; purchaseMethod: string | null;
  expectedDelivery: string | null;
}

const CATEGORIES = ["HARDWARE", "SOFTWARE", "NETWORKING", "PERIPHERALS", "CONSUMABLES", "FURNITURE", "OTHER"];
const STATUSES = ["PENDING", "APPROVED", "PAYMENT_DUE", "COMPLETED", "REJECTED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const statusColor: Record<string, string> = {
  PENDING: "warning", APPROVED: "success", PAYMENT_DUE: "default", COMPLETED: "success", REJECTED: "destructive",
};
const priorityColor: Record<string, string> = {
  LOW: "secondary", MEDIUM: "default", HIGH: "warning", URGENT: "destructive",
};

export default function PurchasesPage() {
  const { companies, departments } = useSettings();
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<PurchaseItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    productName: "", category: "HARDWARE", requestedBy: "", department: "", company: "NCPL",
    vendorName: "", estimatedCost: "", actualCost: "", priority: "MEDIUM",
    justification: "", remarks: "", invoiceNumber: "",
  });

  // Approval dialog
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalItem, setApprovalItem] = useState<PurchaseItem | null>(null);
  const [approvalAction, setApprovalAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approvedBy, setApprovedBy] = useState("");
  const [approvalRemarks, setApprovalRemarks] = useState("");

  const fetchPurchases = () => {
    setLoading(true);
    fetch("/api/purchases?limit=500")
      .then((r) => r.json())
      .then((d) => setPurchases(d.data || []))
      .catch(() => setPurchases([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchPurchases(); }, []);

  const filtered = useMemo(() => {
    let result = purchases.filter((p) => {
      const matchSearch = !search || p.productName?.toLowerCase().includes(search.toLowerCase()) || p.requestedBy?.toLowerCase().includes(search.toLowerCase()) || (p.vendorName || p.vendor || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [purchases, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  // Summary counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { PENDING: 0, APPROVED: 0, PAYMENT_DUE: 0, COMPLETED: 0, REJECTED: 0 };
    purchases.forEach((p) => { if (counts[p.status] !== undefined) counts[p.status]++; });
    return counts;
  }, [purchases]);

  // Edit
  const openEdit = (p: PurchaseItem) => {
    setEditItem(p);
    setForm({
      productName: p.productName, category: p.category || "HARDWARE", requestedBy: p.requestedBy,
      department: p.department || "", company: p.company || "NCPL",
      vendorName: p.vendorName || p.vendor || "", estimatedCost: String(p.estimatedCost || ""),
      actualCost: String(p.actualCost || ""), priority: p.priority || "MEDIUM",
      justification: p.justification || "", remarks: p.remarks || "",
      invoiceNumber: p.invoiceNumber || "",
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/purchases/${editItem.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        estimatedCost: parseFloat(form.estimatedCost) || null,
        actualCost: parseFloat(form.actualCost) || null,
      }),
    });
    setSaving(false); setEditOpen(false); fetchPurchases();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase request?")) return;
    await fetch(`/api/purchases/${id}`, { method: "DELETE" }); fetchPurchases();
  };

  // Approval workflow
  const openApproval = (p: PurchaseItem, action: "APPROVED" | "REJECTED") => {
    setApprovalItem(p);
    setApprovalAction(action);
    setApprovedBy("");
    setApprovalRemarks("");
    setApprovalOpen(true);
  };

  const handleApproval = async () => {
    if (!approvalItem || !approvedBy.trim()) return;
    setSaving(true);
    await fetch(`/api/purchases/${approvalItem.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: approvalAction,
        approvedBy: approvedBy.trim(),
        approvalDate: new Date().toISOString(),
        remarks: approvalRemarks || approvalItem.remarks,
      }),
    });
    setSaving(false); setApprovalOpen(false); fetchPurchases();
  };

  // Quick status transitions
  const handleStatusUpdate = async (p: PurchaseItem, newStatus: string, extraData?: Record<string, any>) => {
    await fetch(`/api/purchases/${p.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, ...extraData }),
    });
    fetchPurchases();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Purchase Requests</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} purchase records</p>
          </div>
          <div className="flex gap-2">
            <BulkUpload
              entityName="Purchases"
              sampleHeaders={["productName","requestedBy","category","quantity","estimatedCost","vendorName","company","department","priority","justification","remarks"]}
              sampleRow={["Dell Monitor 27\"","Rahul K","HARDWARE","5","15000","Dell India","NCPL","IT Department","MEDIUM","New monitors for dev team","Urgent requirement"]}
              apiEndpoint="/api/purchases/bulk"
              onComplete={fetchPurchases}
            />
            <Link href="/dashboard/purchases/new">
              <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New Request</Button>
            </Link>
          </div>
        </div>

        {/* Status summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => { setStatusFilter("PENDING"); setPage(1); }}>
            <CardContent className="p-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div><p className="text-lg font-bold">{statusCounts.PENDING}</p><p className="text-[10px] text-muted-foreground">Pending</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => { setStatusFilter("APPROVED"); setPage(1); }}>
            <CardContent className="p-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div><p className="text-lg font-bold">{statusCounts.APPROVED}</p><p className="text-[10px] text-muted-foreground">Approved</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => { setStatusFilter("PAYMENT_DUE"); setPage(1); }}>
            <CardContent className="p-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <div><p className="text-lg font-bold">{statusCounts.PAYMENT_DUE}</p><p className="text-[10px] text-muted-foreground">Payment Due</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => { setStatusFilter("COMPLETED"); setPage(1); }}>
            <CardContent className="p-3 flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-500" />
              <div><p className="text-lg font-bold">{statusCounts.COMPLETED}</p><p className="text-[10px] text-muted-foreground">Completed</p></div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition" onClick={() => { setStatusFilter("REJECTED"); setPage(1); }}>
            <CardContent className="p-3 flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div><p className="text-lg font-bold">{statusCounts.REJECTED}</p><p className="text-[10px] text-muted-foreground">Rejected</p></div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search product, vendor, requester..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  {STATUSES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
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
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortableHeader label="Product" sortKey="productName" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Category" sortKey="category" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden lg:table-cell"><SortableHeader label="Vendor" sortKey="vendorName" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Requested By" sortKey="requestedBy" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="text-right"><SortableHeader label="Est. Cost" sortKey="estimatedCost" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead><SortableHeader label="Priority" sortKey="priority" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden lg:table-cell">Approved By</TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={9} className="text-center py-12 text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />No purchase requests found</TableCell></TableRow>
                    ) : paginated.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.productName}</TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="outline" className="text-xs">{p.category}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell">{p.vendorName || p.vendor || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell text-sm">{p.requestedBy}</TableCell>
                        <TableCell className="text-right">{p.estimatedCost ? formatCurrency(p.estimatedCost) : "—"}</TableCell>
                        <TableCell><Badge variant={priorityColor[p.priority?.toUpperCase()] as any || "secondary"} className="text-xs">{p.priority}</Badge></TableCell>
                        <TableCell><Badge variant={statusColor[p.status] as any || "secondary"} className="text-xs">{p.status.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{p.approvedBy || "—"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(p)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>

                              {/* Approval actions */}
                              {p.status === "PENDING" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-green-600" onClick={() => openApproval(p, "APPROVED")}>
                                    <CheckCircle className="mr-2 h-4 w-4" />Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => openApproval(p, "REJECTED")}>
                                    <XCircle className="mr-2 h-4 w-4" />Reject
                                  </DropdownMenuItem>
                                </>
                              )}

                              {/* Status transitions */}
                              {p.status === "APPROVED" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(p, "PAYMENT_DUE", { purchaseOrderSent: true })}>
                                    <CreditCard className="mr-2 h-4 w-4" />Mark Payment Due
                                  </DropdownMenuItem>
                                </>
                              )}
                              {p.status === "PAYMENT_DUE" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => handleStatusUpdate(p, "COMPLETED", { paymentDone: true, delivered: true })}>
                                    <Truck className="mr-2 h-4 w-4" />Mark Completed
                                  </DropdownMenuItem>
                                </>
                              )}

                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(p.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />Delete
                              </DropdownMenuItem>
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

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Purchase Request</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Product Name *</Label><Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Priority</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Requested By</Label><Input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Vendor</Label><Input value={form.vendorName} onChange={(e) => setForm({ ...form, vendorName: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Estimated Cost (₹)</Label><Input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Actual Cost (₹)</Label><Input type="number" value={form.actualCost} onChange={(e) => setForm({ ...form, actualCost: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Company</Label><Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{companies.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Department</Label><Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid gap-2"><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Justification</Label><Textarea rows={2} value={form.justification} onChange={(e) => setForm({ ...form, justification: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Remarks</Label><Input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving || !form.productName}>{saving ? "Saving..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={approvalOpen} onOpenChange={setApprovalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {approvalAction === "APPROVED" ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />}
                {approvalAction === "APPROVED" ? "Approve" : "Reject"} Purchase Request
              </DialogTitle>
              <DialogDescription>
                {approvalItem?.productName} — requested by {approvalItem?.requestedBy}
                {approvalItem?.estimatedCost ? ` (${formatCurrency(approvalItem.estimatedCost)})` : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>{approvalAction === "APPROVED" ? "Approved" : "Rejected"} By *</Label>
                <Input placeholder="Enter your name" value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Remarks</Label>
                <Textarea rows={2} placeholder={approvalAction === "APPROVED" ? "Optional approval notes..." : "Reason for rejection..."} value={approvalRemarks} onChange={(e) => setApprovalRemarks(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalOpen(false)}>Cancel</Button>
              <Button variant={approvalAction === "APPROVED" ? "default" : "destructive"} onClick={handleApproval} disabled={saving || !approvedBy.trim()}>
                {saving ? "Processing..." : approvalAction === "APPROVED" ? "Approve" : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
