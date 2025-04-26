import { useState, useEffect } from "react";
import { TreatmentHistoryCard } from "@/components/treatment-history-card";
import { useQuery } from "@tanstack/react-query";
import { Animal, TreatmentRecord } from "@shared/schema";
import { useParams, Link, Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { TreatmentForm } from "@/components/forms/treatment-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Filter, PlusCircle, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";


export default function TreatmentPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Check if user is admin or vet
  if (!authLoading && user && (user.role !== 'admin' && user.role !== 'vet')) {
    return <Redirect to="/" />;
  }

  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all_statuses") params.append("status", statusFilter);
    if (searchQuery) params.append("search", searchQuery);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const [expandedAnimal, setExpandedAnimal] = useState<string | null>(null);
const [animalList, setAnimalList] = useState<Animal[] | null>(null);

const { data: animals, isLoading: animalsLoading } = useQuery<Animal[]>({
    queryKey: [`/api/animals${buildQueryString()}`],
    enabled: !id,
  });

// Keep animalList in sync with animals query data
useEffect(() => {
  if (animals) setAnimalList(animals);
}, [animals]);

const handleDeleteAnimal = (id: number) => {
  if (animalList) setAnimalList(animalList.filter(a => a.id !== id));
  setExpandedAnimal(null);
};

  const { data: animal, isLoading: animalLoading } = useQuery<Animal>({
    queryKey: [`/api/animals/${id}`],
    enabled: !!id,
  });

  const { data: treatments, isLoading: treatmentsLoading } = useQuery<TreatmentRecord[]>({
    queryKey: [`/api/animals/${id}/treatments`],
    enabled: !!id,
  });

  // Mutation for updating animal status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PUT", `/api/animals/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/animals/${id}`] });
    },
  });

  const handleStatusChange = (status: string) => {
    if (id) {
      updateStatusMutation.mutate({ id, status });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refresh due to the changed queryKey
  };

  const clearFilters = () => {
    setStatusFilter("all_statuses");
    setSearchQuery("");
  };

  // Display animal details and treatment records if an animal is selected
  if (id) {
    return (
      
        <div className="bg-gray-50">
          <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Button variant="link" className="mb-4 p-0" asChild>
              <Link href="/treatment">← Back to All Animals</Link>
            </Button>

            {animalLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-gray-600">Loading animal details...</span>
              </div>
            ) : animal ? (
              <>
                <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                  <div className="md:flex">
                    <div className="md:flex-shrink-0 md:w-1/3">
                      <img
                        className="h-64 w-full object-cover md:h-full"
                        src={animal.photoUrl}
                        alt={`${animal.name} - ${animal.breed}`}
                      />
                    </div>
                    <div className="p-6 md:p-8 md:w-2/3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
                          <p className="text-md text-gray-600">{animal.breed} ({animal.species})</p>
                        </div>
                        <StatusBadge status={animal.status} className="text-sm" />
                      </div>

                      <p className="mt-4 text-gray-700">{animal.description}</p>

                      <div className="mt-6">
                        <h2 className="text-lg font-medium text-gray-900">Update Status</h2>
                        <div className="mt-2 flex items-center space-x-4">
                          <Select 
                            value={animal.status} 
                            onValueChange={handleStatusChange}
                            disabled={updateStatusMutation.isPending}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="adopted">Adopted</SelectItem>
                              <SelectItem value="treatment">In Treatment</SelectItem>
                              <SelectItem value="critical">Critical</SelectItem>
                              <SelectItem value="recovering">Recovering</SelectItem>
                            </SelectContent>
                          </Select>
                          {updateStatusMutation.isPending && (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          )}
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button onClick={() => setTreatmentDialogOpen(true)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Treatment Record
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Dialog open={treatmentDialogOpen} onOpenChange={setTreatmentDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Treatment Record for {animal.name}</DialogTitle>
                      <DialogDescription>
                        Record details of the medical treatment provided to the animal.
                      </DialogDescription>
                    </DialogHeader>
                    <TreatmentForm 
                      animalId={animal.id} 
                      onSuccess={() => setTreatmentDialogOpen(false)} 
                    />
                  </DialogContent>
                </Dialog>

                {/* Treatment history section removed from animal detail view. Now only available in the Treatment section via TreatmentHistoryCard. */}
              </>
            ) : (
              <div className="text-center py-20">
                <h2 className="text-xl font-medium text-gray-900">Animal not found</h2>
                <p className="mt-2 text-gray-600">The animal you're looking for doesn't exist.</p>
                <Button className="mt-4" asChild>
                  <Link href="/treatment">View All Animals</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      
    );
  }

  // Display list of all animals for treatment
  return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Animal Treatment Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage treatment records and update health status for animals in our care.
              </p>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search animals by name, breed, or species..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="w-full sm:w-40">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All Statuses</SelectItem>
                        <SelectItem value="treatment">In Treatment</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="recovering">Recovering</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button variant="outline" onClick={clearFilters} className="px-3">
                    <Filter className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="grid" className="mb-6">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              {animalsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <CardContent className="p-4">
                        <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-full mb-4" />
                        <div className="h-8 bg-gray-200 rounded w-1/3" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : animalList && animalList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {animalList
                    .filter((animal) => animal.status !== 'adoptable')
                    .map((animal) => (
                      <Card key={animal.id} className="overflow-hidden">
                        <div className="relative h-48">
                          <img 
                            className="w-full h-full object-cover" 
                            src={animal.photoUrl} 
                            alt={`${animal.name} - ${animal.breed}`}
                          />
                          <div className="absolute top-2 right-2">
                            <StatusBadge status={animal.status} />
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h2 className="text-xl font-bold text-gray-900">{animal.name}</h2>
                          <p className="text-sm text-gray-600 mb-2">{animal.breed} ({animal.species})</p>
                          <p className="text-sm text-gray-700 line-clamp-2 mb-4">{animal.description}</p>
                          <div className="flex gap-2">
                            <Button asChild>
                              <Link href={`/treatment/${animal.id}`}>Manage Treatment</Link>
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setExpandedAnimal(expandedAnimal === String(animal.id) ? null : String(animal.id))}>
  {expandedAnimal === String(animal.id) ? "Hide History" : "Show History"}
</Button>
                          </div>
                          {expandedAnimal === String(animal.id) && (
  <div className="mt-4">
    <TreatmentHistoryCard animal={animal} onDelete={() => handleDeleteAnimal(animal.id)} />
  </div>
)}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-medium text-gray-900">No animals found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filters.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="list">
              {animalsLoading ? (
                <div className="space-y-4">
                  {Array(6).fill(0).map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4 flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 mr-4" />
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1" />
                          <div className="h-4 bg-gray-200 rounded w-2/3" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : animalList && animalList.length > 0 ? (
                <div className="space-y-4">
                  {animalList
                    .filter((animal) => animal.status !== 'adoptable')
                    .map((animal) => (
                      <Card key={animal.id}>
                        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center">
                          <div className="w-full sm:w-20 h-20 rounded-full overflow-hidden mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                            <img 
                              className="w-full h-full object-cover" 
                              src={animal.photoUrl} 
                              alt={animal.name} 
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                              <h3 className="text-lg font-semibold text-gray-900">{animal.name}</h3>
                              <StatusBadge status={animal.status} className="mt-1 sm:mt-0" />
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{animal.breed} ({animal.species}) - {animal.age} years old</p>
                            <p className="text-sm text-gray-700 mt-2 line-clamp-2">{animal.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Button asChild>
                                <Link href={`/treatment/${animal.id}`}>View Details</Link>
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => setExpandedAnimal(expandedAnimal === String(animal.id) ? null : String(animal.id))}>
                                {expandedAnimal === String(animal.id) ? "Hide History" : "Show History"}
                              </Button>
                            </div>
                            {expandedAnimal === String(animal.id) && (
                              <div className="mt-4">
                                <TreatmentHistoryCard animal={animal} onDelete={() => handleDeleteAnimal(animal.id)} />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <h3 className="text-lg font-medium text-gray-900">No animals found</h3>
                  <p className="mt-1 text-gray-500">Try adjusting your search or filters.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
  );
}