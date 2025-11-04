import axios from 'axios'

const http = axios.create({ baseURL: 'http://localhost:8080', timeout: 8000 })

export const api = {
  async getProducts() {
    const { data } = await http.get('/api/products')
    return data
  },
  async login(email) {
    const params = new URLSearchParams({ email })
    const { data } = await http.post('/api/login', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return data
  },
  async register(email, name) {
    const params = new URLSearchParams({ email, username: name })
    const { data } = await http.post('/api/register', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return data
  },
  async checkout(cartItems, paymentMode, userEmail, coupon=''){
    const { data } = await http.post('/api/checkout', { items: cartItems, paymentMode, userEmail, coupon }, { headers: { 'Content-Type': 'application/json' } })
    return data
  },
  async getInvoice(orderId) {
    const { data } = await http.get(`/api/order/${orderId}/invoice`)
    return data
  },
  async getOffers() {
    const { data } = await http.get('/api/offers')
    return data
  },
  async bookDelivery(orderId, slot) {
    const params = new URLSearchParams({ orderId, slot })
    const { data } = await http.post('/api/delivery/book', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    return data
  },
  async getDeliveryStatus(orderId) {
    const { data } = await http.get(`/api/delivery/${orderId}/status`)
    return data
  }
}
