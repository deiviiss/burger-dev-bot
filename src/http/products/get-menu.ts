'use server'

import { Product, Promotion } from "@/interfaces/types"

const initialProducts: Product[] = [
  // Hamburguesas
  {
    id: "1",
    name: "Hamburguesa Sencilla",
    description: "Carne de res, lechuga, tomate, cebolla y aderezo especial",
    price: 45,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGhhbWJ1cmd1ZXNhfGVufDB8fDB8fHww",
    categoryId: "1",
    active: true,
    promotionPrice: null,
  },
  {
    id: "2",
    name: "Hamburguesa con Queso",
    description: "Carne de res, queso americano, lechuga, tomate y cebolla",
    price: 55,
    image: "https://images.unsplash.com/photo-1508737027454-e6454ef45afd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGhhbWJ1cmd1ZXNhfGVufDB8fDB8fHww",
    categoryId: "1",
    active: true,
    promotionPrice: null,
  },
  {
    id: "3",
    name: "Hamburguesa Doble",
    description: "Doble carne, doble queso, tocino, lechuga, tomate y cebolla",
    price: 75,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzfYU8-fLn5NcMApKXlovqqVfQ57t73q_7-w&s",
    categoryId: "1",
    active: true,
    promotionPrice: null,
  },
  {
    id: "4",
    name: "Hamburguesa Hawaiana",
    description: "Carne de res, queso, piña, jamón y salsa especial",
    price: 65,
    image: "https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGhhbWJ1cmd1ZXNhfGVufDB8fDB8fHww",
    categoryId: "1",
    active: true,
    promotionPrice: null,
  },

  // Hot Dogs
  {
    id: "5",
    name: "Hot Dog Sencillo",
    description: "Salchicha, pan, catsup, mostaza y mayonesa",
    price: 30,
    image: "https://images.unsplash.com/photo-1599599810694-b5b37304c041?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG90ZG9nc3xlbnwwfHwwfHx8MA%3D%3D",
    categoryId: "2",
    active: true,
    promotionPrice: null,
  },
  {
    id: "6",
    name: "Hot Dog Especial",
    description: "Salchicha, tocino, queso derretido, jalapeños y cebolla",
    price: 45,
    image: "https://images.unsplash.com/photo-1537790698196-aad88bf9bb27?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8aG90ZG9nc3xlbnwwfHwwfHx8MA%3D%3D",
    categoryId: "2",
    active: true,
    promotionPrice: null,
  },
  {
    id: "7",
    name: "Hot Dog Jumbo",
    description: "Salchicha jumbo, chili con carne, queso y cebolla crujiente",
    price: 50,
    image: "https://images.unsplash.com/photo-1541214113241-21578d2d9b62?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGhvdGRvZ3N8ZW58MHx8MHx8fDA%3D",
    categoryId: "2",
    active: true,
    promotionPrice: null,
  },

  // Tortas
  {
    id: "8",
    name: "Torta de Jamón",
    description: "Jamón, queso, aguacate, jitomate, lechuga y mayonesa",
    price: 40,
    image: "https://media.istockphoto.com/id/846063880/es/foto/jam%C3%B3n-suizo-y-sandwich-de-rucula.webp?a=1&b=1&s=612x612&w=0&k=20&c=LJ84P21Xt9kiJxHWHpP1FC9trUOf7Y_nXFkbnhJQLLo=",
    categoryId: "3",
    active: true,
    promotionPrice: null,
  },
  {
    id: "9",
    name: "Torta de Milanesa",
    description: "Milanesa de res, aguacate, jitomate, lechuga y mayonesa",
    price: 55,
    image: "https://media.istockphoto.com/id/499674183/es/foto/s%C3%A1ndwich-de-pollo.jpg?s=612x612&w=0&k=20&c=7tSbXKmii8zp7bAx_Ff3G34HUTvSDKh4zWeyMhpziTM=",
    categoryId: "3",
    active: true,
    promotionPrice: null,
  },
  {
    id: "10",
    name: "Torta Cubana",
    description: "Jamón, queso, milanesa, salchicha, huevo, aguacate y frijoles",
    price: 70,
    image: "https://media.istockphoto.com/id/1305689009/es/foto/cl%C3%A1sico-s%C3%A1ndwich-cubano-a-la-parrilla.jpg?s=612x612&w=0&k=20&c=9ddT6mvtjp0SAVLBC5rSPEI3HVdCfYcmxafbMQlL5D0=",
    categoryId: "3",
    active: true,
    promotionPrice: null,
  },

  // Papas Fritas
  {
    id: "11",
    name: "Papas Fritas Chicas",
    description: "Papas fritas crujientes con sal",
    price: 25,
    image: "https://media.istockphoto.com/id/1495638137/es/foto/papas-fritas-en-olla-en-la-mesa-frente-a-la-pared-de-ladrillo.jpg?s=612x612&w=0&k=20&c=Rf8kpBTAv2ZRVS2q5CoYzBhVcCfBlJHuEYupv2RDCgI=",
    categoryId: "4",
    active: true,
    promotionPrice: null,
  },
  {
    id: "12",
    name: "Papas Fritas Grandes",
    description: "Porción grande de papas fritas crujientes con sal",
    price: 35,
    image: "https://media.istockphoto.com/id/1867541332/es/foto/primer-plano-de-patatas-fritas-con-queso-y-salsa-de-trufa-negra.jpg?s=612x612&w=0&k=20&c=1_00ITpbtGDjxzPOOlV_IiL0sm5We57bc8CV58598Fc=",
    categoryId: "4",
    active: true,
    promotionPrice: null,
  },
  {
    id: "13",
    name: "Papas con Queso",
    description: "Papas fritas cubiertas con queso cheddar derretido",
    price: 45,
    image: "https://media.istockphoto.com/id/2027765034/es/foto/deliciosas-papas-fritas-cargadas-con-queso-y-crema-agria.jpg?s=612x612&w=0&k=20&c=_w_xeBsl9jIbDolPuwqqkDKMvJSsbNIIC7AjqV9tJZk=",
    categoryId: "4",
    active: true,
    promotionPrice: null,
  },

  // Snacks
  {
    id: "14",
    name: "Nachos con Queso",
    description: "Totopos con queso derretido, jalapeños y pico de gallo",
    price: 50,
    image: "https://media.istockphoto.com/id/509993206/es/foto/nachos.jpg?s=612x612&w=0&k=20&c=UlzQoQ88ZI9l8a9Hx1-4XD5ineCqweRzm1Gkdq0x0T4=",
    categoryId: "5",
    active: true,
    promotionPrice: null,
  },
  {
    id: "15",
    name: "Alitas BBQ (6 pzas)",
    description: "Alitas de pollo bañadas en salsa BBQ",
    price: 85,
    image: "https://media.istockphoto.com/id/2163052205/es/foto/homemade-garlic-parmesan-chicken-wings-in-a-plate.jpg?s=612x612&w=0&k=20&c=_fFF-8LYuP1Qm5h7fDDwfUPeIsciV3Nip8i59UCOOMM=",
    categoryId: "5",
    active: true,
    promotionPrice: null,
  },
  {
    id: "16",
    name: "Nuggets de Pollo",
    description: "8 piezas de nuggets de pollo con aderezo a elegir",
    price: 60,
    image: "https://media.istockphoto.com/id/618209540/es/foto/cesta-de-nuggets-de-pollo-con-salsa-agridulce.jpg?s=612x612&w=0&k=20&c=BewWO31I_5HKBlh8w0cFfn3j-TzYhLNjeBDi5IxB1gY=",
    categoryId: "5",
    active: true,
    promotionPrice: null,
  },

  // Bebidas
  {
    id: "17",
    name: "Coca-Cola",
    description: "Refresco de cola 500ml",
    price: 20,
    image: "https://media.istockphoto.com/id/1887055343/es/foto/renderizado-3d-de-bebida-y-agua.jpg?s=612x612&w=0&k=20&c=Nu2sqmG1P_-LAREETtW5N8KJQVKcRD0KZ3UY5fC-aVs=",
    categoryId: "6",
    active: true,
    promotionPrice: null,
  },
  {
    id: "18",
    name: "Agua Mineral",
    description: "Agua mineral 500ml",
    price: 15,
    image: "https://media.istockphoto.com/id/1060742942/es/foto/se-vierte-en-un-vaso-de-agua.jpg?s=612x612&w=0&k=20&c=xagi1288_G_S8KY5zFkvWOCISJdnH0tNg2zQ1EICQtQ=",
    categoryId: "6",
    active: true,
    promotionPrice: null,
  },
  {
    id: "19",
    name: "Limonada",
    description: "Limonada natural con hielo 500ml",
    price: 25,
    image: "https://media.istockphoto.com/id/537228258/es/foto/frasco-para-conservas-gafas-de-limonada-caseras-en-madera-r%C3%BAstica.jpg?s=612x612&w=0&k=20&c=W3BHW8jizneBee3Gye4crswQwwKdrGegAgu5_Vj5M2U=",
    categoryId: "6",
    active: true,
    promotionPrice: null,
  },
  {
    id: "20",
    name: "Cerveza",
    description: "Cerveza nacional 355ml",
    price: 35,
    image: "https://media.istockphoto.com/id/495306979/es/foto/hilera-de-copas-de-cervezas-diferentes-en-el-bar-de-madera.jpg?s=612x612&w=0&k=20&c=1ewK3z1QtBDGtRhO9lsmrgztJq2OoZGL3KpkZYBge40=",
    categoryId: "6",
    active: true,
    promotionPrice: null,
  },

  // Postres
  {
    id: "21",
    name: "Pastel de Chocolate",
    description: "Rebanada de pastel de chocolate con ganache",
    price: 40,
    image: "https://media.istockphoto.com/id/2165404401/es/foto/tarta-de-chocolate-con-glaseado-de-chocolate-en-un-plato-negro-junto-a-un-tenedor.jpg?s=612x612&w=0&k=20&c=fMB6H6Rh7_ZqLc9aSb-m9hjMm-ec_YFzXsl9UNtHu1Y=",
    categoryId: "7",
    active: true,
    promotionPrice: null,
  },
  {
    id: "22",
    name: "Helado de Vainilla",
    description: "Dos bolas de helado de vainilla con topping a elegir",
    price: 35,
    image: "https://media.istockphoto.com/id/1326143969/es/foto/bol-con-bolas-de-helado-de-vainilla.jpg?s=612x612&w=0&k=20&c=1U2ePAMN2Zodvnl5917YtsnUIs3a0z_u1FHazJthkIc=",
    categoryId: "7",
    active: true,
    promotionPrice: null,
  },
  {
    id: "23",
    name: "Flan Napolitano",
    description: "Porción de flan casero con caramelo",
    price: 30,
    image: "https://media.istockphoto.com/id/146773364/es/foto/flan.jpg?s=612x612&w=0&k=20&c=jCf-FRhYysARrDFTLSSOA647mu017izKG3WLzf59btA=",
    categoryId: "7",
    active: true,
    promotionPrice: null,
  },
]

