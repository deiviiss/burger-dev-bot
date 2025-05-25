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

export type FlowValue = 'TALK' | 'ORDER' | 'CONFIRM'