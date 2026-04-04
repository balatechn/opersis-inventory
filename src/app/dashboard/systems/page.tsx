"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, Monitor, Eye } from "lucide-react";
import { formatCurrency, formatDate, COMPANIES, ASSET_STATUSES } from "@/lib/utils";

interface Asset {
  id: string;
  assetTag: string;
  productName: string;
  serialNumber: string | null;
  company: string;
  department: string | null;
  location: string | null;
  status: string;
  cost: number | null;
  purchaseDate: string | null;
  assignedUser?: { name: string } | null;
}

export default function SystemsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [companyFilter, setCompanyFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/systems")
      .then((r) => r.json())
      .then((d) => setAssets(d.data || d))
      .catch(() => {
        setAssets([
          {
            id: "1", assetTag: "NCPL-LAP-001", productName: "Dell XPS 15",
            serialNumber: "SN12345", company: "NCPL", department: "IT",
            location: "Bangalore", status: "ACTIVE", cost: 125000,
            purchaseDate: "2024-06-15", assignedUser: { name: "Rahul K" },
          },
          {
            id: "2", assetTag: "RAIN-DES-002", productName: "HP EliteDesk 800",
            serialNumber: "SN67890", company: "RAINLAND_AUTO_CORP", department: "Finance",
            location: "Ankola", status: "ACTIVE", cost: 85000,
            purchaseDate: "2024-03-20", assignedUser: { name: "Priya S" },
          },
          {
            id: "3", assetTag: "NCPL-LAP-003", productName: "Lenovo ThinkPad X1",
            serialNumber: "SN11223", company: "NCPL", department: "HR",
            location: "Bangalore", status: "SPARE", cost: 110000,
            purchaseDate: "2024-01-10", assignedUser: null,
          },
          {
            id: "4", assetTag: "ISKY-MON-004", productName: "Dell U2722D Monitor",
            serialNumber: "SN44556", company: "ISKY", department: "IT",
            location: "Mumbai", status: "ACTIVE", cost: 32000,
            purchaseDate: "2024-08-05", assignedUser: { name: "Amit V" },
          },
          {
            id: "5", assetTag: "NCPL-PRT-005", productName: "HP LaserJet Pro",
            serialNumber: "SN77889", company: "NCPL", department: "Admin",
            location: "Chickmagalur", status: "REPAIR", cost: 28000,
            purchaseDate: "2023-11-22", assignedUser: null,
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchSearch =
        !search ||
        a.productName.toLowerCase().includes(search.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        a.serialNumber?.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
      const matchCompany = companyFilter === "ALL" || a.company === companyFilter;
      return matchSearch && matchStatus && matchCompany;
    });
  }, [assets, search, statusFilter, companyFilter]);

  const getStatusBadge = (status: string) => {
    const s = ASSET_STATUSES.find((st) => st.value === status);
    return <Badge className={s?.color || ""}>{s?.label || status}</Badge>;
  };

  const getCompanyLabel = (val: string) =>
    COMPANIES.find((c) => c.value === val)?.label || val;

  const handleExport = () => {
    const csv = [
      ["Asset Tag", "Product", "Serial", "Company", "Department", "Location", "Status", "Cost"],
      ...filtered.map((a) => [
        a.assetTag, a.productName, a.serialNumber || "", getCompanyLabel(a.company),
        a.department || "", a.location || "", a.status, String(a.cost || 0),
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "assets_report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Systems / IT Assets</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} assets found
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link href="/dashboard/systems/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Asset
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, tag, or serial..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  {ASSET_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Companies</SelectItem>
                  {COMPANIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Tag</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="hidden md:table-cell">Company</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead className="hidden lg:table-cell">Assigned To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell text-right">Cost</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                        <Monitor className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No assets found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((asset) => (
                      <TableRow key={asset.id} className="group">
                        <TableCell className="font-mono text-xs font-medium">
                          {asset.assetTag}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{asset.productName}</div>
                            <div className="text-xs text-muted-foreground">
                              {asset.serialNumber || "—"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getCompanyLabel(asset.company)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {asset.location || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {asset.assignedUser?.name || "Unassigned"}
                        </TableCell>
                        <TableCell>{getStatusBadge(asset.status)}</TableCell>
                        <TableCell className="hidden md:table-cell text-right">
                          {formatCurrency(asset.cost)}
                        </TableCell>
                        <TableCell>
                          <Link href={`/dashboard/systems/${asset.id}`}>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
