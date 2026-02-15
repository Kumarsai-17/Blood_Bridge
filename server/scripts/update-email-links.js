/**
 * Script to update all hardcoded localhost links in email templates
 * Run this script to replace localhost URLs with environment variable
 * 
 * Usage: node scripts/update-email-links.js
 */

const fs = require('fs');
const path = require('path');

const files = [
  '../controllers/adminController.js',
  '../controllers/hospitalController.js',
  '../controllers/authController.js'
];

const replacements = [
  {
    old: "http://localhost:5173/login",
    new: "${process.env.FRONTEND_URL || 'http://localhost:5173'}/login"
  },
  {
    old: "http://localhost:5173/donor/requests",
    new: "${process.env.FRONTEND_URL || 'http://localhost:5173'}/donor/requests"
  },
  {
    old: "http://localhost:5173/verify-email",
    new: "${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email"
  },
  {
    old: "http://localhost:5173/reset-password",
    new: "${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password"
  }
];

console.log('🔄 Updating email links in controllers...\n');

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  replacements.forEach(({ old, new: newText }) => {
    if (content.includes(old)) {
      content = content.replace(new RegExp(old.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
      changed = true;
      console.log(`✅ Updated: ${old} → ${newText}`);
    }
  });
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`📝 Saved: ${file}\n`);
  } else {
    console.log(`ℹ️  No changes needed: ${file}\n`);
  }
});

console.log('✨ Done! All email links updated.');
console.log('\n📌 Remember to set FRONTEND_URL in your .env file:');
console.log('   FRONTEND_URL=https://your-vercel-app.vercel.app');
