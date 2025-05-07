import { useAuth } from "@/hooks/use-auth";
const API_URL = 'YOUR_API_URL/api/animals'; // e.g., http://localhost:3000/api/animals

const animals = [
  // CATS
  {
    name: 'Luna',
    species: 'cat',
    breed: 'Persian',
    age: 2,
    description: 'A gentle Persian cat who loves to cuddle and nap in the sun.',
    status: 'available',
    location: 'Mumbai',
    photoUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Simba',
    species: 'cat',
    breed: 'Siamese',
    age: 1,
    description: 'A playful Siamese kitten with striking blue eyes and endless energy.',
    status: 'available',
    location: 'Delhi',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-3005759c61d3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Bella',
    species: 'cat',
    breed: 'Maine Coon',
    age: 3,
    description: 'A majestic Maine Coon with a fluffy tail and a friendly personality.',
    status: 'available',
    location: 'Pune',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-327f6b0037c4?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Leo',
    species: 'cat',
    breed: 'Bengal',
    age: 2,
    description: 'An adventurous Bengal cat who loves to climb and explore.',
    status: 'available',
    location: 'Bangalore',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-8e5b6a5c1f3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Daisy',
    species: 'cat',
    breed: 'Ragdoll',
    age: 4,
    description: 'A sweet Ragdoll cat who enjoys gentle play and soft pets.',
    status: 'available',
    location: 'Chennai',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-3c7e6d7e6e2c?auto=format&fit=crop&w=600&q=80'
  },
  // DOGS
  {
    name: 'Max',
    species: 'dog',
    breed: 'Labrador',
    age: 3,
    description: 'A loyal Labrador who loves to fetch and go for long walks.',
    status: 'available',
    location: 'Mumbai',
    photoUrl: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Rocky',
    species: 'dog',
    breed: 'German Shepherd',
    age: 2,
    description: 'A brave German Shepherd who is both smart and affectionate.',
    status: 'available',
    location: 'Delhi',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-1b8e9e1e2e5c?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Coco',
    species: 'dog',
    breed: 'Pug',
    age: 1,
    description: 'A fun-loving Pug who enjoys treats and belly rubs.',
    status: 'available',
    location: 'Pune',
    photoUrl: 'https://images.unsplash.com/photo-1556520930-085831d1a6bf?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Bruno',
    species: 'dog',
    breed: 'Beagle',
    age: 4,
    description: 'An energetic Beagle who loves to sniff and explore new places.',
    status: 'available',
    location: 'Bangalore',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-6b2b6e8e2e3e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Ruby',
    species: 'dog',
    breed: 'Golden Retriever',
    age: 2,
    description: 'A friendly Golden Retriever who is great with kids and families.',
    status: 'available',
    location: 'Chennai',
    photoUrl: 'https://images.unsplash.com/photo-1518715308788-7b2b6e8e2e3e?auto=format&fit=crop&w=600&q=80'
  }
];

async function addAnimals() {
  for (const animal of animals) {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer YOUR_TOKEN' // Uncomment and add your token if needed
      },
      body: JSON.stringify(animal)
    });
    if (response.ok) {
      console.log(`Added ${animal.name} successfully!`);
    } else {
      console.error(`Failed to add ${animal.name}:`, await response.text());
    }
  }
}

addAnimals();import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatsCard } from "@/components/stats-card";
import { ServiceCard } from "@/components/service-card";
import { AnimalCard } from "@/components/animal-card";
import { RecentRescueItem } from "@/components/recent-rescue-item";
import { useQuery } from "@tanstack/react-query";
import { Animal } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PawPrint, Home, Syringe, HeartHandshake } from "lucide-react";


export default function HomePage() {
  const { data: animals, isLoading: animalsLoading } = useQuery<Animal[]>({
    queryKey: ["/api/animals?status=available"],
  });
  const { user } = useAuth();

  return (
    <div className="py-6 sm:py-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h2>
          <p className="text-gray-600 mt-1">
            Here are your adoption requests and their current status.
          </p>
        </div>
        {/* Hero Section */}
        <div className="bg-primary rounded-lg shadow-xl overflow-hidden mb-8">
          <div className="relative h-80">
            <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=400&q=80" alt="Hero image of rescued animals" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-transparent opacity-90"></div>
            <div className="absolute inset-0 flex items-center">
              <div className="ml-8 sm:ml-16 max-w-2xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Give them a second chance at life</h1>
                <p className="text-white text-lg mb-6">Help us rescue, rehabilitate, and rehome animals in need.</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/adoption">Adopt a Pet</Link>
                  </Button>
                  <Button asChild variant="outline" className="text-white border-white hover:bg-primary-700 hover:text-white" size="lg">
                    <Link href="/submit-report">Report a Rescue</Link>
                  </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
            <StatsCard
              title="Animals Rescued"
              value="1,342"
              icon={<PawPrint className="h-5 w-5 text-white" />}
              color="bg-primary-100 text-primary-600"
            />
            <StatsCard
              title="Successful Adoptions"
              value="892"
              icon={<Home className="h-5 w-5 text-white" />}
              color="bg-orange-100 text-orange-600"
            />
            <StatsCard
              title="Active Volunteers"
              value="124"
              icon={<HeartHandshake className="h-5 w-5 text-white" />}
              color="bg-blue-100 text-blue-600"
            />
          </div>

          {/* Featured Animals */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Animals Needing Homes</h2>
              <Button asChild variant="link" className="text-primary-600">
                <Link href="/adoption">
                  See all <span className="ml-1">→</span>
                </Link>
              </Button>
            </div>

            {animalsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="h-[360px]">
                    <Skeleton className="h-48 rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-4 w-32 mb-4" />
                      <Skeleton className="h-16" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {animals?.slice(0, 3).map((animal) => (
                  <AnimalCard key={animal.id} animal={animal} />
                ))}
              </div>
            )}
          </section>

          {/* Services */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Services</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ServiceCard
                title="Rescue & Rehabilitation"
                description="We respond to emergency situations to rescue animals in distress and provide medical care and rehabilitation."
                icon={<PawPrint className="h-5 w-5 text-white" />}
                color="bg-primary-100 text-primary-600"
                linkText="Report a rescue"
                linkHref="/submit-report"
              />
              <ServiceCard
                title="Adoption Program"
                description="We connect animals with loving homes through our thorough adoption process to ensure the perfect match."
                icon={<Home className="h-5 w-5 text-white" />}
                color="bg-orange-100 text-orange-600"
                linkText="Adopt a pet"
                linkHref="/adoption"
              />
            </div>
          </section>

        </div>
      </div>
  );
}
