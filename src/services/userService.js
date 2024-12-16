import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../model/User.js';

const JWT_SECRET = process.env.JWT_SECRET;

// Benutzer registrieren
export const registerUser = async (username, email, password) => {
  try {
    // Prüfen, ob Benutzername oder E-Mail bereits existiert
    const existingUser = await User.findOne({
      $or: [{ name: username.toLowerCase() }, { email: email }],
    });

    if (existingUser) {
      throw new Error('Benutzername oder E-Mail existieren bereits.');
    }

    // Passwort verschlüsseln
    const hashedPassword = await bcrypt.hash(password, 12);

    // Benutzer erstellen
    const newUser = await User.create({
      name: username.toLowerCase(),
      email,
      password: hashedPassword,
      createdAt: Date.now(),
    });
    return newUser;
  } catch (error) {
    throw new Error(`Fehler bei der Registierung: ${error.message}`);
  }
};

// Benutzer einloggen
export const loginUser = async (username, password) => {
  try {
    // Benutzer suchen
    const user = await User.findOne({ name: username.toLowerCase() });

    if (!user) {
      throw new Error('Ungültiger Benutzername oder Passwort.');
    }
    // Passwort überprüfen
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Ungültiger Benutzername oder Passwort.');
    }

    // JWT-Token generieren
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return { token, name: user.name };
  } catch (error) {
    throw new Error(`Fehler beim Login: ${error.message}`);
  }
};

// Benutzerinformationen abrufen
export const getUserById = async userId => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Benutzer nicht gefunden.');
    }

    return user;
  } catch (error) {
    throw new Error(`Fehler beim Abrufen des Benutzers: ${error.message}`);
  }
};

export const updateUserOnlineStatusById = async userId => {
  try {
    // Benutzer überprüfen
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Benutzer nicht gefunden.');
    }

    // Online Status aktualisieren
    const updateResult = await User.updateOne(
      { _id: userId },
      { activeAt: Date.now() }
    );

    // Prüfen ob die Aktualisierung erfolgreich war
    if (updateResult.modifiedCount === 0) {
      throw new Error('Der Online-Status konnte nicht aktualisiert werden.');
    }
  } catch (error) {
    throw new Error(
      `Fehler beim aktualisieren des Online-Status: ${error.message}`
    );
  }
};
