# Social DM SaaS - Backend Server

Node.js/Express backend server with MongoDB for the Social DM SaaS application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the server directory:
```
MONGODB_URI=mongodb+srv://jiokarthikeyan18_db_user:EfM0YYHVz1GSzMoe@clickmychat.z79csnn.mongodb.net/
PORT=5000
```

3. Start the server:
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Links
- `GET /api/links` - Get all links (supports query params: status, platform, startDate, endDate, search, page, limit)
- `GET /api/links/:id` - Get single link by ID
- `GET /api/links/slug/:slug` - Get link by slug
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `POST /api/links/:id/click` - Increment click count

### Leads
- `GET /api/leads` - Get all leads (supports query params: status, platform, startDate, endDate, search, page, limit)
- `GET /api/leads/:id` - Get single lead by ID
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics
- `GET /api/analytics/stats` - Get dashboard statistics (total clicks, leads, links, chats)
- `GET /api/analytics/platforms` - Get platform-wise analytics
- `GET /api/analytics/weekly` - Get weekly analytics
- `GET /api/analytics/monthly` - Get monthly analytics
- `GET /api/analytics/clicks-leads` - Get clicks and leads data for charts
- `GET /api/analytics/page-views` - Get page views and visitors data

## Data Models

### Link
- `link_name` (String, required)
- `clicks` (Number, default: 0)
- `status` (String, enum: 'active', 'paused')
- `slug` (String, required, unique)
- `link` (String, required) - The actual URL
- `platform` (String, enum: 'Instagram', 'Facebook', 'WhatsApp', 'Google', 'Website', 'YouTube', 'Telegram', 'Landing Page')
- `createdAt` (Date)

### Lead
- `name` (String, required)
- `number` (String, required)
- `link` (String, required)
- `linkId` (ObjectId, ref: 'Link')
- `status` (String, enum: 'pending', 'contacted', 'qualified', 'working', 'proposal sent', 'not interested', 'closed')
- `email` (String, required)
- `platform` (String, required)
- `location` (String)
- `createdAt` (Date)

## Example API Calls

### Create a Link
```bash
POST /api/links
Content-Type: application/json

{
  "link_name": "Instagram Link",
  "slug": "instagram-link",
  "link": "https://instagram.com/yourprofile",
  "platform": "Instagram",
  "status": "active"
}
```

### Create a Lead
```bash
POST /api/leads
Content-Type: application/json

{
  "name": "John Doe",
  "number": "1234567890",
  "email": "john@example.com",
  "link": "instagram link",
  "platform": "Instagram",
  "location": "New York"
}
```

### Get Dashboard Stats
```bash
GET /api/analytics/stats
```
