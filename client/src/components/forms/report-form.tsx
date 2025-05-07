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
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { insertRescueReportSchema } from "@shared/schema";
import { useLocation } from "wouter";

// Extend the schema with custom validation
const rescueReportFormSchema = insertRescueReportSchema.extend({
  notes: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  location: z.string().min(5, {
    message: "Location must be at least 5 characters.",
  }),
});

type RescueReportFormValues = z.infer<typeof rescueReportFormSchema>;

interface RescueReportFormProps {
  animalId: number;
}

export function RescueReportForm({ animalId }: RescueReportFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const form = useForm<RescueReportFormValues>({
    resolver: zodResolver(rescueReportFormSchema),
    defaultValues: {
      animalId,
      reporterId: user?.id,
      notes: "",
      location: "",
      status: "new",
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (values: RescueReportFormValues) => {
      const res = await apiRequest("POST", "/api/reports", values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Rescue report submitted!",
        description: "Thank you for submitting a rescue report. Our team will respond shortly.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${animalId}/reports`] });
      setLocation(`/animals/${animalId}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to submit rescue report",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: RescueReportFormValues) {
    reportMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Where was the animal found? (e.g., 123 Main St, City)" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Please be as specific as possible about the location.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Situation Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the animal's condition, behavior, and the situation in which it was found."
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormDescription>
                This information helps us provide appropriate care for the animal.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={reportMutation.isPending}
        >
          {reportMutation.isPending ? "Submitting..." : "Submit Rescue Report"}
        </Button>
      </form>
    </Form>
  );
}
