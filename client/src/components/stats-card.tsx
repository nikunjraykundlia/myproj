import { Card, CardContent } from "@/components/ui/card";

type StatsCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

export function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
