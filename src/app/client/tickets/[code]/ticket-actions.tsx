"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MessageSquare, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { addWorkNoteAction, confirmTicketAction } from "@/lib/actions/tickets";
import { sendMessageAction } from "@/lib/actions/messaging";

export function TicketActions({ ticketId, code, status }: { ticketId: number; code: string; status: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function addNote() {
    if (!note.trim()) return;
    setBusy(true);
    const res = await addWorkNoteAction(ticketId, note);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setNote("");
    toast.success("Information added");
    router.refresh();
  }

  async function send() {
    if (!msg.trim()) return;
    setBusy(true);
    const res = await sendMessageAction(ticketId, msg);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setMsg("");
    toast.success("Message sent");
    router.refresh();
  }

  async function confirm(ok: boolean) {
    setBusy(true);
    const res = await confirmTicketAction(ticketId, ok, reason);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(ok ? "Ticket closed — thank you!" : "Ticket reopened");
    setConfirmOpen(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline"><Plus /> Add information</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Additional information for {code}</DialogTitle>
            <DialogDescription>Visible to the admin and technician on this ticket.</DialogDescription>
          </DialogHeader>
          <Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Anything the technician should know…" />
          <DialogFooter>
            <Button onClick={addNote} disabled={busy || !note.trim()}>
              {busy && <Loader2 className="size-4 animate-spin" />} Attach to ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline"><MessageSquare /> Message technician</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message about {code}</DialogTitle>
          </DialogHeader>
          <Textarea rows={4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Type your message…" />
          <DialogFooter>
            <Button onClick={send} disabled={busy || !msg.trim()}>
              {busy && <Loader2 className="size-4 animate-spin" />} Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {status === "RESOLVED" && (
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogTrigger asChild>
            <Button>Confirm resolution</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Is {code} fixed?</DialogTitle>
              <DialogDescription>
                Confirming closes the ticket. If it is not fixed, tell us what is still wrong and it goes back to In Progress.
              </DialogDescription>
            </DialogHeader>
            <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional — what is still wrong?" />
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => confirm(false)} disabled={busy}>Not fixed — reopen</Button>
              <Button onClick={() => confirm(true)} disabled={busy}>
                {busy && <Loader2 className="size-4 animate-spin" />} Fixed — close ticket
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
