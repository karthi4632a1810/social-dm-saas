# Migration Guide: From Hardcoded Data to MongoDB Backend

This guide explains the changes made to migrate from hardcoded dummy data to a MongoDB-backed API.

## What Was Changed

### 1. Backend Setup
- ✅ Created Node.js/Express server in `/server` folder
- ✅ Set up MongoDB connection with your provided connection string
- ✅ Created database models (Link, Lead)
- ✅ Created API routes for CRUD operations
- ✅ Created analytics endpoints

### 2. Database Seeding
- ✅ Created seed script to populate database with all dummy data
- ✅ All hardcoded data from frontend has been moved to database

### 3. Frontend Updates
- ✅ Created API utility file (`src/utils/api.js`)
- ✅ Updated `Dashboard.jsx` to fetch data from API
- ✅ Updated `AllLinks.jsx` to fetch data from API
- ✅ Updated `AllLeads.jsx` to fetch data from API
- ✅ Removed all hardcoded dummy data arrays

## Setup Instructions

### Step 1: Install Backend Dependencies
```bash
cd server
npm install
```

### Step 2: Seed the Database
```bash
npm run seed
```

This will:
- Connect to your MongoDB database
- Clear any existing data
- Insert all the dummy data (10 links, 10 leads)

### Step 3: Start the Backend Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Step 4: Start the Frontend
```bash
# In the root directory
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## API Endpoints

### Links
- `GET /api/links` - Get all links
- `GET /api/links/:id` - Get single link
- `POST /api/links` - Create new link
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link
- `POST /api/links/:id/click` - Increment click count

### Leads
- `GET /api/leads` - Get all leads
- `GET /api/leads/:id` - Get single lead
- `POST /api/leads` - Create new lead
- `PUT /api/leads/:id` - Update lead
- `DELETE /api/leads/:id` - Delete lead

### Analytics
- `GET /api/analytics/stats` - Dashboard statistics
- `GET /api/analytics/platforms` - Platform analytics
- `GET /api/analytics/weekly` - Weekly analytics
- `GET /api/analytics/monthly` - Monthly analytics

## Data Structure

### Link Model
```javascript
{
  link_name: String,
  clicks: Number,
  status: "active" | "paused",
  slug: String (unique),
  link: String (URL),
  platform: String,
  createdAt: Date
}
```

### Lead Model
```javascript
{
  name: String,
  number: String,
  link: String,
  linkId: ObjectId (reference to Link),
  status: String,
  email: String,
  platform: String,
  location: String,
  createdAt: Date
}
```

## What's Different Now

### Before (Hardcoded)
- Data was stored in arrays directly in components
- No persistence - data lost on refresh
- No API calls

### After (MongoDB Backend)
- Data stored in MongoDB database
- Data persists across sessions
- All operations go through API
- Real-time updates possible
- Can add filtering, pagination, search

## Troubleshooting

### Database Connection Issues
- Check that your MongoDB connection string is correct in `server/.env`
- Ensure MongoDB Atlas allows connections from your IP

### API Not Responding
- Make sure backend server is running on port 5000
- Check CORS settings if frontend is on different port
- Verify API_BASE_URL in `src/utils/api.js` matches your backend URL

### Data Not Showing
- Run the seed script: `cd server && npm run seed`
- Check browser console for API errors
- Verify backend server logs for errors

## Next Steps

1. **Add Authentication**: Implement user authentication for secure API access
2. **Add Real-time Updates**: Use WebSockets for live data updates
3. **Add Search**: Implement full-text search for links and leads
4. **Add Pagination**: Implement proper pagination UI
5. **Add Error Handling**: Add better error messages and loading states
6. **Add Data Validation**: Add client-side and server-side validation
