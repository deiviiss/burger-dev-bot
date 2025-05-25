# Burger Dev Bot - WhatsApp with Baileys and BuilderBot

<p align="center">
  <img src="https://builderbot.vercel.app/assets/thumbnail-vector.png" height="80">
</p>

## Description

This project is a WhatsApp chatbot built with [Baileys](https://github.com/WhiskeySockets/Baileys) and [BuilderBot](https://builderbot.vercel.app/), designed to automate order taking from a digital menu, data confirmation, and promotion management for a fast food business.

Features include:

- Conversational flows for orders, data confirmation, and modification.
- Integration with a database using Prisma ORM.
- Dynamic promotions and menu.
- Order code and payment method validation.
- Webhook for new order notifications.

## Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd base-ts-baileys-json
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   pnpm install
   ```
3. Configure environment variables in a `.env` file (see `.env.example`).
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Start the bot:
   ```bash
   npm run dev
   ```

## Usage

- The bot automatically responds to WhatsApp messages.
- Users can place orders, confirm data, and receive promotions.
- Admins receive notifications of new confirmed orders.

## Main Structure

- `src/flows/` — Conversational flows (orders, confirmation, modification).
- `src/http/products/` — Menu and promotions logic.
- `src/interfaces/` — TypeScript types and contracts.
- `prisma/` — Database schema and migrations.

## Technologies

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Baileys](https://github.com/WhiskeySockets/Baileys)
- [BuilderBot](https://builderbot.vercel.app/)
- [Prisma ORM](https://www.prisma.io/)

## Credits

- Based on BuilderBot by [@leifermendez](https://twitter.com/leifermendez)
- Adapted and extended for order and promotion management on WhatsApp

## Contact

- [💻 Discord](https://link.codigoencasa.com/DISCORD)
- [👌 𝕏 (Twitter)](https://twitter.com/leifermendez)
