import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const kpis = [
  { label: "Today's attendance", value: "92.4%", tone: "text-accent-cyan" },
  { label: "Fee collected (term)", value: "₹1.25 Cr", tone: "text-status-success" },
  { label: "Outstanding", value: "₹32 L", tone: "text-status-warning" },
  { label: "Classes in session", value: "18", tone: "text-text-primary" },
];

export default function PrincipalDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Executive Command Center</h1>
        <p className="text-sm text-text-secondary">
          Horizon Institute — live operational pulse (demo metrics until API is
          connected).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-accent-cyan/15">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-text-secondary">
                {kpi.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`font-mono-tabular text-3xl font-semibold ${kpi.tone}`}>
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Department attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-text-secondary">
            {[
              ["Computer Science", 94],
              ["Electronics", 91],
              ["Mechanical", 88],
              ["Civil", 90],
            ].map(([dept, pct]) => (
              <div key={dept as string} className="space-y-1">
                <div className="flex justify-between">
                  <span>{dept as string}</span>
                  <span className="font-mono-tabular text-text-primary">
                    {pct as number}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-hover">
                  <div
                    className="h-2 rounded-full bg-accent-cyan"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="rounded-md border border-status-danger/30 bg-status-danger/10 px-3 py-2 text-status-danger">
              3 students below 75% attendance in CS-201
            </p>
            <p className="rounded-md border border-status-warning/30 bg-status-warning/10 px-3 py-2 text-status-warning">
              12 overdue invoices past due date
            </p>
            <p className="rounded-md border border-subtle px-3 py-2 text-text-secondary">
              2 faculties pending attendance submission for Period 1
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}