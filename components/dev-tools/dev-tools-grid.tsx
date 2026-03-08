import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DevToolDefinition {
  name: string;
  description: string;
  href: string;
  badge?: string;
}

const DEV_TOOLS: DevToolDefinition[] = [
  {
    name: 'Power Fx Playground',
    description:
      'Experiment with Power Fx-style formulas against JSON data in your browser. Perfect for testing expressions before using them in Power Apps or automation.',
    href: '/dev-tools/power-fx-playground',
    badge: 'Playground',
  },
];

export function DevToolsGrid() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {DEV_TOOLS.map((tool) => (
        <Link key={tool.name} href={tool.href} className="group">
          <Card className="h-full transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-[0_0_18px_rgba(56,189,248,0.35)]">
            <CardHeader>
              <div className="mb-2 flex items-center justify-between gap-2">
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                {tool.badge && (
                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                    {tool.badge}
                  </Badge>
                )}
              </div>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">
                Click to open the interactive playground and start testing formulas.
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

