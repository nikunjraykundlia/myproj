import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { MapPin } from "lucide-react";
import { Link } from "wouter";
import { Animal } from "@shared/schema";

type AnimalCardProps = {
  animal: Animal;
};

export function AnimalCard({ animal }: AnimalCardProps) {
  return (
    <Card className="overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="relative">
        <img className="h-48 w-full object-cover" src={animal.photoUrl} alt={`${animal.name} - ${animal.breed}`} />
        <div className="absolute top-0 right-0 mt-3 mr-3">
          <StatusBadge status={animal.status} />
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900">{animal.name}</h3>
          <p className="text-sm text-gray-500">{animal.age} {animal.age === 1 ? 'year' : 'years'} old</p>
        </div>
        <p className="mt-1 text-sm text-gray-500">{animal.breed}</p>
        <p className="mt-2 text-sm text-gray-700 line-clamp-2">{animal.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-4 w-4 text-gray-400 mr-1" />
            {animal.location}
          </div>
          {(animal.id ?? animal._id) && (
            
            <Button asChild variant="default" size="sm">
              <Link href={`/animals/${(animal.id ?? animal._id).toString()}`}>View Details</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
