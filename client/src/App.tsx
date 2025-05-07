import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import RescueTrackerPage from "@/pages/rescue-tracker-page";
import AnimalDetailPage from "@/pages/animal-detail-page";
import AnimalEditPage from "@/pages/animals/[id]/edit";
import LawsAndRegulationsPage from "@/pages/laws-and-regulations-page";
import SubmitReportPage from "@/pages/submit-report-page";
import AdoptionPage from "@/pages/adoption-page";
import AdoptFormPage from "@/pages/adopt-form-page";
import MyRequestsPage from "@/pages/my-requests-page";
import TreatmentPage from "@/pages/treatment-page";
import AnimalAdminPage from "@/pages/animal-admin-page";
import { ProtectedRoute, AdminVetRoute } from "./lib/protected-route";
import { MainLayout } from "@/components/layout/main-layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/rescue-tracker" component={RescueTrackerPage} />
      <Route path="/animals/:id" component={AnimalDetailPage} />
<ProtectedRoute path="/animals/:id/edit" component={AnimalEditPage} />
      <ProtectedRoute path="/submit-report" component={SubmitReportPage} />
      <ProtectedRoute path="/submit-report/:id" component={SubmitReportPage} />
      <Route path="/adoption" component={AdoptionPage} />
      <ProtectedRoute path="/adopt/:id" component={AdoptFormPage} />
      <ProtectedRoute path="/my-requests" component={MyRequestsPage} />
      <AdminVetRoute path="/treatment" component={TreatmentPage} />
      <AdminVetRoute path="/treatment/:id" component={TreatmentPage} />
      <AdminVetRoute path="/animal-admin" component={AnimalAdminPage} />
      <Route path="/laws-and-regulations" component={LawsAndRegulationsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <MainLayout>
      <Router />
    </MainLayout>
  );
}

export default App;
