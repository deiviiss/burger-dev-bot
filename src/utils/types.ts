export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  categoryId: string
  active: boolean
  promotionPrice: number | null
}

export interface Category {
  id: string
  name: string
}

export interface Promotion {
  id: string
  name: string
  description: string
  discountPercentage: number
  startDate: string
  endDate: string
  productIds: string[]
  active: boolean
  discountCode: string
  image?: string // Added field for promotion image
}

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED'

export interface OrderItem {
  id: string
  orderId: string
  productId?: string
  promotionId?: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  shortId: string
  name: string
  phoneNumber: string
  items: OrderItem[]
  totalPrice: number
  status: OrderStatus
  address: string
  comment?: string
  createdAt: string
}

export interface User {
  id: string
  name: string
  phoneNumber: string
  createdAt: Date
  orders?: Order[]
}

export type FlowValue = 'TALK' | 'ORDER' | 'CONFIRM'