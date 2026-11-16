import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlaceholderModule({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">{description}</p>
        <p className="mt-4 text-xs text-text-secondary">
          This route is scaffolded per <code className="text-accent-cyan">docs/UI.md</code>.
          Wire it to the API when modules land.
        </p>
      </CardContent>
    </Card>
  );
}