import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchTechnicians } from "@/lib/data";

export default async function TechniciansPage() {
  const techs = await fetchTechnicians();
  const available = techs.filter((t) => t.status === "Available").length;
  const busy = techs.filter((t) => t.status === "Busy").length;
  const offline = techs.filter((t) => t.status === "Offline").length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Total", techs.length], ["Available", available], ["Busy", busy], ["Offline", offline]].map(([l, v]) => (
          <Card key={l as string}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{l}</p>
              <p className="text-2xl font-bold">{v as number}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>Technicians directory</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Technician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {techs.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="size-8">
                        <AvatarImage src={t.avatar_url ?? undefined} alt={t.name} />
                        <AvatarFallback>{t.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.specialization}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{t.email}<br /><span className="text-muted-foreground">{t.phone}</span></TableCell>
                  <TableCell>{t.assigned_tickets}</TableCell>
                  <TableCell>{t.completed_tickets}</TableCell>
                  <TableCell><Badge variant="outline">{t.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
