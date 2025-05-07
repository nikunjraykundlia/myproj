import { Loader2 } from "lucide-react";
import { Route, Redirect } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Route path={path}>
      {() => (user ? <Component /> : <Redirect to="/auth" />)}
    </Route>
  );
}

export function AdminVetRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();

  console.log('AdminVetRoute:', { user, isLoading, path });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  if (!user) {
    console.log('No user, redirecting to auth');
    return <Redirect to="/auth" />;
  }

  if (user.role !== "admin" && user.role !== "vet") {
    console.log('User not authorized:', user.role);
    return <Redirect to="/" />;
  }

  return <Route path={path} component={Component} />;
}
