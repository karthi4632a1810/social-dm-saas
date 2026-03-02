# Form Creation and Destination Types Guide

## Overview

The application now supports multiple destination types for short links:
- **URL/Phone** - Traditional URL or phone number links
- **Form** - Links that redirect to custom forms
- **WhatsApp** - Links that open WhatsApp with a pre-filled message

## Features

### 1. Form Creation Page

**Route:** `/create-form`

Create custom forms with multiple field types:
- Text
- Email
- Phone
- Textarea
- Select
- Checkbox
- Radio

**Features:**
- Add/remove form fields dynamically
- Set field labels, types, placeholders
- Mark fields as required
- Form validation

### 2. Enhanced Link Creation

**Route:** `/short-links`

The link creation form now includes:

#### Destination Type Selection (Radio Buttons)
- **Phone / URL** - For traditional links
- **Form** - Link to a custom form
- **WhatsApp** - WhatsApp message link

#### Conditional Fields Based on Selection

**When "Phone / URL" is selected:**
- Shows URL input field
- Accepts any URL or phone number (tel: links)

**When "Form" is selected:**
- Shows dropdown of available forms
- Lists all active forms you've created
- Link to create new form if none exist

**When "WhatsApp" is selected:**
- WhatsApp Number input
- Message textarea
- Preview of generated WhatsApp URL

## How to Use

### Creating a Form

1. Navigate to `/create-form` or click "Create Form" in the sidebar
2. Enter form name (required)
3. Add form description (optional)
4. Add fields:
   - Click "+ Add Field"
   - Set field label, type, placeholder
   - Mark as required if needed
5. Click "Create Form"

### Creating a Link with Form Destination

1. Go to `/short-links`
2. Fill in Link Name and Custom Slug
3. Select "Form" as destination type
4. Choose a form from the dropdown
5. Select platform
6. Click "Create Link"

### Creating a WhatsApp Link

1. Go to `/short-links`
2. Fill in Link Name and Custom Slug
3. Select "WhatsApp" as destination type
4. Enter WhatsApp number (with or without country code)
5. Enter message text
6. Preview the generated WhatsApp URL
7. Select platform
8. Click "Create Link"

## API Endpoints

### Forms
- `GET /api/forms` - Get all forms
- `GET /api/forms/:id` - Get single form
- `POST /api/forms` - Create form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Links (Updated)
- Links now support `destinationType`, `formId`, `whatsappNumber`, `whatsappMessage`
- When fetching links, form data is automatically populated

## Data Structure

### Form Model
```javascript
{
  name: String,
  description: String,
  fields: [{
    label: String,
    type: String, // 'text', 'email', 'phone', 'textarea', 'select', 'checkbox', 'radio'
    required: Boolean,
    placeholder: String,
    options: [String] // For select/radio/checkbox
  }],
  isActive: Boolean
}
```

### Link Model (Updated)
```javascript
{
  link_name: String,
  slug: String,
  destinationType: 'url' | 'form' | 'whatsapp',
  link: String, // For URL type
  formId: ObjectId, // For form type
  whatsappNumber: String, // For WhatsApp type
  whatsappMessage: String, // For WhatsApp type
  platform: String,
  status: 'active' | 'paused',
  clicks: Number
}
```

## WhatsApp URL Format

When creating a WhatsApp link, the system generates:
```
https://wa.me/{number}?text={encoded_message}
```

Example:
- Number: `+1234567890`
- Message: `Hello, I'm interested!`
- Generated: `https://wa.me/1234567890?text=Hello%2C%20I'm%20interested%21`

## Notes

- Forms must be created before they can be used in links
- Only active forms appear in the dropdown
- WhatsApp numbers are automatically cleaned (removes non-digits)
- All destination types support the same platform selection
- Links can be updated to change destination types
