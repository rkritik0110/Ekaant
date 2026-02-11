import { Link, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { LogOut, User, LayoutDashboard, Target, Menu, HelpCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if we're on the homepage for transparent header
  const isHomePage = location.pathname === "/";
  // Only transparent when on homepage, light theme, AND not scrolled
  const isTransparent = isHomePage && theme !== "dark" && !isScrolled;

  useEffect(() => {
    const handleScroll = () => {
      // Trigger at 100px scroll
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleNavClick = () => {
    setMobileMenuOpen(false);
  };

  const MobileNav = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "md:hidden",
            isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""
          )}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] sm:w-[320px]">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 mt-6">
          {user ? (
            <>
              <div className="px-2 py-3 border-b border-border mb-2">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role}</p>
              </div>
              <Button 
                asChild 
                variant="ghost" 
                className="justify-start"
                onClick={handleNavClick}
              >
                <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {role === "student" && (
                <>
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start"
                    onClick={handleNavClick}
                  >
                    <Link to="/focus">
                      <Target className="mr-2 h-4 w-4" />
                      Focus Hub
                    </Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="ghost" 
                    className="justify-start"
                    onClick={handleNavClick}
                  >
                    <Link to="/book">Book Seat</Link>
                  </Button>
                </>
              )}
               <Button 
                 asChild 
                 variant="ghost" 
                 className="justify-start"
                 onClick={handleNavClick}
               >
                 <Link to="/support">
                   <HelpCircle className="mr-2 h-4 w-4" />
                   Support
                 </Link>
               </Button>
               <div className="border-t border-border mt-2 pt-2">
                 <Button 
                   variant="ghost" 
                   className="justify-start text-destructive w-full"
                   onClick={() => {
                     handleSignOut();
                     handleNavClick();
                   }}
                 >
                   <LogOut className="mr-2 h-4 w-4" />
                   Sign out
                 </Button>
               </div>
            </>
          ) : (
            <Button asChild onClick={handleNavClick}>
              <Link to="/login">Sign in</Link>
            </Button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      isTransparent 
        ? "bg-transparent border-transparent" 
        : "border-b border-border/50 bg-background/80 backdrop-blur-lg"
    )}>
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className={cn(
              "flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg",
              isTransparent ? "bg-primary" : "bg-primary"
            )}>
              <span className="text-base sm:text-lg font-bold text-primary-foreground">E</span>
            </div>
            <div className="hidden sm:flex sm:flex-col">
              <span className={cn(
                "text-lg font-semibold tracking-tight",
                isTransparent ? "text-white" : "text-foreground"
              )}>Ekaant</span>
              <span className={cn(
                "text-[10px] uppercase tracking-widest",
                isTransparent ? "text-white/70" : "text-muted-foreground"
              )}>
                The Silentium
              </span>
            </div>
          </Link>

          {/* Navigation links for logged-in users */}
          {user && (
            <nav className="hidden items-center gap-1 md:flex">
              <Button asChild variant="ghost" size="sm" className={isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""}>
                <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              {role === "student" && (
                <>
                  <Button asChild variant="ghost" size="sm" className={isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""}>
                    <Link to="/focus">
                      <Target className="mr-2 h-4 w-4" />
                      Focus Hub
                    </Link>
                  </Button>
                   <Button asChild variant="ghost" size="sm" className={isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""}>
                     <Link to="/book">Book Seat</Link>
                   </Button>
                 </>
               )}
               <Button asChild variant="ghost" size="sm" className={isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""}>
                 <Link to="/support">
                   <HelpCircle className="mr-2 h-4 w-4" />
                   Support
                 </Link>
               </Button>
             </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle isTransparent={isTransparent} />

          {/* Desktop user menu */}
          {user && !isMobile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(
                  "focus-ring",
                  isTransparent ? "text-white hover:text-white hover:bg-white/10" : ""
                )}>
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground capitalize">{role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to={role === "admin" ? "/admin" : "/dashboard"}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {role === "student" && (
                  <DropdownMenuItem asChild>
                    <Link to="/focus">
                      <Target className="mr-2 h-4 w-4" />
                      Focus Hub
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : !user && !isMobile ? (
            <Button asChild size="sm" className={cn(
              isTransparent ? "bg-white/10 text-white border-white/30 hover:bg-white/20" : ""
            )}>
              <Link to="/login">Sign in</Link>
            </Button>
          ) : null}

          {/* Mobile menu */}
          {isMobile && <MobileNav />}
        </div>
      </div>
    </header>
  );
}
