"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, ShoppingCart, CheckCircle, Clock, CreditCard, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface PurchaseItem {
  id: string;
  productName: string;
  vendorName: string | null;
  quantity: number;
  totalAmount: number | null;
  status: string;
  date: string;
  requestedBy: { name: string };
  itemCategory: string;
}

const STATUS_MAP: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "info" | "secondary" }> = {
  PENDING: { label: "Pending", variant: "warning" },
  APPROVED: { label: "Approved", variant: "info" },
  PAYMENT_PENDING: { label: "Payment Pending", variant: "secondary" },
  COMPLETED: { label: "Completed", variant: "success" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/purchases")
      .then((r) => r.json())
      .then((d) => setPurchases(d.data || d))
      .catch(() => {
        setPurchases([
          { id: "1", productName: "Dell Latitude 5540", vendorName: "Dell India", quantity: 5, totalAmount: 525000, status: "APPROVED", date: "2026-03-20", requestedBy: { name: "Rahul K" }, itemCategory: "HARDWARE" },
          { id: "2", productName: "Adobe Creative Cloud", vendorName: "Adobe", quantity: 3, totalAmount: 90000, status: "PENDING", date: "2026-03-28", requestedBy: { name: "Priya S" }, itemCategory: "SOFTWARE" },
          { id: "3", productName: "Cisco Switch 24-Port", vendorName: "Cisco", quantity: 2, totalAmount: 86000, status: "PAYMENT_PENDING", date: "2026-03-15", requestedBy: { name: "Amit V" }, itemCategory: "NETWORKING" },
          { id: "4", productName: "HP LaserJet Pro", vendorName: "HP India", quantity: 1, totalAmount: 28000, status: "COMPLETED", date: "2026-02-10", requestedBy: { name: "Sanjay M" }, itemCategory: "HARDWARE" },
          { id: "5", productName: "AWS Reserved Instances", vendorName: "AWS", quantity: 1, totalAmount: 150000, status: "PENDING", date: "2026-04-01", requestedBy: { name: "Rahul K" }, itemCategory: "CLOUD_SERVICE" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchSearch = !search || p.productName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [purchases, search, statusFilter]);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Requests</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} requests</p>
          </div>
          <Link href="/dashboard/purchases/new">
            <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />New Request</Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending", count: purchases.filter((p) => p.status === "PENDING").length, icon: Clock, color: "text-amber-600 bg-amber-50" },
            { label: "Approved", count: purchases.filter((p) => p.status === "APPROVED").length, icon: CheckCircle, color: "text-blue-600 bg-blue-50" },
            { label: "Payment Due", count: purchases.filter((p) => p.status === "PAYMENT_PENDING").length, icon: CreditCard, color: "text-purple-600 bg-purple-50" },
            { label: "Completed", count: purchases.filter((p) => p.status === "COMPLETED").length, icon: ShoppingCart, color: "text-green-600 bg-green-50" },
          ].map((s) => (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div><p className="text-2xl font-bold">{s.count}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search purchases..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (<SelectItem key={k} value={k}>{v.label}</SelectItem>))}
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
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Requested By</TableHead>
                    <TableHead className="hidden lg:table-cell">Vendor</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />No purchases found</TableCell></TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.productName}</div>
                          <div className="text-xs text-muted-foreground">{p.itemCategory}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{p.requestedBy.name}</TableCell>
                        <TableCell className="hidden lg:table-cell">{p.vendorName || "—"}</TableCell>
                        <TableCell className="text-center">{p.quantity}</TableCell>
                        <TableCell className="hidden md:table-cell text-right">{formatCurrency(p.totalAmount)}</TableCell>
                        <TableCell>
                          <Badge variant={STATUS_MAP[p.status]?.variant || "default"}>
                            {STATUS_MAP[p.status]?.label || p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">{formatDate(p.date)}</TableCell>
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
