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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

const addAnimalFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  species: z.string().min(2, "Species must be at least 2 characters"),
  breed: z.string().min(2, "Breed must be at least 2 characters"),
  age: z.string().transform((val) => Number(val)),
  photoUrl: z.string().url("Please enter a valid URL"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  status: z.string().default("available"),
  location: z.string().min(5, "Location must be at least 5 characters"),
});

type AddAnimalFormValues = z.infer<typeof addAnimalFormSchema>;

type AddAnimalFormProps = {
  initialValues?: Partial<AddAnimalFormValues>;
  onSubmit?: (values: AddAnimalFormValues) => void;
  submitLabel?: string;
  onSuccess?: () => void;
};

export default function AddAnimalForm({ initialValues, onSubmit, submitLabel = "Report Rescue", onSuccess }: AddAnimalFormProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const form = useForm<AddAnimalFormValues>({
    resolver: zodResolver(addAnimalFormSchema),
    defaultValues: initialValues || {
      name: "",
      species: "",
      breed: "",
      age: "",
      photoUrl: "",
      description: "",
      status: "available",
      location: "",
    },
  });

  const addAnimalMutation = useMutation({
    mutationFn: async (values: AddAnimalFormValues) => {
      const res = await apiRequest("POST", "/api/animals", values);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Animal reported successfully!",
        description: "Thank you for helping us save more lives.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
        if (onSuccess) onSuccess();
      setLocation(`/animals/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Failed to report animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function handleAddSubmit(values: AddAnimalFormValues) {
    addAnimalMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit ? onSubmit : handleAddSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter animal's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species</FormLabel>
              <FormControl>
                <Input placeholder="e.g., dog, cat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input placeholder="Enter animal's breed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter age in years" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="photoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Photo URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter URL of animal's photo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the animal's condition, behavior, and the situation in which it was found."
                  {...field}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select {...field} className="input-class border rounded px-2 py-1 w-full">
                  <option value="available">Available</option>
                  <option value="adoptable">Adoptable</option>
                  <option value="pending">Pending</option>
                  <option value="adopted">Adopted</option>
                  <option value="treatment">Treatment</option>
                  <option value="critical">Critical</option>
                  <option value="recovering">Recovering</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Where was the animal found? (e.g., 123 Main St, City)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={addAnimalMutation.isPending}
        >
          {addAnimalMutation.isPending ? "Submitting..." : submitLabel}
        </Button>
    </form>
    </Form>
  );
}
