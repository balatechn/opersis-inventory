"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
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
import { Plus, Search, Package, AlertTriangle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SoftwareItem {
  id: string; name: string; vendor: string | null; licenseType: string;
  totalLicenses: number; usedLicenses: number; costPerLicense: number | null;
  totalCost: number | null; expiryDate: string | null; renewalDate: string | null;
  category: string | null; licenseKey: string | null; invoiceNumber: string | null; notes: string | null;
}

export default function SoftwarePage() {
  const [software, setSoftware] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<SoftwareItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [form, setForm] = useState({
    name: "", vendor: "", licenseType: "SUBSCRIPTION", totalLicenses: "1", usedLicenses: "0",
    costPerLicense: "", expiryDate: "", renewalDate: "", category: "", licenseKey: "", invoiceNumber: "", notes: "",
  });

  const fetchSoftware = () => {
    setLoading(true);
    fetch("/api/software").then((r) => r.json()).then((d) => setSoftware(d.data || d)).catch(() => setSoftware([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchSoftware(); }, []);

  const filtered = useMemo(() => {
    let result = software.filter((s) => {
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.vendor?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || s.licenseType === typeFilter;
      return matchSearch && matchType;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [software, search, typeFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  };

  const openEdit = (sw: SoftwareItem) => {
    setEditItem(sw);
    setForm({ name: sw.name, vendor: sw.vendor || "", licenseType: sw.licenseType, totalLicenses: String(sw.totalLicenses), usedLicenses: String(sw.usedLicenses), costPerLicense: sw.costPerLicense ? String(sw.costPerLicense) : "", expiryDate: sw.expiryDate ? sw.expiryDate.split("T")[0] : "", renewalDate: sw.renewalDate ? sw.renewalDate.split("T")[0] : "", category: sw.category || "", licenseKey: sw.licenseKey || "", invoiceNumber: sw.invoiceNumber || "", notes: sw.notes || "" });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editItem) return;
    setSaving(true);
    await fetch(`/api/software/${editItem.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, totalLicenses: parseInt(form.totalLicenses) || 0, usedLicenses: parseInt(form.usedLicenses) || 0, costPerLicense: form.costPerLicense ? parseFloat(form.costPerLicense) : null, expiryDate: form.expiryDate || null, renewalDate: form.renewalDate || null }) });
    setSaving(false); setEditOpen(false); fetchSoftware();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this software license?")) return;
    await fetch(`/api/software/${id}`, { method: "DELETE" }); fetchSoftware();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Software Management</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} software licenses</p>
          </div>
          <Link href="/dashboard/software/new"><Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add Software</Button></Link>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search software..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" /></div>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="License Type" /></SelectTrigger>
                <SelectContent><SelectItem value="ALL">All Types</SelectItem><SelectItem value="SUBSCRIPTION">Subscription</SelectItem><SelectItem value="PERPETUAL">Perpetual</SelectItem></SelectContent>
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
                      <TableHead><SortableHeader label="Software" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Vendor" sortKey="vendor" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Type" sortKey="licenseType" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="text-center">Licenses</TableHead>
                      <TableHead className="hidden lg:table-cell text-right"><SortableHeader label="Cost" sortKey="totalCost" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} className="justify-end" /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Expires" sortKey="expiryDate" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Package className="h-8 w-8 mx-auto mb-2 opacity-30" />No software found</TableCell></TableRow>
                    ) : paginated.map((sw) => (
                      <TableRow key={sw.id}>
                        <TableCell><div className="font-medium">{sw.name}</div><div className="text-xs text-muted-foreground">{sw.category || "—"}</div></TableCell>
                        <TableCell className="hidden md:table-cell">{sw.vendor || "—"}</TableCell>
                        <TableCell><Badge variant={sw.licenseType === "SUBSCRIPTION" ? "info" : "secondary"}>{sw.licenseType === "SUBSCRIPTION" ? "Sub" : "Perpetual"}</Badge></TableCell>
                        <TableCell className="text-center"><span className="font-medium">{sw.usedLicenses}</span><span className="text-muted-foreground">/{sw.totalLicenses}</span>{sw.usedLicenses >= sw.totalLicenses && <Badge variant="destructive" className="ml-2 text-[10px]">Full</Badge>}</TableCell>
                        <TableCell className="hidden lg:table-cell text-right">{formatCurrency(sw.totalCost)}</TableCell>
                        <TableCell className="hidden md:table-cell"><div className="flex items-center gap-1">{isExpiringSoon(sw.expiryDate) && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}<span className={isExpiringSoon(sw.expiryDate) ? "text-amber-600 font-medium" : ""}>{sw.expiryDate ? formatDate(sw.expiryDate) : "Never"}</span></div></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(sw)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(sw.id)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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
            <DialogHeader><DialogTitle>Edit Software</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2"><Label>Software Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Vendor</Label><Input value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} /></div>
                <div className="grid gap-2"><Label>License Type</Label><Select value={form.licenseType} onValueChange={(v) => setForm({ ...form, licenseType: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="SUBSCRIPTION">Subscription</SelectItem><SelectItem value="PERPETUAL">Perpetual</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2"><Label>Total Licenses</Label><Input type="number" value={form.totalLicenses} onChange={(e) => setForm({ ...form, totalLicenses: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Used</Label><Input type="number" value={form.usedLicenses} onChange={(e) => setForm({ ...form, usedLicenses: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Cost / License</Label><Input type="number" value={form.costPerLicense} onChange={(e) => setForm({ ...form, costPerLicense: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
                <div className="grid gap-2"><Label>Renewal Date</Label><Input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
                <div className="grid gap-2"><Label>License Key</Label><Input value={form.licenseKey} onChange={(e) => setForm({ ...form, licenseKey: e.target.value })} /></div>
              </div>
              <div className="grid gap-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={saving || !form.name}>{saving ? "Saving..." : "Update"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
