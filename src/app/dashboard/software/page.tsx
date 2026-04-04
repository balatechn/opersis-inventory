"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, Package, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SoftwareItem {
  id: string;
  softwareName: string;
  vendorName: string | null;
  licenseType: string;
  totalLicenses: number;
  usedLicenses: number;
  costPerLicense: number | null;
  totalCost: number | null;
  expiryDate: string | null;
  category: string | null;
}

export default function SoftwarePage() {
  const [software, setSoftware] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  useEffect(() => {
    fetch("/api/software")
      .then((r) => r.json())
      .then((d) => setSoftware(d.data || d))
      .catch(() => {
        setSoftware([
          { id: "1", softwareName: "Microsoft 365 Business", vendorName: "Microsoft", licenseType: "SUBSCRIPTION", totalLicenses: 50, usedLicenses: 42, costPerLicense: 1500, totalCost: 75000, expiryDate: "2026-06-30", category: "Office Suite" },
          { id: "2", softwareName: "Adobe Creative Cloud", vendorName: "Adobe", licenseType: "SUBSCRIPTION", totalLicenses: 10, usedLicenses: 8, costPerLicense: 3000, totalCost: 30000, expiryDate: "2026-04-15", category: "Design" },
          { id: "3", softwareName: "Kaspersky Endpoint Security", vendorName: "Kaspersky", licenseType: "SUBSCRIPTION", totalLicenses: 80, usedLicenses: 68, costPerLicense: 800, totalCost: 64000, expiryDate: "2026-08-20", category: "Antivirus" },
          { id: "4", softwareName: "Windows 11 Pro", vendorName: "Microsoft", licenseType: "PERPETUAL", totalLicenses: 60, usedLicenses: 55, costPerLicense: 12000, totalCost: 720000, expiryDate: null, category: "OS" },
          { id: "5", softwareName: "Tally Prime", vendorName: "Tally Solutions", licenseType: "SUBSCRIPTION", totalLicenses: 5, usedLicenses: 5, costPerLicense: 18000, totalCost: 90000, expiryDate: "2026-05-10", category: "Accounting" },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return software.filter((s) => {
      const matchSearch = !search || s.softwareName.toLowerCase().includes(search.toLowerCase()) ||
        s.vendorName?.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "ALL" || s.licenseType === typeFilter;
      return matchSearch && matchType;
    });
  }, [software, search, typeFilter]);

  const isExpiringSoon = (date: string | null) => {
    if (!date) return false;
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= 30;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Software Management</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} software licenses</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/software/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Software
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
                <Input placeholder="Search software..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="License Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                  <SelectItem value="PERPETUAL">Perpetual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          {loading ? (
            <CardContent className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}
            </CardContent>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Software</TableHead>
                    <TableHead className="hidden md:table-cell">Vendor</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Licenses</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">Cost</TableHead>
                    <TableHead className="hidden md:table-cell">Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        No software found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((sw) => (
                      <TableRow key={sw.id}>
                        <TableCell>
                          <Link href={`/dashboard/software/${sw.id}`} className="hover:text-blue-600">
                            <div className="font-medium">{sw.softwareName}</div>
                            <div className="text-xs text-muted-foreground">{sw.category || "—"}</div>
                          </Link>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{sw.vendorName || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={sw.licenseType === "SUBSCRIPTION" ? "info" : "secondary"}>
                            {sw.licenseType === "SUBSCRIPTION" ? "Sub" : "Perpetual"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-medium">{sw.usedLicenses}</span>
                          <span className="text-muted-foreground">/{sw.totalLicenses}</span>
                          {sw.usedLicenses >= sw.totalLicenses && (
                            <Badge variant="destructive" className="ml-2 text-[10px]">Full</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-right">
                          {formatCurrency(sw.totalCost)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            {isExpiringSoon(sw.expiryDate) && (
                              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            )}
                            <span className={isExpiringSoon(sw.expiryDate) ? "text-amber-600 font-medium" : ""}>
                              {sw.expiryDate ? formatDate(sw.expiryDate) : "Never"}
                            </span>
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
      </div>
    </PageTransition>
  );
}
