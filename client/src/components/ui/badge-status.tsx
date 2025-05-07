import { cn } from "@/lib/utils";

interface BadgeStatusProps {
  status: 'available' | 'pending' | 'adopted' | 'under_treatment' | 'critical' | 'recovering' | 'reported' | 'in_progress' | 'rescued' | 'approved' | 'rejected';
  className?: string;
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'available':
        return 'bg-[#4CAF50] text-white';
      case 'pending':
        return 'bg-[#FFC107] text-white';
      case 'adopted':
        return 'bg-[#03A9F4] text-white';
      case 'under_treatment':
        return 'bg-[#9C27B0] text-white';
      case 'critical':
        return 'bg-[#F44336] text-white';
      case 'recovering':
        return 'bg-[#4CAF50] text-white';
      case 'reported':
        return 'bg-[#FF9800] text-white';
      case 'in_progress':
        return 'bg-[#3F51B5] text-white';
      case 'rescued':
        return 'bg-[#8BC34A] text-white';
      case 'approved':
        return 'bg-[#4CAF50] text-white';
      case 'rejected':
        return 'bg-[#F44336] text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getFormattedStatus = () => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      getStatusStyles(),
      className
    )}>
      {getFormattedStatus()}
    </span>
  );
}
