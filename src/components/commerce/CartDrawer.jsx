import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CartDrawer = () => {
  const { isOpen, close, items, updateQty, removeItem, subtotal, clear } =
    useCart();
  const navigate = useNavigate();
  const [isClearing, setIsClearing] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleClear = () => {
    clear();
    setIsClearing(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (!open ? close() : null)}>
      <SheetContent className="flex flex-col gap-6">
        <SheetHeader>
          <SheetTitle>
            Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-auto space-y-6 pr-2">
          {items.length === 0 ? (
            <p className="text-muted-foreground text-center">
              Your cart is empty. Start shopping!
            </p>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-4 border-b pb-4 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={`${item.name} thumbnail`}
                    className="w-20 h-16 object-cover rounded-md border shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.price.toFixed(0)} DA
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQty(
                            item.productId,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        aria-label="Decrease quantity"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="min-w-6 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateQty(item.productId, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="font-semibold">
                      {(item.price * item.quantity).toFixed(0)} DA
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.productId)}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <Separator />
        <SheetFooter className="space-y-0">
          <div className="flex items-center justify-between">
            <span
              className="text-muted-foreground "
              style={{ marginRight: 10 }}
            >
              Subtotal
            </span>
            <span className="text-lg font-semibold">
              {subtotal.toFixed(0)} DA
            </span>
          </div>
          <div className="flex gap-3">
            <AlertDialog open={isClearing} onOpenChange={setIsClearing}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsClearing(true)}
                >
                  Clear
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Cart?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove all items from your cart?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClear}>
                    Clear
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="hero"
              className="flex-1"
              onClick={() => {
                close();
                navigate("/checkout");
              }}
              disabled={items.length === 0}
            >
              Checkout
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
