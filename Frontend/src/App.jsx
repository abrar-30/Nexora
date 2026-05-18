import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import Spinner from "./components/ui/Spinner";

const Layout = lazy(() => import("./components/Layout"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ProductsPage = lazy(() => import("./pages/ProductsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminProductsPage = lazy(() =>
  import("./pages/admin/Product/AdminProductsPage"),
);
const AdminCategoriesPage = lazy(() =>
  import("./pages/admin/AdminCategoriesPage"),
);
const AdminBrandsPage = lazy(() => import("./pages/admin/AdminBrandsPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminProductEditPage = lazy(() =>
  import("./pages/admin/Product/AdminProductEditPage"),
);
const AdminProductCreatePage = lazy(() =>
  import("./pages/admin/Product/AdminProductCreatePage"),
);
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const AdminStockPage = lazy(() => import("./pages/admin/AdminStockPage"));
const AdminOrdersPage = lazy(() => import("./pages/admin/AdminOrdersPage"));
const AdminPaymentsPage = lazy(() => import("./pages/admin/AdminPaymentsPage"));
const AdminStockTransactionsPage = lazy(() => import("./pages/admin/AdminStockTransactionsPage"));
const AdminUnitsPage = lazy(() => import("./pages/admin/Unit/AdminUnitsPage"));
const AdminTaxSlabsPage = lazy(() =>
  import("./pages/admin/TaxSlab/AdminTaxSlabsPage"),
);
const AdminCitiesPage = lazy(() =>
  import("./pages/admin/Location/AdminCitiesPage"),
);
const AdminCountriesPage = lazy(() =>
  import("./pages/admin/Location/AdminCountriesPage"),
);
const AdminStatesPage = lazy(() =>
  import("./pages/admin/Location/AdminStatesPage"),
);
const AdminProductDetailPage = lazy(() =>
  import("./pages/admin/Product/ProductDetailPage"),
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Suspense fallback={<Spinner />}>
            <Routes>
            {/* Auth pages — no navbar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main layout with navbar */}
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />

              {/* Protected — coming soon */}
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <CartPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/success"
                element={
                  <ProtectedRoute>
                    <CheckoutSuccessPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/checkout/:productId?"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin — coming soon */}
              {/* <Route path="/admin/products" element={<AdminRoute><AdminProductsPage /></AdminRoute>} /> */}
            </Route>

            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route
                path="products/new"
                element={<AdminProductCreatePage />}
              />
              <Route
                path="products/edit/:id"
                element={<AdminProductEditPage />}
              />
              <Route path="products/:id" element={<AdminProductDetailPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="brands" element={<AdminBrandsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="stock" element={<AdminStockPage />} />
              <Route path="stock-transactions" element={<AdminStockTransactionsPage />} />
              <Route path="tax-slabs" element={<AdminTaxSlabsPage />} />
              <Route path="units" element={<AdminUnitsPage />} />
              <Route path="countries" element={<AdminCountriesPage />} />
              <Route path="states" element={<AdminStatesPage />} />
              <Route path="cities" element={<AdminCitiesPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
