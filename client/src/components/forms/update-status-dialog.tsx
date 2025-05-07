import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Animal } from "@shared/schema";

const ANIMAL_STATUSES = [
  "available",
  "adoptable",
  "pending",
  "adopted",
  "treatment",
  "critical",
  "recovering",
] as const;

const updateStatusSchema = z.object({
  status: z.enum(ANIMAL_STATUSES),
  notes: z.string().min(5, "Please enter some notes."),
});

type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animal: Animal;
  onSuccess?: () => void;
}

export function UpdateStatusDialog({ open, onOpenChange, animal, onSuccess }: UpdateStatusDialogProps) {
  const { toast } = useToast();
  const form = useForm<UpdateStatusFormValues>({
    resolver: zodResolver(updateStatusSchema),
    defaultValues: {
      status: animal.status,
      notes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: UpdateStatusFormValues) => {
      // Update animal status
      // Ensure animal.id is a valid ObjectId string
      let animalId = animal.id;
      if (typeof animalId === 'object' && animalId.$oid) {
        animalId = animalId.$oid;
      } else {
        animalId = String(animalId);
      }
      console.log('Updating animal status for ID:', animalId);
      await apiRequest("PUT", `/api/animals/${animalId}`, { status: values.status });
      // Add treatment record (notes)
      await apiRequest("POST", "/api/treatments", {
        animalId: String(animal.id),
        diagnosis: values.status,
        treatment: values.notes,
      });
    },
    onSuccess: () => {
      toast({
        title: "Animal status updated!",
        description: "The animal's status and treatment history have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animal.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animal.id}/treatments`] });
      onOpenChange(false);
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: UpdateStatusFormValues) {
    mutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="update-status-description">
        <span id="update-status-description" className="sr-only">
          Update the animal status and add notes for treatment history. All fields are required.
        </span>
        <DialogHeader>
          <DialogTitle>Update Animal Status</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={form.watch("status")}
              onValueChange={val => form.setValue("status", val as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ANIMAL_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={form.watch("notes")}
              onChange={e => form.setValue("notes", e.target.value)}
              rows={4}
              placeholder="Add notes about the animal's condition or treatment..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
