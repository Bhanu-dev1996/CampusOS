"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { loginWithPassword } from "@/lib/auth";
import { ApiError } from "@/lib/api-client";
import { roleHomePath } from "@/lib/rbac";
import { env } from "@/lib/env";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useSession();
  const [tenant, setTenant] = useState("horizon");
  const [email, setEmail] = useState("principal@horizon.edu");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const profile = await loginWithPassword({
        email,
        password,
        tenantSubdomain: tenant,
      });
      setUser(profile);
      toast.success(`Welcome, ${profile.fullName}`);
      router.push(roleHomePath[profile.activeRole]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not reach API — start Docker/Postgres and `uvicorn` (see apps/api/README.md).";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-primary/30 shadow-[0_0_24px_rgba(0,240,255,0.08)]">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{env.appName}</CardTitle>
        <CardDescription>
          Sign in with your institution subdomain. After seeding the API, use
          password <code className="text-accent-cyan">CampusOS123!</code>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant">Institution subdomain</Label>
            <Input
              id="tenant"
              value={tenant}
              onChange={(e) => setTenant(e.target.value)}
              placeholder="horizon"
              autoComplete="organization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}