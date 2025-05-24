import Message from '../model/Message.js';
import Room from '../model/Room.js';

// Benutzerberechtigung prüfen
const checkUserPermission = async (roomId, userId) => {
  const room = await Room.findOne({
    _id: roomId,
    members: { $in: [userId] },
  });

  if (!room) {
    throw new Error(
      'Zugriff verweigert: Benutzer ist kein Mitglied dieses Raums.'
    );
  }
};

// Nachricht erstellen
export const createMessage = async (roomId, userId, content) => {
  try {
    // Berechtigung prüfen
    await checkUserPermission(roomId, userId);

    const newMessage = await Message.create({
      roomId,
      userId,
      contents: [
        {
          type: 'text',
          content,
        },
      ],
      createdAt: Date.now(),
    });
    return newMessage;
  } catch (error) {
    throw new Error(`Fehler beim Erstellen der Nachricht: ${error.message}`);
  }
};

// Nachrichten eines Raumes abrufen
export const getRoomMessages = async (roomId, userId, msgId) => {
  if (msgId) {
    // Lade ältere Nachrichten
    try {
      // Berechtigung prüfen
      await checkUserPermission(roomId, userId);

      const messages = await Message.find({
        roomId,
        _id: { $lt: msgId },
      })
        .sort({ _id: -1 }) // Neueste zuerst (absteigend nach ID)
        .limit(5);
      return messages.reverse();
    } catch (error) {
      throw new Error(`Fehler beim Abrufen der Nachrichten ${error.message}`);
    }
  } else {
    // Lade die neusten x Nachrichten
    try {
      // Berechtigung prüfen
      await checkUserPermission(roomId, userId);

      const messages = await Message.find({ roomId })
        .sort({ _id: -1 }) // Neueste Nachrichten zuerst
        .limit(50); // Begrenze auf x Nachrichten

      messages.reverse(); // Drehe die Reihenfolge um, um älteste → neueste zu zeigen
      return messages;
    } catch (error) {
      throw new Error(`Fehler beim Abrufen der Nachrichten ${error.message}`);
    }
  }
};
// Nachrichten eines Raumes abrufen
export const getRoomLastMessage = async (roomId, userId) => {
  try {
    // Berechtigung prüfen
    await checkUserPermission(roomId, userId);

    const messages = await Message.findOne({ roomId }).sort({ _id: -1 });
    return messages;
  } catch (error) {
    throw new Error(
      `Fehler beim Abrufen der letzten Nachricht ${error.message}`
    );
  }
};

// Nachrichten löschen
export const deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error('Nachricht nicht gefunden.');
    }

    await checkUserPermission(message.roomId, userId);

    const deletedMessage = await Message.findByIdAndDelete(messageId);
    return deletedMessage;
  } catch (error) {
    throw new Error(`Fehler beim löschen der Nachricht: ${error.message}`);
  }
};

export const getMessageStats = async roomId => {
  try {
    const messagesUnreaded = await Message.countDocuments({
      _id: roomId,
      readedAt: { $ne: null },
    });

    const messageStats = {
      messagesUnreaded: messagesUnreaded.length,
    };

    return messageStats;
  } catch (err) {
    throw new Error('There was an error:', err);
  }
};

export const updateMessageReadedAt = async (roomId, messageId, userId) => {
  try {
    const messageReadedAt = Message.updateOne(
      { _id: messageId, roomId, 'readedAt.userId': { $ne: userId } },
      { $addToSet: { readedAt: { userId, date: Date.now() } } }
    );
  } catch (error) {
    throw new Error('There was an Error while updating readedAt:', error);
  }
};
