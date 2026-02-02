import { CheckCircle2, Copy, Github, ShieldCheck, Terminal, Zap } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const [step, setStep] = useState<"init" | "device-code">("init");
  const [copied, setCopied] = useState(false);
  const mockUserCode = "8C91-4D2A";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      {/* --- RIGHT PANEL: AUTH FORM --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#0d1117]">
        <div className="w-full max-w-105 animate-in fade-in slide-in-from-bottom-8 duration-700">

          <Card className="border-[#30363d] bg-[#161b22] shadow-2xl">
            <CardHeader className="text-center space-y-1 pb-6">
              <CardTitle className="text-2xl text-white">Welcome back</CardTitle>
              <CardDescription className="text-slate-400">
                Authenticate to sync your repositories
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">

              {step === "init" ? (
                /* VIEW 1: INITIAL LOGIN OPTIONS */
                <Tabs defaultValue="oauth" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-[#0d1117] border border-[#30363d]">
                    <TabsTrigger value="oauth">Browser Login</TabsTrigger>
                    <TabsTrigger value="token">Manual Token</TabsTrigger>
                  </TabsList>

                  {/* TAB 1: OAUTH / DEVICE FLOW */}
                  <TabsContent value="oauth" className="space-y-4 pt-4">
                    <Button
                      variant="outline"
                      className="w-full h-12 gap-3 bg-[#238636] hover:bg-[#2ea043] text-white border-0 hover:text-white font-medium shadow-[0_0_15px_rgba(35,134,54,0.4)] transition-all"
                      onClick={() => setStep("device-code")}
                    >
                      <Github className="w-5 h-5" />
                      Sign in with GitHub
                    </Button>
                    <p className="text-xs text-center text-muted-foreground px-4">
                      We use the secure <strong>Device Flow</strong>. You'll be redirected to GitHub to approve this app.
                    </p>
                  </TabsContent>

                  {/* TAB 2: MANUAL TOKEN */}
                  <TabsContent value="token" className="space-y-4 pt-4">
                    <div className="grid gap-2">
                      <Label htmlFor="token" className="text-slate-300">Personal Access Token</Label>
                      <Input
                        id="token"
                        type="password"
                        placeholder="ghp_..."
                        className="bg-[#0d1117] border-[#30363d] text-white placeholder:text-slate-600 focus-visible:ring-blue-500/50"
                      />
                    </div>
                    <Button className="w-full bg-slate-100 text-slate-900 hover:bg-white">
                      Verify Token
                    </Button>
                  </TabsContent>
                </Tabs>
              ) : (
                /* VIEW 2: DEVICE CODE DISPLAY */
                <div className="space-y-6 py-2">
                  <div className="space-y-2 text-center">
                    <span className="text-xs font-medium uppercase tracking-wider text-blue-400">Action Required</span>
                    <h3 className="text-sm text-slate-300">
                      Go to <a href="https://github.com/login/device" target="_blank" className="text-blue-400 hover:underline">github.com/login/device</a> and enter:
                    </h3>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div className="relative flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-md p-4">
                      <code className="text-2xl font-mono font-bold text-white tracking-[0.2em] w-full text-center">
                        {mockUserCode}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 h-8 w-8 text-slate-400 hover:text-white hover:bg-[#30363d]"
                        onClick={handleCopy}
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Waiting for approval...
                    </div>
                    <Button
                      variant="link"
                      className="text-slate-500 hover:text-slate-300"
                      onClick={() => setStep("init")}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

            </CardContent>

            <Separator className="bg-[#30363d]" />

            <CardFooter className="pt-6 justify-center">
              <p className="text-xs text-slate-500">
                By clicking continue, you agree to our Terms of Service.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper for the branding side
function FeatureRow({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
      <div className="mt-1 p-2 bg-[#161b22] rounded-md border border-[#30363d] shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}
