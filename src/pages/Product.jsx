import { useParams } from "react-router-dom";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { toast } from "sonner";
import { useEffect, useState } from "react";
const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState([]);

  const { addItem } = useCart();

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data from API (note: comment mentioned localStorage, but code is fetching from API)
        const res = await fetch(`${API_URL}/products/${id}`, {
          method: "GET",
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch data"); // Updated error message to match GET operation
        }
        const req = await res.json();
        // console.log("API Response:", req); // Debug log
        setProduct(req.product);
      } catch (error) {
        console.error("Error loading products:", error);
        setProduct(req.products);
        []; // Set empty array on error
      }
    };
    loadData();
  }, []);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Product not found.</p>
      </div>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.product_name,
    image: [product.product_picture],
    description: product.product_description,
    offers: {
      "@type": "Offer",
      priceCurrency: "DZD",
      price: product.product_price,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div>
      <Header />
      <main className="container mx-auto py-10">
        <section className="grid md:grid-cols-2 gap-10">
          <div className="aspect-[4/3] overflow-hidden rounded-lg border">
            <img
              src={`${API_URL}/products/uploads/products/${product.product_picture}`}
              alt={`${product.product_name} large image`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h1 className="text-3xl font-bold">{product.product_name}</h1>
            <p className="text-xl font-semibold">{product.product_price} DA</p>
            <p className="text-muted-foreground leading-relaxed">
              {product.product_description}
            </p>
            <div className="flex gap-3">
              <Button
                variant="hero"
                onClick={() => {
                  addItem(product, 1);
                  toast.success(`${product.product_name} added to cart`);
                }}
              >
                Add to cart
              </Button>
              <Button variant="outline">Add to wishlist</Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
};

export default ProductPage;
