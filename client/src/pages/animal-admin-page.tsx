import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Animal, InsertAnimal } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, X, Check, Image } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StatusBadge } from "@/components/status-badge";
import { apiRequest, queryClient } from "@/lib/queryClient";


// Available species and statuses
const ANIMAL_SPECIES = ['dog', 'cat', 'rabbit', 'hamster', 'bird', 'other'] as const;
const ANIMAL_STATUSES = ['available', 'pending', 'adopted', 'treatment', 'critical', 'recovering'] as const;

// Schema for animal form
const animalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  species: z.enum(ANIMAL_SPECIES, {
    errorMap: () => ({ message: "Please select a species" }),
  }),
  breed: z.string().min(1, "Breed is required"),
  age: z.coerce.number().min(0, "Age must be a positive number"),
  description: z.string().min(10, "Description should be at least 10 characters"),
  status: z.enum(ANIMAL_STATUSES, {
    errorMap: () => ({ message: "Please select a status" }),
  }),
  location: z.string().min(1, "Location is required"),
  photoUrl: z.string().min(1, "Photo URL is required"),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

export default function AnimalAdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const { toast } = useToast();
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data: animals, isLoading: animalsLoading } = useQuery<Animal[]>({
    queryKey: ["/api/animals"],
  });

  // Create form hook
  const createForm = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      name: "",
      species: "dog",
      breed: "",
      age: 0,
      description: "",
      status: "available",
      location: "",
      photoUrl: "",
    },
  });

  // Edit form hook
  const editForm = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      name: "",
      species: "dog",
      breed: "",
      age: 0,
      description: "",
      status: "available",
      location: "",
      photoUrl: "",
    },
  });

  // Handle file upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Create animal mutation
  const createAnimalMutation = useMutation({
    mutationFn: async (values: AnimalFormValues) => {
      // If there's a photo file, we'd upload it first (placeholder for implementation)
      let photoUrl = values.photoUrl;
      
      if (photoFile) {
        // This is where you would normally upload the file to a server or storage service
        // For now, we'll just use the value provided in the form or the preview as a fallback
        photoUrl = photoPreview || values.photoUrl;
      }
      
      const animalData = { ...values, photoUrl };
      const res = await apiRequest("POST", "/api/animals", animalData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      setIsCreateDialogOpen(false);
      createForm.reset();
      setPhotoFile(null);
      setPhotoPreview(null);
      toast({
        title: "Animal Created",
        description: "The animal was successfully added to the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create Animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update animal mutation
  const updateAnimalMutation = useMutation({
    mutationFn: async (values: AnimalFormValues & { id: number }) => {
      const { id, ...animalData } = values;
      
      // If there's a photo file, we'd upload it first (placeholder for implementation)
      let photoUrl = animalData.photoUrl;
      
      if (photoFile) {
        // This is where you would normally upload the file to a server or storage service
        // For now, we'll just use the preview as the URL
        photoUrl = photoPreview || animalData.photoUrl;
      }
      
      const updatedAnimalData = { ...animalData, photoUrl };
      const res = await apiRequest("PUT", `/api/animals/${id}`, updatedAnimalData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      setIsEditDialogOpen(false);
      editForm.reset();
      setSelectedAnimal(null);
      setPhotoFile(null);
      setPhotoPreview(null);
      toast({
        title: "Animal Updated",
        description: "The animal information was successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete animal mutation
  const deleteAnimalMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/animals/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      setIsDeleteDialogOpen(false);
      setSelectedAnimal(null);
      toast({
        title: "Animal Deleted",
        description: "The animal was successfully removed from the system.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete Animal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/animals/${id}/status`, { status });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/animals"] });
      toast({
        title: "Status Updated",
        description: "The animal's status was successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle create form submission
  const onCreateSubmit = (values: AnimalFormValues) => {
    createAnimalMutation.mutate(values);
  };

  // Handle edit form submission
  const onEditSubmit = (values: AnimalFormValues) => {
    if (selectedAnimal) {
      updateAnimalMutation.mutate({ ...values, id: selectedAnimal.id });
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = () => {
    if (selectedAnimal) {
      deleteAnimalMutation.mutate(selectedAnimal.id);
    }
  };

  // Handle edit button click
  const handleEditClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    editForm.reset({
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      age: animal.age,
      description: animal.description,
      status: animal.status,
      location: animal.location,
      photoUrl: animal.photoUrl,
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsDeleteDialogOpen(true);
  };

  // Handle status update
  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Check if user is admin or vet
  const isAdminOrVet = user && (user.role === "admin" || user.role === "vet");

  // If still loading auth, show loading
  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If not admin or vet, redirect to home
  if (!isAdminOrVet) {
    return <Redirect to="/" />;
  }

  // Calculate pagination
  const totalPages = animals ? Math.ceil(animals.length / pageSize) : 0;
  const paginatedAnimals = animals?.slice((page - 1) * pageSize, page * pageSize);

  return (
    
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Animal Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create, update, and manage animals in the system.
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Animal
          </Button>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Animals</TabsTrigger>
                <TabsTrigger value="available">Available</TabsTrigger>
                <TabsTrigger value="treatment">In Treatment</TabsTrigger>
                <TabsTrigger value="adopted">Adopted</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <AnimalTable 
                  animals={paginatedAnimals || []} 
                  isLoading={animalsLoading}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusUpdate}
                />
              </TabsContent>
              
              <TabsContent value="available">
                <AnimalTable 
                  animals={(paginatedAnimals || []).filter(a => a.status === 'available')} 
                  isLoading={animalsLoading}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusUpdate}
                />
              </TabsContent>
              
              <TabsContent value="treatment">
                <AnimalTable 
                  animals={(paginatedAnimals || []).filter(a => ['treatment', 'critical', 'recovering'].includes(a.status))} 
                  isLoading={animalsLoading}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusUpdate}
                />
              </TabsContent>
              
              <TabsContent value="adopted">
                <AnimalTable 
                  animals={(paginatedAnimals || []).filter(a => a.status === 'adopted')} 
                  isLoading={animalsLoading}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onStatusChange={handleStatusUpdate}
                />
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(i + 1)}
                        className="w-8"
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Animal Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Animal</DialogTitle>
            </DialogHeader>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name" 
                      {...createForm.register("name")} 
                      placeholder="Enter animal name"
                      className={createForm.formState.errors.name ? "border-red-500" : ""}
                    />
                    {createForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="species">Species</Label>
                      <Select 
                        onValueChange={(value) => createForm.setValue("species", value as any)} 
                        defaultValue={createForm.getValues("species")}
                      >
                        <SelectTrigger id="species">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMAL_SPECIES.map(species => (
                            <SelectItem key={species} value={species}>
                              {species.charAt(0).toUpperCase() + species.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {createForm.formState.errors.species && (
                        <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.species.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="age">Age (years)</Label>
                      <Input 
                        id="age" 
                        type="number"
                        min="0"
                        {...createForm.register("age")} 
                        className={createForm.formState.errors.age ? "border-red-500" : ""}
                      />
                      {createForm.formState.errors.age && (
                        <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.age.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="breed">Breed</Label>
                    <Input 
                      id="breed" 
                      {...createForm.register("breed")} 
                      placeholder="Enter breed"
                      className={createForm.formState.errors.breed ? "border-red-500" : ""}
                    />
                    {createForm.formState.errors.breed && (
                      <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.breed.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      {...createForm.register("location")} 
                      placeholder="Enter location"
                      className={createForm.formState.errors.location ? "border-red-500" : ""}
                    />
                    {createForm.formState.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.location.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      onValueChange={(value) => createForm.setValue("status", value as any)} 
                      defaultValue={createForm.getValues("status")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {createForm.formState.errors.status && (
                      <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.status.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      {...createForm.register("description")} 
                      placeholder="Enter detailed description"
                      className={`min-h-[120px] ${createForm.formState.errors.description ? "border-red-500" : ""}`}
                    />
                    {createForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="photoUrl">Photo</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex-1">
                        <Input 
                          id="photoUrl" 
                          {...createForm.register("photoUrl")} 
                          placeholder="Enter photo URL"
                          className={createForm.formState.errors.photoUrl ? "border-red-500" : ""}
                        />
                        {createForm.formState.errors.photoUrl && (
                          <p className="text-red-500 text-sm mt-1">{createForm.formState.errors.photoUrl.message}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">or</p>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('photoUpload')?.click()}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <input 
                        id="photoUpload"
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Photo preview */}
                  {(photoPreview || createForm.watch("photoUrl")) && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2 bg-gray-100 border rounded aspect-video relative overflow-hidden">
                        <img 
                          src={photoPreview || createForm.watch("photoUrl")} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    createForm.reset();
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createAnimalMutation.isPending}
                >
                  {createAnimalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Animal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Animal Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Animal</DialogTitle>
            </DialogHeader>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input 
                      id="edit-name" 
                      {...editForm.register("name")} 
                      className={editForm.formState.errors.name ? "border-red-500" : ""}
                    />
                    {editForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-species">Species</Label>
                      <Select 
                        onValueChange={(value) => editForm.setValue("species", value as any)} 
                        defaultValue={editForm.getValues("species")}
                      >
                        <SelectTrigger id="edit-species">
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          {ANIMAL_SPECIES.map(species => (
                            <SelectItem key={species} value={species}>
                              {species.charAt(0).toUpperCase() + species.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {editForm.formState.errors.species && (
                        <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.species.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-age">Age (years)</Label>
                      <Input 
                        id="edit-age" 
                        type="number"
                        min="0"
                        {...editForm.register("age")} 
                        className={editForm.formState.errors.age ? "border-red-500" : ""}
                      />
                      {editForm.formState.errors.age && (
                        <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.age.message}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-breed">Breed</Label>
                    <Input 
                      id="edit-breed" 
                      {...editForm.register("breed")} 
                      className={editForm.formState.errors.breed ? "border-red-500" : ""}
                    />
                    {editForm.formState.errors.breed && (
                      <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.breed.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-location">Location</Label>
                    <Input 
                      id="edit-location" 
                      {...editForm.register("location")} 
                      className={editForm.formState.errors.location ? "border-red-500" : ""}
                    />
                    {editForm.formState.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.location.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-status">Status</Label>
                    <Select 
                      onValueChange={(value) => editForm.setValue("status", value as any)} 
                      defaultValue={editForm.getValues("status")}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMAL_STATUSES.map(status => (
                          <SelectItem key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editForm.formState.errors.status && (
                      <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.status.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea 
                      id="edit-description" 
                      {...editForm.register("description")} 
                      className={`min-h-[120px] ${editForm.formState.errors.description ? "border-red-500" : ""}`}
                    />
                    {editForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-photoUrl">Photo</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex-1">
                        <Input 
                          id="edit-photoUrl" 
                          {...editForm.register("photoUrl")} 
                          className={editForm.formState.errors.photoUrl ? "border-red-500" : ""}
                        />
                        {editForm.formState.errors.photoUrl && (
                          <p className="text-red-500 text-sm mt-1">{editForm.formState.errors.photoUrl.message}</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">or</p>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => document.getElementById('edit-photoUpload')?.click()}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Upload
                      </Button>
                      <input 
                        id="edit-photoUpload"
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </div>
                  </div>
                  
                  {/* Photo preview */}
                  {(photoPreview || editForm.watch("photoUrl")) && (
                    <div className="mt-4">
                      <Label>Preview</Label>
                      <div className="mt-2 bg-gray-100 border rounded aspect-video relative overflow-hidden">
                        <img 
                          src={photoPreview || editForm.watch("photoUrl")} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400?text=Image+Not+Found")}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    editForm.reset();
                    setSelectedAnimal(null);
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateAnimalMutation.isPending}
                >
                  {updateAnimalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-bold">{selectedAnimal?.name}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={onDeleteConfirm}
                disabled={deleteAnimalMutation.isPending}
              >
                {deleteAnimalMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    
  );
}

// Animal Table Component
interface AnimalTableProps {
  animals: Animal[];
  isLoading: boolean;
  onEdit: (animal: Animal) => void;
  onDelete: (animal: Animal) => void;
  onStatusChange: (id: number, status: string) => void;
}

function AnimalTable({ animals, isLoading, onEdit, onDelete, onStatusChange }: AnimalTableProps) {
  const [showStatusMenu, setShowStatusMenu] = useState<number | null>(null);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (animals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No animals found in this category.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.id}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                    <img 
                      src={animal.photoUrl} 
                      alt={animal.name}
                      className="h-full w-full object-cover"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/100?text=?")}
                    />
                  </div>
                  <Link href={`/animals/${animal.id}`} className="text-blue-600 hover:underline">
                    {animal.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="capitalize">{animal.species}</TableCell>
              <TableCell>{animal.breed}</TableCell>
              <TableCell>{animal.age} {animal.age === 1 ? 'year' : 'years'}</TableCell>
              <TableCell>
                <div className="relative">
                  <div 
                    className="cursor-pointer"
                    onClick={() => setShowStatusMenu(showStatusMenu === animal.id ? null : animal.id)}
                  >
                    <StatusBadge status={animal.status} />
                  </div>
                  
                  {showStatusMenu === animal.id && (
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      {ANIMAL_STATUSES.map(status => (
                        <div 
                          key={status}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center ${status === animal.status ? 'bg-gray-50' : ''}`}
                          onClick={() => {
                            onStatusChange(animal.id, status);
                            setShowStatusMenu(null);
                          }}
                        >
                          {status === animal.status && <Check className="h-4 w-4 text-green-500 mr-2" />}
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                        </div>
                      ))}
                      <div 
                        className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 border-t flex items-center text-gray-500"
                        onClick={() => setShowStatusMenu(null)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </div>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{animal.location}</TableCell>
              <TableCell>{animal.createdAt ? format(new Date(animal.createdAt), 'dd MMM yyyy') : '-'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button variant="outline" size="icon" onClick={() => onEdit(animal)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="text-red-500" onClick={() => onDelete(animal)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}