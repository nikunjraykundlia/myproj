import { useParams, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Animal } from "@shared/schema";
import { RescueReportForm } from "@/components/forms/report-form";
import AddAnimalForm from "@/components/forms/add-animal-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

import { LoadingState } from "@/components/ui/page-states";

export default function SubmitReportPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const { data: animal, isLoading: animalLoading } = useQuery<Animal>({
    queryKey: [`/api/animals/${id}`],
    enabled: !!id,
  });

  const isLoading = authLoading || (id && animalLoading);

  // If user is not logged in, redirect to login page
  if (!authLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>
              {id && animal 
                ? `Submit Rescue Report for ${animal.name}`
                : "Submit New Rescue Report"
              }
            </CardTitle>
            <CardDescription>
              Provide details about the animal's situation and location to help our rescue team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {id ? (
                  <RescueReportForm animalId={id} />
                ) : (
                  <div className="py-4">
                    <p className="mb-4 text-gray-600 text-center">Fill out the form below to report a new animal rescue. Your submission will help us save more lives!</p>
                    <AddAnimalForm />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
