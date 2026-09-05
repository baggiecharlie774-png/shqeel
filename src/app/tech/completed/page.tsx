import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/tickets/badges";
import { fetchTickets } from "@/lib/data";

export default async function CompletedPage() {
  const tickets = await fetchTickets();
  const done = tickets.filter((t) => ["RESOLVED", "CLOSED"].includes(t.status));
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Resolved & closed ({done.length})</h2>
        <p className="text-sm text-muted-foreground">Your verified solutions archive.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>History</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Open</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {done.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-semibold text-primary">{t.ticket_code}</TableCell>
                  <TableCell className="max-w-80 truncate">{t.title}</TableCell>
                  <TableCell><StatusBadge status={t.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/tech/tickets/${t.ticket_code}`}>View log</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {done.length === 0 && (
                <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No completed tickets yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
