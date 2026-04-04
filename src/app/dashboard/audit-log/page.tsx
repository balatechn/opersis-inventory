"use client";

import { useEffect, useState, useMemo } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText, Search, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((d) => setLogs(d.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter(
      (l) =>
        l.action.toLowerCase().includes(q) ||
        l.entity.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q) ||
        l.user?.name.toLowerCase().includes(q)
    );
  }, [logs, search]);

  const actionColor = (action: string) => {
    const a = action.toLowerCase();
    if (a.includes("created") || a.includes("added")) return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (a.includes("updated") || a.includes("approved")) return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (a.includes("deleted") || a.includes("rejected")) return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (a.includes("login")) return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Audit Log</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} entries</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search action, entity, user..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">{[...Array(8)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="hidden md:table-cell">Details</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground"><ScrollText className="h-8 w-8 mx-auto mb-2 opacity-30" />No audit logs found</TableCell></TableRow>
                  ) : (
                    filtered.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {new Date(l.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${actionColor(l.action)}`}>
                            {l.action}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium text-sm">{l.entity}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground max-w-[300px] truncate">{l.details || "—"}</TableCell>
                        <TableCell>
                          {l.user ? (
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                              </div>
                              <span className="text-xs">{l.user.name}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">System</span>
                          )}
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
