import { StatusBadge } from "@/components/status-badge";
import { RescueReport, User } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

type RecentRescueItemProps = {
  report?: RescueReport & { reporter: User };
  animal?: {
    name: string;
    species: string;
    photoUrl: string;
  };
};

export function RecentRescueItem({ report, animal }: RecentRescueItemProps) {
  const fallbackImage = "https://placehold.co/100?text=No+Image";
  const safeReport = report || {
    notes: "No notes available",
    status: "pending",
    createdAt: new Date().toISOString(),
    reporter: {
      name: "Unknown Reporter",
      email: "",
      role: "user"
    }
  };
  const notes = safeReport.notes || "No notes available";
  
  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            <img 
              className="h-10 w-10 object-cover" 
              src={animal?.photoUrl || fallbackImage} 
              alt={animal ? `${animal.name} thumbnail` : "Animal thumbnail"} 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = fallbackImage;
              }}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {animal ? `${animal.name} (${animal.species})` : "Unknown Animal"}
            </div>
            <div className="text-sm text-gray-500">
              {notes.length > 50 ? `${notes.substring(0, 50)}...` : notes}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <StatusBadge status={safeReport.status} />
          <div className="text-sm text-gray-500 mt-1">
            {formatDistanceToNow(new Date(safeReport.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
