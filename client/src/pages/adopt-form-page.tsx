import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import AdoptionForm from "@/components/forms/adoption-form";
import { useAuth } from "@/hooks/use-auth";
import type { Animal } from "@shared/schema";


export default function AdoptFormPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();

  const { data: animal, isLoading: animalLoading } = useQuery<Animal>({
    queryKey: [`/api/animals/${id}`],
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Invalid Request</h1>
        <p>No animal specified for adoption.</p>
      </div>
    );
  }

  if (authLoading || animalLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Animal not found</h1>
        <p>The animal you are looking for does not exist.</p>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container py-8">
          <h1 className="text-2xl font-bold mb-4">Adopt {animal.name}</h1>
          <AdoptionForm animalId={animal.id} animalName={animal.name} />
        </div>
      </div>
  );
}