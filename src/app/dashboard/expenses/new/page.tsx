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

const EXPENSE_TYPES = ["HARDWARE", "SOFTWARE", "INTERNET", "AMC", "CLOUD", "LICENSING", "MAINTENANCE", "OTHER"];

export default function NewExpensePage() {
  const router = useRouter();
  const { companies, departments } = useSettings();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    expenseDate: new Date().toISOString().split("T")[0],
    expenseType: "HARDWARE",
    vendorName: "",
    invoiceNumber: "",
    amount: "",
    gst: "",
    paymentStatus: "UNPAID",
    paidDate: "",
    company: "NCPL",
    department: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const amount = parseFloat(form.amount) || 0;
  const gst = parseFloat(form.gst) || 0;
  const totalAmount = amount + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || amount <= 0) { toast.error("Amount is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount,
          gst,
          totalAmount,
          expenseDate: form.expenseDate || null,
          paidDate: form.paidDate || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Expense recorded successfully");
      router.push("/dashboard/expenses");
    } catch {
      toast.error("Failed to record expense");
    } finally { setSaving(false); }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/expenses"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <div>
            <h1 className="text-2xl font-bold">Record Expense</h1>
            <p className="text-sm text-muted-foreground">Add a new IT expense entry</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Expense Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Expense Date</Label><Input type="date" value={form.expenseDate} onChange={(e) => handleChange("expenseDate", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Expense Type</Label>
                <Select value={form.expenseType} onValueChange={(v) => handleChange("expenseType", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EXPENSE_TYPES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Vendor Name</Label><Input value={form.vendorName} onChange={(e) => handleChange("vendorName", e.target.value)} /></div>
              <div className="space-y-2"><Label>Invoice Number</Label><Input value={form.invoiceNumber} onChange={(e) => handleChange("invoiceNumber", e.target.value)} /></div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Select value={form.company} onValueChange={(v) => handleChange("company", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{companies.map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.department} onValueChange={(v) => handleChange("department", v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{departments.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Amount & Payment</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => handleChange("amount", e.target.value)} placeholder="0" /></div>
              <div className="space-y-2"><Label>GST (₹)</Label><Input type="number" value={form.gst} onChange={(e) => handleChange("gst", e.target.value)} placeholder="0" /></div>
              <div className="space-y-2"><Label>Total Amount</Label><Input readOnly value={totalAmount > 0 ? `₹${totalAmount.toLocaleString("en-IN")}` : ""} className="bg-gray-50 font-bold" /></div>
              <div className="space-y-2">
                <Label>Payment Status</Label>
                <Select value={form.paymentStatus} onValueChange={(v) => handleChange("paymentStatus", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="UNPAID">Unpaid</SelectItem>
                    <SelectItem value="PARTIAL">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.paymentStatus === "PAID" && (
                <div className="space-y-2"><Label>Paid Date</Label><Input type="date" value={form.paidDate} onChange={(e) => handleChange("paidDate", e.target.value)} /></div>
              )}
              <div className="space-y-2 md:col-span-2 lg:col-span-4"><Label>Description</Label><Textarea value={form.description} onChange={(e) => handleChange("description", e.target.value)} rows={3} placeholder="Expense details..." /></div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 pb-6">
            <Link href="/dashboard/expenses"><Button variant="outline" type="button">Cancel</Button></Link>
            <Button type="submit" disabled={saving} className="gap-1.5"><Save className="h-4 w-4" />{saving ? "Saving..." : "Record Expense"}</Button>
          </div>
        </form>
      </div>
    </PageTransition>
  );
}
