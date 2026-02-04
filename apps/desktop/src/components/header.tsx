import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";

import { ModeToggle } from "./mode-toggle";
import { buttonVariants } from "./ui/button";
import { Separator } from "./ui/separator";

export default function Header() {
  const links = [{ to: "/", label: "Home" }] as const;

  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[auto_1fr_auto] items-center px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Github className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">better-github</div>
            <div className="text-xs text-muted-foreground">desktop workspace</div>
          </div>
        </div>
        <div className="flex items-center justify-start">
          <Separator orientation="vertical" className="mx-6 h-8" />
          <nav className="flex items-center gap-2">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={buttonVariants({ variant: "ghost", size: "sm" })}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center justify-end gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
