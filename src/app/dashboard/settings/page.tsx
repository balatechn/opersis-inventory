"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Shield, Building2, MapPin, Briefcase, Plus, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invalidateSettingsCache } from "@/hooks/use-settings";
import type { CompanyOption } from "@/hooks/use-settings";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orgName, setOrgName] = useState("National Group India");
  const [currency, setCurrency] = useState("INR");
  const [depreciationRate, setDepreciationRate] = useState("25");
  const [renewalAlertDays, setRenewalAlertDays] = useState("30");

  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [newCompanyValue, setNewCompanyValue] = useState("");
  const [newCompanyLabel, setNewCompanyLabel] = useState("");

  const [departments, setDepartments] = useState<string[]>([]);
  const [newDepartment, setNewDepartment] = useState("");

  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setOrgName(d.orgName || "");
        setCurrency(d.currency || "INR");
        setDepreciationRate(String(d.depreciationRate ?? 25));
        setRenewalAlertDays(String(d.renewalAlertDays ?? 30));
        setCompanies(d.companies || []);
        setDepartments(d.departments || []);
        setLocations(d.locations || []);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgName,
          currency,
          depreciationRate: parseFloat(depreciationRate) || 25,
          renewalAlertDays: parseInt(renewalAlertDays) || 30,
          companies,
          departments,
          locations,
        }),
      });
      if (!res.ok) throw new Error();
      invalidateSettingsCache();
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const addCompany = () => {
    const val = newCompanyValue.trim().toUpperCase().replace(/\s+/g, "_");
    const lbl = newCompanyLabel.trim() || newCompanyValue.trim();
    if (!val) return;
    if (companies.some((c) => c.value === val)) { toast.error("Company already exists"); return; }
    setCompanies([...companies, { value: val, label: lbl }]);
    setNewCompanyValue("");
    setNewCompanyLabel("");
  };

  const removeCompany = (value: string) => setCompanies(companies.filter((c) => c.value !== value));

  const addDepartment = () => {
    const d = newDepartment.trim();
    if (!d) return;
    if (departments.includes(d)) { toast.error("Department already exists"); return; }
    setDepartments([...departments, d]);
    setNewDepartment("");
  };

  const removeDepartment = (d: string) => setDepartments(departments.filter((x) => x !== d));

  const addLocation = () => {
    const l = newLocation.trim();
    if (!l) return;
    if (locations.includes(l)) { toast.error("Location already exists"); return; }
    setLocations([...locations, l]);
    setNewLocation("");
  };

  const removeLocation = (l: string) => setLocations(locations.filter((x) => x !== l));

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-6 max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48" />
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)}
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage system configuration</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>

        {/* General Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Default Depreciation Rate (%)</Label>
                <Input type="number" value={depreciationRate} onChange={(e) => setDepreciationRate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Renewal Alert Days</Label>
                <Input type="number" value={renewalAlertDays} onChange={(e) => setRenewalAlertDays(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Companies */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Companies</CardTitle>
            </div>
            <CardDescription>Manage the list of companies available in forms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {companies.map((c) => (
                <Badge key={c.value} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5 text-sm">
                  {c.label}
                  <button onClick={() => removeCompany(c.value)} className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Value (e.g. ACME)" value={newCompanyValue} onChange={(e) => setNewCompanyValue(e.target.value)} className="max-w-[200px]" onKeyDown={(e) => e.key === "Enter" && addCompany()} />
              <Input placeholder="Display label (optional)" value={newCompanyLabel} onChange={(e) => setNewCompanyLabel(e.target.value)} className="max-w-[200px]" onKeyDown={(e) => e.key === "Enter" && addCompany()} />
              <Button size="sm" variant="outline" onClick={addCompany} className="gap-1"><Plus className="h-4 w-4" />Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Departments</CardTitle>
            </div>
            <CardDescription>Manage the list of departments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {departments.map((d) => (
                <Badge key={d} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5 text-sm">
                  {d}
                  <button onClick={() => removeDepartment(d)} className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="New department name" value={newDepartment} onChange={(e) => setNewDepartment(e.target.value)} className="max-w-[300px]" onKeyDown={(e) => e.key === "Enter" && addDepartment()} />
              <Button size="sm" variant="outline" onClick={addDepartment} className="gap-1"><Plus className="h-4 w-4" />Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Locations</CardTitle>
            </div>
            <CardDescription>Manage the list of office locations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {locations.map((l) => (
                <Badge key={l} variant="secondary" className="gap-1 pl-3 pr-1 py-1.5 text-sm">
                  {l}
                  <button onClick={() => removeLocation(l)} className="ml-1 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="New location name" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} className="max-w-[300px]" onKeyDown={(e) => e.key === "Enter" && addLocation()} />
              <Button size="sm" variant="outline" onClick={addLocation} className="gap-1"><Plus className="h-4 w-4" />Add</Button>
            </div>
          </CardContent>
        </Card>

        {/* Security (info only) */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium">JWT Authentication</p>
                  <p className="text-xs text-muted-foreground">Token-based auth with 8h expiry</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="text-sm font-medium">Role-Based Access Control</p>
                  <p className="text-xs text-muted-foreground">Admin, IT Manager, Viewer roles</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
