import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoadingProvider } from './contexts/LoadingContext';
import GlobalLoader from './components/GlobalLoader';
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Reviews from "./pages/Reviews";
import AdminDashboard from "./pages/AdminDashboard";
import AllUsers from "./pages/AllUsers";
import AdminReviews from "./pages/AdminReviews";
import AddInventory from "./pages/AddInventory";
import Products from "./pages/Products";
import Checkout from "./pages/Checkout"; // Naya Checkout page import kiya
import OrderHistory from "./pages/Orderhistory"; // Naya OrderHistory page import kiya
import AdminOrders from "./pages/AdminOrders";
import AdminHelp from "./pages/AdminHelp";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";

function App() {
  return (
    <LoadingProvider>
      <BrowserRouter>
        <GlobalLoader />
        <Routes>
        {/* AUTH */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER ROUTES */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/products" element={<Products />} />
        
        {/* CHECKOUT - Buy Now click karne par yahan aaye ga */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/order-history" element={<OrderHistory />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AllUsers />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/inventory" element={<AddInventory />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/help" element={<AdminHelp />} />

        </Routes>
      </BrowserRouter>
    </LoadingProvider>
  );
}

export default App;