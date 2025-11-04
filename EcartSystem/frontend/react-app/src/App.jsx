import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import ProductList from './components/ProductList'
import CartPage from './components/CartPage'
import PaymentPage from './components/PaymentPage'
import AdminDashboard from './components/AdminDashboard'
import OrderTracking from './components/OrderTracking'
import OrdersPage from './components/OrdersPage'
import ProductDetails from './components/ProductDetails'
import InvoicePage from './components/InvoicePage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import ProfilePage from './components/ProfilePage'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Offers from './components/Offers'
import Delivery from './components/Delivery'
import { AuthProvider, useAuth } from './state/AuthContext'
import { CartProvider, useCart } from './state/CartContext'

function ProtectedAdmin({ children }){ return children }

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen grid grid-rows-[auto,1fr,auto]">
          <Navbar />
          <main className="max-w-6xl mx-auto w-full px-4 py-6">
            <Routes>
              <Route index element={<ProductList/>} />
              <Route path="/p/:id" element={<ProductDetails/>} />

              <Route path="/cart" element={<CartPage/>} />
              <Route path="/pay" element={<PaymentPage/>} />
              <Route path="/orders" element={<OrdersPage/>} />
              <Route path="/order/:id" element={<OrderTracking/>} />
              <Route path="/order/:id/invoice" element={<InvoicePage/>} />
              <Route path="/offers" element={<Offers/>} />
              <Route path="/delivery" element={<Delivery/>} />
              <Route path="/delivery/:orderId" element={<Delivery/>} />
              <Route path="/admin" element={<ProtectedAdmin><AdminDashboard/></ProtectedAdmin>} />
              <Route path="/login" element={<LoginPage/>} />
              <Route path="/register" element={<RegisterPage/>} />
              <Route path="/profile" element={<ProfilePage/>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}


