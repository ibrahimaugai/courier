# Consignment/Booking Model Documentation

## Overview

The consignment system handles booking creation with support for:
- Customer lookup/creation (when admin creates booking)
- Document uploads to Cloudinary
- Complete shipment tracking
- CN number generation

## Database Model

### Booking Model

The `Booking` model in Prisma schema includes:

#### Core Fields
- `id` - UUID primary key
- `cnNumber` - Unique consignment note number (auto-generated if not provided)
- `bookingDate` - Date of booking
- `status` - BookingStatus enum (BOOKED, AT_HUB, IN_TRANSIT, etc.)

#### Customer & Location
- `customerId` - Reference to Customer (shipper)
- `originCityId` - Origin city
- `destinationCityId` - Destination city

#### Service & Product
- `serviceId` - Service type (e.g., Over Night, MOFA Attestation)
- `productId` - Product type (e.g., General, International)

#### Consignee Information
- `consigneeName` - Full name
- `consigneePhone` - Mobile number
- `consigneeEmail` - Email (optional)
- `consigneeAddress` - Primary address
- `consigneeAddress2` - Secondary address (optional)
- `consigneeLandline` - Landline (optional)
- `consigneeZipCode` - Zip code (optional)
- `consigneeCompanyName` - Company name (optional)

#### Shipper Information (stored for reference)
- `shipperName` - Full name
- `shipperPhone` - Mobile number
- `shipperEmail` - Email (optional)
- `shipperAddress` - Primary address
- `shipperAddress2` - Secondary address (optional)
- `shipperLandline` - Landline (optional)
- `shipperCompanyName` - Company name (optional)
- `shipperCnic` - CNIC number (optional)

#### Shipment Details
- `weight` - Actual weight in kg
- `pieces` - Number of pieces
- `chargeableWeight` - Weight used for pricing (max of weight and volumetric weight)
- `volumetricWeight` - Volumetric weight (optional)
- `declaredValue` - Declared value (optional)
- `packetContent` - Description of contents
- `handlingInstructions` - Special handling instructions (optional)

#### Payment & Pricing
- `paymentMode` - PaymentMode enum (PREPAID, COD, TOPAY)
- `codAmount` - Cash on delivery amount (if COD)
- `rate` - Base rate
- `otherAmount` - Additional charges
- `totalAmount` - Total amount

#### Document Management
- `documentUrls` - JSON array of Cloudinary URLs
- `documentDetails` - JSON object containing:
  ```json
  {
    "serviceType": "MOFA|Apostille|UAE Embassy|etc.",
    "documents": [
      {
        "name": "Nikah Nama",
        "price": 5000,
        "url": "https://cloudinary.com/..."
      }
    ]
  }
  ```

#### Tracking & Operations
- `batchId` - Reference to Batch (optional)
- `manifestId` - Reference to Manifest (optional)
- `deliverySheetId` - Reference to DeliverySheet (optional)
- `cnAllocationId` - Reference to CN Allocation (optional)

#### Metadata
- `dcReferenceNo` - DC reference number (optional)
- `manualCn` - Manual CN number (optional)
- `cancelReason` - Cancellation reason (optional)
- `createdBy` - User ID who created the booking
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `deliveredAt` - Delivery timestamp (optional)

### BookingHistory Model

Tracks all status changes and actions:
- `id` - UUID primary key
- `bookingId` - Reference to Booking
- `action` - Action performed (e.g., "CREATED", "STATUS_CHANGED")
- `oldStatus` - Previous status (optional)
- `newStatus` - New status (optional)
- `performedBy` - User ID who performed the action
- `remarks` - Additional remarks (optional)
- `createdAt` - Timestamp

## API Endpoints

### POST `/api/v1/consignments`
Create a new consignment/booking

**Request:**
- Content-Type: `multipart/form-data`
- Body: All consignment fields + optional `documents` files

**Response:**
- Created booking object with all relations

**Features:**
- Auto-generates CN number if not provided
- Creates customer if doesn't exist (by phone lookup)
- Uploads documents to Cloudinary
- Creates booking history entry

### GET `/api/v1/consignments`
Get all consignments with optional filters

**Query Parameters:**
- `status` - Filter by BookingStatus
- `customerId` - Filter by customer
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `cnNumber` - Search by CN number

### GET `/api/v1/consignments/track/:cnNumber`
Track consignment by CN number

**Response:**
- Booking details with full history

## Customer Management

### Automatic Customer Creation

When admin creates a booking:
1. System searches for customer by phone number
2. If not found, creates new customer with:
   - Auto-generated customer code (CUST-000001, CUST-000002, etc.)
   - Name, phone, address from shipper data
   - City from origin city
   - CNIC if provided
3. If found, updates customer info if changed

## Document Upload

### Supported Formats
- Images: JPG, JPEG, PNG
- Documents: PDF, DOC, DOCX

### Upload Process
1. Files uploaded via multipart/form-data
2. Each file uploaded to Cloudinary in `courier-documents` folder
3. URLs stored in `documentUrls` (JSON array)
4. Document details (name, price, URL) stored in `documentDetails` (JSON)

### Document Service Types
- MOFA Attestation
- Apostille (Normal/Urgent)
- UAE Embassy
- Board Verification
- HEC
- IBCC
- National Bureau

## CN Number Generation

CN numbers are auto-generated using `CnGenerator` utility:
- Format: 10 digits `YYYYMMDDNN` (no CN prefix or dashes)
- Example: `2026022301`
- Unique per day
- Transaction-safe (prevents race conditions)

## Environment Variables

Add to `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=courier-documents
```

## Usage Example

### Creating a Booking with Documents

```javascript
const formData = new FormData();
formData.append('productId', 'product-uuid');
formData.append('serviceId', 'service-uuid');
formData.append('originCityId', 'city-uuid');
formData.append('destinationCityId', 'city-uuid');
formData.append('weight', '2.5');
formData.append('pieces', '1');
formData.append('packetContent', 'Electronics');
formData.append('payMode', 'PREPAID');
formData.append('rate', '1000');
formData.append('totalAmount', '1500');
formData.append('mobileNumber', '03001234567');
formData.append('fullName', 'John Doe');
formData.append('address', '123 Main St');
formData.append('consigneeMobileNumber', '03009876543');
formData.append('consigneeFullName', 'Jane Smith');
formData.append('consigneeAddress', '456 Park Ave');
formData.append('documentServiceType', 'MOFA');

// Add document files
files.forEach(file => {
  formData.append('documents', file);
});

// Add document details as JSON
formData.append('documents', JSON.stringify([
  { name: 'Nikah Nama', price: 5000 },
  { name: 'Passport Copy', price: 5000 }
]));

fetch('/api/v1/consignments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Service Structure

### ConsignmentsService

**Methods:**
- `createConsignment()` - Creates booking with customer lookup/creation and document upload
- `findAll()` - Get all bookings with filters
- `findByCnNumber()` - Track booking by CN number

**Private Methods:**
- `findOrCreateCustomer()` - Customer lookup/creation logic
- `uploadDocuments()` - Cloudinary upload handler

### CloudinaryService

**Methods:**
- `uploadFile()` - Upload single file
- `uploadMultipleFiles()` - Upload multiple files
- `deleteFile()` - Delete single file
- `deleteMultipleFiles()` - Delete multiple files


