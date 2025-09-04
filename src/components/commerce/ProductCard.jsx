import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

import { toast } from "sonner";
const API_URL = process.env.REACT_APP_BACKEND_URL;

const StarRating = ({ rating }) => {
  const fullStars = Math.round(rating);
  return (
    <div
      aria-label={`Rating ${rating} out of 5`}
      className="text-sm text-muted-foreground"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < fullStars ? "★" : "☆"}</span>
      ))}
    </div>
  );
};

const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  return (
    <Card className="overflow-hidden card-elevated">
      <Link
        to={`/product/${product.id}`}
        className="block aspect-[4/3] overflow-hidden"
      >
        <img
          src={`${API_URL}/products/uploads/products/${product.product_picture}`}
          alt={`${product.product_name} product image`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </Link>
      <CardHeader className="space-y-2">
        <CardTitle className="text-base leading-snug">
          <Link to={`/product/${product.id}`}>{product.product_name}</Link>
        </CardTitle>
        {/* <StarRating rating={product.rating} /> */}
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <p className="text-lg font-semibold">{product.product_price} DA</p>
      </CardContent>
      <CardFooter>
        <Button
          variant="hero"
          className="w-full"
          onClick={() => {
            addItem(product, 1);
            toast.success(`${product.product_name} added to cart`);
          }}
          aria-label={`Add ${product.product_name} to cart`}
        >
          Add to cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
