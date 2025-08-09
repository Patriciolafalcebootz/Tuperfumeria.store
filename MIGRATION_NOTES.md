# Migration Notes

- Legacy stock data from `data/stock.legacy.json` is normalized into the new schema using `npm run migrate`.
- The new `stock.service` provides a single source of truth for stock with optimistic concurrency and reservations.
- Frontend now uses `StockClient` and all direct JSON reads were removed.
- Breaking change: product identifiers use auto-generated `sku` slugs; update any external references accordingly.
