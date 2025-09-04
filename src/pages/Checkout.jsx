import { useEffect, useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Loader2, CreditCard, Shield } from "lucide-react";

const Checkout = () => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search] = useSearchParams();

  // Form state
  const [shippingDetails, setShippingDetails] = useState({
    fullName: localStorage.getItem("novashop_user")?.full_name,
    email: localStorage.getItem("novashop_user")?.email,
    address: "",
    city: "",
    postalCode: "",
    phone: localStorage.getItem("novashop_user")?.phone_number,
  });
  useEffect(() => {
    setShippingDetails((prev) => ({
      ...prev,
      fullName: user?.full_name || "",
      email: user?.email || "",
      phone: user?.phone_number || "",
    }));
  }, []);

  // Payment state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.info("Please sign in to checkout");
      navigate(`/auth?from=/checkout`);
    }
  }, [user, navigate]);

  // Check for payment success from URL params
  useEffect(() => {
    const status = search.get("status");
    const orderId = search.get("order_id");

    if (status === "success" && orderId) {
      setPaymentSuccess(true);
      toast.success("Payment successful! Thank you for your order.");
      clear(); // Clear cart on successful payment
    } else if (status === "failed") {
      toast.error("Payment failed. Please try again.");
    } else if (status === "cancelled") {
      toast.info("Payment cancelled.");
    }
  }, [search, clear]);

  const total = useMemo(() => subtotal, [subtotal]);

  const handleInputChange = (field, value) => {
    setShippingDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const required = ["fullName", "email", "address", "city", "phone"];
    const missing = required.filter((field) => !shippingDetails[field].trim());

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingDetails.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Basic phone validation (Algerian format)
    const phoneRegex = /^(0|\+213)[5-7][0-9]{8}$/;
    if (!phoneRegex.test(shippingDetails.phone)) {
      toast.error("Please enter a valid Algerian phone number");
      return false;
    }

    return true;
  };

  const createChargilyPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      // Prepare order data
      const orderData = {
        userId: 1,
        totalAmount: total,
        shippingAddress: shippingDetails.address,
        items: items,
      };

      console.log(orderData);

      // Call your backend API to create Chargily payment
      const request = await fetch(`${API_URL}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!request.ok) {
        throw new Error("Failed to create payment");
      }

      const response = await request.json();
      const { paymentLink } = response.data;

      // Redirect to Chargily payment page
      window.location.href = paymentLink;
    } catch (error) {
      console.error("Payment creation error:", error);
      toast.error("Failed to initialize payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return null;

  if (paymentSuccess) {
    return (
      <div>
        <Header />
        <main className="container mx-auto py-10 text-center">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-green-600">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. You will receive a confirmation email
              shortly.
            </p>
            <Button onClick={() => navigate("/")} variant="hero">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <section className="md:col-span-2 space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    placeholder="Full name *"
                    value={shippingDetails.fullName}
                    onChange={(e) =>
                      handleInputChange("fullName", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Email *"
                    type="email"
                    value={shippingDetails?.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  <Input
                    placeholder="Phone number * (e.g., 0555123456)"
                    value={shippingDetails?.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="Address *"
                    value={shippingDetails?.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="sm:col-span-2"
                  />
                  <Input
                    placeholder="City *"
                    value={shippingDetails?.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                  />
                  <Input
                    placeholder="Postal code"
                    value={shippingDetails?.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  * Required fields
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Payment Method</h2>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Payment Online</p>
                      <p className="text-sm text-muted-foreground">
                        Secure payment via CCP, EDAHABIA, or international cards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>
                      Your payment information is secure and encrypted
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <aside className="space-y-4">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3">
                {items.map((i) => (
                  <div key={i.id} className="flex items-center gap-3">
                    <img
                      src={i.image}
                      alt={`${i.name} thumbnail`}
                      className="w-16 h-12 object-cover rounded-md border"
                    />
                    <div className="flex-1">
                      <p className="font-medium leading-tight">{i.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Qty {i.quantity}
                      </p>
                    </div>
                    <div className="font-medium">
                      {(i.price * i.quantity).toLocaleString("DZ")} DA
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">
                    {total.toLocaleString("DZ")} DA
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold">
                    {total.toLocaleString("DZ")} DA
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={createChargilyPayment}
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-0" />
                      Payment
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    clear();
                    toast.success("Cart cleared");
                  }}
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
