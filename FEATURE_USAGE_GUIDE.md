# E-Cart System - Feature Usage Guide

## Quick Start

### Installation
```bash
cd E_CART_SYSTEM
npm install
npm run dev
```

### Backend Setup
Make sure your backend server is running on `http://localhost:8080` with the following endpoints configured.

---

## Feature Usage Guide

### 1. Shopping Cart with Offers

#### Accessing the Cart
- Navigate to `/` (home page)
- Cart displays all available products
- Each product can be added/removed or quantity adjusted

#### Applying Offers
1. View available offers in the right sidebar
2. Click "Apply" button on desired offer
3. Discount is calculated automatically
4. Summary shows:
   - Subtotal
   - Applied discount amount
   - Shipping cost
   - Final total

#### Offer Types
- **Coupon**: Use code at checkout
- **Threshold**: Automatic discount on minimum spend
- **BOGO**: Buy one item, get discount on second
- **Seasonal**: Time-limited promotional offers

---

### 2. Product Search & Discovery

#### Accessing Search
- Click "Shop" in navigation bar
- Or navigate to `/search`

#### Search Features
```
Search by:
- Product name
- Category
- Price range (slider)

Sort by:
- Relevance
- Price (Low to High)
- Price (High to Low)
- Rating

View options:
- Grid view (default)
- List view
```

#### Example Searches
```
// Search for electronics under ₹5000
Category: Electronics
Price: 0-5000

// Search for rated products
Sort by: Rating
```

#### Adding to Wishlist
1. Click heart icon on product card
2. Product added to localStorage
3. Access wishlist via `/wishlist`

---

### 3. Payment & Checkout

#### Checkout Process
1. Click "Checkout" button in cart
2. Review order summary
3. Select payment method:
   - UPI / Net Banking
   - Credit / Debit Card
   - Digital Wallet
   - Cash on Delivery (COD)
4. Click "Place Order"

#### Login Requirement
- Users must be logged in to checkout
- Redirects to login page if not authenticated
- Creates order record upon successful payment

#### Order Confirmation
```
Successful Order Response:
{
  "orderId": "ORD12345",
  "total": 4999.00,
  "subtotal": 5999.00,
  "discount": 1000.00,
  "shipping": 0.00,
  "paymentMethod": "upi",
  "status": "processing"
}
```

---

### 4. Delivery Tracking

#### Accessing Tracking
1. Navigate to `/orders` (Order History)
2. Click "Track" button on any order
3. Redirects to `/orders/:orderId/tracking`

#### Tracking Information
- Current delivery status
- Estimated delivery date
- Delivery agent details:
  - Name
  - Phone number
  - Vehicle information
- Current location
- Complete delivery timeline with timestamps

#### Status Flow
```
picked → in_transit → out_for_delivery → delivered
```

#### Tracking Features
- Real-time location updates
- Agent contact information
- Timeline with detailed events
- Support contact button

---

### 5. User Profile Management

#### Profile Page (`/profile`)
- View user information
- Update profile details
- Change password
- Manage addresses
- Payment methods

#### Actions Available
```
- Edit personal information
- Add/remove addresses
- Save payment methods
- View saved cards
```

---

### 6. Order History

#### Order History Page (`/orders`)
Features:
- List all past orders
- Sort by date, status, amount
- Quick actions:
  - View details
  - Track delivery
  - Download invoice
  - Return/refund
  - Review & rate

#### Order Status Display
- Processing
- Shipped
- Out for Delivery
- Delivered
- Cancelled
- Returned

---

### 7. Wishlist Management

#### Wishlist Page (`/wishlist`)
- View all saved items
- Move items to cart
- Remove from wishlist
- Share wishlist
- Price drop notifications (future)

#### Wishlist Operations
```javascript
// Add to wishlist (from product card)
Click heart icon → Item saved to localStorage

// Access wishlist
Navigate to /wishlist

// Move to cart
Click "Add to Cart" button

// Remove from wishlist
Click remove button
```

---

### 8. Admin Dashboard

#### Accessing Admin Panel
- Navigate to `/admin`
- Requires admin authentication

#### Dashboard Statistics
```
Displays:
- Total Sales (₹)
- Total Orders (count)
- Total Users (count)
- Total Products (count)
```

#### Admin Features

##### Dashboard Tab
- View key metrics
- Recent orders table
- Order status overview
- Sales trends (future)

##### Orders Tab (Coming Soon)
- View all orders
- Filter by status, date, amount
- Export orders
- Bulk operations

##### Users Tab (Coming Soon)
- User list
- User details
- Account management
- Activity logs

##### Products Tab (Coming Soon)
- Product inventory
- Stock management
- Add/edit products
- Pricing management

---

## API Integration Examples

### Get Products
```javascript
fetch('http://localhost:8080/api/products')
  .then(res => res.json())
  .then(data => console.log(data))
```

### Get Offers
```javascript
fetch('http://localhost:8080/api/offers')
  .then(res => res.json())
  .then(offers => console.log(offers))
```

### Track Order
```javascript
const orderId = 'ORD12345';
fetch(`http://localhost:8080/api/orders/${orderId}/tracking`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
  .then(res => res.json())
  .then(tracking => console.log(tracking))
