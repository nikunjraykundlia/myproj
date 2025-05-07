import { useQuery } from "@tanstack/react-query";
import { Animal, RescueReport, TreatmentRecord, User } from "@shared/schema";
import { AnimalProgressUpdateForm } from "@/components/animal-progress-update-form";
import { Link, useParams } from "wouter";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Timeline, 
  TimelineContent, 
  TimelineItem, 
  TimelineSeparator, 
  TimelineDot, 
  TimelineConnector 
} from "@/components/ui/timeline";
import { TreatmentForm } from "@/components/forms/treatment-form";
import { formatDistanceToNow, format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { MapPin, CalendarClock, User as UserIcon, FileText, Syringe } from "lucide-react";

import { LoadingState, ErrorState } from "@/components/ui/page-states";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { UpdateStatusDialog } from "@/components/forms/update-status-dialog";
import { queryClient } from "@/lib/queryClient";

export default function AnimalDetailPage() {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { id } = useParams();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/animals/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete animal");
      return await res.json();
    },
    onSuccess: () => {
      toast.success("Animal deleted successfully");
      setLocation("/rescue-tracker");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete animal");
    },
  });

  const handleDeleteAnimal = () => {
    deleteMutation.mutate();
  };

  const { data: animal, isLoading: animalLoading } = useQuery<Animal>({
    queryKey: [`/api/animals/${id}`],
    enabled: !!id,
  });

  const { data: reports, isLoading: reportsLoading } = useQuery<(RescueReport & { reporter: User })[]>({
    queryKey: [`/api/animals/${id}/reports`],
    enabled: !!id,
  });

  const { data: treatments, isLoading: treatmentsLoading } = useQuery<TreatmentRecord[]>({
    queryKey: [`/api/animals/${id}/treatments`],
    enabled: !!id,
  });

  // Local state for progress updates (persisted in localStorage)
  const [progressUpdates, setProgressUpdates] = useState<Array<{ note: string; user: string; date: string }>>([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [postingUpdate, setPostingUpdate] = useState(false);

  // Load updates from localStorage on mount (per animal)
  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`rescue_reports_${id}`);
    if (stored) {
      try {
        setProgressUpdates(JSON.parse(stored));
      } catch (e) {
        setProgressUpdates([]);
      }
    } else {
      setProgressUpdates([]);
    }
  }, [id]);

  function handlePostUpdate(note: string) {
    setPostingUpdate(true);
    setTimeout(() => {
      const newUpdate = {
        note,
        // @ts-ignore
        user: user && user._doc ? user._doc.name : user.name,
        date: new Date().toLocaleString("en-IN", { hour12: false })
      };
      setProgressUpdates(prev => {
        const updated = [newUpdate, ...prev];
        // Persist to localStorage
        if (id) localStorage.setItem(`rescue_reports_${id}` , JSON.stringify(updated));
        return updated;
      });
      setShowUpdateForm(false);
      setPostingUpdate(false);
    }, 500);
  }

  // Support both plain user and Mongoose doc user
  const userObj = user && user._doc ? user._doc : user;
  const isVetOrAdmin = userObj && (userObj.role === "vet" || userObj.role === "admin");

  if (!id) {
    return <ErrorState title="Invalid animal ID" />;
  }

  if (animalLoading) {
    return <LoadingState message="Loading animal details..." />;
  }

  if (!animal) {
    return <ErrorState title="Animal not found" />;
  }

  return (
    <div className="bg-gray-50">
      {/* DEBUG: Current user info */}
      {/* Debug User Info - styled card */}
      {userObj && (
        <div className="max-w-xl mx-auto mb-6">
          <div className="rounded-lg shadow bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-300 p-4">
            <div className="flex items-center mb-2">
              <span className="inline-block bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded mr-2">DEBUG</span>
              <span className="font-semibold text-yellow-800">Current User Info</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-yellow-900">
                <tbody>
                  <tr>
                    <td className="font-semibold pr-2 py-1">Name:</td>
                    <td>{userObj.name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 py-1">Username:</td>
                    <td>{userObj.username}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 py-1">Email:</td>
                    <td>{userObj.email}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 py-1">Role:</td>
                    <td><span className="font-bold text-yellow-700">{userObj.role}</span></td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 py-1">User ID:</td>
                    <td><code className="bg-yellow-200 rounded px-1">{userObj._id || userObj.id}</code></td>
                  </tr>
                  <tr>
                    <td className="font-semibold pr-2 py-1">Joined:</td>
                    <td>{userObj.createdAt ? new Date(userObj.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <Button variant="link" className="mb-4 p-0" asChild>
          <Link href="/rescue-tracker">← Back to Rescue Tracker</Link>
        </Button>

        {/* Animal details section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:flex-shrink-0 md:w-1/3">
              <img
                className="h-64 w-full object-cover md:h-full"
                src={animal.photoUrl}
                alt={`${animal.name} - ${animal.breed}`}
              />
            </div>
            <div className="p-6 md:p-8 md:w-2/3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
                  <p className="text-md text-gray-600">{animal.breed} ({animal.species})</p>
                </div>
                <StatusBadge status={animal.status} className="text-sm" />
              </div>

              <div className="mt-4 flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{animal.location}</span>
              </div>

              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900">About {animal.name}</h2>
                <p className="mt-2 text-gray-600">{animal.description}</p>
                
                <div className="mt-4 flex items-center">
                  <div className="flex items-center mr-6">
                    <CalendarClock className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm">{animal.age} {animal.age === 1 ? 'year' : 'years'} old</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">

                <Button variant="outline" asChild>
                  <Link href={`/animals/${id}/edit`}>Edit</Link>
                </Button>

                {isVetOrAdmin && (
                  <>
                    <Button variant="destructive"
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>

              {/* Delete Confirmation Dialog */}
              {isVetOrAdmin && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete Animal?</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete <b>{animal.name}</b>? This action cannot be undone.</p>
                    <div className="flex gap-2 mt-4 justify-end">
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleDeleteAnimal} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Tabs for reports */}
        <Tabs defaultValue="reports" className="bg-white rounded-lg shadow-md">
          <TabsList className="border-b p-0 h-auto rounded-none">
            <TabsTrigger value="reports" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3">
              <FileText className="h-4 w-4 mr-2" />
              Rescue Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="p-0 md:p-6">

            {/* Rescue Reports Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 tracking-tight">Rescue Reports & Progress Updates</h2>
              {isVetOrAdmin && (
                <div className="">
                  {!showUpdateForm ? (
                    <Button size="sm" variant="outline" className="shadow-sm" onClick={() => setShowUpdateForm(true)}>
                      + Add Update
                    </Button>
                  ) : (
                    <div className="bg-white rounded-lg shadow p-3 mt-2 md:mt-0 w-full md:w-96">
                      <AnimalProgressUpdateForm
                        onSubmit={handlePostUpdate}
                        submitting={postingUpdate}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress Updates Timeline */}
            {progressUpdates.length > 0 && (
              <section className="mb-8">
                <h3 className="text-lg font-medium text-blue-800 mb-3">Live Progress Updates</h3>
                <Timeline className="max-w-2xl mx-auto">
                  {progressUpdates.map((upd, idx) => (
                    <TimelineItem key={upd.date + upd.user + idx}>
                      <TimelineSeparator>
                        <TimelineDot color="primary" className="bg-blue-500 border-blue-300" />
                        <TimelineConnector />
                      </TimelineSeparator>
                      <TimelineContent>
                        <Card className="mb-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-100 shadow-sm">
                          <CardContent className="p-4 md:p-5 flex flex-col gap-1">
                            <div className="flex items-center text-xs text-blue-700 mb-1 gap-2">
                              <UserIcon className="w-4 h-4 inline-block mr-1" />
                              <span className="font-medium">{upd.user}</span>
                              <span className="text-gray-400">&bull;</span>
                              <span>{upd.date}</span>
                            </div>
                            <div className="text-gray-900 text-base leading-relaxed whitespace-pre-line">{upd.note}</div>
                          </CardContent>
                        </Card>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              </section>
            )}

            {/* Rescue Reports from backend (if any) */}

            {reportsLoading ? (
              <div className="flex justify-center items-center py-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <span className="ml-2 text-gray-600">Loading reports...</span>
              </div>
            ) : reports && reports.length > 0 ? (
              <Timeline className="max-w-2xl mx-auto">
                {reports.map((report, index) => (
                  <TimelineItem key={report.id}>
                    <TimelineSeparator>
                      <TimelineDot color="primary" />
                      {index < reports.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                              <span className="font-medium">{report.reporter.name}</span>
                            </div>
                            <StatusBadge status={report.status} />
                          </div>
                          <p className="text-gray-700 my-2">{report.notes}</p>
                          <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{report.location}</span>
                            </div>
                            <span>
                              {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No rescue reports available for this animal.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="treatments" className="p-6">
  {/* Add notes form for treatment history */}
  <div className="mb-4">
    <TreatmentForm animal={animal} onSuccess={() => queryClient.invalidateQueries({ queryKey: [`/api/animals/${id}/treatments`] })} />
  </div>
            {treatmentsLoading ? (
              <div className="flex justify-center items-center py-6">
                <Skeleton className="h-6 w-6 rounded-full" />
                <span className="ml-2 text-gray-600">Loading treatments...</span>
              </div>
            ) : treatments && treatments.length > 0 ? (
              <Timeline className="max-w-3xl mx-auto">
                {treatments.map((treatment, index) => (
                  <TimelineItem key={treatment.id}>
                    <TimelineSeparator>
                      <TimelineDot color="secondary" />
                      {index < treatments.length - 1 && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Card className="mb-6">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center">
                              <Syringe className="h-5 w-5 text-gray-500 mr-2" />
                              <span className="font-medium">Dr. {treatment.vetName}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {format(new Date(treatment.date), 'MMM d, yyyy')}
                            </span>
                          </div>
                          <p className="text-gray-700 my-2">{treatment.notes}</p>
                        </CardContent>
                      </Card>
                    </TimelineContent>
                  </TimelineItem>
                ))}
              </Timeline>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600">No treatment records available for this animal.</p>
                {isVetOrAdmin && (
                  <Button variant="outline" className="mt-4" asChild>
                    <Link href={`/treatment/${id}`}>Add First Treatment Record</Link>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
          
          {isVetOrAdmin && (
            <TabsContent value="add-treatment" className="p-6">
              <div className="max-w-xl mx-auto">
                <h3 className="text-lg font-medium mb-4">Add Treatment Record</h3>
                <TreatmentForm animal={id} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
