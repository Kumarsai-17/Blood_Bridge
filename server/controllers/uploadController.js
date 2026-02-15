const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * UPLOAD DOCUMENTS
 * For hospital and blood bank registration documents
 */
exports.uploadDocuments = upload.array('documents', 5); // Allow up to 5 files

exports.handleDocumentUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Generate file URLs
    const fileUrls = req.files.map(file => {
      return {
        filename: file.filename,
        originalName: file.originalname,
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      };
    });

    console.log('📁 Files uploaded:', fileUrls.length);

    res.json({
      success: true,
      message: `${fileUrls.length} file(s) uploaded successfully`,
      files: fileUrls
    });

  } catch (error) {
    console.error('UPLOAD ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

/**
 * DELETE UPLOADED FILE
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

  } catch (error) {
    console.error('DELETE FILE ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete file'
    });
  }
};