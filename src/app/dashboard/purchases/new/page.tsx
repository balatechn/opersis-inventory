"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function NewPurchasePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    requestedByFirst: "", requestedByLast: "", company: "", date: "",
    productName: "", quantity: "1", itemCategory: "OTHER",
    perUnitAmount: "", vendorName: "", vendorContact: "",
    purchaseMethod: "", approvedByFirst: "", approvedByLast: "",
    purchaseRemarks: "", paymentDueDate: "", financeEmailId: "",
    renewalDate: "", status: "PENDING",
  });
  const [statusChecks, setStatusChecks] = useState<string[]>([]);

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const toggleStatus = (val: string) => {
    setStatusChecks((prev) =>
      prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName) { toast.error("Product name is required"); return; }
    setSaving(true);
    try {
      const qty = parseInt(form.quantity) || 1;
      const unitAmt = form.perUnitAmount ? parseFloat(form.perUnitAmount) : null;
      const total = unitAmt ? unitAmt * qty : null;

      const res = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          quantity: qty,
          perUnitAmount: unitAmt,
          totalAmount: total,
          date: form.date || null,
          paymentDueDate: form.paymentDueDate || null,
          renewalDate: form.renewalDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Purchase request created");
      router.push("/dashboard/purchases");
    } catch {
      toast.error("Failed to create request");
    } finally { setSaving(false); }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/purchases"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">New Purchase Request</h1>
            <p className="text-sm text-muted-foreground">Submit a new purchase or procurement request</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Requester Info</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>First Name</Label><Input value={form.requestedByFirst} onChange={(e) => handleChange("requestedByFirst", e.target.value)} /></div>
              <div className="space-y-2"><Label>Last Name</Label><Input value={form.requestedByLast} onChange={(e) => handleChange("requestedByLast", e.target.value)} /></div>
              <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={(e) => handleChange("company", e.target.value)} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => handleChange("date", e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Product Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Product Name *</Label><Input value={form.productName} onChange={(e) => handleChange("productName", e.target.value)} /></div>
              <div className="space-y-2"><Label>Quantity</Label><Input type="number" value={form.quantity} onChange={(e) => handleChange("quantity", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Item Category</Label>
                <Select value={form.itemCategory} onValueChange={(v) => handleChange("itemCategory", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["HARDWARE","SOFTWARE","NETWORKING","PERIPHERAL","CLOUD_SERVICE","OTHER"].map((c) => (<SelectItem key={c} value={c}>{c.replace("_"," ")}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Per Unit Amount (₹)</Label><Input type="number" value={form.perUnitAmount} onChange={(e) => handleChange("perUnitAmount", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input readOnly value={form.perUnitAmount && form.quantity ? `₹${(parseFloat(form.perUnitAmount) * parseInt(form.quantity)).toLocaleString("en-IN")}` : ""} className="bg-gray-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Vendor & Approval</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Vendor Name</Label><Input value={form.vendorName} onChange={(e) => handleChange("vendorName", e.target.value)} /></div>
              <div className="space-y-2"><Label>Contact</Label><Input value={form.vendorContact} onChange={(e) => handleChange("vendorContact", e.target.value)} placeholder="+91" /></div>
              <div className="space-y-2">
                <Label>Purchase Method</Label>
                <Select value={form.purchaseMethod} onValueChange={(v) => handleChange("purchaseMethod", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                    <SelectItem value="VENDOR_DIRECT">Vendor Direct</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Approved By (First)</Label><Input value={form.approvedByFirst} onChange={(e) => handleChange("approvedByFirst", e.target.value)} /></div>
              <div className="space-y-2"><Label>Approved By (Last)</Label><Input value={form.approvedByLast} onChange={(e) => handleChange("approvedByLast", e.target.value)} /></div>
              <div className="space-y-2"><Label>Payment Due Date</Label><Input type="date" value={form.paymentDueDate} onChange={(e) => handleChange("paymentDueDate", e.target.value)} /></div>
              <div className="space-y-2"><Label>Finance Email</Label><Input value={form.financeEmailId} onChange={(e) => handleChange("financeEmailId", e.target.value)} type="email" /></div>
              <div className="space-y-2"><Label>Renewal Date</Label><Input type="date" value={form.renewalDate} onChange={(e) => handleChange("renewalDate", e.target.value)} /></div>
              <div className="space-y-2 md:col-span-2 lg:col-span-3"><Label>Remarks</Label><Textarea value={form.purchaseRemarks} onChange={(e) => handleChange("purchaseRemarks", e.target.value)} rows={3} /></div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Purchase Status</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {[
                  { val: "Approved", color: "text-green-700" },
                  { val: "Approval Pending", color: "text-amber-600" },
                  { val: "Payment pending", color: "text-red-600" },
                  { val: "All Done", color: "text-blue-700" },
                ].map((s) => (
                  <label key={s.val} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={statusChecks.includes(s.val)}
                      onCheckedChange={() => toggleStatus(s.val)}
                    />
                    <span className={`text-sm font-medium ${s.color}`}>{s.val}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-6">
            <Link href="/dashboard/purchases"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" />{saving ? "Saving..." : "Submit Request"}</Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
