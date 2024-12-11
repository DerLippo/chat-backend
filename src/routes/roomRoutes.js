import express from 'express';
import Room from '../model/Room.js';
import User from '../model/User.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Raum erstellen
router.post('/createRoom', verifyToken, async (req, res) => {
  let { name, members } = req.body; // `members` enthält Benutzernamen

  members = members.map(name => name.toLowerCase());
  members = [...new Set(members)];
  if (!name || !members || members.length === 0) {
    return res
      .status(400)
      .json({ error: 'Name und Mitglieder sind erforderlich.' });
  }

  try {
    // Benutzernamen zu IDs auflösen
    const existingMembers = await User.find({ name: { $in: members } });

    if (existingMembers.length !== members.length) {
      return res.status(400).json({
        error:
          'Einer oder mehrere der angegebenen Mitglieder existieren nicht.',
      });
    }

    // Extrahiere die User IDs der gefundenen Mitglieder
    const memberIds = existingMembers.map(member => member._id);

    // Raum erstellen
    const newRoom = await Room.create({
      name,
      members: memberIds, // Speichere die User IDs
      createdAt: Date.now(),
    });

    res
      .status(201)
      .json({ message: 'Raum erfolgreich erstellt.', room: newRoom });
  } catch (err) {
    console.error('Fehler beim Erstellen des Raumes:', err);
    res.status(500).json({ error: 'Fehler beim Erstellen des Raumes.' });
  }
});

export default router;
