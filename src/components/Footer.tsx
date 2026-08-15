import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">E-Cart</h3>
            <p className="text-sm text-gray-400 mb-4">
              Your one-stop destination for quality products and amazing deals.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail size={18} />
                <a href="mailto:info@ecart.com" className="text-sm hover:text-blue-400">
                  info@ecart.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} />
                <a href="tel:+919876543210" className="text-sm hover:text-blue-400">
                  +91 98765 43210
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span className="text-sm">New Delhi, India</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-blue-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/search" className="hover:text-blue-400 transition-colors">
                  Shop
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-blue-400 transition-colors">
                  My Orders
                </a>
              </li>
              <li>
                <a href="/wishlist" className="hover:text-blue-400 transition-colors">
                  Wishlist
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Returns & Exchange
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-400 transition-colors">
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="border-t border-gray-700 pt-8 mb-8">
          <h4 className="text-lg font-bold text-white mb-4">Follow Us</h4>
          <div className="flex gap-4">
            <a
              href="#"
              className="bg-gray-800 hover:bg-blue-600 p-2 rounded-full transition-colors"
              title="Facebook"
            >
              <Facebook size={20} />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-sky-400 p-2 rounded-full transition-colors"
              title="Twitter"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-pink-600 p-2 rounded-full transition-colors"
              title="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              className="bg-gray-800 hover:bg-blue-700 p-2 rounded-full transition-colors"
              title="LinkedIn"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © 2024 E-Cart. All rights reserved.
          </div>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1">
              🔒 Secure Payments
            </span>
            <span className="flex items-center gap-1">
              📦 Fast Delivery
            </span>
            <span className="flex items-center gap-1">
              ✅ Verified Sellers
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
