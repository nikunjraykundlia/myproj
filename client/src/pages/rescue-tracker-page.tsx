import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Animal } from "@shared/schema";
import { AnimalCard } from "@/components/animal-card";
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
import { Loader2, Search, Filter } from "lucide-react";


export default function RescueTrackerPage() {
  const [speciesFilter, setSpeciesFilter] = useState<string>("all_species");
  const [statusFilter, setStatusFilter] = useState<string>("all_statuses");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Build query string based on filters
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (speciesFilter && speciesFilter !== "all_species") params.append("species", speciesFilter);
    if (statusFilter && statusFilter !== "all_statuses") params.append("status", statusFilter);
    if (searchQuery) params.append("search", searchQuery);
    return params.toString() ? `?${params.toString()}` : "";
  };

  const { data: animals, isLoading } = useQuery<Animal[]>({
    queryKey: [`/api/animals${buildQueryString()}`],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will automatically refresh due to the changed queryKey
  };

  const clearFilters = () => {
    setSpeciesFilter("all_species");
    setStatusFilter("all_statuses");
    setSearchQuery("");
  };

  return (
      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rescue Tracker</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and filter animals that have been rescued, are in treatment, or available for adoption.
              </p>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <a href="/submit-report">Report a Rescue</a>
            </Button>
          </div>

          <Card className="mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <form onSubmit={handleSearch} className="flex-1 flex space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="search"
                      placeholder="Search animals..."
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

                  <div className="w-full sm:w-40">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all_statuses">All Statuses</SelectItem>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="adopted">Adopted</SelectItem>
                        <SelectItem value="treatment">In Treatment</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="recovering">Recovering</SelectItem>
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
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : animals && animals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
              {animals.map((animal) => (
                <AnimalCard key={animal.id} animal={animal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-600">
              No animals found matching the selected filters.
            </div>
          )}
        </div>
      </div>
  );
}
