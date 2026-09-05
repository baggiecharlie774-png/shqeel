import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchClients } from "@/lib/data";

export default async function ClientsPage() {
  const clients = await fetchClients();
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total clients</p><p className="text-2xl font-bold">{clients.length}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Total tickets</p><p className="text-2xl font-bold">{clients.reduce((n, c) => n + c.total_tickets, 0)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Newest client</p><p className="truncate text-lg font-bold">{clients[0]?.name ?? "—"}</p></CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Client directory</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tickets</TableHead>
                <TableHead>Latest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm">{c.email}<br /><span className="text-muted-foreground">{c.phone}</span></TableCell>
                  <TableCell>{c.location ?? "—"}</TableCell>
                  <TableCell>{c.total_tickets}</TableCell>
                  <TableCell className="font-mono text-xs">{c.latest_ticket ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
