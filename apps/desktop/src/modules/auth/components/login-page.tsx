import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from '@tanstack/react-router';
import { CheckCircle2, Copy, Github, Loader2, ShieldCheck, Terminal, Zap } from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/store/github-client";
import { useDeviceCode, usePollToken } from "../hooks/use-github-login";
import { FeatureRow } from "./feature-row";

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"init" | "device-code">("init");
  const [copied, setCopied] = useState(false);
  const [manualToken, setManualToken] = useState("");

  const { setToken } = useAuthStore();

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
      setToken(pollData.access_token);
      navigate("/choosegitclient");
    } else if (pollData?.error) {
      setStep("init");
    }
  }, [pollData, setToken]);

  const handleCopy = () => {
    if (deviceData?.user_code) {
      navigator.clipboard.writeText(deviceData.user_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0d1117] text-slate-200 overflow-hidden">

      {/* --- LEFT PANEL: BRANDING --- */}
      <div className="hidden lg:flex flex-col w-1/2 relative bg-[#010409] items-center justify-center border-r border-[#30363d]">
             {/* Abstract Background Decoration */}
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-[#0d1117] to-[#010409]" />
             <div className="relative z-10 max-w-lg p-8 space-y-8">
               <div className="flex items-center gap-3 mb-8">
                 <div className="p-3 bg-white/5 rounded-xl border border-white/10 shadow-inner">
                   <Github className="w-8 h-8 text-white" />
                 </div>
                 <span className="text-xl font-bold tracking-tight text-white">Better Desktop</span>
               </div>
               <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white via-slate-300 to-slate-500">
                 Review code <br /> without the friction.
               </h1>

               <div className="space-y-6 pt-4">
                 <FeatureRow
                   icon={<Zap className="w-5 h-5 text-yellow-500" />}
                   title="Lightning Fast"
                   desc="Built with Rust & Tauri for native performance."
                 />
                 <FeatureRow
                   icon={<ShieldCheck className="w-5 h-5 text-green-500" />}
                   title="Secure Storage"
                   desc="Tokens stored safely in your system keyring."
                 />

                 <FeatureRow
                   icon={<Terminal className="w-5 h-5 text-blue-500" />}
                   title="Developer First"
                   desc="Deep integration with your local terminal workflow."
                 />
               </div>
             </div>
           </div>

      {/* --- RIGHT PANEL --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0d1117]">
        <div className="w-full max-w-105 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <Card className="border-[#30363d] bg-[#161b22] shadow-2xl">
            <CardHeader className="text-center space-y-1 pb-6">
              <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-slate-400">Authenticate to sync your repositories</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {step === "init" ? (
                <Tabs defaultValue="oauth" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#0d1117] border border-[#30363d]">
                    <TabsTrigger value="oauth">Browser Login</TabsTrigger>
                    <TabsTrigger value="token">Manual Token</TabsTrigger>
                  </TabsList>

                  <TabsContent value="oauth" className="space-y-4 pt-4">
                    <Button
                      variant="outline"
                      disabled={isGettingCode}
                      onClick={handleGithubLogin}
                      className="w-full h-12 gap-3 bg-[#238636] hover:bg-[#2ea043] text-white border-0 hover:text-white font-medium transition-all"
                    >
                      {isGettingCode ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Github className="w-5 h-5" />
                      )}
                      {isGettingCode ? "Connecting..." : "Sign in with GitHub"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground px-4">
                      We use the secure <strong>Device Flow</strong>.
                    </p>
                  </TabsContent>

                  <TabsContent value="token" className="space-y-4 pt-4">
                     {/* Manual Token Input Logic */}
                     <Input
                       type="password"
                       placeholder="ghp_..."
                       value={manualToken}
                       onChange={(e) => setManualToken(e.target.value)}
                       className="bg-[#0d1117] border-[#30363d] text-white"
                     />
                     <Button
                       onClick={() => setToken(manualToken)}
                       className="w-full bg-slate-100 text-slate-900 hover:bg-white"
                     >
                       Verify Token
                     </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                /* --- STEP 2: SHOW CODE --- */
                <div className="space-y-6 py-2">
                  <div className="space-y-2 text-center">
                    <span className="text-xs font-medium uppercase tracking-wider text-blue-400">Action Required</span>
                    <h3 className="text-sm text-slate-300">
                      Go to <a href={deviceData?.verification_uri} target="_blank" className="text-blue-400 hover:underline">github.com/login/device</a> and enter:
                    </h3>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                      <code className="text-2xl font-mono font-bold text-white tracking-[0.2em] w-full text-center">
                        {deviceData?.user_code || "LOADING"}
                      </code>
                      <Button size="icon" variant="ghost" onClick={handleCopy} className="absolute right-2 text-slate-400 hover:text-white">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    {/* Dynamic Status Message */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                      {pollData?.error === "authorization_pending" ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          Waiting for approval...
                        </>
                      ) : pollData?.access_token ? (
                        <span className="text-green-500 font-bold">Success! Redirecting...</span>
                      ) : (
                         "Connecting..."
                      )}
                    </div>
                    <Button variant="link" className="text-slate-500 hover:text-slate-300" onClick={() => setStep("init")}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            {/* Footer... */}
          </Card>
        </div>
      </div>
    </div>
  );
}
