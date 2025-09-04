import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/commerce/ProductCard";
import CartDrawer from "@/components/commerce/CartDrawer";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const heroRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minRating, setMinRating] = useState("0");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState([]);

  // Price bounds from catalog
  const minPriceAll = useMemo(() => {
    if (!products.length) return 0; // fallback
    return Math.min(...products.map((p) => p.product_price));
  }, [products]);

  const maxPriceAll = useMemo(() => {
    if (!products.length) return 1000; // fallback
    return Math.max(...products.map((p) => p.product_price));
  }, [products]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load data from API (note: comment mentioned localStorage, but code is fetching from API)
        const res = await fetch(`${API_URL}/products`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to fetch data"); // Updated error message to match GET operation
        }
        const req = await res.json();

        // Handle different possible response structures
        if (req.products) {
          setProducts(req.products);
          // console.log("Products set:", req.products.length);
        } else if (Array.isArray(req)) {
          setProducts(req);
          // console.log("Products set (direct array):", req.length);
        } else {
          // console.log("Unexpected API response structure:", req);
          setProducts([]);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]); // Set empty array on error
      }
    };
    loadData();
  }, []);

  // Log price bounds after products are loaded
  useEffect(() => {
    if (products.length > 0) {
      // console.log("Min price:", minPriceAll);
      // console.log("Max price:", maxPriceAll);
    }
  }, [minPriceAll, maxPriceAll, products.length]);

  // Interactive hero pointer effect
  const onMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    heroRef.current.style.setProperty("--pointer-x", `${x}px`);
    heroRef.current.style.setProperty("--pointer-y", `${y}px`);
  };

  // Initialize price slider once based on catalog
  useEffect(() => {
    if (products.length > 0 && minPriceAll !== 0 && maxPriceAll !== 1000) {
      // console.log("Setting price range:", [minPriceAll, maxPriceAll]);
      setPriceRange([minPriceAll, maxPriceAll]);
    }
  }, [minPriceAll, maxPriceAll, products.length]);

  // Sync query from URL (?q=)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Derived filtered products
  const filteredProducts = useMemo(() => {
    // console.log("Filtering products:", {
    //   totalProducts: products.length,
    //   query: query.trim(),
    //   priceRange,
    //   minRating: minRating,
    // });

    const q = query.trim().toLowerCase();
    const [minP, maxP] = priceRange;
    const minR = parseFloat(minRating) || 0;

    const filtered = products.filter((p) => {
      // Make sure product_name exists and is a string
      const productName = p.product_name
        ? String(p.product_name).toLowerCase()
        : "";
      const nameMatch = q === "" || productName.includes(q);
      const priceMatch = p.product_price >= minP && p.product_price <= maxP;
      const ratingMatch = (p.rating || 0) >= minR;

      // console.log(
      //   `Product "${
      //     p.product_name
      //   }": name="${nameMatch}" (searching "${q}" in "${productName}"), price=${priceMatch} (${
      //     p.product_price
      //   } in [${minP}, ${maxP}]), rating=${ratingMatch} (${
      //     p.rating || 0
      //   } >= ${minR})`
      // );

      return nameMatch && priceMatch && ratingMatch;
    });

    // console.log("Filtered products:", filtered.length);
    return filtered;
  }, [products, query, priceRange, minRating]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [query, priceRange, minRating]);

  // Pagination
  const pageSize = 6;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () =>
      filteredProducts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      ),
    [filteredProducts, currentPage]
  );

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is NovaShop?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "NovaShop is a modern e-commerce storefront demo built with React.",
        },
      },
      {
        "@type": "Question",
        name: "Do you ship internationally?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, we ship to most countries worldwide.",
        },
      },
    ],
  };

  return (
    <div>
      <Header />
      <main>
        {/* Hero */}
        <section
          ref={heroRef}
          onMouseMove={onMouseMove}
          className="surface-hero border-b border-border"
        >
          <div className="container mx-auto py-20 md:py-28">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Modern products for everyday life
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Discover our curated selection of tech and lifestyle essentials
                designed to elevate your daily routine.
              </p>
              <div className="flex gap-3">
                <a href="#featured">
                  <button className="btn-hero h-11 px-6 rounded-md">
                    Shop new arrivals
                  </button>
                </a>
                <a
                  href="#featured"
                  className="h-11 inline-flex items-center justify-center rounded-md border border-input px-6 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Browse all
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* All products with filters */}
        <section id="featured" className="container mx-auto py-12 md:py-16">
          <h2 className="text-2xl font-semibold mb-6">Featured</h2>

          {/* Filters */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Search
              </label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                aria-label="Search products"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Price: ${priceRange[0]} - ${priceRange[1]}
              </label>
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                min={minPriceAll}
                max={maxPriceAll}
                step={1}
                aria-label="Price range"
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-2">
                Minimum rating
              </label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger aria-label="Minimum rating">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any</SelectItem>
                  <SelectItem value="4">4.0+</SelectItem>
                  <SelectItem value="4.5">4.5+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <button
                className="btn-hero h-10 px-4 rounded-md"
                onClick={() => {
                  setQuery("");
                  setMinRating("0");
                  setPriceRange([minPriceAll, maxPriceAll]);
                  setSearchParams({});
                }}
              >
                Clear filters
              </button>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {paginated.length} of {filteredProducts.length} products
          </p>

          {/* Grid - Fixed to use paginated products instead of all products */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.length > 0 ? (
              paginated.map((p) => (
                <ProductCard key={p.id || p.product_name} product={p} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  {products.length === 0
                    ? "Loading products..."
                    : "No products found matching your criteria."}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <nav
            className="mt-8 flex items-center justify-center gap-2"
            aria-label="Pagination"
          >
            <button
              className="h-10 rounded-md border border-input px-3 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              onClick={() => setPage((n) => Math.max(1, n - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const num = i + 1;
              const active = num === currentPage;
              return (
                <button
                  key={num}
                  className={
                    "h-10 min-w-10 rounded-md border border-input px-3 " +
                    (active
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground")
                  }
                  onClick={() => setPage(num)}
                  aria-current={active ? "page" : undefined}
                >
                  {num}
                </button>
              );
            })}
            <button
              className="h-10 rounded-md border border-input px-3 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              onClick={() => setPage((n) => Math.min(totalPages, n + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </nav>
        </section>
      </main>
      <Footer />
      <CartDrawer />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
};

export default Index;
