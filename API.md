# CRM Xeno — Full API Reference

**Base URL:** `http://localhost:3001`

**Auth:** Most endpoints require `Authorization: Bearer <token>`.
Obtain a token via `POST /api/auth/login`.

---

## Table of Contents

1. [Auth](#1-auth)
2. [Business](#2-business)
3. [CSV Uploads](#3-csv-uploads)
4. [AI Discovery](#4-ai-discovery)
5. [Metrics Engine](#5-metrics-engine)
6. [Segments](#6-segments)
7. [Campaigns](#7-campaigns)
8. [Campaign Details](#8-campaign-details)
9. [Analytics & Insights](#9-analytics--insights)
10. [Auto Pipeline](#10-auto-pipeline)
11. [Insight Pipeline](#11-insight-pipeline)
12. [Order Attribution](#12-order-attribution)
13. [Dashboard](#13-dashboard)
14. [Receipt Callback](#14-receipt-callback)
15. [Recommended Flow](#15-recommended-flow)

---

## 1. Auth

No auth token required.

### POST /api/auth/signup

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@brewchain.com",
    "password": "test123456",
    "name": "Brew Owner"
  }'
```

**Response `201`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbXE3N3ZlemQwMDAwY21hazh0Z2drcnhlIiwiZW1haWwiOiJvd25lckBicmV3Y2hhaW4uY29tIiwiaWF0IjoxNzgxMDQ0NDM3LCJleHAiOjE3ODE2NDkyMzd9.lRdWx4-RjTjkCY7kgj0tp3BlmnElZHIm3VnxRSM0tAM",
  "user": {
    "id": "cmq77vezd0000cmak8tggkrxe",
    "email": "owner@brewchain.com",
    "name": "Brew Owner"
  }
}
```

**Error `409`:**
```json
{ "error": "Email already registered" }
```

**Error `400` (validation):**
```json
{
  "error": {
    "email": ["Invalid email"],
    "password": ["String must contain at least 6 character(s)"]
  }
}
```

---

### POST /api/auth/login

**Request:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@brewchain.com",
    "password": "test123456"
  }'
```

**Response `200`:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmq77vezd0000cmak8tggkrxe",
    "email": "owner@brewchain.com",
    "name": "Brew Owner"
  }
}
```

**Error `401`:**
```json
{ "error": "Invalid email or password" }
```

---

## 2. Business

All endpoints require `Authorization: Bearer <token>`.

### POST /api/businesses

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Brew Coffee Chain",
    "industry": "Coffee Chain",
    "location": "Mumbai",
    "description": "Premium coffee chain with 5 outlets across Mumbai",
    "problem": "Customers do not come back after first visit",
    "goal": "Increase repeat purchases by 20% in 3 months",
    "mode": "SELF"
  }'
```

**Fields:**

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `name` | Yes | string | 1–200 chars |
| `industry` | Yes | string | 1–100 chars |
| `location` | No | string | Max 200 |
| `description` | No | string | Max 2000 |
| `problem` | No | string | Max 2000 |
| `goal` | No | string | Max 2000 |
| `mode` | No | `"SELF"` or `"AI"` | Defaults to `"SELF"` |

**Response `201`:**
```json
{
  "id": "cmq77vezt0002cmak7gprcgca",
  "userId": "cmq77vezd0000cmak8tggkrxe",
  "name": "Brew Coffee Chain",
  "industry": "Coffee Chain",
  "location": "Mumbai",
  "description": "Premium coffee chain with 5 outlets across Mumbai",
  "problem": "Customers do not come back after first visit",
  "goal": "Increase repeat purchases by 20% in 3 months",
  "mode": "SELF",
  "createdAt": "2026-06-09T22:33:57.161Z",
  "updatedAt": "2026-06-09T22:33:57.161Z"
}
```

---

### GET /api/businesses

**Request:**
```bash
curl http://localhost:3001/api/businesses \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
[
  {
    "id": "cmq77vezt0002cmak7gprcgca",
    "name": "Brew Coffee Chain",
    "industry": "Coffee Chain",
    "mode": "SELF",
    "createdAt": "2026-06-09T22:33:57.161Z"
  },
  {
    "id": "cmqb2rpg60001cmmmfko1ykb4",
    "name": "Final AI Test",
    "industry": "Cafe",
    "mode": "AI",
    "createdAt": "2026-06-12T15:22:00.000Z"
  }
]
```

---

### GET /api/businesses/:businessId

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca \
  -H "Authorization: Bearer <token>"
```

**Response `200`:** Full business object (same shape as POST response).

**Error `404`:**
```json
{ "error": "Business not found" }
```

**Error `403`:**
```json
{ "error": "Forbidden" }
```

---

### PUT /api/businesses/:businessId

Partial update — send only fields to change.

**Request:**
```bash
curl -X PUT http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Brew Coffee Chain Updated",
    "mode": "AI"
  }'
```

**Response `200`:** Updated business object.

---

### DELETE /api/businesses/:businessId

Permanently deletes a business and **all its associated data** — customers, orders, products, events, segments, campaigns, recipients, and upload jobs.

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "deleted": true
}
```

**Error `404`:**
```json
{ "error": "Business not found" }
```

> ⚠️ This action is irreversible. All customer data, order history, segments, and campaigns for this business are permanently removed in a single transaction.

---

## 3. CSV Uploads

Upload data as CSV files. Uses **multipart/form-data** with field name `file`.

**CSV format rules:**
- Header row must match the column names below (case-insensitive)
- Empty rows are skipped automatically
- File size limit: 10 MB
- Only `.csv` files accepted

### POST /api/uploads/:businessId/customers

**Request:**
```bash
curl -X POST http://localhost:3001/api/uploads/cmq77vezt0002cmak7gprcgca/customers \
  -H "Authorization: Bearer <token>" \
  -F "file=@customers.csv"
```

**customers.csv:**
```csv
customer_id,name,email,phone,city,signup_date,preferred_channel
C001,Rahul,rahul@test.com,9999999991,Mumbai,2024-01-15,WHATSAPP
C002,Priya,priya@test.com,9999999992,Delhi,2024-02-20,EMAIL
C003,Amit,amit@test.com,9999999993,Bangalore,2024-03-10,WHATSAPP
C004,Sneha,sneha@test.com,9999999994,Pune,2024-04-05,SMS
C005,Vikram,vikram@test.com,9999999995,Chennai,2024-05-01,WHATSAPP
```

**Columns:**

| Column | Required | Example |
|--------|----------|---------|
| `customer_id` | Yes | `C001` |
| `name` | No | `Rahul` |
| `email` | No | `rahul@test.com` |
| `phone` | No | `9999999991` |
| `city` | No | `Mumbai` |
| `signup_date` | No | `2024-01-15` |
| `preferred_channel` | No | `WHATSAPP`, `EMAIL`, `SMS`, or `RCS` |

**Response `201` (success):**
```json
{
  "fileType": "CUSTOMERS",
  "imported": 5,
  "errors": []
}
```

**Response `400` (validation errors):**
```json
{
  "fileType": "CUSTOMERS",
  "imported": 0,
  "errors": [
    { "line": 3, "field": "customer_id", "message": "customer_id is required" },
    { "line": 5, "field": "customer_id", "message": "Duplicate customer_id: C003 (first at line 4)" },
    { "line": 6, "field": "preferred_channel", "message": "Invalid channel: PUSH. Must be WHATSAPP, EMAIL, SMS, or RCS" }
  ]
}
```

---

### POST /api/uploads/:businessId/orders

**Request:**
```bash
curl -X POST http://localhost:3001/api/uploads/cmq77vezt0002cmak7gprcgca/orders \
  -H "Authorization: Bearer <token>" \
  -F "file=@orders.csv"
```

**orders.csv:**
```csv
order_id,customer_id,product_name,product_category,amount,quantity,order_date
O001,C001,Cold Coffee,Coffee,150,2,2024-06-01
O002,C001,Latte,Coffee,200,1,2024-05-15
O003,C002,Cappuccino,Coffee,180,1,2024-06-10
O004,C003,Cold Coffee,Coffee,150,3,2024-04-20
O005,C003,Mocha,Coffee,220,1,2024-06-05
O006,C004,Latte,Coffee,200,2,2024-03-01
O007,C005,Cappuccino,Coffee,180,1,2024-06-15
O008,C001,Mocha,Coffee,220,2,2024-04-01
```

**Columns:**

| Column | Required | Example |
|--------|----------|---------|
| `order_id` | Yes | `O001` |
| `customer_id` | Yes | `C001` (must already exist in DB) |
| `product_name` | Yes | `Cold Coffee` (auto-creates product if new) |
| `product_category` | No | `Coffee` |
| `amount` | Yes | `150` (line total, not unit price) |
| `quantity` | No | `2` (defaults to 1) |
| `order_date` | Yes | `2024-06-01` |

**Response `201` (success):**
```json
{
  "fileType": "ORDERS",
  "imported": 8,
  "errors": [],
  "productsCreated": 4
}
```

`productsCreated` shows how many new products were auto-created from the import.

**Response `400` (validation errors):**
```json
{
  "fileType": "ORDERS",
  "imported": 0,
  "errors": [
    { "line": 2, "field": "customer_id", "message": "Customer not found: C999" },
    { "line": 4, "field": "amount", "message": "Invalid amount: abc" }
  ]
}
```

---

### POST /api/uploads/:businessId/events

**Request:**
```bash
curl -X POST http://localhost:3001/api/uploads/cmq77vezt0002cmak7gprcgca/events \
  -H "Authorization: Bearer <token>" \
  -F "file=@events.csv"
```

**events.csv:**
```csv
type,description,event_date,metadata
PRICE_HIKE,Coffee price increased by 10%,2024-06-01,{"oldPrice":150,"newPrice":165}
NEW_PRODUCT,Launched new Mocha flavor,2024-05-15,{}
SEASONAL_SALE,Monsoon special discount,2024-07-01,{"discount":20}
```

**Columns:**

| Column | Required | Example |
|--------|----------|---------|
| `type` | Yes | `PRICE_HIKE`, `PRICE_DROP`, `NEW_PRODUCT`, `SEASONAL_SALE`, `OUT_OF_STOCK` |
| `description` | No | `Coffee price increased` |
| `event_date` | Yes | `2024-06-01` |
| `metadata` | No | `{"discount": 20}` (must be valid JSON) |

**Response `201`:**
```json
{
  "fileType": "EVENTS",
  "imported": 3,
  "errors": []
}
```

---

## 4. AI Discovery

### POST /api/businesses/:businessId/discover

Analyzes your uploaded data and returns AI-generated suggestions. Works with or without OpenAI API key.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/discover \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "suggestedMetrics": [
    {
      "name": "Coffee Chain Purchase Frequency",
      "description": "Average number of coffee chain purchases per customer per month"
    },
    {
      "name": "Customer Retention Rate",
      "description": "Percentage of customers who made repeat purchases within 90 days"
    },
    {
      "name": "Average Order Value",
      "description": "Average amount spent per order (currently ₹188)"
    }
  ],
  "suggestedSegments": [
    {
      "name": "Potential Churn",
      "description": "Customers who haven't purchased recently despite being formerly active",
      "rules": "days_since_last_purchase > 60 AND orders_count > 3"
    },
    {
      "name": "High Value Customers",
      "description": "Top spenders who contribute the most revenue",
      "rules": "total_spend > 5000"
    },
    {
      "name": "Recent Customers",
      "description": "Customers who signed up recently and are still building habits",
      "rules": "orders_count < 3"
    }
  ],
  "suggestedCampaigns": [
    {
      "name": "Win Back Campaign",
      "description": "Re-engage lapsed customers with an incentive",
      "channel": "WHATSAPP",
      "message": "We miss you! Enjoy 20% off on your next order at Brew Coffee Chain."
    },
    {
      "name": "Reward Loyal Customers",
      "description": "Thank your best customers with an exclusive offer",
      "channel": "EMAIL",
      "message": "Thank you for being a valued customer! Here's an exclusive 15% discount just for you."
    },
    {
      "name": "New Customer Welcome",
      "description": "Onboard new customers with a first-order incentive",
      "channel": "WHATSAPP",
      "message": "Welcome to Brew Coffee Chain! Enjoy 10% off your first order today."
    }
  ]
}
```

**Note:** With `OPENAI_API_KEY` set, the AI generates industry-specific suggestions. Without it, rule-based fallback is used.

---

## 5. Metrics Engine

### POST /api/businesses/:businessId/metrics/run

Computes per-customer profile fields: total orders, total spend, days since last purchase, favorite product.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/metrics/run \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "customersUpdated": 5
}
```

**What gets computed for each customer:**

| Field | Source |
|-------|--------|
| `totalOrders` | Count of customer's orders |
| `totalSpend` | Sum of all order amounts |
| `lastPurchaseDate` | Most recent order date |
| `daysSinceLastPurchase` | Days from last purchase to now |
| `favoriteProductId` | Product with the most orders |

**Must be called before** creating segments with rules like `totalSpend > 5000` or `daysSinceLastPurchase > 60`.

---

## 6. Segments

### POST /api/businesses/:businessId/segments

Create a manual segment with filter rules.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/segments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "High Value Customers",
    "description": "Customers who spend the most",
    "rules": [
      { "field": "totalSpend", "operator": "gt", "value": 100 },
      { "field": "totalOrders", "operator": "gte", "value": 2 }
    ]
  }'
```

**Available fields** (both camelCase and snake_case work):

| Field (use any variant) | Maps To | Type |
|------------------------|---------|------|
| `daysSinceLastPurchase`, `days_since_last_purchase`, `days_since_first_purchase`, `days_since_purchase`, `last_purchase_days` | `daysSinceLastPurchase` | number |
| `totalOrders`, `total_orders`, `orders_count`, `order_count`, `num_orders` | `totalOrders` | number |
| `totalSpend`, `total_spend`, `total_spent`, `spend` | `totalSpend` | number |
| `signupDate`, `signup_date` | `signupDate` | date (string) |
| `lastPurchaseDate`, `last_purchase_date` | `lastPurchaseDate` | date (string) |

**Available operators:** `gt`, `gte`, `lt`, `lte`, `eq`, `ne`

> Unknown field names are silently ignored. If ALL rules have unknown fields, `audienceSize` will be `0`.

**Response `201`:**
```json
{
  "id": "cmq77vpsn0016cmak0zsorwp1",
  "businessId": "cmq77vezt0002cmak7gprcgca",
  "name": "High Value Customers",
  "description": "Customers who spend the most",
  "rulesJson": [
    { "field": "totalSpend", "operator": "gt", "value": 100 },
    { "field": "totalOrders", "operator": "gte", "value": 2 }
  ],
  "audienceSize": 5,
  "createdAt": "2026-06-09T22:34:11.160Z",
  "updatedAt": "2026-06-09T22:34:11.160Z"
}
```

`audienceSize` is automatically computed — it's the number of customers matching the rules.

---

### POST /api/businesses/:businessId/segments/ai

Generate a segment from a natural language prompt. Returns the suggestion — does NOT save to DB.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/segments/ai \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "prompt": "Find customers who used to buy frequently but disappeared recently"
  }'
```

**Response `200` (AI suggestion):**
```json
{
  "name": "Potential Churn",
  "description": "Customers who used to be active but haven't purchased recently",
  "rules": [
    { "field": "daysSinceLastPurchase", "operator": "gt", "value": 60 },
    { "field": "totalOrders", "operator": "gt", "value": 3 }
  ]
}
```

To save, call `POST .../segments` with the returned `name`, `description`, and `rules`.

---

### GET /api/businesses/:businessId/segments

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/segments \
  -H "Authorization: Bearer <token>"
```

**Response `200`:** Array of segment objects, newest first.

---

### GET /api/businesses/:businessId/segments/:segmentId

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/segments/cmq77vpsn0016cmak0zsorwp1 \
  -H "Authorization: Bearer <token>"
```

**Response `200`:** Single segment object.

---

## 7. Campaigns

### POST /api/businesses/:businessId/campaigns

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "segmentId": "cmq77vpsn0016cmak0zsorwp1",
    "channel": "WHATSAPP",
    "message": "Enjoy 20% off your next coffee! Show this at any outlet."
  }'
```

**Fields:**

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `segmentId` | Yes | string | CUID of an existing segment |
| `channel` | Yes | `WHATSAPP`, `EMAIL`, `SMS`, or `RCS` | |
| `message` | Yes | string | 1–5000 chars |

**Response `201`:**
```json
{
  "id": "cmq77vptn0018cmak3o2a7u5g",
  "businessId": "cmq77vezt0002cmak7gprcgca",
  "segmentId": "cmq77vpsn0016cmak0zsorwp1",
  "channel": "WHATSAPP",
  "message": "Enjoy 20% off your next coffee! Show this at any outlet.",
  "status": "DRAFT",
  "createdAt": "2026-06-09T22:34:11.195Z",
  "launchedAt": null,
  "updatedAt": "2026-06-09T22:34:11.195Z"
}
```

---

### GET /api/businesses/:businessId/campaigns

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
[
  {
    "id": "cmq77vptn0018cmak3o2a7u5g",
    "channel": "WHATSAPP",
    "message": "Enjoy 20% off your next coffee!",
    "status": "SENT",
    "createdAt": "2026-06-09T22:34:11.195Z",
    "launchedAt": "2026-06-09T22:34:16.007Z",
    "segment": {
      "name": "High Value Customers",
      "audienceSize": 5
    }
  }
]
```

Each campaign includes the segment name and audience size.

---

### GET /api/businesses/:businessId/campaigns/:campaignId

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g \
  -H "Authorization: Bearer <token>"
```

**Response `200`:** Single campaign with full segment details (name, description, rulesJson, audienceSize).

---

### POST /api/businesses/:businessId/campaigns/:campaignId/ai-assist

AI reviews your campaign and recommends a channel + improved message.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/ai-assist \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "channel": "WHATSAPP",
  "message": "We miss you! Enjoy 20% off on your next coffee at Brew Coffee Chain."
}
```

---

### POST /api/businesses/:businessId/campaigns/:campaignId/launch

Sends the campaign. This:
1. Finds all customers matching the segment's rules
2. Creates CampaignRecipient records
3. Sets campaign status to `SENT`
4. Fires each recipient to the channel service (async)

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/launch \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "recipientsCreated": 5,
  "status": "SENT"
}
```

**Error `400` (already launched):**
```json
{ "error": "Campaign has already been launched" }
```

**Error `400` (no matching customers):**
```json
{ "error": "No customers match the segment criteria" }
```

---

## 8. Campaign Details

### GET /api/businesses/:businessId/campaigns/:campaignId/details

Full campaign report with analytics + per-customer status list.

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/details \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "id": "cmq77vptn0018cmak3o2a7u5g",
  "channel": "WHATSAPP",
  "message": "Enjoy 20% off your next coffee! Show this at any outlet.",
  "status": "SENT",
  "launchedAt": "2026-06-09T22:34:16.007Z",
  "createdAt": "2026-06-09T22:34:11.195Z",
  "segment": {
    "id": "cmq77vpsn0016cmak0zsorwp1",
    "name": "High Value Customers",
    "description": "Customers who spend the most",
    "audienceSize": 5
  },
  "analytics": {
    "campaignId": "cmq77vptn0018cmak3o2a7u5g",
    "sent": 5,
    "delivered": 4,
    "opened": 1,
    "read": 1,
    "clicked": 0,
    "failed": 0
  },
  "recipients": [
    {
      "customerId": "C001",
      "customerName": "Rahul",
      "email": "rahul@test.com",
      "phone": "9999999991",
      "status": "DELIVERED",
      "updatedAt": "2026-06-09T22:34:16.050Z"
    },
    {
      "customerId": "C002",
      "customerName": "Priya",
      "email": "priya@test.com",
      "phone": "9999999992",
      "status": "OPENED",
      "updatedAt": "2026-06-09T22:34:18.120Z"
    },
    {
      "customerId": "C003",
      "customerName": "Amit",
      "email": "amit@test.com",
      "phone": "9999999993",
      "status": "DELIVERED",
      "updatedAt": "2026-06-09T22:34:17.300Z"
    },
    {
      "customerId": "C004",
      "customerName": "Sneha",
      "email": "sneha@test.com",
      "phone": "9999999994",
      "status": "DELIVERED",
      "updatedAt": "2026-06-09T22:34:16.800Z"
    },
    {
      "customerId": "C005",
      "customerName": "Vikram",
      "email": "vikram@test.com",
      "phone": "9999999995",
      "status": "DELIVERED",
      "updatedAt": "2026-06-09T22:34:18.500Z"
    }
  ]
}
```

This is the endpoint you'd use for a campaign result details page — it shows exactly who received what and their current status.

---

## 9. Analytics & Insights

### GET /api/businesses/:businessId/campaigns/:campaignId/analytics

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/analytics \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "campaignId": "cmq77vptn0018cmak3o2a7u5g",
  "sent": 5,
  "delivered": 4,
  "opened": 1,
  "read": 1,
  "clicked": 0,
  "failed": 0
}
```

---

### GET /api/businesses/:businessId/campaigns/:campaignId/insights

AI analyses campaign performance and generates findings and recommendations.

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/insights \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "summary": "Campaign 'Enjoy 20% off your next coffee!...' performed with 100% delivery rate, 25% open rate, and 0% click rate.",
  "findings": [
    "Total 5 recipients targeted from segment High Value Customers.",
    "5 messages delivered (100% delivery rate).",
    "1 recipient opened the message (25% open rate).",
    "0 recipients clicked (0% click rate).",
    "No delivery failures recorded."
  ],
  "recommendations": [
    "Open rate is healthy — maintain current messaging approach.",
    "Add a clearer call-to-action or incentive to drive more clicks.",
    "Delivery quality is good.",
    "Run this campaign again with a different discount tier to compare performance."
  ]
}
```

With OpenAI API key, these are generated by GPT-4o-mini. Without it, rule-based fallback is used.

---

## 10. Auto Pipeline

### POST /api/businesses/:businessId/auto-pipeline

One-shot: runs metrics → AI discovery → creates segments → creates draft campaigns.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmqb2rpg60001cmmmfko1ykb4/auto-pipeline \
  -H "Authorization: Bearer <token>"
```

**Response `200`** (zero-audience segments are automatically skipped):
```json
{
  "metricsUpdated": 5,
  "segmentsCreated": [
    {
      "id": "cmqb2rpi4000lcmmmv0crthf9",
      "name": "Recent Customers",
      "audienceSize": 4
    }
  ],
  "campaignsCreated": [
    {
      "id": "cmqb2rpi7000rcmmm6yhixvlf",
      "name": "New Customer Welcome",
      "channel": "WHATSAPP",
      "message": "Welcome to Final AI Test! Enjoy 10% off your first order today."
    }
  ]
}
```

> **Important:** The pipeline does NOT auto-trigger on upload. Upload all CSVs first, then call this endpoint once. This ensures the AI has complete data (customers + orders + events) before generating segments and campaigns.

> **Channels are data-driven:** The pipeline ignores the AI's channel suggestions and instead uses the most common `preferredChannel` from your customer data. If most customers prefer WHATSAPP, all auto-created campaigns will use WHATSAPP.

---

## 11. Insight Pipeline

### POST /api/businesses/:businessId/campaigns/:campaignId/insight-pipeline

Analyzes a completed campaign's performance and creates **follow-up segments and draft campaigns** based on what the data reveals.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/insight-pipeline \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "summary": "Campaign analysis: Many recipients did not open — try a different channel.",
  "segmentsCreated": [
    {
      "id": "cmqb41op10001cmlhh65r4dld",
      "name": "Did Not Open",
      "audienceSize": 5
    }
  ],
  "campaignsCreated": [
    {
      "id": "cmqb41op50003cmlh43tdnsk0",
      "name": "Channel Switch Follow-up",
      "channel": "SMS",
      "message": "Last chance! Brew Coffee Chain has a special offer waiting for you. Check it out!"
    }
  ]
}
```

**What it does:**
1. Reads campaign analytics (sent, delivered, opened, clicked, failed)
2. Calls AI (or fallback) to generate follow-up recommendations
3. Creates new segments (e.g., "Did Not Open", "Opened but Did Not Click")
4. Creates matching draft campaigns with tailored messages
5. Returns summary of everything created

> **Channels are data-driven:** All campaigns use the most common `preferredChannel` from your customer data (via `getPreferredChannel`). The AI's channel suggestion is ignored.

**Fallback logic (when no `OPENAI_API_KEY`):**

| Analytics Pattern | Segment Created | Campaign Created |
|------------------|----------------|------------------|
| Opened > 0, clicked == 0 | "Opened but Did Not Click" | Stronger CTA follow-up |
| Delivered > opened | "Did Not Open" | Channel switch follow-up |
| Failed > 0 | "Failed Delivery Contacts" | (segment only, review data) |
| Clicked > 0 | "Engaged Customers" | Follow-up offer |

All created campaigns are in `DRAFT` status — ready for review before launch.

---

## 12. Order Attribution

### POST /api/businesses/:businessId/campaigns/:campaignId/attribution

Attribute an order to a campaign — marks a customer's purchase as having been driven by this campaign.

**Request:**
```bash
curl -X POST http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/attribution \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "orderId": "ORD-ATTR-001",
    "customerId": "C003",
    "revenue": 450
  }'
```

**Fields:**

| Field | Required | Notes |
|-------|----------|-------|
| `orderId` | Yes | Your order reference ID |
| `customerId` | Yes | The customer's external ID (from the CSV) |
| `revenue` | Yes | Revenue amount attributed to this campaign |

**Response `201`:**
```json
{
  "id": "cmqb6zpot0019cmn9zomedjbt",
  "campaignId": "cmq77vptn0018cmak3o2a7u5g",
  "customerId": "cmq77vi8z0006cmak6d6k7777",
  "orderId": "ORD-ATTR-001",
  "businessId": "cmq77vezt0002cmak7gprcgca",
  "revenue": 450,
  "attributedAt": "2026-06-12T17:20:22.734Z"
}
```

**Error `409`:**
```json
{ "error": "Order already attributed to this campaign" }
```

**Error `400`:**
```json
{ "error": "Customer was not part of this campaign" }
```

### GET /api/businesses/:businessId/campaigns/:campaignId/attribution

List all attributed orders for a campaign.

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/campaigns/cmq77vptn0018cmak3o2a7u5g/attribution \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "campaignId": "cmq77vptn0018cmak3o2a7u5g",
  "attributedOrders": [
    {
      "orderId": "ORD-ATTR-001",
      "customerId": "C003",
      "customerName": "Amit",
      "revenue": 450,
      "attributedAt": "2026-06-12T17:20:22.734Z"
    }
  ],
  "totalRevenue": 450,
  "totalOrders": 1
}
```

> Attribution data is also included in the `GET .../campaigns/:id/details` response under `attribution` — so the campaign details page shows analytics + attribution in one call.

---

## 13. Dashboard

### GET /api/businesses/:businessId/dashboard

Single endpoint that returns all data needed to power a full analytics dashboard — KPIs, charts, tables. No request body.

**Request:**
```bash
curl http://localhost:3001/api/businesses/cmq77vezt0002cmak7gprcgca/dashboard \
  -H "Authorization: Bearer <token>"
```

**Response `200`:**
```json
{
  "summary": {
    "totalCustomers": 12000,
    "totalOrders": 85000,
    "totalRevenue": 2500000,
    "averageOrderValue": 29.41,
    "totalProducts": 18,
    "totalCampaigns": 5,
    "totalSegments": 8,
    "totalEvents": 12
  },
  "campaignPerformance": {
    "totalSent": 5000,
    "totalDelivered": 4750,
    "totalOpened": 3200,
    "totalRead": 2500,
    "totalClicked": 800,
    "totalFailed": 250,
    "overallOpenRate": 64.0,
    "overallCtr": 25.0
  },
  "customerGrowth": {
    "total": 12000,
    "repeatCustomers": 4500,
    "repeatRate": 37.5,
    "signupsByMonth": [
      { "month": "2024-01", "count": 340 },
      { "month": "2024-02", "count": 280 }
    ]
  },
  "revenueBreakdown": {
    "total": 2500000,
    "campaignAttributed": 450000,
    "campaignAttributedPercent": 18.0
  },
  "ordersOverTime": [
    { "month": "2024-01", "count": 1200, "revenue": 36000 },
    { "month": "2024-02", "count": 1400, "revenue": 42000 }
  ],
  "topProducts": [
    { "name": "Cold Coffee", "category": "Beverages", "orders": 1500, "revenue": 225000 },
    { "name": "Latte", "category": "Beverages", "orders": 1200, "revenue": 240000 }
  ],
  "channelBreakdown": [
    { "channel": "WHATSAPP", "sent": 3000, "opened": 2100, "openRate": 70.0 },
    { "channel": "EMAIL", "sent": 1500, "opened": 675, "openRate": 45.0 }
  ],
  "segmentSizes": [
    { "name": "High Value Customers", "size": 500 },
    { "name": "Potential Churn", "size": 200 }
  ],
  "recentCampaigns": [
    {
      "id": "cmq77vptn0018cmak3o2a7u5g",
      "channel": "WHATSAPP",
      "status": "SENT",
      "message": "Enjoy 20% off your next coffee!",
      "sent": 1000,
      "delivered": 950,
      "opened": 720,
      "read": 600,
      "clicked": 180,
      "failed": 50,
      "launchedAt": "2026-06-09T22:34:16.007Z"
    }
  ]
}
```

**What each section powers:**

| Section | Chart/Widget | Data |
|---------|-------------|------|
| `summary` | 8 KPI cards | Total customers, orders, revenue, AOV, products, campaigns, segments, events |
| `campaignPerformance` | Funnel chart | Aggregated across all campaigns (sent → delivered → opened → read → clicked → failed) + open rate + CTR |
| `customerGrowth` | Line chart + gauge | Total customers, repeat count, repeat rate + signups per month |
| `revenueBreakdown` | Donut chart | Total revenue vs revenue attributed to campaigns |
| `ordersOverTime` | Dual axis line chart | Order count + revenue grouped by month |
| `topProducts` | Horizontal bar chart | Top 10 products by order count |
| `channelBreakdown` | Grouped bar chart | Sent/opened counts and open rate per channel |
| `segmentSizes` | Pie chart | All segments with their audience size |
| `recentCampaigns` | Table | Last 5 campaigns with per-campaign delivery stats |

---

## 14. Receipt Callback

### POST /api/receipt

Internal endpoint used by the Channel Service to report delivery status. No auth required.

**Request:**
```bash
curl -X POST http://localhost:3001/api/receipt \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "cmq77vptn0018cmak3o2a7u5g",
    "customerId": "cmq77vi8z0006cmak6d6k7777",
    "status": "DELIVERED"
  }'
```

**Response `200`:**
```json
{
  "campaignId": "cmq77vptn0018cmak3o2a7u5g",
  "customerId": "cmq77vi8z0006cmak6d6k7777",
  "status": "DELIVERED",
  "updatedAt": "2026-06-12T15:30:00.000Z"
}
```

**Error `404`:**
```json
{ "error": "CampaignRecipient not found" }
```

**Supported statuses:** `SENT`, `DELIVERED`, `OPENED`, `READ`, `CLICKED`, `FAILED`

---

## 15. Recommended Flow

### Self Mode (manual)

```text
 1. POST /api/auth/signup               → Create account
 2. POST /api/auth/login                → Get token
 3. POST /api/businesses                → Create business (mode: "SELF" or omit)
 4. POST /api/uploads/:bid/customers    → Upload customers CSV
 5. POST /api/uploads/:bid/orders       → Upload orders CSV
 6. POST /api/uploads/:bid/events       → Upload events CSV (optional)
 7. POST /api/businesses/:bid/metrics/run    → Compute customer profiles
 8. POST /api/businesses/:bid/discover       → Get AI suggestions
 9. POST /api/businesses/:bid/segments       → Create a segment
10. POST /api/businesses/:bid/campaigns      → Create a campaign
11. POST .../campaigns/:cid/ai-assist        → Refine message (optional)
12. POST .../campaigns/:cid/launch           → Send campaign
13. GET  .../campaigns/:cid/details          → View results
14. GET  .../campaigns/:cid/insights         → Get AI recommendations
```

### AI Mode (automated)

Upload all your CSVs first, then trigger the pipeline once via the explicit endpoint.

```text
 1. POST /api/auth/signup               → Create account
 2. POST /api/auth/login                → Get token
 3. POST /api/businesses                → Create business (mode: "AI")
 4. POST /api/uploads/:bid/customers    → Upload customers CSV
 5. POST /api/uploads/:bid/orders       → Upload orders CSV
 6. POST /api/uploads/:bid/events       → Upload events CSV (optional)
    ↓
    (All data is now in the database)
    ↓
 7. POST /api/businesses/:bid/auto-pipeline  → Click "Analyze"
    ↓
    (System runs metrics → AI discovery → creates segments → creates campaigns)
    ↓
 8. GET  /api/businesses/:bid/campaigns      → Review auto-created campaigns
 9. POST .../campaigns/:cid/launch           → Send campaign
10. GET  .../campaigns/:cid/details          → View per-customer results
11. GET  .../campaigns/:cid/insights         → AI recommendations
```

---

## Error Response Format

All errors follow a consistent format:

```json
// Validation errors
{
  "error": {
    "fieldName": ["Error message 1", "Error message 2"]
  }
}

// Simple errors
{
  "error": "Human readable error message"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error or bad request |
| 401 | Missing or invalid token |
| 403 | Forbidden (not the owner) |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate email) |
| 500 | Internal server error |
