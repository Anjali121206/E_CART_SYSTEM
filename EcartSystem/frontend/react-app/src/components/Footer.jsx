export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">E‑Cart</h3>
            <p className="text-slate-600 text-sm">
              Your one-stop shop for all your needs. Quality products, fast delivery, great prices.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="/" className="hover:text-brand">Products</a></li>
              <li><a href="/offers" className="hover:text-brand">Offers</a></li>
              <li><a href="/delivery" className="hover:text-brand">Delivery</a></li>
              <li><a href="/orders" className="hover:text-brand">Orders</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Support</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand">Help Center</a></li>
              <li><a href="#" className="hover:text-brand">Contact Us</a></li>
              <li><a href="#" className="hover:text-brand">Track Order</a></li>
              <li><a href="#" className="hover:text-brand">Returns</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-brand">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-brand">Terms of Service</a></li>
              <li><a href="#" className="hover:text-brand">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-6 text-center text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} E‑Cart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
