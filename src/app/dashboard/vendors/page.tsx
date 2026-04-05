"use client";

import { useEffect, useState, useMemo } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Plus, Search, Building2, Pencil, Trash2, Globe, Phone, Mail } from "lucide-react";
import { BulkUpload } from "@/components/ui/bulk-upload";

interface VendorItem {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  category: string | null;
  website: string | null;
  active: boolean;
  notes: string | null;
}

const VENDOR_CATEGORIES = ["GENERAL", "HARDWARE", "SOFTWARE", "NETWORKING", "CLOUD", "TELECOM", "SERVICES", "OFFICE_SUPPLIES"];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<VendorItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", contactPerson: "", email: "", phone: "", address: "", city: "", state: "",
    gstNumber: "", panNumber: "", category: "GENERAL", website: "", notes: "",
  });

  const fetchVendors = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (catFilter !== "ALL") params.set("category", catFilter);
    fetch(`/api/vendors?${params}`)
      .then((r) => r.json())
      .then((d) => setVendors(d.data || []))
      .catch(() => setVendors([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVendors(); }, [catFilter]);

  const filtered = useMemo(() => {
    if (!search) return vendors;
    const q = search.toLowerCase();
    return vendors.filter((v) =>
      v.name.toLowerCase().includes(q) || v.contactPerson?.toLowerCase().includes(q) || v.email?.toLowerCase().includes(q) || v.gstNumber?.toLowerCase().includes(q)
    );
  }, [vendors, search]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", contactPerson: "", email: "", phone: "", address: "", city: "", state: "", gstNumber: "", panNumber: "", category: "GENERAL", website: "", notes: "" });
    setDialogOpen(true);
  };

  const openEdit = (v: VendorItem) => {
    setEditItem(v);
    setForm({
      name: v.name, contactPerson: v.contactPerson || "", email: v.email || "", phone: v.phone || "",
      address: v.address || "", city: v.city || "", state: v.state || "", gstNumber: v.gstNumber || "",
      panNumber: v.panNumber || "", category: v.category || "GENERAL", website: v.website || "", notes: v.notes || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editItem ? `/api/vendors/${editItem.id}` : "/api/vendors";
    const method = editItem ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    setDialogOpen(false);
    fetchVendors();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this vendor?")) return;
    await fetch(`/api/vendors/${id}`, { method: "DELETE" });
    fetchVendors();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} vendors</p>
          </div>
          <div className="flex gap-2">
            <BulkUpload
              entityName="Vendors"
              sampleHeaders={["name","contactPerson","email","phone","address","city","state","gstNumber","panNumber","category","website","notes"]}
              sampleRow={["Dell Technologies","John Smith","john@dell.com","+91 98765 43210","123 Tech Park","Bangalore","Karnataka","29ABCDE1234F1Z5","ABCDE1234F","HARDWARE","https://dell.com","Primary hardware vendor"]}
              apiEndpoint="/api/vendors/bulk"
              onComplete={fetchVendors}
            />
            <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus className="h-4 w-4" />Add Vendor</Button>
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="w-full sm:w-[170px]"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  {VENDOR_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
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
                    <TableHead>Vendor</TableHead>
                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">City</TableHead>
                    <TableHead className="hidden md:table-cell">GST No</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[80px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Building2 className="h-8 w-8 mx-auto mb-2 opacity-30" />No vendors found</TableCell></TableRow>
                  ) : (
                    filtered.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell>
                          <div className="font-medium">{v.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            {v.email && <span className="flex items-center gap-0.5"><Mail className="h-3 w-3" />{v.email}</span>}
                            {v.phone && <span className="flex items-center gap-0.5"><Phone className="h-3 w-3" />{v.phone}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{v.contactPerson || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell">{v.city || "—"}{v.state ? `, ${v.state}` : ""}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">{v.gstNumber || "—"}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{v.category}</Badge></TableCell>
                        <TableCell>
                          <Badge variant={v.active ? "success" : "secondary"}>{v.active ? "Active" : "Inactive"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(v)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => handleDelete(v.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editItem ? "Edit Vendor" : "Add Vendor"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Vendor Name *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Company name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Contact Person</Label>
                  <Input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{VENDOR_CATEGORIES.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>GST Number</Label>
                  <Input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} placeholder="22AAAAA0000A1Z5" />
                </div>
                <div className="grid gap-2">
                  <Label>PAN Number</Label>
                  <Input value={form.panNumber} onChange={(e) => setForm({ ...form, panNumber: e.target.value })} placeholder="AAAAA0000A" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Website</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://" />
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving || !form.name}>{saving ? "Saving..." : editItem ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
