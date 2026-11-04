# OnChain Radar

A static, installable PWA starter for monitoring new DEX pools. Initial network: Solana.

## Features
- GeckoTerminal new-pools feed, refreshed every 60 seconds while the app is open
- Network, minimum-liquidity, maximum-age and sort filters
- Device-local watchlist
- Paper-trading simulation (virtual cash only)
- Add to iPhone Home Screen after deploying over HTTPS

## Deploy with GitHub Pages
1. Create a GitHub repository named `onchain-radar`.
2. Upload all files in this folder to the repository root.
3. In repository Settings → Pages, choose Deploy from a branch, `main`, `/ (root)`, then Save.
4. Wait for GitHub Pages to publish the site. Your URL will look like `https://YOUR-USERNAME.github.io/onchain-radar/`.

## Add to iPhone
Open the published URL in Safari → Share → Add to Home Screen → Add.

## Data and limitations
- Uses GeckoTerminal's public API endpoint `/api/v2/networks/{network}/new_pools`.
- Public endpoint is beta, cached and rate-limited. The app refreshes once per minute, within the published approximate limit.
- “New pool” means a pool recently indexed by GeckoTerminal; this is not a raw on-chain contract-deployment feed.
- The app does not monitor specific wallets, verify liquidity locks, detect honeypots, or provide AI predictions. Those require additional data sources and careful validation.
- Paper trading is deliberately simple and does not model fees, slippage, price movements or profit/loss. It is for UI practice only.
- No wallet connection, private keys, real-money orders, or automatic trading.
