import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickFlowCard() {
  return (
    <Card>
      <CardHeader>
        <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">quick flow</p>
        <CardTitle className="mt-2 text-lg">Start fast, stay organized</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-muted-foreground">
        <FlowStep index="01">
          Pick a repo source and name your workspace so it stays searchable later.
        </FlowStep>
        <FlowStep index="02">Confirm clone path and sync before you start.</FlowStep>
        <FlowStep index="03">Jump back into your last working state instantly.</FlowStep>
      </CardContent>
    </Card>
  );
}

export function FlowStep({ index, children }: { index: string; children: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
        {index}
      </div>
      <div className="text-foreground">{children}</div>
    </div>
  );
}
