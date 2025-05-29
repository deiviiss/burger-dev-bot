'use server'

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