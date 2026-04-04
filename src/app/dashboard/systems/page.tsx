"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, Search, Download, Monitor, Eye, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, COMPANIES, ASSET_STATUSES, DEPARTMENTS, LOCATIONS } from "@/lib/utils";

interface Asset {
  id: string; assetTag: string; productName: string; serialNumber: string | null;
  company: string; department: string | null; location: string | null; status: string;
  cost: number | null; purchaseDate: string | null; make: string | null; config: string | null;
  osVersion: string | null; vendorDetails: string | null; invoiceNumber: string | null;
  warrantyPeriod: string | null; remarks: string | null;
  assignedUser?: { name: string } | null;
}

export default function SystemsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState("productName");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    productName: "", serialNumber: "", make: "", config: "", osVersion: "",
    company: "NCPL", department: "", location: "", vendorDetails: "",
    cost: "", status: "ACTIVE", invoiceNumber: "", warrantyPeriod: "", remarks: "",
  });

  const fetchAssets = () => {
    setLoading(true);
    fetch("/api/systems").then((r) => r.json()).then((d) => setAssets(d.data || d)).catch(() => setAssets([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchAssets(); }, []);

  const filtered = useMemo(() => {
    let result = assets.filter((a) => {
      const matchSearch = !search || a.productName.toLowerCase().includes(search.toLowerCase()) || a.assetTag.toLowerCase().includes(search.toLowerCase()) || a.serialNumber?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchCompany = companyFilter === "ALL" || a.company === companyFilter;
      return matchSearch && matchStatus && matchCompany;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [assets, search, statusFilter, companyFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const getStatusBadge = (status: string) => {
    const s = ASSET_STATUSES.find((st) => st.value === status);
    return <Badge className={s?.color || ""}>{s?.label || status}</Badge>;
  };
  const getCompanyLabel = (val: string) => COMPANIES.find((c) => c.value === val)?.label || val;

  const handleExport = () => {
    const csv = [["Asset Tag","Product","Serial","Company","Department","Location","Status","Cost"], ...filtered.map((a) => [a.assetTag, a.productName, a.serialNumber || "", getCompanyLabel(a.company), a.department || "", a.location || "", a.status, String(a.cost || 0)])].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "assets_report.csv"; link.click(); URL.revokeObjectURL(url);
  };

  const openEdit = (a: Asset) => {
    setEditItem(a);
    setForm({ productName: a.productName, serialNumber: a.serialNumber || "", make: a.make || "", config: a.config || "", osVersion: a.osVersion || "", company: a.company, department: a.department || "", location: a.location || "", vendorDetails: a.vendorDetails || "", cost: a.cost ? String(a.cost) : "", status: a.status, invoiceNumber: a.invoiceNumber || "", warrantyPeriod: a.warrantyPeriod || "", remarks: a.remarks || "" });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/systems/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, cost: form.cost ? parseFloat(form.cost) : null }) });
    setSaving(false); setEditOpen(false); fetchAssets();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this asset?")) return;
    await fetch(`/api/systems/${id}`, { method: "DELETE" }); fetchAssets();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Systems / IT Assets</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} assets found</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5"><Download className="h-4 w-4" />Export</Button>
            <Link href="/dashboard/systems/new"><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Asset</Button></Link>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search by name, tag, or serial..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Status</SelectItem>{ASSET_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={(v) => { setCompanyFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Company" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Companies</SelectItem>{COMPANIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
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
                      <TableHead><SortableHeader label="Asset Tag" sortKey="assetTag" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Product" sortKey="productName" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Company" sortKey="company" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden lg:table-cell"><SortableHeader label="Location" sortKey="location" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                      <TableHead><SortableHeader label="Status" sortKey="status" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell text-right"><SortableHeader label="Cost" sortKey="cost" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="text-center py-12 text-muted-foreground"><Monitor className="h-8 w-8 mx-auto mb-2 opacity-30" />No assets found</TableCell></TableRow>
                    ) : paginated.map((asset) => (
                      <TableRow key={asset.id} className="group">
                        <TableCell className="font-mono text-xs font-medium">{asset.assetTag}</TableCell>
                        <TableCell><div><div className="font-medium">{asset.productName}</div><div className="text-xs text-muted-foreground">{asset.serialNumber || "—"}</div></div></TableCell>
                        <TableCell className="hidden md:table-cell">{getCompanyLabel(asset.company)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{asset.location || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{asset.assignedUser?.name || "Unassigned"}</TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-right">{formatCurrency(asset.cost)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/systems/${asset.id}`)}><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(asset)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(asset.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
            <DialogHeader><DialogTitle>Edit Asset</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Product Name *</Label><Input value={form.productName} onChange={(e) => setForm({ ...form, productName: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Serial Number</Label><Input value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Make</Label><Input value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Company</Label><Select value={form.company} onValueChange={(v) => setForm({ ...form, company: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{COMPANIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Status</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ASSET_STATUSES.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Department</Label><Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent></Select></div>
                <div className="grid gap-2"><Label>Location</Label><Select value={form.location} onValueChange={(v) => setForm({ ...form, location: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{LOCATIONS.map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Cost (₹)</Label><Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Invoice No.</Label><Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} /></div>
              </div>
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
