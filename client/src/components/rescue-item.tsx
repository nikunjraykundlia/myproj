import { RescueReport, Animal, User } from "@shared/schema";
import { BadgeStatus } from "@/components/ui/badge-status";
import { formatDistanceToNow } from "date-fns";

interface RescueItemProps {
  rescue: RescueReport;
  animal?: Animal;
  reporter?: User;
}

export function RescueItem({ rescue, animal, reporter }: RescueItemProps) {
  const timestamp = typeof rescue.timestamp === 'string' 
    ? new Date(rescue.timestamp) 
    : rescue.timestamp;
  
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div className="px-4 py-4 sm:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
            {animal?.photoUrl ? (
              <img 
                className="h-10 w-10 object-cover" 
                src={animal.photoUrl} 
                alt={animal.name || "Animal thumbnail"}
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {animal?.name || "Unknown Animal"} ({animal?.breed || "Unknown Breed"})
            </div>
            <div className="text-sm text-gray-500">{rescue.notes}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <BadgeStatus status={rescue.status} />
          <div className="text-sm text-gray-500 mt-1">{timeAgo}</div>
        </div>
      </div>
    </div>
  );
}