const initialPromotions: Promotion[] = [
  {
    id: "promo-001",
    name: "Combo Hamburguesa + Papas + Refresco",
    description: "Hamburguesa sencilla con papas chicas y refresco",
    discountPercentage: 15,
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-06-01T23:59:59Z",
    productIds: ["prod-hamburguesa", "prod-papas", "prod-refresco"],
    active: true,
    discountCode: "COMBO15",
    image: "https://example.com/images/combo-hamburguesa.jpg" // Image for combo promotion
  },
  {
    id: "promo-002",
    name: "2 Hot Dogs por $50",
    description: "Lleva 2 hot dogs sencillos por solo $50",
    discountPercentage: 20, // Approximate discount percentage
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-06-01T23:59:59Z",
    productIds: ["prod-hotdog"],
    active: true,
    discountCode: "HOTDOG50",
    image: "https://example.com/images/promo-hotdogs.jpg" // Image for hot dog promotion
  },
  {
    id: "promo-003",
    name: "Refresco gratis en pedidos mayores a $100",
    description: "Obtén un refresco gratis en compras mayores a $100",
    discountPercentage: 100, // Free item discount
    startDate: "2025-05-01T00:00:00Z",
    endDate: "2025-06-01T23:59:59Z",
    productIds: ["prod-refresco"],
    active: true,
    discountCode: "FREECOKE",
    image: "https://example.com/images/refresco-gratis.jpg" // Image for free drink promo
  }
];

