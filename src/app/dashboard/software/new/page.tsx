"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import Link from "next/link";

export default function NewSoftwarePage() {
  const router = useRouter();
  const { departments } = useSettings();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    softwareName: "", vendorName: "", company: "National Consulting", department: "",
    licenseType: "SUBSCRIPTION", totalLicenses: "1", usedLicenses: "0",
    costPerLicense: "", purchaseDate: "", expiryDate: "", renewalDate: "", renewalCycle: "NONE",
    licenseKey: "", activationCode: "", invoiceNumber: "", category: "",
    versionEdition: "", deviceAssetTag: "", remarks: "",
  });

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.softwareName) { toast.error("Software name is required"); return; }
    setSaving(true);
    try {
      const totalLicenses = parseInt(form.totalLicenses) || 1;
      const usedLicenses = parseInt(form.usedLicenses) || 0;
      const costPerLicense = form.costPerLicense ? parseFloat(form.costPerLicense) : null;
      const totalCost = costPerLicense ? costPerLicense * totalLicenses : null;

      const res = await fetch("/api/software", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, totalLicenses, usedLicenses, costPerLicense, totalCost,
          purchaseDate: form.purchaseDate || null,
          expiryDate: form.expiryDate || null,
          renewalDate: form.renewalDate || null,
          renewalCycle: form.renewalCycle || "NONE",
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Software license created");
      router.push("/dashboard/software");
    } catch {
      toast.error("Failed to create software");
    } finally { setSaving(false); }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/software"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Add Software</h1>
            <p className="text-sm text-muted-foreground">Register a new software license</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Software Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Software Name *</Label><Input value={form.softwareName} onChange={(e) => handleChange("softwareName", e.target.value)} placeholder="e.g., Microsoft 365" /></div>
              <div className="space-y-2"><Label>Vendor</Label><Input value={form.vendorName} onChange={(e) => handleChange("vendorName", e.target.value)} /></div>
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="e.g., OS, Antivirus, Office Suite" /></div>
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => handleChange("company", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => handleChange("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Version / Edition</Label><Input value={form.versionEdition} onChange={(e) => handleChange("versionEdition", e.target.value)} /></div>
              <div className="space-y-2"><Label>Device / Asset Tag</Label><Input value={form.deviceAssetTag} onChange={(e) => handleChange("deviceAssetTag", e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Licensing</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>License Type</Label>
                <Select value={form.licenseType} onValueChange={(v) => handleChange("licenseType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUBSCRIPTION">Subscription</SelectItem>
                    <SelectItem value="PERPETUAL">Perpetual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Total Licenses</Label><Input type="number" value={form.totalLicenses} onChange={(e) => handleChange("totalLicenses", e.target.value)} /></div>
              <div className="space-y-2"><Label>Used Licenses</Label><Input type="number" value={form.usedLicenses} onChange={(e) => handleChange("usedLicenses", e.target.value)} /></div>
              <div className="space-y-2"><Label>Cost per License (₹)</Label><Input type="number" value={form.costPerLicense} onChange={(e) => handleChange("costPerLicense", e.target.value)} /></div>
              <div className="space-y-2"><Label>License Key</Label><Input value={form.licenseKey} onChange={(e) => handleChange("licenseKey", e.target.value)} /></div>
              <div className="space-y-2"><Label>Activation Code</Label><Input value={form.activationCode} onChange={(e) => handleChange("activationCode", e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Dates & Invoice</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Purchase Date</Label><Input type="date" value={form.purchaseDate} onChange={(e) => handleChange("purchaseDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiryDate} onChange={(e) => handleChange("expiryDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>Renewal Date</Label><Input type="date" value={form.renewalDate} onChange={(e) => handleChange("renewalDate", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Renewal Cycle</Label>
                <Select value={form.renewalCycle} onValueChange={(v) => handleChange("renewalCycle", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={(e) => handleChange("invoiceNumber", e.target.value)} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Remarks</Label><Textarea value={form.remarks} onChange={(e) => handleChange("remarks", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-6">
            <Link href="/dashboard/software"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" />{saving ? "Saving..." : "Save Software"}</Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
