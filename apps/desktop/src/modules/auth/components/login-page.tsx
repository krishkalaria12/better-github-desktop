import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from '@tanstack/react-router';
import { open } from "@tauri-apps/plugin-shell";
import { CheckCircle2, Copy, Github, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useAuthStore } from "@/store/github-client";
import { useDeviceCode, usePollToken } from "../hooks/use-github-login";

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"init" | "device-code">("init");
  const [copied, setCopied] = useState(false);
  const [manualToken, setManualToken] = useState("");
  const didOpenRef = useRef(false);

  const { setToken, token, isLoading } = useAuthStore();

  const {
    mutate: getCode,
    data: deviceData,
    isPending: isGettingCode
  } = useDeviceCode();

  const {
    data: pollData
  } = usePollToken(deviceData?.device_code, deviceData?.interval);

  const handleGithubLogin = () => {
    getCode(undefined, {
      onSuccess: () => setStep("device-code"),
    });
  };

  useEffect(() => {
    if (pollData?.access_token) {
      void setToken(pollData.access_token);
      navigate({ to: "/choosegitclient" });
    } else if (pollData?.error && pollData?.error !== "authorization_pending" && pollData?.error !== "slow_down") {
      setStep("init");
    }
  }, [pollData, setToken, navigate]);

  useEffect(() => {
    if (!deviceData?.device_code) return;
    didOpenRef.current = false;
  }, [deviceData?.device_code]);

  useEffect(() => {
    if (!deviceData?.verification_uri) return;
    if (didOpenRef.current) return;
    didOpenRef.current = true;
    open(deviceData.verification_uri).catch(() => {
      window.open(deviceData.verification_uri, "_blank");
    });
  }, [deviceData?.verification_uri]);

  useEffect(() => {
    if (!isLoading && token) {
      navigate({ to: "/choosegitclient" });
    }
  }, [isLoading, token, navigate]);

  const handleCopy = () => {
    if (deviceData?.user_code) {
      navigator.clipboard.writeText(deviceData.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#0b1117] px-6 py-12 text-slate-200">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-slate-800/40 via-[#0b1117] to-[#0b1117]" />
        <div className="absolute right-[-20%] top-[-30%] h-105 w-105 rounded-full bg-linear-to-br from-blue-500/20 via-cyan-400/10 to-transparent blur-3xl" />
        <div className="absolute left-[-10%] bottom-[-25%] h-80 w-80 rounded-full bg-linear-to-br from-emerald-400/15 via-blue-500/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Github className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Better Desktop</p>
            <p className="text-lg font-semibold text-white">Sign in</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-[#222a36] bg-[#121824] shadow-[0_25px_70px_-45px_rgba(15,23,42,0.9)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-blue-500 to-slate-200" />
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl text-white">Continue with GitHub</CardTitle>
            <CardDescription className="text-slate-400">
              Choose your preferred sign-in method to sync repositories.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            {step === "init" ? (
              <Tabs defaultValue="oauth" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border border-[#263040] bg-[#0c111b]">
                  <TabsTrigger value="oauth">Device Flow</TabsTrigger>
                  <TabsTrigger value="token">Manual Token</TabsTrigger>
                </TabsList>

                <TabsContent value="oauth" className="space-y-4 pt-5">
                  <div className="rounded-xl border border-[#273042] bg-[#0d1320] p-4 text-sm text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">Secure browser authorization</span>
                      <span className="text-xs text-slate-400">~30 seconds</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      We will open the GitHub device page and show your code.
                    </p>
                  </div>
                  <Button
                    disabled={isGettingCode}
                    onClick={handleGithubLogin}
                    className="h-12 w-full gap-3 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 text-sm font-semibold text-slate-900 hover:opacity-90"
                  >
                    {isGettingCode ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Github className="w-5 h-5" />
                    )}
                    {isGettingCode ? "Generating code..." : "Continue with GitHub"}
                  </Button>
                </TabsContent>

                <TabsContent value="token" className="space-y-4 pt-5">
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="ghp_..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="h-12 bg-[#0d1320] border-[#263040] text-white"
                    />
                    <p className="text-xs text-slate-500">Paste a personal access token with repo permissions.</p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!manualToken.trim()) return;
                      await setToken(manualToken.trim());
                      navigate({ to: "/choosegitclient" });
                    }}
                    className="h-12 w-full bg-white text-sm font-semibold text-slate-900 hover:bg-slate-100"
                  >
                    Verify and continue
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-[#273042] bg-[#0d1320] p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                    <span>Device code</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-[#293344] bg-[#0b111b] px-4 py-4">
                    <code className="text-2xl font-mono font-semibold tracking-[0.3em] text-white">
                      {deviceData?.user_code || "LOADING"}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-white"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    Open {deviceData?.verification_uri ?? "github.com/login/device"} in your browser and enter the code.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-[#263040] bg-[#0d1320] px-4 py-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    {pollData?.error === "authorization_pending"
                      ? "Waiting for approval..."
                      : pollData?.access_token
                      ? "Success! Redirecting..."
                      : "Connecting to GitHub..."}
                  </div>
                  <Button
                    variant="link"
                    className="text-xs text-slate-500 hover:text-slate-200"
                    onClick={() => setStep("init")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
