# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
<<<<<<< HEAD
=======

---

## Payments Quick Start

This frontend is wired to the MernStack_PROJECT backend payments service.

### Environment

Create `frontend/.env` with:

```
VITE_PAYMENTS_BASE_URL=http://localhost:5000/main-payments
VITE_ITEM_PAYMENTS_BASE_URL=http://localhost:5000/item-payments
```

Restart the dev server after changes.

### Endpoints used by the UI

- Main payments: `POST /` under `VITE_PAYMENTS_BASE_URL`
- Inventory payments: `GET /order/:orderId`, `POST /inventory-payment` under `VITE_ITEM_PAYMENTS_BASE_URL`

### Test URLs

- Service payments page (example):
  `/payment-management/service?serviceId=507f1f77bcf86cd799439011&customerId=507f1f77bcf86cd799439012&totalAmount=20000`

- Inventory payments page (example):
  `/payment-management/inventory?orderId=507f1f77bcf86cd799439011&customerId=507f1f77bcf86cd799439012&totalAmount=4500`

### Notes

- The UI maps form fields to the backend model fields: `orderId`, `customerId`, `amount`, `method`, `bankSlipUrl`, `notes`.
- For quick demos, test ObjectIds are used if test-like IDs are provided.
>>>>>>> origin/Sonali-PaymentDelivery
