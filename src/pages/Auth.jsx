import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const { user, register, login } = useAuth();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const from = search.get("from") || "/";

  useEffect(() => {
    if (user) navigate(from);
  }, [user, from, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name"));
    const email = String(fd.get("email"));
    const username = String(fd.get("username"));
    const phone = String(fd.get("phone"));
    const password = String(fd.get("password"));
    try {
      setLoading(true);
      await register(name, email, username, phone, password);
      toast.success("Welcome to NovaShop!");
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email"));
    const password = String(fd.get("password"));
    try {
      setLoading(true);
      await login(email, password);
      toast.success("Signed in");
      navigate(from);
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto py-10">
        <section className="max-w-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Account</h1>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="register">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm">Email</label>
                  <Input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="text-sm">Password</label>
                  <Input
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register" className="mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm">Full name</label>
                  <Input type="text" name="name" required autoComplete="name" />
                </div>
                <div>
                  <label className="text-sm">Email</label>
                  <Input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="text-sm">Username</label>
                  <Input
                    type="text"
                    name="username"
                    required
                    autoComplete="username"
                  />
                </div>
                <div>
                  <label className="text-sm">Phone</label>
                  <Input
                    type="number"
                    name="phone"
                    required
                    autoComplete="phone"
                  />
                </div>
                <div>
                  <label className="text-sm">Password</label>
                  <Input
                    type="password"
                    name="password"
                    required
                    autoComplete="new-password"
                  />
                </div>
                <Button type="submit" variant="hero" disabled={loading}>
                  {loading ? "Creating..." : "Create account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
