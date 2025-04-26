import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Animal } from "@shared/schema";
import { AnimalCard } from "@/components/animal-card";
import { AdoptionRequestSection } from "./adoption-page-adoption-request-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Search, Filter, Heart } from "lucide-react";


export default function AdoptionPage() {
  const [speciesFilter, setSpeciesFilter] = useState<string>("all_species");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (speciesFilter && speciesFilter !== "all_species") params.append("species", speciesFilter);
    // Always filter for adoptable animals only
    params.append("status", "adoptable");
    if (searchQuery) params.append("search", searchQuery);
    return params.toString() ? `?${params.toString()}` : "";
  };


  const { data: animals, isLoading } = useQuery<Animal[]>({
    queryKey: [`/api/animals${buildQueryString()}`],
  });

  // Ensure adoptable animals are always available in localStorage for the adoption form
  useEffect(() => {
    if (animals && animals.length > 0) {
      localStorage.setItem('adoptableAnimals', JSON.stringify(animals));
    }
  }, [animals]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refresh due to the changed queryKey
  };

  const clearFilters = () => {
    setSpeciesFilter("all_species");
    setSearchQuery("");
  };

  return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 rounded-lg shadow-xl overflow-hidden mb-8">
            <div className="relative h-48 md:h-64">
              <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1534361960057-19889db9621e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=400&q=80" alt="Adorable pets ready for adoption" />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-transparent opacity-90"></div>
              <div className="absolute inset-0 flex items-center">
                <div className="ml-8 sm:ml-16 max-w-2xl">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Find Your Perfect Companion</h1>
                  <p className="text-white text-lg mb-6">Browse our available animals and give them a forever home.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Available for Adoption</h2>
              <p className="mt-1 text-sm text-gray-600">
                These loving animals are ready to find their forever homes.
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
                      placeholder="Search adoptable pets..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit">Search</Button>
                </form>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="w-full sm:w-40">
                    <Select value={speciesFilter} onValueChange={setSpeciesFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Species" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_species">All Species</SelectItem>
                        <SelectItem value="dog">Dogs</SelectItem>
                        <SelectItem value="cat">Cats</SelectItem>
                        <SelectItem value="rabbit">Rabbits</SelectItem>
                        <SelectItem value="bird">Birds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Skeleton className="h-24 w-full" />
            </div>
          ) : animals && animals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animals
  .filter(animal => animal.status === "adoptable")
  .map((animal) => (
    <div key={animal.id}>
      <AnimalCard animal={animal} />
      <AdoptionRequestSection animalId={animal.id} />
    </div>
  ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="h-16 w-16 text-orange-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No animals available for adoption</h3>
              <p className="mt-1 text-gray-500">Please check back later as new animals become available.</p>
            </div>
          )}

          <div className="mt-16 bg-white rounded-lg shadow-md p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Adoption Process</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-primary-100 text-primary-600 rounded-full p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">1. Find Your Match</h3>
                <p className="text-gray-600">Browse available animals and find one that matches your lifestyle and preferences.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-orange-100 text-orange-600 rounded-full p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2. Submit Application</h3>
                <p className="text-gray-600">Fill out the adoption application form with your information and why you'd be a great pet parent.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">3. Welcome Home</h3>
                <p className="text-gray-600">After your application is approved, you'll welcome your new family member to their forever home.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
