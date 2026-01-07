# DigiUsers Collection & Cloudinary Integration Summary

## ✅ Changes Implemented

### 1. MongoDB Collection Name Changed
- **Before**: Users stored in default `users` collection
- **After**: Users stored in `digiusers` collection
- **File Modified**: `backend/models/User.js`
- **Change**: Added collection name parameter: `mongoose.model('User', userSchema, 'digiusers')`

### 2. Cloudinary Integration for File Storage
- **Before**: Files stored locally in `backend/uploads/` directory
- **After**: Files stored in Cloudinary cloud storage
- **Benefits**:
  - Scalable storage (no server disk space limits)
  - CDN delivery for fast file access
  - Automatic image optimization
  - Secure file URLs
  - Organized by user: `secure-vault/digiusers/{userId}/`

### 3. Files Modified

#### Backend Models
- `backend/models/User.js`
  - Changed collection name to `digiusers`
  
- `backend/models/Document.js`
  - Removed `filePath` field (local storage)
  - Added `cloudinaryPublicId` field
  - Added `cloudinaryResourceType` field

#### Backend Configuration
- `backend/config/cloudinary.js` (NEW)
  - Cloudinary configuration
  - Multer storage adapter for Cloudinary
  - File upload middleware
  - Helper functions for file operations

#### Backend Routes
- `backend/routes/documents.js`
  - Updated upload route to use Cloudinary
  - Updated delete route to delete from Cloudinary
  - Updated download route to redirect to Cloudinary URL
  - Removed local file serving route

#### Dependencies
- `backend/package.json`
  - Added `cloudinary` package
  - Added `multer-storage-cloudinary` package

#### Documentation
- `backend/SETUP.md` - Updated with Cloudinary setup instructions
- `CLOUDINARY_SETUP.md` - Complete Cloudinary integration guide

## 📋 Setup Required

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Get Cloudinary Credentials
1. Sign up at https://cloudinary.com/ (free tier available)
2. Get credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 3. Update Environment Variables
Add to `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔄 How It Works Now

### User Registration
- Users are stored in `digiusers` collection in MongoDB
- All user data remains the same structure

### File Upload Flow
1. User uploads file via `/api/documents` (multipart/form-data)
2. File validated (type, size)
3. File uploaded to Cloudinary in folder: `secure-vault/digiusers/{userId}/`
4. Cloudinary returns:
   - `secure_url` - HTTPS URL
   - `public_id` - Unique identifier
   - `resource_type` - image/raw
5. Document record created with Cloudinary URL and metadata

### File Access
- Files accessed directly via Cloudinary URLs (CDN)
- No local file serving needed
- Download endpoint redirects to Cloudinary URL

### File Deletion
- File deleted from Cloudinary using `public_id`
- Document record removed from MongoDB
- User storage updated

## 📁 File Organization in Cloudinary

```
secure-vault/
  └── digiusers/
      └── {userId}/
          ├── {timestamp}-{random}.jpg
          ├── {timestamp}-{random}.png
          └── {timestamp}-{random}.pdf
```

## 🎯 Supported File Types

- **Images**: JPG, JPEG, PNG
  - Auto-optimized
  - Thumbnails generated
  - Max 800x800px (configurable)

- **PDFs**: PDF files
  - Stored as raw files
  - No transformation

## ⚠️ Important Notes

1. **Migration**: Existing documents with local file paths will still work, but new uploads use Cloudinary
2. **Storage Limits**: Cloudinary free tier: 25GB storage, 25GB bandwidth/month
3. **Security**: Never commit Cloudinary API Secret to git
4. **Backward Compatibility**: Old file paths are handled gracefully

## 🧪 Testing

1. **Signup**: Create new user (stored in `digiusers` collection)
2. **Upload Image**: Upload JPG/PNG file
3. **Upload PDF**: Upload PDF file
4. **View File**: Access file via `fileUrl` from document
5. **Download**: Use download endpoint (redirects to Cloudinary)
6. **Delete**: Delete document (removes from Cloudinary)

## 📚 Documentation

- See `CLOUDINARY_SETUP.md` for detailed Cloudinary setup
- See `backend/SETUP.md` for general backend setup
- See `backend/README.md` for API documentation

## ✅ Status

- ✅ User collection changed to `digiusers`
- ✅ Cloudinary integration complete
- ✅ File upload working with Cloudinary
- ✅ File deletion working with Cloudinary
- ✅ Download redirects to Cloudinary
- ✅ Documentation updated

Ready for testing! 🚀
