"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ApiError } from "@/lib/api-client";
import {
  resolveTenantBySubdomain,
  type TenantCreated,
  type TenantCreateInput,
} from "@/lib/platform";

const tenantFormSchema = z.object({
  name: z.string().trim().min(2, "Institution name must be at least 2 characters"),
  subdomain: z
    .string()
    .trim()
    .toLowerCase()
    .min(2, "Subdomain must be at least 2 characters")
    .max(63, "Subdomain is too long")
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Use lowercase letters, numbers, and hyphens only"),
  academic_year: z.string().trim().min(4, "Academic year is required"),
  principal_email: z.string().trim().email("Enter a valid principal email"),
});

type FieldErrors = Partial<Record<keyof TenantCreateInput, string>>;

const emptyForm: TenantCreateInput = {
  name: "",
  subdomain: "",
  academic_year: "2025-26",
  principal_email: "",
};

export function TenantCreateSheet({
  open,
  onOpenChange,
  isPending,
  lastCreated,
  onClearCreated,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  lastCreated: TenantCreated | null;
  onClearCreated: () => void;
  onSubmit: (values: TenantCreateInput) => void;
}) {
  const [form, setForm] = useState<TenantCreateInput>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(emptyForm);
      setErrors({});
      setSubdomainAvailable(null);
      return;
    }
    const active = document.activeElement;
    if (active instanceof HTMLElement) {
      active.blur();
    }
    const id = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (
        focused instanceof HTMLElement &&
        focused.dataset.slot === "sheet-close"
      ) {
        focused.blur();
      }
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  async function onSubdomainBlur() {
    const key = form.subdomain.trim().toLowerCase();
    if (key.length < 2) {
      setSubdomainAvailable(null);
      return;
    }
    const parsed = tenantFormSchema.shape.subdomain.safeParse(key);
    if (!parsed.success) {
      setSubdomainAvailable(null);
      return;
    }
    try {
      await resolveTenantBySubdomain(key);
      setSubdomainAvailable(false);
      setErrors((prev) => ({
        ...prev,
        subdomain: "This subdomain is already in use",
      }));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setSubdomainAvailable(true);
        setErrors((prev) =>
          prev.subdomain === "This subdomain is already in use"
            ? { ...prev, subdomain: undefined }
            : prev,
        );
      } else {
        setSubdomainAvailable(null);
      }
    }
  }

  function updateField<K extends keyof TenantCreateInput>(key: K, value: TenantCreateInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (key === "subdomain") {
      setSubdomainAvailable(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = tenantFormSchema.safeParse(form);
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof TenantCreateInput;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    onSubmit(parsed.data);
  }

  function closeSheet() {
    onClearCreated();
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full border-subtle bg-surface sm:max-w-md">
        {lastCreated ? (
          <>
            <SheetHeader>
              <SheetTitle className="type-title">Institution created</SheetTitle>
              <SheetDescription>{lastCreated.name} is ready to use.</SheetDescription>
            </SheetHeader>
            <div className="type-page flex flex-1 flex-col gap-3 px-4">
              <p>
                <span className="text-text-secondary">Subdomain:</span>{" "}
                <code className="text-accent-cyan">{lastCreated.subdomain}</code>
              </p>
              <p>
                <span className="text-text-secondary">Principal:</span>{" "}
                {lastCreated.principal_onboarding.principal_email}
              </p>
              <p>
                <span className="text-text-secondary">Temporary password:</span>{" "}
                <code className="rounded bg-surface-hover px-1.5 py-0.5 text-accent-cyan">
                  {lastCreated.principal_onboarding.temporary_password}
                </code>
              </p>
            </div>
            <SheetFooter className="border-t border-subtle">
              <Button type="button" className="w-full" onClick={closeSheet}>
                Done
              </Button>
            </SheetFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle className="type-title">Create institution</SheetTitle>
              <SheetDescription>All fields are required.</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4">
              <Field
                id="name"
                label="Institution name"
                value={form.name}
                error={errors.name}
                onChange={(v) => updateField("name", v)}
                placeholder="St. Xavier's College"
                autoComplete="organization"
              />
              <Field
                id="subdomain"
                label="Subdomain"
                value={form.subdomain}
                error={errors.subdomain}
                onChange={(v) => updateField("subdomain", v.toLowerCase())}
                onBlur={() => void onSubdomainBlur()}
                placeholder="stxaviers"
                hint={
                  errors.subdomain
                    ? undefined
                    : subdomainAvailable === true
                      ? "Subdomain is available"
                      : form.subdomain
                        ? `${form.subdomain}.campusos.io`
                        : "Used at login (e.g. horizon)"
                }
                hintClassName={
                  subdomainAvailable === true ? "text-accent-cyan" : undefined
                }
              />
              <Field
                id="academic_year"
                label="Academic year"
                value={form.academic_year}
                error={errors.academic_year}
                onChange={(v) => updateField("academic_year", v)}
                placeholder="2025-26"
              />
              <Field
                id="principal_email"
                label="Principal email"
                type="email"
                value={form.principal_email}
                error={errors.principal_email}
                onChange={(v) => updateField("principal_email", v)}
                placeholder="principal@example.edu"
                autoComplete="email"
              />
            </div>
            <SheetFooter className="border-t border-subtle">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating…
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  onBlur,
  placeholder,
  hint,
  hintClassName,
  type = "text",
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  hint?: string;
  hintClassName?: string;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label} <span className="text-destructive">*</span>
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        required
      />
      {hint && !error ? (
        <p
          id={`${id}-hint`}
          className={cn(
            "text-xs text-text-secondary",
            hintClassName ?? "font-mono",
          )}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}