export async function getMenu(): Promise<{ menu: string; promotions: string }> {
  try {
    const menu = `🍔 Hamburguesas
Hamburguesa Sencilla
Carne de res, lechuga, tomate, cebolla y aderezo especial
💵 $45.00

Hamburguesa con Queso
Carne de res, queso americano, lechuga, tomate y cebolla
💵 $55.00

Hamburguesa Doble
Doble carne, doble queso, tocino, lechuga, tomate y cebolla
💵 $75.00

Hamburguesa Hawaiana
Carne de res, queso, piña, jamón y salsa especial
💵 $65.00

🌭 Hot Dogs
Hot Dog Sencillo
Salchicha, pan, catsup, mostaza y mayonesa
💵 $30.00

Hot Dog Especial
Salchicha, tocino, queso derretido, jalapeños y cebolla
💵 $45.00

Hot Dog Jumbo
Salchicha jumbo, chili con carne, queso y cebolla crujiente
💵 $50.00

🥪 Tortas
Torta de Jamón
Jamón, queso, aguacate, jitomate, lechuga y mayonesa
💵 $40.00

Torta de Milanesa
Milanesa de res, aguacate, jitomate, lechuga y mayonesa
💵 $55.00

Torta Cubana
Jamón, queso, milanesa, salchicha, huevo, aguacate y frijoles
💵 $70.00

🍟 Papas Fritas
Papas Fritas Chicas
Papas fritas crujientes con sal
💵 $25.00

Papas Fritas Grandes
Porción grande de papas fritas crujientes con sal
💵 $35.00

Papas con Queso
Papas fritas cubiertas con queso cheddar derretido
💵 $45.00

🍗 Snacks
Nachos con Queso
Totopos con queso derretido, jalapeños y pico de gallo
💵 $50.00

Alitas BBQ (6 pzas)
Alitas de pollo bañadas en salsa BBQ
💵 $85.00

Nuggets de Pollo
8 piezas de nuggets de pollo con aderezo a elegir
💵 $60.00

🥤 Bebidas
Coca-Cola (500ml)
💵 $20.00

Agua Mineral (500ml)
💵 $15.00

Limonada (500ml)
Limonada natural con hielo
💵 $25.00

Cerveza Nacional (355ml)
💵 $35.00

🍰 Postres
Pastel de Chocolate
Rebanada de pastel de chocolate con ganache
💵 $40.00

Helado de Vainilla
Dos bolas de helado de vainilla con topping a elegir
💵 $35.00

Flan Napolitano
Porción de flan casero con caramelo
💵 $30.00
`
    const promotions = `
🎉 Promociones
Combo Hamburguesa + Papas + Refresco
Hamburguesa sencilla con papas chicas y refresco
🔖 15% de descuento
💵 $90.00 → $76.50
🤑 Ahorra $13.50

2 Hot Dogs por $50
Lleva 2 hot dogs sencillos por solo $50
🔖 20% de descuento
💵 $60.00 → $50.00
🤑 Ahorra $10.00

Refresco gratis en pedidos mayores a $100
Obtén un refresco gratis en compras mayores a $100
🔖 100% de descuento en refresco
💵 $20.00 → $0.00
🤑 Ahorra $20.00
`

    return {
      menu,
      promotions
    }
  } catch (error) {
    console.error("Error al obtener productos:", error)
    return null
  }
}