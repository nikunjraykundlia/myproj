import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

type ServiceCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  linkText: string;
  linkHref: string;
};

export function ServiceCard({ 
  title, 
  description, 
  icon, 
  color, 
  linkText, 
  linkHref 
}: ServiceCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center mb-4">
          <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
            {icon}
          </div>
          <h3 className="ml-3 text-lg font-medium text-gray-900">{title}</h3>
        </div>
        <p className="text-sm text-gray-500">{description}</p>
        <div className="mt-5">
          <Button variant="link" className="p-0 text-primary hover:text-primary-600" asChild>
            <Link href={linkHref}>
              {linkText} <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