```

### Place Order
```javascript
fetch('http://localhost:8080/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  },
  body: JSON.stringify({
    items: cartItems,
    paymentMethod: 'upi',
    total: 4999.00,
    discount: 1000.00,
    shipping: 0.00
  })
})
  .then(res => res.json())
  .then(order => console.log(order))
```

---

## Common Use Cases

### Use Case 1: Customer Places Order with Discount
```
1. User searches for "electronics" → ProductSearchPage
2. Filters by price: ₹2000-5000
3. Adds item to cart
4. Views available offers
5. Applies "20% off on ₹500+" offer
6. Proceeds to checkout
7. Selects UPI payment
8. Order placed successfully
9. Redirected to order history
```

### Use Case 2: Track Delivery
```
1. User navigates to /orders
2. Clicks "Track" on recent order
3. Views delivery tracking page
4. Sees current location: "Distribution Center, Delhi"
5. Sees agent: "Raj Kumar, +91-9876543210"
6. Timeline shows: picked → in_transit → out_for_delivery
7. Estimated delivery: Tomorrow 6-8 PM
8. Clicks contact support if needed
```

### Use Case 3: Admin Monitors Sales
```
1. Admin navigates to /admin
2. Views dashboard statistics
3. Sees 450 orders, ₹125000 total sales
4. Reviews recent orders table
5. Sees orders with different statuses
6. Can click on order for details
7. Can export data for analysis
```

### Use Case 4: Customer Manages Wishlist
```
1. User navigates to /search
2. Clicks heart icon on products
3. Items added to wishlist
4. User navigates to /wishlist
5. Views all saved items
6. Clicks "Add to Cart" for desired items
7. Removes items no longer needed
```

---

## Keyboard Shortcuts

```
/ - Open search
g h - Go to home
g c - Go to cart
g w - Go to wishlist
g o - Go to orders
g p - Go to profile
g a - Go to admin (if authorized)
? - Show help
```

---

## Troubleshooting

### Cart Not Showing Products
- Check backend server is running on port 8080
- Verify API endpoint: `GET /api/products`
- Check browser console for errors
- Clear localStorage and refresh

### Offers Not Displaying
- Verify API endpoint: `GET /api/offers`
- Check if offers are active (not expired)
- Clear browser cache
- Check network tab in developer tools

### Payment Page Shows Error
- Ensure user is logged in
- Check authentication token in localStorage
- Verify payment method is selected
- Check backend order API endpoint

### Tracking Information Not Loading
- Verify order ID is valid
- Check authentication token
- Ensure order exists in database
- Check tracking API endpoint

### Admin Dashboard Access Denied
- Verify admin authentication
- Check user role in database
- Ensure authorization header is sent
- Check admin API endpoint permissions

---

## Best Practices

### For Customers
1. ✅ Always apply available offers before checkout
2. ✅ Add items to wishlist for future reference
3. ✅ Use price filters to find products in budget
4. ✅ Track delivery regularly
5. ✅ Review products after delivery

### For Admins
1. ✅ Monitor sales dashboard regularly
2. ✅ Update offers based on inventory
3. ✅ Respond to customer issues promptly
4. ✅ Review delivery performance
5. ✅ Analyze sales trends

### For Developers
1. ✅ Keep API keys secure (use environment variables)
2. ✅ Implement proper error handling
3. ✅ Add loading states for better UX
4. ✅ Validate user input on frontend
5. ✅ Test all features before deployment

---

## Performance Tips

### Frontend Optimization
- Use browser DevTools to identify slow components
- Implement image lazy loading
- Optimize re-renders with React.memo
- Use code splitting for large features

### Backend Optimization
- Implement caching for product lists
- Use pagination for large datasets
- Optimize database queries with indexes
- Implement request throttling

### Network Optimization
- Use gzip compression
- Implement API response caching
- Optimize API response size
- Batch API requests where possible

---

## Security Reminders

⚠️ **Important Security Practices:**

1. **Never expose API keys** in frontend code
2. **Always validate** user input
3. **Use HTTPS** in production
4. **Secure authentication** tokens
5. **Implement CORS** properly
6. **Sanitize** user-generated content
7. **Rate limit** API endpoints
8. **Monitor** for suspicious activity

---

## Support & Documentation

### Getting Help
- Check error messages in browser console
- Review API responses in Network tab
- Refer to backend API documentation
- Check GitHub issues and discussions

### Reporting Issues
```
Include:
- Browser and version
- Steps to reproduce
- Expected vs actual behavior
- Console errors
- Network requests
```

---

## Feature Roadmap

### Phase 2 (Next)
- [ ] Real-time chat support
- [ ] Product reviews and ratings
- [ ] Recommendation engine
- [ ] Multi-language support

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Progressive Web App
- [ ] Advanced analytics
- [ ] Subscription services

### Phase 4
- [ ] AI-powered search
- [ ] Virtual try-on
- [ ] Social shopping
- [ ] Marketplace integration

---

## Version History

```
v1.2.0 (Current)
- Added delivery tracking
- Enhanced cart with offers
- Product search & filtering
- Admin dashboard
- Footer component

v1.1.0
- User authentication
- Order history
- Wishlist functionality

v1.0.0
- Basic cart functionality
- Product listing
- Payment integration
```

---

## License & Terms

This E-Cart system is provided as-is for educational and commercial use.
Please review the terms of service and privacy policy before using.

---

**Last Updated**: January 2024
**Version**: 1.2.0
**Support**: support@ecart.com
