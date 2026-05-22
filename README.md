````markdown
# IdeaVault — Backend API

Express + MongoDB REST API powering the IdeaVault platform.

---

## Tech Stack

- Node.js + Express
- MongoDB (native driver)
- `jose-cjs` for JWT verification (Better Auth JWKS)
- `cors`, `dotenv`

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env` file:

```env
MONGODB_URI=your_mongodb_connection_string
CLIENT_URL=http://localhost:3000
PORT=5000
```

### 3. Run the server

```bash
node index.js
```

Server runs on `http://localhost:5000`

---

## API Reference

### Ideas

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/idea` | ❌ | Get all ideas. Supports `?search=`, `?category=`, `?limit=` |
| GET | `/idea/:id` | ✅ | Get single idea by ID |
| POST | `/idea` | ❌ | Create a new idea |
| PATCH | `/idea/:id` | ❌ | Update an idea |
| DELETE | `/idea/:id` | ✅ | Delete an idea |
| GET | `/ideasbycreator/:creatorId` | ✅ | Get all ideas by a specific creator |
| GET | `/ideaname/:id` | ❌ | Get idea title only (used for comment display) |

### Comments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/comment` | ✅ | Post a new comment |
| GET | `/comment/:ideaId` | ✅ | Get all comments for an idea |
| PATCH | `/comment/:id` | ✅ | Edit a comment |
| DELETE | `/comment/:commentid` | ✅ | Delete a comment |
| GET | `/commentbyuser/:userId` | ✅ | Get all comments by a user (sorted newest first) |

---

## Query Parameters — `GET /idea`

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Case-insensitive regex search on `ideaTitle` |
| `category` | string | Filter by exact category match |
| `limit` | number | Limit number of results (0 = no limit) |

**Example:**
```
GET /idea?search=drone&category=Health&limit=6
```

---

## Idea Schema

```json
{
  "ideaTitle": "DroneAid",
  "shortDescription": "Emergency medical supply delivery via drones.",
  "detailedDescription": "Full description...",
  "category": "Health",
  "tags": ["drones", "logistics", "emergency"],
  "imageURL": "https://example.com/image.jpg",
  "estimatedBudget": 500000,
  "targetAudience": "Hospitals, NGOs",
  "problemStatement": "Remote areas lack timely access to medical supplies.",
  "proposedSolution": "Deploy drones with smart routing.",
  "creatorId": "user_id_here"
}
```

## Comment Schema

```json
{
  "ideaId": "idea_id_here",
  "userId": "user_id_here",
  "userName": "John Doe",
  "comment": "Great idea!",
  "like": 0,
  "time": "2026-05-22T07:00:31.496Z"
}
```
##test the server using my site
https://ideavault-one-mu.vercel.app/
---
