# Solana Token Portfolio Tracker

A full-stack application that tracks token balances and prices for Solana wallets, providing historical price data and portfolio management capabilities (currently using Mock Data).

## Architecture Overview

### Frontend (React + MobX)

The frontend uses React with MobX for state management, providing real-time updates of token balances and prices.

Key Components:
- **TokenStore**: Central state management for token data using MobX
- **API Service**: Handles all communication with the backend
- **DataMapperService**: Transforms API responses into frontend data structures

### Backend (Node.js + Express + Prisma)

The backend integrates multiple external APIs and maintains a database of token data.

#### External API Clients

1. **HeliusClient**
   - Fetches token balances for user wallets
   - Provides token metadata

2. **BirdeyeClient**
   - Retrieves current and historical token prices
   - Supports price tracking over customizable time periods

3. **JupiterClient**
   - Fetches comprehensive token metadata
   - Provides token list with accurate decimals and symbols

#### Core Services

1. **TokenService**
   - Manages token data and price history
   - Integrates Jupiter metadata with Birdeye prices
   - Handles database operations for tokens

2. **UserService**
   - Manages user accounts and their token holdings
   - Synchronizes token balances with Helius data
   - Maintains user portfolio state

3. **TokenAccountService**
   - Handles token balance tracking
   - Maps raw API data to database structures

### Database (PostgreSQL + Prisma)

Stores:
- User accounts
- Token metadata
- Historical price data
- Token balances

## Data Flow

1. User connects wallet
2. Backend fetches token balances from Helius
3. For each token:
   - Retrieves metadata from Jupiter
   - Fetches prices from Birdeye
   - Stores data in database
4. Frontend displays portfolio with real-time updates

## API Endpoints

### Users
- `GET /api/users/withTokens`: Get user data with all token holdings
- `POST /api/users/newUser`: Create new user

### Tokens
- `GET /api/tokens/token`: Get token metadata and prices
- `POST /api/tokens/setToken`: Save new token data

### Token Accounts
- `GET /api/token-accounts/getBalances`: Get user token balances
- `POST /api/token-accounts/createTokenAccount`: Create new token account


## Environment Variables

Required environment variables:
- `HELIUS_API_KEY`: API key for Helius
- `BIRDEYE_API_KEY`: API key for Birdeye
- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Backend server port

## Development

run `npm i` from both `frontend/` and `backend/` directories to install dependencies.

run `npm start` to start both frontend and backend.

run `npm test` to run tests

### Debug Mode

Open debugger in VSCode and select `Run Script: test` in the run configuration drop down.
