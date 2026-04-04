"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { COMPANIES, DEPARTMENTS, LOCATIONS, ASSET_STATUSES } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSystemPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    assetTag: "",
    productName: "",
    serialNumber: "",
    make: "",
    config: "",
    osVersion: "",
    company: "NCPL",
    department: "",
    location: "",
    vendorDetails: "",
    purchaseDate: "",
    invoiceNumber: "",
    cost: "",
    warrantyPeriod: "",
    warrantyExpiry: "",
    maintenanceSchedule: "",
    status: "ACTIVE",
    remarks: "",
    phone: "",
    emailId: "",
    officeAppId: "",
    softwareInstalled: "",
    logRetention: "",
    previousUser: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.assetTag || !form.productName) {
      toast.error("Asset Tag and Product Name are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          cost: form.cost ? parseFloat(form.cost) : null,
          purchaseDate: form.purchaseDate || null,
          warrantyExpiry: form.warrantyExpiry || null,
          maintenanceSchedule: form.maintenanceSchedule || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success("Asset created successfully");
      router.push("/dashboard/systems");
    } catch {
      toast.error("Failed to create asset. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/systems">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Add New Asset</h1>
            <p className="text-sm text-muted-foreground">Register a new IT asset in the system</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Asset Tag *</Label>
                <Input
                  value={form.assetTag}
                  onChange={(e) => handleChange("assetTag", e.target.value)}
                  placeholder="e.g., NCPL-LAP-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input
                  value={form.productName}
                  onChange={(e) => handleChange("productName", e.target.value)}
                  placeholder="e.g., Dell XPS 15"
                />
              </div>
              <div className="space-y-2">
                <Label>Serial Number</Label>
                <Input
                  value={form.serialNumber}
                  onChange={(e) => handleChange("serialNumber", e.target.value)}
                  placeholder="Serial number"
                />
              </div>
              <div className="space-y-2">
                <Label>Make / Brand</Label>
                <Input
                  value={form.make}
                  onChange={(e) => handleChange("make", e.target.value)}
                  placeholder="e.g., Dell, HP, Lenovo"
                />
              </div>
              <div className="space-y-2">
                <Label>OS & Version</Label>
                <Input
                  value={form.osVersion}
                  onChange={(e) => handleChange("osVersion", e.target.value)}
                  placeholder="e.g., Windows 11 Pro"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ASSET_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Organization</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={form.company} onValueChange={(v) => handleChange("company", v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMPANIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => handleChange("department", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={form.location} onValueChange={(v) => handleChange("location", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Email ID</Label>
                <Input
                  value={form.emailId}
                  onChange={(e) => handleChange("emailId", e.target.value)}
                  placeholder="user@company.com"
                  type="email"
                />
              </div>
              <div className="space-y-2">
                <Label>Office App ID</Label>
                <Input
                  value={form.officeAppId}
                  onChange={(e) => handleChange("officeAppId", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Purchase & Warranty */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Purchase & Warranty</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => handleChange("purchaseDate", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Number</Label>
                <Input
                  value={form.invoiceNumber}
                  onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cost (₹)</Label>
                <Input
                  type="number"
                  value={form.cost}
                  onChange={(e) => handleChange("cost", e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty Period</Label>
                <Input
                  value={form.warrantyPeriod}
                  onChange={(e) => handleChange("warrantyPeriod", e.target.value)}
                  placeholder="e.g., 3 Years"
                />
              </div>
              <div className="space-y-2">
                <Label>Warranty Expiry</Label>
                <Input
                  type="date"
                  value={form.warrantyExpiry}
                  onChange={(e) => handleChange("warrantyExpiry", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Schedule</Label>
                <Input
                  type="date"
                  value={form.maintenanceSchedule}
                  onChange={(e) => handleChange("maintenanceSchedule", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Additional Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vendor Details</Label>
                <Textarea
                  value={form.vendorDetails}
                  onChange={(e) => handleChange("vendorDetails", e.target.value)}
                  placeholder="Vendor name, contact info..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Configuration</Label>
                <Textarea
                  value={form.config}
                  onChange={(e) => handleChange("config", e.target.value)}
                  placeholder="RAM, CPU, Storage..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Software Installed</Label>
                <Input
                  value={form.softwareInstalled}
                  onChange={(e) => handleChange("softwareInstalled", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Previous User</Label>
                <Input
                  value={form.previousUser}
                  onChange={(e) => handleChange("previousUser", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Log Retention</Label>
                <Input
                  value={form.logRetention}
                  onChange={(e) => handleChange("logRetention", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Remarks / History Notes</Label>
                <Textarea
                  value={form.remarks}
                  onChange={(e) => handleChange("remarks", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 pb-6">
            <Link href="/dashboard/systems">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={saving} className="gap-1.5">
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Asset"}
            </Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
