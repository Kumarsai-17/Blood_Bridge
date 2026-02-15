const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['approved', 'rejected', 'user_created', 'user_deleted', 'status_changed']
  },
  targetUserId: {
    type: String,
    required: true
  },
  targetUserName: {
    type: String,
    required: true
  },
  targetUserRole: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  details: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
