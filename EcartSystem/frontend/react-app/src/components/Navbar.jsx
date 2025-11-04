import { NavLink } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { useCart } from '../state/CartContext'

export default function Navbar() {
  const { user } = useAuth()
  const { items } = useCart()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="text-2xl font-bold text-brand">
            E‑Cart
          </NavLink>
          <div className="hidden md:flex items-center gap-4">
            <NavLink to="/" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
              Products
            </NavLink>
            <NavLink to="/offers" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
              Offers
            </NavLink>
            <NavLink to="/delivery" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
              Delivery
            </NavLink>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NavLink to="/cart" className={({isActive}) => `relative ${isActive ? 'text-brand' : 'text-slate-600 hover:text-brand'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13l-1.1 5M7 13h10m0 0v8a2 2 0 01-2 2H9a2 2 0 01-2-2v-8z" />
            </svg>
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </NavLink>

          <NavLink to="/orders" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
            Orders
          </NavLink>

          <NavLink to="/admin" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
            Admin
          </NavLink>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-600">Hi, {user.name}</span>
              <NavLink to="/profile" className={({isActive}) => isActive ? 'text-brand font-medium' : 'text-slate-600 hover:text-brand'}>
                Profile
              </NavLink>
            </div>
          ) : (
            <NavLink to="/login" className="btn">
              Login
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}
