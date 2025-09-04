import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Custom table components
const Table = ({ children, className = "" }) => (
  <div className={`w-full overflow-auto ${className}`}>
    <table className="w-full caption-bottom text-sm">{children}</table>
  </div>
);

const TableHeader = ({ children }) => (
  <thead className="[&_tr]:border-b">{children}</thead>
);

const TableBody = ({ children }) => (
  <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
);

const TableRow = ({ children, className = "" }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = "" }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>
    {children}
  </td>
);
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  X,
  Loader2,
  Package,
  ShoppingCart,
  CreditCard,
  Calendar,
  MapPin,
  User,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

const Dashboard = () => {
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Get user ID safely
  const getUserId = () => {
    try {
      const user = JSON.parse(localStorage.getItem("novashop_user") || "{}");
      return user.id || null;
    } catch {
      return null;
    }
  };

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const [newProduct, setNewProduct] = useState({
    product_name: "",
    product_description: "",
    product_price: "",
    add_by_user: getUserId(),
  });

  // Pagination settings
  const itemsPerPage = 6;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = orders.slice(startIndex, endIndex);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_URL}/products`, {
        method: "GET",
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch products");
      }

      const req = await res.json();
      setProducts(req.products || []);
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataOrders = async () => {
    try {
      const token = localStorage.getItem("novashop_token");
      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/order`, {
        method: "GET",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to fetch orders");
      }

      const req = await res.json();
      console.log(req);

      setOrders(req.orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    }
  };

  useEffect(() => {
    loadData();
    loadDataOrders();
  }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (
      !newProduct.product_name ||
      !newProduct.product_description ||
      !newProduct.product_price
    ) {
      return;
    }

    if (!getUserId()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      if (selectedFile) {
        formData.append("pictures", selectedFile);
      }
      formData.append("product_name", newProduct.product_name);
      formData.append("product_description", newProduct.product_description);
      formData.append("product_price", newProduct.product_price);
      formData.append("add_by_user", getUserId());

      const token = localStorage.getItem("novashop_token");
      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: {
          "x-auth-token": token,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add product");
      }

      // Reset form
      setNewProduct({
        product_name: "",
        product_description: "",
        product_price: "",
        add_by_user: getUserId(),
      });
      setSelectedFile(null);
      setImagePreview(null);

      // Reset file input
      const fileInput = document.getElementById("product_picture");
      if (fileInput) fileInput.value = "";

      // Reload products
      await loadData();
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    const fileInput = document.getElementById("product_picture");
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const token = localStorage.getItem("novashop_token");
      if (!token) {
        return;
      }

      const res = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        headers: {
          "x-auth-token": token,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      await loadData();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleStatusChange = async (
    orderId,
    newStatus,
    isPaymentStatus = false
  ) => {
    try {
      // Update locally first for immediate feedback
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              ...(isPaymentStatus
                ? { payment_status: newStatus }
                : { status: newStatus }),
            }
          : order
      );
      setOrders(updatedOrders);
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => handlePageChange(i)}
              isActive={currentPage === i}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => handlePageChange(1)}
            isActive={currentPage === 1}
            className="cursor-pointer hover:bg-primary/10 transition-colors"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          items.push(
            <PaginationItem key={i}>
              <PaginationLink
                onClick={() => handlePageChange(i)}
                isActive={currentPage === i}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
              >
                {i}
              </PaginationLink>
            </PaginationItem>
          );
        }
      }

      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => handlePageChange(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer hover:bg-primary/10 transition-colors"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "pending":
        return "default";
      case "processed":
        return "secondary";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "processed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Dashboard
            </h1>
            <p className="text-slate-600">
              Manage your products and orders with ease
            </p>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl p-1">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger
              value="add-product"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Add Product
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg transition-all duration-300 flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-white/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  All Products ({products.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                      <span className="text-slate-600">
                        Loading products...
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20 hover:bg-slate-50/50">
                          <TableHead className="font-semibold text-slate-700">
                            Image
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Name
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Description
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Price
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Added By
                          </TableHead>
                          <TableHead className="font-semibold text-slate-700">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow
                            key={product.id}
                            className="border-white/20 hover:bg-slate-50/50 transition-colors"
                          >
                            <TableCell>
                              {product.product_picture ? (
                                <img
                                  src={`${API_URL}/products/uploads/products/${product.product_picture}`}
                                  alt={product.product_name}
                                  className="w-16 h-16 object-cover rounded-xl border border-white/20 shadow-md"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <div
                                className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center text-xs font-medium text-slate-500 shadow-md border border-white/20"
                                style={{
                                  display: product.product_picture
                                    ? "none"
                                    : "flex",
                                }}
                              >
                                No Image
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-slate-800">
                              {product.product_name}
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-slate-600">
                              {product.product_description}
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {product.product_price} DA
                            </TableCell>
                            <TableCell className="text-slate-600">
                              {product.add_by_user}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteProduct(product.id)}
                                className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors border-slate-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {products.length === 0 && !isLoading && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="text-center text-slate-500 py-16"
                            >
                              <div className="flex flex-col items-center gap-4">
                                <Package className="w-16 h-16 text-slate-300" />
                                <div>
                                  <p className="text-lg font-medium">
                                    No products added yet
                                  </p>
                                  <p className="text-sm text-slate-400">
                                    Start by adding your first product
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-product" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-white/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  Add New Product
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleAddProduct} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label
                        htmlFor="product_name"
                        className="text-slate-700 font-medium"
                      >
                        Product Name *
                      </Label>
                      <Input
                        id="product_name"
                        value={newProduct.product_name}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            product_name: e.target.value,
                          })
                        }
                        placeholder="Enter product name"
                        required
                        disabled={isSubmitting}
                        className="bg-white/50 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label
                        htmlFor="product_price"
                        className="text-slate-700 font-medium"
                      >
                        Price (DA) *
                      </Label>
                      <Input
                        id="product_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={newProduct.product_price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            product_price: e.target.value,
                          })
                        }
                        placeholder="0.00"
                        required
                        disabled={isSubmitting}
                        className="bg-white/50 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="product_description"
                      className="text-slate-700 font-medium"
                    >
                      Description *
                    </Label>
                    <Input
                      id="product_description"
                      value={newProduct.product_description}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          product_description: e.target.value,
                        })
                      }
                      placeholder="Product description"
                      required
                      disabled={isSubmitting}
                      className="bg-white/50 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl h-12"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label
                      htmlFor="product_picture"
                      className="text-slate-700 font-medium"
                    >
                      Product Image
                    </Label>
                    {imagePreview && (
                      <div className="relative inline-block mb-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-40 h-40 object-cover rounded-2xl border border-white/20 shadow-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-8 w-8 rounded-full p-0 shadow-lg"
                          onClick={removeSelectedFile}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Input
                        id="product_picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="bg-white/50 border-white/20 focus:border-blue-400 rounded-xl h-12 file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:text-sm file:bg-gradient-to-r file:from-blue-500 file:to-purple-500 file:text-white hover:file:from-blue-600 hover:file:to-purple-600 file:transition-all"
                        disabled={isSubmitting}
                      />
                      {selectedFile && (
                        <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 border border-slate-200">
                          <strong>{selectedFile.name}</strong> -{" "}
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Adding Product...
                      </>
                    ) : (
                      <>
                        <Package className="mr-2 h-5 w-5" />
                        Add Product
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6 mt-6">
            <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/20">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  Orders ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {paginatedOrders.map((order) => (
                    <Card
                      key={order.id}
                      className="bg-gradient-to-r from-white to-slate-50/50 border border-white/40 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <CardTitle className="text-xl flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <ShoppingCart className="w-4 h-4 text-white" />
                              </div>
                              Order #{order.id}
                            </CardTitle>
                            <div className="space-y-1 text-sm text-slate-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{order.shippingAddress}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    order.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right space-y-3">
                            <p className="text-2xl font-bold text-green-600">
                              {order.totalAmount} DA
                            </p>

                            {/* Shipping Status */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm text-slate-600 font-medium">
                                  Shipping:
                                </span>
                                <Badge
                                  className={`px-3 py-1 text-sm font-medium border ${getStatusColor(
                                    order.status || "pending"
                                  )}`}
                                >
                                  {(order.status || "pending")
                                    .charAt(0)
                                    .toUpperCase() +
                                    (order.status || "pending").slice(1)}
                                </Badge>
                              </div>
                              <Select
                                value={order.status || "pending"}
                                onValueChange={(value) =>
                                  handleStatusChange(order.id, value, false)
                                }
                              >
                                <SelectTrigger className="w-36 h-8 bg-white/80 border-slate-200 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 shadow-lg z-50">
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="processed">
                                    Processed
                                  </SelectItem>
                                  <SelectItem value="shipped">
                                    Shipped
                                  </SelectItem>
                                  <SelectItem value="delivered">
                                    Delivered
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Payment Status */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 justify-end">
                                <span className="text-sm text-slate-600 font-medium">
                                  Payment:
                                </span>
                                <Badge
                                  className={`px-3 py-1 text-sm font-medium border ${getPaymentStatusColor(
                                    order.paymentStatus || "pending"
                                  )}`}
                                >
                                  {order.paymentStatus || "pending"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="flex items-center gap-2 hover:bg-slate-50 border-slate-200"
                          >
                            {expandedOrders.has(order.id) ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Hide Details
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" />
                                View Details
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>

                      {expandedOrders.has(order.id) && (
                        <CardContent className="pt-0 border-t border-slate-100">
                          <div className="space-y-4">
                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                              <Package className="w-4 h-4" />
                              Order Items:
                            </h4>
                            {order.OrderItems?.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center py-3 px-4 bg-slate-50/50 rounded-xl border border-slate-100"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                  <span className="font-medium text-slate-800">
                                    {item.productName}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium text-slate-800">
                                    {item.quantity} × {item.price} DA ={" "}
                                    {item.quantity * item.price} DA
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Unit price: {item.price} DA
                                  </div>
                                </div>
                              </div>
                            )) || (
                              <div className="text-center py-8 text-slate-500 bg-slate-50/50 rounded-xl border border-slate-100">
                                <Package className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                                <p>No items found</p>
                              </div>
                            )}

                            <div className="pt-4 border-t border-slate-100">
                              <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-slate-700">
                                  Total Amount:
                                </span>
                                <span className="text-green-600">
                                  {order.totalAmount} DA
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}

                  {orders.length === 0 && (
                    <div className="text-center py-16 text-slate-500">
                      <div className="flex flex-col items-center gap-4">
                        <ShoppingCart className="w-20 h-20 text-slate-300" />
                        <div>
                          <p className="text-xl font-medium text-slate-600">
                            No orders found
                          </p>
                          <p className="text-sm text-slate-400">
                            Orders will appear here when customers place them
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 space-y-4">
                    <Pagination>
                      <PaginationContent className="gap-2">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                            className={`${
                              currentPage === 1
                                ? "pointer-events-none opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                            } transition-all duration-200 rounded-lg border-slate-200`}
                          />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            className={`${
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600"
                            } transition-all duration-200 rounded-lg border-slate-200`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>

                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
                        <span className="text-sm font-medium text-slate-600">
                          Showing {startIndex + 1} to{" "}
                          {Math.min(endIndex, orders.length)} of {orders.length}{" "}
                          orders
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
