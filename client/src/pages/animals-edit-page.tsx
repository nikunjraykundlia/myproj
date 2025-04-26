import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Animal } from "@shared/schema";

import { LoadingState, ErrorState } from "@/components/ui/page-states";
import { AddAnimalForm } from "@/components/forms/add-animal-form";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function AnimalsEditPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: animal, isLoading, error } = useQuery<Animal>({
    queryKey: [`/api/animals/${id}`],
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: async (updated: Partial<Animal>) => {
      const res = await fetch(`/api/animals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Failed to update animal");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Animal updated successfully");
      queryClient.invalidateQueries([`/api/animals/${id}`]);
      setLocation(`/animals/${id}`);
    },
    onError: () => {
      toast.error("Failed to update animal");
    },
  });

  if (!id) return <ErrorState title="Invalid animal ID" />;
  if (isLoading) return <LoadingState message="Loading animal..." />;
  if (error || !animal) return <ErrorState title="Animal not found" />;

  return (
    
      <div className="max-w-xl mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">Edit Animal</h1>
            <AddAnimalForm
              initialValues={animal}
              onSubmit={mutation.mutate}
              isSubmitting={mutation.isLoading}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    
  );
}
