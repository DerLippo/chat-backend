import Room from '../model/Room.js';
import User from '../model/User.js';

// Räume eines Nutzers abrufen
export const getRoomsByUserId = async userId => {
  try {
    const rooms = await Room.find({ members: userId }).lean();
    return rooms;
  } catch (error) {
    throw new Error(`Fehler beim Abrufen der Räume: ${error.message}`);
  }
};

// Überprüfe ob der Raum existiert
export const getRoomByRoomIdAndUserId = async (roomId, userId) => {
  try {
    const rooms = await Room.findOne({ _id: roomId, members: userId }).lean();
    return rooms;
  } catch (error) {
    throw new Error(
      `Der Raum existiert nicht oder Zugriff verweigert: ${error.message}`
    );
  }
};

// Raumdetails abrufen
export const getRoomDetails = async (roomId, userId) => {
  try {
    const room = await Room.findOne({
      _id: roomId,
      members: { $in: [userId] },
    });
    if (!room) throw new Error('Raum nicht gefunden oder Zugriff verweigert.');
    return room;
  } catch (error) {
    throw error;
  }
};

// Raum erstellen
export const createRoom = async (name, members) => {
  try {
    const lowerCaseMembers = members.map(name => name.toLowerCase());
    const existingMembers = await User.find({
      name: { $in: lowerCaseMembers },
    });

    if (existingMembers.length !== members.length) {
      throw new Error(
        'Einer oder mehrere der Angegebenen Mitglieder existieren nicht.'
      );
    }

    const memberIds = existingMembers.map(member => member._id);
    const newRoom = await Room.create({
      name,
      members: memberIds,
      createdAt: Date.now(),
    });

    return newRoom;
  } catch (error) {
    throw error;
  }
};

// Raum verlassen
export const exitRoom = async (roomId, userId) => {
  try {
    const exit = await Room.findByIdAndUpdate(
      roomId,
      { $pull: { members: userId } },
      { new: true }
    );

    if (!exit) {
      throw new Error(
        'Raum nicht gefunden oder Benutzer konnte nicht entfernt werden.'
      );
    }

    return exit;
  } catch (error) {
    throw new Error(`Fehler beim Verlassen des Raums: ${error.message}`);
  }
};
