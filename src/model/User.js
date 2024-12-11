import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  activeAt: { type: Date, default: Date.now },
  disabled: { type: Boolean, default: false },
  role: { type: String, default: 'user' },
});

// Pre-Hook: Name in Kleinbuchstaben konvertieren und Leerzeichen entfernen
userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    // Konvertiere den Namen zu Kleinbuchstaben
    // Entferne:
    // - Normale Leerzeichen (\s)
    // - Zero Width No-Break Space (\uFEFF)
    // - Non-breaking Space (\xA0)
    this.name = this.name.toLowerCase().replace(/[\s\uFEFF\xA0]+/g, '');
  }
  next();
});

// Pre-Hook: Email in Kleinbuchstaben speichern und Leerzeichen entfernen
userSchema.pre('save', function (next) {
  if (this.isModified('email')) {
    // Konvertiere die E-Mail zu Kleinbuchstaben
    // Entferne:
    // - Normale Leerzeichen (\s)
    // - Zero Width No-Break Space (\uFEFF)
    // - Non-breaking Space (\xA0)
    this.email = this.email.toLowerCase().replace(/[\s\uFEFF\xA0]+/g, '');
  }
  next();
});

const User = model('User', userSchema);
export default User;
