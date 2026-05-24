import { ShieldCheck } from "lucide-react";

import { LoginCardBackground } from "@/components/auth/login-card-background";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Card, CardContent } from "@/components/ui/card";
import { isGoogleAuthConfigured } from "@/lib/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ callbackUrl?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const callbackUrl = params.callbackUrl ?? "/";
  const configured = isGoogleAuthConfigured();

  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-96px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_28%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.06),transparent_32%)] dark:hidden"
      />
      <Card className="relative w-full max-w-md overflow-hidden border border-black/10 bg-white/92 shadow-[0_28px_80px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-slate-950/75 dark:shadow-[0_30px_90px_rgba(0,0,0,0.14)]">
        <LoginCardBackground />
        <CardContent className="relative z-10 space-y-6 p-8 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-[22px] border border-black/8 bg-white shadow-[0_18px_40px_rgba(0,0,0,0.12)] dark:border-white/10 dark:bg-white dark:shadow-[0_18px_40px_rgba(0,0,0,0.18)]">
            <img
              src="https://media.allohealth.care/allo-logo-v1.png"
              alt="Allo Health logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Allo Health Inventory Task
            </p>
            <h1 className="text-3xl font-black text-slate-950 dark:text-white">Sign in</h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              Continue with Google to access protected reservation pages.
            </p>
          </div>

          <div className="rounded-[24px] border border-black/8 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-900/60">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 shrink-0 text-slate-900 dark:text-white" />
              Secure login with persistent session access.
            </div>
          </div>

          {configured ? (
            <GoogleSignInButton callbackUrl={callbackUrl} />
          ) : (
            <div className="rounded-[24px] border border-black/15 bg-black/5 p-4 text-sm leading-6 text-slate-900 dark:border-white/15 dark:bg-white/8 dark:text-white">
              Google OAuth is not configured yet. Add `GOOGLE_CLIENT_ID`,
              `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` to enable login.
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
