const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  website: { type: String, default: '' },
  role: { type: String, enum: ['user', 'author', 'admin'], default: 'author' },
  subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  monetization: { enabled: { type: Boolean, default: false }, plan: { type: String, default: 'free' } },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.matchPassword = async function(pw) { return await bcrypt.compare(pw, this.password); };
userSchema.methods.toJSON = function() { const o = this.toObject(); delete o.password; return o; };

module.exports = mongoose.model('User', userSchema);
