import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function AnimalProgressUpdateForm({ onSubmit, submitting }: { onSubmit: (note: string) => void; submitting: boolean }) {
  const [note, setNote] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (note.trim()) {
          onSubmit(note);
          setNote("");
        }
      }}
      className="space-y-2"
    >
      <Textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Write a progress update..."
        rows={3}
        required
      />
      <div className="flex gap-2 justify-end">
        <Button type="submit" disabled={submitting || !note.trim()}>
          {submitting ? "Posting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
