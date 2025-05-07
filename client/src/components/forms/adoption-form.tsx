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
import { useAuth } from "@/hooks/use-auth";
import { insertAdoptionRequestSchema } from "@shared/schema";
import { useLocation } from "wouter";

// Extend the schema with custom validation
const adoptionFormSchema = insertAdoptionRequestSchema.extend({
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

type AdoptionFormValues = z.infer<typeof adoptionFormSchema>;

interface AdoptionFormProps {
  animalId: number;
  animalName: string;
}

export default function AdoptionForm({ animalId, animalName }: AdoptionFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const form = useForm<AdoptionFormValues>({
    resolver: zodResolver(adoptionFormSchema),
    defaultValues: {
      animalId,
      userId: user?.id,
      message: "",
      status: "pending",
    },
  });

  const adoptionMutation = useMutation({
    mutationFn: async (values: AdoptionFormValues) => {
      const res = await apiRequest("POST", "/api/adoptions", values);
      return await res.json();
    },
    onSuccess: (data, variables) => {
      // Store request in localStorage for instant UI update on /my-requests
      try {
        const userId = user?.id || (variables && variables.userId) || "guest";
        const key = `adoptions_${userId}`;
        const prev = JSON.parse(localStorage.getItem(key) || "[]");
        // Get the full animal object for this request (if available)
        let animalObj = null;
        if (typeof window !== 'undefined') {
          const animalsRaw = localStorage.getItem('adoptableAnimals');
          if (animalsRaw) {
            const animalsArr = JSON.parse(animalsRaw);
            animalObj = animalsArr.find((a:any) => a.id === animalId || a._id === animalId) || null;
          }
        }
        const newRequest = {
          animalId,
          name: (variables && variables.name) || user?.name || "",
          request: variables?.message || variables?.request || "",
          timestamp: Date.now(),
          animal: animalObj // for direct rendering
        };
        localStorage.setItem(key, JSON.stringify([newRequest, ...prev]));
        window.dispatchEvent(new Event("storage"));
      } catch (e) {
        // Ignore localStorage errors
      }
      toast({
        title: "Adoption request submitted!",
        description: `Your request to adopt ${animalName} has been received. We'll review it shortly.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/adoptions"] });
      setLocation("/my-requests");
    },
    onError: (error) => {
      toast({
        title: "Failed to submit adoption request",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: AdoptionFormValues) {
    adoptionMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Why do you want to adopt {animalName}?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself, your living situation, and why you'd be a great match for this pet."
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormDescription>
                This helps us ensure the animal is going to the right home.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={adoptionMutation.isPending}
        >
          {adoptionMutation.isPending ? "Submitting..." : "Submit Adoption Request"}
        </Button>
      </form>
    </Form>
  );
}
