import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Stethoscope, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { TreatmentRecord, Animal } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

export function TreatmentHistoryCard({ animal, onDelete }: { animal: Animal; onDelete?: (id: string) => void }) {
  const { data: treatments, isLoading: treatmentsLoading } = useQuery<TreatmentRecord[]>({
    queryKey: [`/api/animals/${animal.id}/treatments`],
    enabled: !!animal.id,
  });

  const [deleting, setDeleting] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: async () => {
      setDeleting(true);
      await apiRequest("DELETE", `/api/animals/${animal.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      setDeleting(false);
      if (onDelete) onDelete(animal.id);
    },
    onError: () => {
      setDeleting(false);
      alert("Failed to delete animal");
    },
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span><Stethoscope className="h-5 w-5 mr-2 inline" />Treatment History for {animal.name}</span>
          <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate()} disabled={deleting}>
            <Trash2 className="h-4 w-4 mr-1" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </CardTitle>
        <CardDescription>{animal.breed} ({animal.species})</CardDescription>
      </CardHeader>
      <CardContent>
        {treatmentsLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading treatments...</span>
          </div>
        ) : treatments && treatments.length > 0 ? (
          <div className="space-y-4">
            {treatments.map((treatment) => (
              <Card key={treatment.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">Treatment Record</h3>
                      <p className="text-sm text-gray-500">
                        {treatment.date ? format(new Date(treatment.date), 'MMMM d, yyyy') : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Diagnosis</h4>
                      <p className="mt-1 text-gray-600">{treatment.diagnosis}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Treatment Plan</h4>
                      <p className="mt-1 text-gray-600">{treatment.treatment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-600">No treatment records found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
