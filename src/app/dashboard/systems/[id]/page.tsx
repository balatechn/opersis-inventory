"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Edit,
  Repeat2,
  Wrench,
  Clock,
  IndianRupee,
} from "lucide-react";
import { formatCurrency, formatDate, ASSET_STATUSES, calculateDepreciation } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [transferTo, setTransferTo] = useState("");
  const [transferLocation, setTransferLocation] = useState("");

  useEffect(() => {
    fetch(`/api/systems/${params.id}`)
      .then((r) => r.json())
      .then(setAsset)
      .catch(() => {
        setAsset({
          id: params.id,
          assetTag: "NCPL-LAP-001",
          productName: "Dell XPS 15",
          serialNumber: "SN12345",
          make: "Dell",
          config: "Intel i7-12700H, 16GB RAM, 512GB SSD",
          osVersion: "Windows 11 Pro",
          company: "NCPL",
          department: "IT",
          location: "Bangalore",
          vendorDetails: "Dell Technologies India",
          purchaseDate: "2024-06-15",
          invoiceNumber: "INV-2024-0456",
          cost: 125000,
          warrantyPeriod: "3 Years",
          warrantyExpiry: "2027-06-15",
          maintenanceSchedule: "2025-06-15",
          status: "ACTIVE",
          remarks: "Assigned for development work",
          depreciationRate: 25,
          assignedUser: { name: "Rahul K" },
          transfers: [
            {
              id: "t1",
              fromUser: "Priya S",
              toUser: "Rahul K",
              fromLocation: "Mumbai",
              toLocation: "Bangalore",
              transferDate: "2024-09-01",
              notes: "Transfer due to relocation",
            },
          ],
        });
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  const handleTransfer = async () => {
    if (!transferTo) {
      toast.error("Please enter the new user name");
      return;
    }
    try {
      await fetch(`/api/systems/${params.id}/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUser: transferTo, toLocation: transferLocation }),
      });
      toast.success("Asset transferred successfully");
      router.refresh();
    } catch {
      toast.error("Transfer failed");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    );
  }

  if (!asset) return null;

  const statusInfo = ASSET_STATUSES.find((s) => s.value === asset.status);
  const bookValue = asset.cost && asset.purchaseDate
    ? calculateDepreciation(asset.cost, asset.purchaseDate, asset.depreciationRate || 25)
    : null;

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/systems">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{asset.productName}</h1>
                <Badge className={statusInfo?.color}>{statusInfo?.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">{asset.assetTag}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline" className="gap-1.5">
                  <Repeat2 className="h-4 w-4" />
                  Transfer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Transfer Asset</DialogTitle>
                  <DialogDescription>
                    Transfer this asset to a new user or location.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Transfer To (User)</Label>
                    <Input value={transferTo} onChange={(e) => setTransferTo(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>New Location</Label>
                    <Input value={transferLocation} onChange={(e) => setTransferLocation(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleTransfer} className="gap-1.5">
                    <Repeat2 className="h-4 w-4" />
                    Confirm Transfer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Link href={`/dashboard/systems/${params.id}/edit`}>
              <Button size="sm" className="gap-1.5">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue="details" className="space-y-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history">Transfer History</TabsTrigger>
            <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Device Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Serial Number", asset.serialNumber],
                    ["Make / Brand", asset.make],
                    ["OS & Version", asset.osVersion],
                    ["Configuration", asset.config],
                    ["Software", asset.softwareInstalled],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">{value || "—"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Assignment & Location</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Assigned To", asset.assignedUser?.name || "Unassigned"],
                    ["Company", asset.company],
                    ["Department", asset.department],
                    ["Location", asset.location],
                    ["Email", asset.emailId],
                    ["Phone", asset.phone],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value || "—"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Purchase & Warranty</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ["Purchase Date", formatDate(asset.purchaseDate)],
                    ["Invoice", asset.invoiceNumber],
                    ["Cost", formatCurrency(asset.cost)],
                    ["Warranty", asset.warrantyPeriod],
                    ["Warranty Expiry", formatDate(asset.warrantyExpiry)],
                    ["Next Maintenance", formatDate(asset.maintenanceSchedule)],
                    ["Vendor", asset.vendorDetails],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-1.5 border-b last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value || "—"}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {asset.remarks || "No remarks added."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Transfer History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {asset.transfers?.length ? (
                  <div className="space-y-4">
                    {asset.transfers.map((t: any) => (
                      <div key={t.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <Repeat2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            {t.fromUser || "Unassigned"} → {t.toUser || "Unassigned"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.fromLocation} → {t.toLocation} • {formatDate(t.transferDate)}
                          </p>
                          {t.notes && (
                            <p className="text-xs text-muted-foreground mt-1">{t.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No transfer history
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="depreciation">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <IndianRupee className="h-4 w-4" />
                  Asset Depreciation (WDV Method)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Original Cost</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(asset.cost)}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Current Book Value</p>
                    <p className="text-2xl font-bold text-green-700">{formatCurrency(bookValue)}</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-muted-foreground">Depreciation Rate</p>
                    <p className="text-2xl font-bold text-amber-700">{asset.depreciationRate || 25}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
