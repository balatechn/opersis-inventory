"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, Key, AlertTriangle, AlertOctagon, Clock, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface WarrantyAlert {
  id: string;
  assetTag: string;
  productName: string;
  make: string;
  warrantyExpiry: string;
  status: string;
  company: string;
  department: string | null;
  severity: string;
}

interface LicenseAlert {
  id: string;
  name: string;
  vendor: string | null;
  licenseType: string;
  totalLicenses: number;
  usedLicenses: number;
  expiryDate: string | null;
  renewalDate: string | null;
  costPerLicense: number | null;
  severity: string;
}

interface Summary {
  expiredWarranties: number;
  criticalWarranties: number;
  expiredLicenses: number;
  criticalLicenses: number;
  totalAlerts: number;
}

export default function AlertsPage() {
  const [warranties, setWarranties] = useState<WarrantyAlert[]>([]);
  const [licenses, setLicenses] = useState<LicenseAlert[]>([]);
  const [summary, setSummary] = useState<Summary>({ expiredWarranties: 0, criticalWarranties: 0, expiredLicenses: 0, criticalLicenses: 0, totalAlerts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => {
        setWarranties(d.warranties || []);
        setLicenses(d.licenses || []);
        setSummary(d.summary || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const severityBadge = (s: string) => {
    const map: Record<string, { variant: string; icon: React.ReactNode; label: string }> = {
      expired: { variant: "destructive", icon: <AlertOctagon className="h-3 w-3 mr-1" />, label: "Expired" },
      critical: { variant: "destructive", icon: <AlertTriangle className="h-3 w-3 mr-1" />, label: "< 30 days" },
      warning: { variant: "warning", icon: <Clock className="h-3 w-3 mr-1" />, label: "< 60 days" },
      upcoming: { variant: "outline", icon: <CheckCircle className="h-3 w-3 mr-1" />, label: "< 90 days" },
    };
    const cfg = map[s] || map.upcoming;
    return <Badge variant={cfg.variant as any} className="gap-0.5">{cfg.icon}{cfg.label}</Badge>;
  };

  const daysUntil = (date: string | null) => {
    if (!date) return "—";
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)}d overdue`;
    return `${diff}d remaining`;
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Warranty & License Alerts</h1>
          <p className="text-sm text-muted-foreground">Monitor expiring warranties and software licenses</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm border-l-4 border-l-red-500"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertOctagon className="h-5 w-5 text-red-500" /><div><p className="text-2xl font-bold">{summary.expiredWarranties + summary.expiredLicenses}</p><p className="text-xs text-muted-foreground">Expired</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-orange-500"><CardContent className="p-4"><div className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-orange-500" /><div><p className="text-2xl font-bold">{summary.criticalWarranties + summary.criticalLicenses}</p><p className="text-xs text-muted-foreground">Critical (&lt;30d)</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-blue-500"><CardContent className="p-4"><div className="flex items-center gap-3"><ShieldAlert className="h-5 w-5 text-blue-500" /><div><p className="text-2xl font-bold">{warranties.length}</p><p className="text-xs text-muted-foreground">Warranty Alerts</p></div></div></CardContent></Card>
          <Card className="border-0 shadow-sm border-l-4 border-l-purple-500"><CardContent className="p-4"><div className="flex items-center gap-3"><Key className="h-5 w-5 text-purple-500" /><div><p className="text-2xl font-bold">{licenses.length}</p><p className="text-xs text-muted-foreground">License Alerts</p></div></div></CardContent></Card>
        </div>

        {loading ? (
          <Card className="border-0 shadow-sm"><CardContent className="p-6 space-y-3">{[...Array(5)].map((_, i) => (<Skeleton key={i} className="h-12 rounded-lg" />))}</CardContent></Card>
        ) : (
          <Tabs defaultValue="warranties" className="space-y-4">
            <TabsList>
              <TabsTrigger value="warranties">Warranties ({warranties.length})</TabsTrigger>
              <TabsTrigger value="licenses">Licenses ({licenses.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="warranties">
              <Card className="border-0 shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Tag</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead className="hidden md:table-cell">Make</TableHead>
                        <TableHead className="hidden md:table-cell">Company</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Time Left</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {warranties.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><ShieldAlert className="h-8 w-8 mx-auto mb-2 opacity-30" />No warranty alerts</TableCell></TableRow>
                      ) : warranties.map((w) => (
                        <TableRow key={w.id}>
                          <TableCell className="font-mono text-xs">{w.assetTag}</TableCell>
                          <TableCell className="font-medium">{w.productName}</TableCell>
                          <TableCell className="hidden md:table-cell">{w.make}</TableCell>
                          <TableCell className="hidden md:table-cell">{w.company}</TableCell>
                          <TableCell className="text-xs">{formatDate(w.warrantyExpiry)}</TableCell>
                          <TableCell className="text-xs font-medium">{daysUntil(w.warrantyExpiry)}</TableCell>
                          <TableCell>{severityBadge(w.severity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="licenses">
              <Card className="border-0 shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Software</TableHead>
                        <TableHead className="hidden md:table-cell">Vendor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Usage</TableHead>
                        <TableHead>Expiry / Renewal</TableHead>
                        <TableHead>Time Left</TableHead>
                        <TableHead>Severity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {licenses.length === 0 ? (
                        <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground"><Key className="h-8 w-8 mx-auto mb-2 opacity-30" />No license alerts</TableCell></TableRow>
                      ) : licenses.map((l) => (
                        <TableRow key={l.id}>
                          <TableCell className="font-medium">{l.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{l.vendor || "—"}</TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{l.licenseType}</Badge></TableCell>
                          <TableCell className="text-right text-xs">{l.usedLicenses}/{l.totalLicenses}</TableCell>
                          <TableCell className="text-xs">{formatDate(l.expiryDate || l.renewalDate)}</TableCell>
                          <TableCell className="text-xs font-medium">{daysUntil(l.expiryDate || l.renewalDate)}</TableCell>
                          <TableCell>{severityBadge(l.severity)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </PageTransition>
  );
}
