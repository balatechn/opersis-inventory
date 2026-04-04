"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { TablePagination } from "@/components/ui/table-pagination";
import { SortableHeader } from "@/components/ui/sortable-header";
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2, Shield, UserCheck, UserX, KeyRound } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLES = ["ADMIN", "IT_MANAGER", "VIEWER"];
const roleColors: Record<string, string> = { ADMIN: "destructive", IT_MANAGER: "warning", VIEWER: "secondary" };

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "VIEWER", active: true,
  });

  // Reset password dialog
  const [resetOpen, setResetOpen] = useState(false);
  const [resetItem, setResetItem] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/users").then((r) => r.json()).then((d) => setUsers(Array.isArray(d) ? d : [])).catch(() => setUsers([])).finally(() => setLoading(false));
  };
  useEffect(() => { fetchUsers(); }, []);

  const filtered = useMemo(() => {
    let result = users.filter((u) => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
    result.sort((a, b) => {
      const av = (a as any)[sortKey] ?? "";
      const bv = (b as any)[sortKey] ?? "";
      const cmp = typeof av === "boolean" ? Number(av) - Number(bv) : typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [users, search, roleFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = useCallback((key: string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  }, [sortKey]);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", email: "", password: "", role: "VIEWER", active: true });
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (u: UserItem) => {
    setEditItem(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role, active: u.active });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required"); return; }
    if (!editItem && !form.password.trim()) { setError("Password is required for new users"); return; }

    setSaving(true);
    setError("");

    const url = editItem ? `/api/users/${editItem.id}` : "/api/users";
    const method = editItem ? "PUT" : "POST";
    const body: any = { name: form.name, email: form.email, role: form.role, active: form.active };
    if (form.password.trim()) body.password = form.password;

    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Failed to save user");
      setSaving(false);
      return;
    }

    setSaving(false);
    setDialogOpen(false);
    fetchUsers();
  };

  const handleDelete = async (u: UserItem) => {
    if (!confirm(`Delete user "${u.name}" (${u.email})?`)) return;
    await fetch(`/api/users/${u.id}`, { method: "DELETE" }); fetchUsers();
  };

  const handleToggleActive = async (u: UserItem) => {
    await fetch(`/api/users/${u.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !u.active }),
    });
    fetchUsers();
  };

  const openResetPassword = (u: UserItem) => {
    setResetItem(u);
    setNewPassword("");
    setResetOpen(true);
  };

  const handleResetPassword = async () => {
    if (!resetItem || !newPassword.trim()) return;
    setSaving(true);
    await fetch(`/api/users/${resetItem.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    });
    setSaving(false);
    setResetOpen(false);
  };

  const activeCounts = useMemo(() => {
    const active = users.filter((u) => u.active).length;
    return { active, inactive: users.length - active };
  }, [users]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} users — {activeCounts.active} active, {activeCounts.inactive} inactive</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openCreate}><Plus className="h-4 w-4" />Add User</Button>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name or email..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pl-9" />
              </div>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  {ROLES.map((r) => (<SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>))}
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
                      <TableHead><SortableHeader label="Name" sortKey="name" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Email" sortKey="email" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Role" sortKey="role" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead><SortableHeader label="Status" sortKey="active" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="hidden md:table-cell"><SortableHeader label="Created" sortKey="createdAt" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} /></TableHead>
                      <TableHead className="w-[60px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Users className="h-8 w-8 mx-auto mb-2 opacity-30" />No users found</TableCell></TableRow>
                    ) : paginated.map((u) => (
                      <TableRow key={u.id} className={!u.active ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                        <TableCell><Badge variant={roleColors[u.role] as any || "secondary"} className="text-xs"><Shield className="mr-1 h-3 w-3" />{u.role.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>
                          {u.active ? (
                            <Badge variant="success" className="text-xs"><UserCheck className="mr-1 h-3 w-3" />Active</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs"><UserX className="mr-1 h-3 w-3" />Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{formatDate(u.createdAt)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button size="icon" variant="ghost" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEdit(u)}><Pencil className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openResetPassword(u)}><KeyRound className="mr-2 h-4 w-4" />Reset Password</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(u)}>
                                {u.active ? <><UserX className="mr-2 h-4 w-4" />Deactivate</> : <><UserCheck className="mr-2 h-4 w-4" />Activate</>}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(u)}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
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

        {/* Create / Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editItem ? "Edit User" : "Create New User"}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-2">
              {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-md">{error}</div>}
              <div className="grid gap-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid gap-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="grid gap-2"><Label>{editItem ? "Password (leave blank to keep)" : "Password *"}</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editItem ? "Leave blank to keep current" : ""} /></div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (<SelectItem key={r} value={r}>{r.replace(/_/g, " ")}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Select value={form.active ? "true" : "false"} onValueChange={(v) => setForm({ ...form, active: v === "true" })}>
                  <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="true">Active</SelectItem><SelectItem value="false">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : editItem ? "Update" : "Create"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={resetOpen} onOpenChange={setResetOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Reset password for <strong>{resetItem?.name}</strong> ({resetItem?.email})</p>
            <div className="grid gap-2">
              <Label>New Password *</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetOpen(false)}>Cancel</Button>
              <Button onClick={handleResetPassword} disabled={saving || !newPassword.trim()}>{saving ? "Resetting..." : "Reset Password"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
