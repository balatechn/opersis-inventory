"use client";

import { PageTransition } from "@/components/layout/page-transition";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Users, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage system configuration</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input defaultValue="National Group India" />
              </div>
              <div className="space-y-2">
                <Label>Default Currency</Label>
                <Input defaultValue="INR (₹)" disabled />
              </div>
              <div className="space-y-2">
                <Label>Default Depreciation Rate (%)</Label>
                <Input type="number" defaultValue="25" />
              </div>
              <div className="space-y-2">
                <Label>Renewal Alert Days</Label>
                <Input type="number" defaultValue="30" />
              </div>
            </div>
            <Button size="sm">Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">User Management</CardTitle>
            </div>
            <CardDescription>Manage users and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Admin User", email: "admin@opersis.com", role: "ADMIN" },
                { name: "IT Manager", email: "it.manager@ncpl.com", role: "IT_MANAGER" },
                { name: "Viewer", email: "viewer@ncpl.com", role: "VIEWER" },
              ].map((u) => (
                <div key={u.email} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant={u.role === "ADMIN" ? "default" : u.role === "IT_MANAGER" ? "info" : "secondary"}>
                    {u.role.replace("_", " ")}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label>Alert Email From</Label>
                <Input placeholder="alerts@opersis.com" />
              </div>
            </div>
            <Button size="sm">Save Email Settings</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">Security</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium">JWT Authentication</p>
                  <p className="text-xs text-muted-foreground">Token-based auth with 8h expiry</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
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
