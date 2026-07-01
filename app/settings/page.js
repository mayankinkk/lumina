"use client";

import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Bell, Shield, Palette, Globe, Info } from "lucide-react";

export default function SettingsPage() {
  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your preferences
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full justify-start h-auto p-1">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reader</p>
                    <p className="text-xs text-muted-foreground">reader@lumina.app</p>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Local Storage Only</p>
                    <p className="text-xs text-muted-foreground">
                      All data stays on your device
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API Key Storage</p>
                    <p className="text-xs text-muted-foreground">
                      API keys stored server-side only
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
                  </div>
                  <ThemeToggle />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" /> Reading
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Parchment Background</p>
                    <p className="text-xs text-muted-foreground">Subtle paper texture</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Font Size</p>
                    <p className="text-xs text-muted-foreground">Reading text size</p>
                  </div>
                  <span className="text-sm text-muted-foreground">18px</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4" /> Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Daily Reading Reminder</p>
                    <p className="text-xs text-muted-foreground">Get reminded to read daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Vocabulary Review</p>
                    <p className="text-xs text-muted-foreground">Remind when words are due for review</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Weekly Progress</p>
                    <p className="text-xs text-muted-foreground">Receive weekly reading summary</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" /> About Lumina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-sm">0.1.0</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="text-sm">Next.js 15</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">UI</p>
                  <p className="text-sm">shadcn/ui + Tailwind CSS</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Architecture</p>
                  <p className="text-sm">Feature-based</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ShellLayout>
  );
}
