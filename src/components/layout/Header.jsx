import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const Header = () => {
  const { totalQty, open } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("novashop_user"));
    if (user && user.role === "ADMIN") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  return (
    <header className="border-b border-border sticky top-0 z-40 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <ShoppingBag className="text-primary" />
          <span>NovaShop</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 w-[420px]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products"
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const val = e.currentTarget.value.trim();
                  navigate(val ? `/?q=${encodeURIComponent(val)}` : "/");
                }
              }}
              aria-label="Search"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/">Home</Link>
          </Button>
          {isAdmin && (
            <Button variant="ghost" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
          )}
          <Button variant="ghost" asChild>
            <a href="#featured">Shop</a>
          </Button>
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/checkout")}>
                Checkout
              </Button>
              <Button variant="ghost" onClick={logout} aria-label="Logout">
                <User />
                <span className="ml-1 hidden sm:inline">Sign out</span>
              </Button>
            </div>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          <Button variant="outline" onClick={open} aria-label="Open cart">
            <ShoppingBag />
            <span className="sr-only">Cart</span>
            {totalQty > 0 && <span className="ml-2 text-sm">{totalQty}</span>}
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
