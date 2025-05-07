import { useQuery } from "@tanstack/react-query";
import { AdoptionRequest, Animal } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

type AdoptionRequestWithAnimal = AdoptionRequest & { animal: Animal; timestamp: number };

export default function MyRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<{ name?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [requests, setRequests] = useState<AdoptionRequestWithAnimal[]>([]);

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      fetch("/api/user/profile")
        .then(res => res.ok ? res.json() : null)
        .then(data => setProfile(data))
        .finally(() => setProfileLoading(false));

      const key = `adoptions_${user.id}`;
      const stored = localStorage.getItem(key);
      setRequests(stored ? JSON.parse(stored) : []);
    }
  }, [user]);

  const isLoading = authLoading || profileLoading;

  if (!authLoading && !user) {
    return <Redirect to="/auth" />;
  }

  const nameMatch = profile?.name || user?.name || "";
  console.log('Adoption Requests:', requests); // TEMP DEBUG
  const latestRequest = requests
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
  
  const initial = nameMatch.charAt(0).toUpperCase() || "?";

  return (
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 card">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex items-center gap-4">
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-2xl">
            {initial}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Welcome, {profile?.name || "User"}</h2>
            <p className="text-gray-600 mt-1">Here are your adoption requests and their current status.</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Adoption Requests</h1>
            <p className="mt-1 text-sm text-gray-600">Track the status of your adoption applications.</p>
          </div>
          <Button asChild>
            <Link href="/adoption">Find More Pets</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Loading your requests...</span>
          </div>
        ) : latestRequest && latestRequest.animal ? (
          <Card key={latestRequest.animal.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="md:flex">
                <div className="md:flex-shrink-0 md:w-1/4 h-48 md:h-full">
                  <img
                    className="h-full w-full object-cover"
                    src={latestRequest.animal.photoUrl || '/placeholder-pet.jpg'}
                    alt={`${latestRequest.animal.name} - ${latestRequest.animal.breed}`}
                    onError={e => (e.currentTarget.src = '/placeholder-pet.jpg')}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{latestRequest.animal.name}</h2>
                      <p className="text-sm text-gray-600">{latestRequest.animal.breed} ({latestRequest.animal.species})</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Your Reason:</h3>
                    <p className="mt-1 text-gray-600 text-sm whitespace-pre-line">{latestRequest.request}</p>
                    {latestRequest.timestamp && (
                      <div className="mt-2 text-xs text-gray-500">
                        Submitted {formatDistanceToNow(new Date(latestRequest.timestamp), { addSuffix: true })}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/animals/${latestRequest.animal.id}`}>View Animal</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
