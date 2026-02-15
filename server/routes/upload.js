const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Upload documents
router.post('/documents', 
  uploadController.uploadDocuments,
  uploadController.handleDocumentUpload
);

// Delete document
router.delete('/documents/:filename', uploadController.deleteDocument);

module.exports = router;