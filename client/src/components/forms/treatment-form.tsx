import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { treatmentRecordSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

type TreatmentFormValues = z.infer<typeof treatmentRecordSchema>;

interface TreatmentFormProps {
  animal: { id: number | string } | string | number;
  onSuccess?: () => void;
}

export function TreatmentForm({ animal, onSuccess }: TreatmentFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  // Extract animalId as string for Mongo (ObjectId)
  let animalId: string = "";
  if (typeof animal === "object" && animal !== null && "id" in animal) {
    animalId = String(animal.id);
  } else {
    animalId = String(animal);
  }
  
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentRecordSchema),
    defaultValues: {
      animalId: animalId,
      vetId: String(user?.id || ""),
      diagnosis: "",
      treatment: "",
    },
  });

  const treatmentMutation = useMutation({
    mutationFn: async (values: TreatmentFormValues) => {
      const res = await apiRequest("POST", "/api/treatments", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Treatment record added!",
        description: "The treatment record has been successfully added to the animal's history.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}/treatments`] });
      form.reset({
        animalId,
        vetId: String(user?.id || ""),
        diagnosis: "",
        treatment: "",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Failed to add treatment record",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: TreatmentFormValues) {
    treatmentMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="diagnosis"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Diagnosis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the diagnosis and any findings..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Describe the medical condition and any symptoms observed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="treatment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Treatment Plan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the treatment provided and any follow-up instructions..."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormDescription>
                Detail the treatment administered and any care instructions.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={treatmentMutation.isPending}
        >
          {treatmentMutation.isPending ? "Saving..." : "Add Treatment Record"}
        </Button>
      </form>
    </Form>
  );
}
