# Cloudinary Integration Guide

## Overview

The backend now uses Cloudinary for cloud-based file storage instead of local file storage. This allows:
- Scalable file storage
- Automatic image optimization
- CDN delivery for fast file access
- Secure file URLs
- Organized storage by user

## Setup Instructions

### 1. Create Cloudinary Account

1. Go to https://cloudinary.com/
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. After signup, you'll be taken to the Dashboard

### 2. Get Your Credentials

From the Cloudinary Dashboard:
- **Cloud Name**: Found at the top of the dashboard
- **API Key**: Found in the "Account Details" section
- **API Secret**: Found in the "Account Details" section (click "Reveal" to see it)

### 3. Add to Environment Variables

Add these to your `backend/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

### 4. Install Dependencies

The required packages are already in `package.json`:
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage adapter for Cloudinary

Run:
```bash
cd backend
npm install
```

## How It Works

### File Organization

Files are organized in Cloudinary with this structure:
```
secure-vault/
  └── digiusers/
      └── {userId}/
          └── {timestamp}-{random}.{ext}
```

### File Types Supported

- **Images**: JPG, JPEG, PNG
  - Automatically optimized
  - Thumbnails generated
  - Max dimensions: 800x800 (configurable)

- **PDFs**: PDF files
  - Stored as raw files
  - No transformation applied

### Upload Process

1. User uploads file via `/api/documents` endpoint
2. File is validated (type, size)
3. File is uploaded to Cloudinary in user's folder
4. Cloudinary returns:
   - `secure_url` - HTTPS URL for the file
   - `public_id` - Unique identifier for the file
   - `resource_type` - Type of resource (image/raw)
5. Document record is created in MongoDB with:
   - `fileUrl` - Cloudinary secure URL
   - `cloudinaryPublicId` - For future operations
   - `cloudinaryResourceType` - Resource type

### File Access

- Files are accessed directly via Cloudinary URLs (CDN)
- No need for local file serving
- Download endpoint redirects to Cloudinary URL

### File Deletion

When a document is deleted:
1. File is deleted from Cloudinary using `public_id`
2. Document record is removed from MongoDB
3. User storage is updated

## Benefits

✅ **Scalability**: No server storage limits
✅ **Performance**: CDN delivery for fast access
✅ **Reliability**: Cloudinary handles backups and redundancy
✅ **Optimization**: Automatic image optimization
✅ **Security**: Secure URLs with access control
✅ **Organization**: Files organized by user

## Migration from Local Storage

If you have existing documents with local file paths:
1. They will continue to work (backward compatible)
2. New uploads will use Cloudinary
3. Consider migrating old files to Cloudinary if needed

## Troubleshooting

### Upload Fails
- Check Cloudinary credentials in `.env`
- Verify file size is within limits (20MB default)
- Check file type is allowed
- Review Cloudinary dashboard for errors

### Files Not Accessible
- Verify `fileUrl` in document record
- Check Cloudinary dashboard for file status
- Ensure Cloudinary account is active

### Storage Limit Issues
- Free tier: 25GB storage, 25GB bandwidth/month
- Upgrade plan if needed
- Monitor usage in Cloudinary dashboard

## Production Considerations

1. **Security**: Keep API Secret secure, never commit to git
2. **Monitoring**: Set up Cloudinary webhooks for upload notifications
3. **Backup**: Cloudinary provides automatic backups
4. **CDN**: Files are automatically served via CDN
5. **Transformations**: Can add image transformations on-the-fly via URL parameters

## Example Cloudinary URLs

After upload, files are accessible via:
```
https://res.cloudinary.com/{cloud-name}/image/upload/v{version}/secure-vault/digiusers/{userId}/{filename}.{ext}
```

PDFs:
```
https://res.cloudinary.com/{cloud-name}/raw/upload/v{version}/secure-vault/digiusers/{userId}/{filename}.pdf
```
