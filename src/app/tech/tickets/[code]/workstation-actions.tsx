"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { addWorkNoteAction, updateTicketStatusAction } from "@/lib/actions/tickets";
import { sendMessageAction } from "@/lib/actions/messaging";
import type { TicketStatus } from "@/lib/constants";

export function WorkstationActions({ ticketId, status }: { ticketId: number; status: TicketStatus }) {
  const router = useRouter();
  const [next, setNext] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeStatus() {
    if (!next) return;
    setBusy(true);
    const res = await updateTicketStatusAction(ticketId, next as TicketStatus);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    toast.success(`Status → ${next}`);
    setNext("");
    router.refresh();
  }

  async function postNote() {
    if (!note.trim()) return;
    setBusy(true);
    const res = await addWorkNoteAction(ticketId, note);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setNote("");
    toast.success("Work log posted");
    router.refresh();
  }

  async function send() {
    if (!msg.trim()) return;
    setBusy(true);
    const res = await sendMessageAction(ticketId, msg);
    setBusy(false);
    if (!res.ok) return toast.error(res.error);
    setMsg("");
    toast.success("Message sent to client");
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <div>
        <p className="mb-1 text-sm font-medium">Current status: {status.replace("_", " ")}</p>
        <div className="flex gap-2">
          <NativeSelect value={next} onChange={(e) => setNext(e.target.value)} className="max-w-64">
            <NativeSelectOption value="">Move to…</NativeSelectOption>
            <NativeSelectOption value="IN_PROGRESS">In Progress</NativeSelectOption>
            <NativeSelectOption value="PENDING">Pending</NativeSelectOption>
            <NativeSelectOption value="RESOLVED">Resolved</NativeSelectOption>
          </NativeSelect>
          <Button onClick={changeStatus} disabled={!next || busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} Update
          </Button>
        </div>
      </div>
      <div>
        <p className="mb-1 text-sm font-medium">Work log / resolution note</p>
        <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Steps taken, findings, fix…" />
        <Button className="mt-2" variant="outline" onClick={postNote} disabled={busy || !note.trim()}>
          Post note
        </Button>
      </div>
      <div>
        <p className="mb-1 text-sm font-medium">Message client</p>
        <Textarea rows={2} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="Update for the client…" />
        <Button className="mt-2" variant="outline" onClick={send} disabled={busy || !msg.trim()}>
          Send message
        </Button>
      </div>
    </div>
  );
}
