"use client";

import { motion } from "framer-motion";
import { Chrome, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  callbackUrl?: string;
}

export function GoogleSignInButton({
  callbackUrl = "/"
}: GoogleSignInButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSignIn = () => {
    startTransition(() => {
      void signIn("google", { callbackUrl });
    });
  };

  return (
    <motion.div whileHover={{ y: -3, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
      <Button
        type="button"
        size="lg"
        onClick={handleSignIn}
        disabled={isPending}
        className="h-14 w-full justify-between rounded-[24px] bg-black px-5 text-base text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
            <Chrome className="h-5 w-5" />
          </span>
          Continue with Google
        </span>
        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-sm">Secure</span>}
      </Button>
    </motion.div>
  );
}
