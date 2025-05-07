import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdoptionRequestSectionProps {
  animalId: string | number;
}

interface AdoptionRequest {
  name: string;
  request: string;
}

export function AdoptionRequestSection({ animalId }: AdoptionRequestSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [adoptionRequest, setAdoptionRequest] = useState<AdoptionRequest | null>(null);
  const [form, setForm] = useState({ name: "", request: "" });

  const handleApplyClick = () => setShowForm(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const { user } = useAuth();
const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdoptionRequest({ name: form.name, request: form.request });
    setShowForm(false);
    if (!user) return;
    // Fetch the animal from adoptableAnimals in localStorage
    const animals = JSON.parse(localStorage.getItem('adoptableAnimals') || '[]');
    const animal = animals.find((a: any) => a.id === animalId || a._id === animalId);
    if (!animal) return;
    // Prepare request object
    const newRequest = {
      animal,
      name: form.name,
      request: form.request,
      timestamp: Date.now(),
    };
    // Store in localStorage under per-user key
    try {
      const key = `adoptions_${user.id}`;
      const prev = JSON.parse(localStorage.getItem(key) || '[]');
      // Remove previous entry for this animal
      const filtered = prev.filter((r: any) => (r.animal.id ?? r.animal._id) !== (animal.id ?? animal._id));
      localStorage.setItem(key, JSON.stringify([...filtered, newRequest]));
    } catch (e) {
      const key = `adoptions_${user.id}`;
      localStorage.setItem(key, JSON.stringify([newRequest]));
    }
};

  return (
    <div className="mt-2">
      {!adoptionRequest && !showForm && (
        <Button variant="outline" size="sm" onClick={handleApplyClick}>
          Apply for Adoption
        </Button>
      )}
      {showForm && !adoptionRequest && (
        <form onSubmit={handleSubmit} className="space-y-2 bg-gray-50 border rounded p-3 mt-2">
          <div>
            <label className="block text-xs font-semibold mb-1" htmlFor={`adopt-name-${animalId}`}>Name</label>
            <Input
              id={`adopt-name-${animalId}`}
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" htmlFor={`adopt-request-${animalId}`}>Request</label>
            <textarea
              id={`adopt-request-${animalId}`}
              name="request"
              className="w-full border rounded px-2 py-1 text-sm"
              rows={3}
              value={form.request}
              onChange={handleChange}
              required
              placeholder="Why would you like to adopt this animal?"
            />
          </div>
          <Button type="submit" size="sm" className="w-full">Submit</Button>
        </form>
      )}
      {adoptionRequest && (
        <div className="mt-2 bg-green-50 border border-green-200 rounded p-3">
          <div className="text-xs text-gray-500 mb-1">Adoption Request Submitted:</div>
          <div className="font-semibold text-gray-800">{adoptionRequest.name}</div>
          <div className="text-gray-700 whitespace-pre-line mt-1">{adoptionRequest.request}</div>
        </div>
      )}
    </div>
  );
}
