import { Skeleton } from "./skeleton";
import { MainLayout } from "../layout/main-layout";

interface LoadingStateProps {
  message?: string;
}

interface ErrorStateProps {
  title: string;
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <MainLayout>
      <div className="flex justify-center items-center py-20">
        <Skeleton className="h-8 w-8 rounded-full" />
        <span className="ml-2 text-gray-600">{message}</span>
      </div>
    </MainLayout>
  );
}

export function ErrorState({ title, message }: ErrorStateProps) {
  return (
    <MainLayout>
      <div className="flex flex-col justify-center items-center py-20">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {message && <p className="mt-2 text-gray-600">{message}</p>}
      </div>
    </MainLayout>
  );
} 