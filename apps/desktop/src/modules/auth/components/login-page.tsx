import { Badge } from "@/components/ui/badge";
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
      navigate({ to: "/" });
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
      navigate({ to: "/" });
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 py-12 text-foreground">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
        <div className="absolute right-[-20%] top-[-30%] h-105 w-105 rounded-full bg-linear-to-br from-primary/20 via-cyan-400/10 to-transparent blur-3xl" />
        <div className="absolute left-[-10%] bottom-[-25%] h-80 w-80 rounded-full bg-linear-to-br from-emerald-400/15 via-primary/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-muted/40">
            <Github className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Better Desktop</p>
            <p className="text-lg font-semibold">Sign in</p>
          </div>
        </div>

        <Card className="relative overflow-hidden border-border/60 bg-card/80 shadow-[0_30px_80px_-60px_rgba(15,23,42,0.55)]">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-cyan-400 to-emerald-400" />
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-2xl">Continue with GitHub</CardTitle>
            <CardDescription className="text-muted-foreground">
              Choose your preferred sign-in method to sync repositories.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-6">
            {step === "init" ? (
              <Tabs defaultValue="oauth" className="w-full">
                <TabsList className="grid w-full grid-cols-2 border border-border/60 bg-muted/40">
                  <TabsTrigger value="oauth">Device Flow</TabsTrigger>
                  <TabsTrigger value="token">Manual Token</TabsTrigger>
                </TabsList>

                <TabsContent value="oauth" className="space-y-4 pt-5">
                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">Secure browser authorization</span>
                      <span className="text-xs text-muted-foreground">~30 seconds</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      We will open the GitHub device page and show your code.
                    </p>
                  </div>
                  <Button
                    disabled={isGettingCode}
                    onClick={handleGithubLogin}
                    className="h-12 w-full gap-3 text-sm font-semibold"
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
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">
                      Paste a personal access token with repo permissions.
                    </p>
                  </div>
                  <Button
                    onClick={async () => {
                      if (!manualToken.trim()) return;
                      await setToken(manualToken.trim());
                      navigate({ to: "/" });
                    }}
                    variant="secondary"
                    className="h-12 w-full text-sm font-semibold"
                  >
                    Verify and continue
                  </Button>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border/60 bg-muted/30 p-5">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Device code</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-4">
                    <code className="text-2xl font-semibold tracking-[0.3em] text-foreground">
                      {deviceData?.user_code || "LOADING"}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleCopy}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Open {deviceData?.verification_uri ?? "github.com/login/device"} in your browser and enter the code.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    {pollData?.error === "authorization_pending"
                      ? "Waiting for approval..."
                      : pollData?.access_token
                      ? "Success! Redirecting..."
                      : "Connecting to GitHub..."}
                  </div>
                  <Button
                    variant="link"
                    className="text-xs text-muted-foreground hover:text-foreground"
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
