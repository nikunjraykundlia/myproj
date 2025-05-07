import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Menu, LogOut, User, Shield } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const isAdminOrVet = user && (user.role === "admin" || user.role === "vet");

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return '??';
    return name.trim()[0].toUpperCase();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-primary text-2xl mr-2">🐾</span>
              <Link href="/" className="font-bold text-xl text-primary-600">PawCare</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === '/' ? 'border-primary-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                Home
              </Link>
              <Link href="/rescue-tracker" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === '/rescue-tracker' ? 'border-primary-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                Rescue Tracker
              </Link>
              <Link href="/adoption" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === '/adoption' ? 'border-primary-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                Adoption
              </Link>
              <Link href="/laws-and-regulations" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === '/laws-and-regulations' ? 'border-primary-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                Laws & Regulations
              </Link>

              {isAdminOrVet && (
                <Link href="/animal-admin" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${location === '/animal-admin' ? 'border-primary-600 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                  <Shield className="h-4 w-4 mr-1" />
                  Animal Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center">
              {user ? (
                <>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Bell className="h-5 w-5" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8 bg-primary">
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/8792/8792047.png"
                            alt="User Avatar"
                            className="h-8 w-8 rounded-full object-cover"
                          />
                          <AvatarFallback>{user?.name ? getInitials("User") : "??"}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="flex items-center justify-start gap-2 p-2">
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      {(() => {
                        // Get latest request for this user
                        const key = `adoptions_${user.id}`;
                        const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
                        let latestRequest = null;
                        if (stored) {
                          try {
                            const requests = JSON.parse(stored);
                            const nameMatch = user.name || "";
                            latestRequest = requests
                              .filter((req: any) => req.name === nameMatch)
                              .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0))[0];
                          } catch {}
                        }
                        if (!latestRequest) return null;
                        return (
                          <div className="flex items-center gap-2 px-3 py-2 border-b">
                            <img
                              src={latestRequest.animal?.photoUrl || '/placeholder-pet.jpg'}
                              alt={latestRequest.animal?.name || 'Pet'}
                              className="w-10 h-10 rounded object-cover border"
                              onError={e => (e.currentTarget.src = '/placeholder-pet.jpg')}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold truncate">{latestRequest.animal?.name}</div>
                              <div className="text-xs text-gray-600 truncate">Status: Pending</div>
                              <a href={`/animals/${latestRequest.animal?.id}`} className="text-xs text-primary-600 underline">View</a>
                            </div>
                          </div>
                        );
                      })()}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/my-requests" className="cursor-pointer">
                          My Adoption Requests
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button asChild>
                  <Link href="/auth">
                    <User className="h-4 w-4 mr-2" />
                    Login / Register
                  </Link>
                </Button>
              )}
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <div className="flex flex-col space-y-4 py-4">
                    <Link href="/" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100">
                      Home
                    </Link>
                    <Link href="/rescue-tracker" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100">
                      Rescue Tracker
                    </Link>
                    <Link href="/adoption" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100">
                      Adoption
                    </Link>
                    <Link href="/treatment" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100">
                      Treatment
                    </Link>
                    {isAdminOrVet && (
                      <Link href="/animal-admin" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100 flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Animal Admin
                      </Link>
                    )}
                    {user ? (
                      <>
                        <Link href="/my-requests" onClick={() => setIsOpen(false)} className="px-2 py-2 text-base font-medium rounded-md hover:bg-gray-100">
                          My Adoption Requests
                        </Link>
                        <Button onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }} variant="ghost" className="justify-start">
                          <LogOut className="h-4 w-4 mr-2" />
                          Log out
                        </Button>
                      </>
                    ) : (
                      <Button asChild>
                        <Link href="/auth" onClick={() => setIsOpen(false)}>
                          <User className="h-4 w-4 mr-2" />
                          Login / Register
                        </Link>
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
