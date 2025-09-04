import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CheckCircle, ArrowRight, Home } from "lucide-react";
import { toast } from "sonner";

const PaymentSuccess = () => {
  const { clear } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart on successful payment
    // clear();
    toast.success("Payment completed successfully!");
  }, [clear]);

  return (
    <div>
      <Header />
      <main className="container mx-auto py-16 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Thank you for your purchase. Your order has been processed
                successfully.
              </p>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => navigate("/")}>
                  <Home className="w-4 h-4 mr-2" />
                  Continue Shopping
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
