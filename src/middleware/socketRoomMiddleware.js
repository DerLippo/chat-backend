import {
  exitRoom,
  getRoomByRoomIdAndUserId,
  getRoomsByUserId,
} from '../services/roomService.js';
import {
  getRoomMessages,
  createMessage,
  getRoomLastMessage,
} from '../services/messageService.js';
import User from '../model/User.js';
import {
  getUserById,
  updateUserOnlineStatusById,
} from '../services/userService.js';

export const socketRoomMiddleware = (io, userSockets) => {
  io.on('connection', socket => {
    const userId = socket.userId;

    if (!userId) {
      socket.emit('error', { message: 'Authentifizierung erforderlich.' });
      return;
    }

    // Überprüfe ob userId schon im userSocket registriert ist
    // userSockets enthält alle aktiven Sitzungen eines Users
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.on('disconnect', () => {
      if (userSockets.has(userId)) {
        const sockets = userSockets.get(userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(userId);
        }
      }
    });

    /* Finde alle Räume dem der Nutzer angehört */
    socket.on('findRooms', async () => {
      try {
        const foundRooms = await getRoomsByUserId(socket.userId);

        const roomsWithLastMessage = await Promise.all(
          foundRooms.map(async el => {
            const lastMessage = await getRoomLastMessage(el._id, socket.userId);

            return {
              ...el,
              lastMessage,

              // lastMessageUserName,
            };
          })
        );

        // Füge das Feld `userName` in jedem Raum hinzu
        const roomsWithLastMessageUserName = await Promise.all(
          roomsWithLastMessage.map(async element => {
            element.members = undefined; // Entferne Members da nicht benötigt und userId sonst sichtbar

            const lastMsgUserId = element?.lastMessage?.userId?.toString();

            // Prüfe ob eine userId in der letzten Nachricht vorhanden ist (vielleicht gibts noch keine nachricht?)
            if (lastMsgUserId) {
              const user = await getUserById(lastMsgUserId); // Hole den Benutzer
              if (user) {
                element.lastMessage = {
                  ...element.lastMessage.toObject(), // Mache Object modifizerbar
                  userName: user.name, // Füge userName hinzu
                  userId: undefined, // Entferne userId
                };
              }
              // element.lastMessage.userName = user.name; // Füge den `userName` hinzu
            }

            return element; // Gib das modifizierte Element zurück
          })
        );

        socket.emit('receiveRooms', roomsWithLastMessageUserName);
      } catch (error) {
        socket.emit('error', {
          message: 'Fehler beim Abrufen der Räume.',
          details: error.message,
        });
      }
    });

    /* Betrete einen Raum und rufe Nachrichten + Details ab */
    socket.on('enterRoom', async data => {
      const { roomId } = data; // Extrahiere die Raum-ID
      try {
        const room = await getRoomByRoomIdAndUserId(roomId, socket.userId); // Finde den Raum in der Datenbank

        // Sicherheitsprüfung: Ist der User ein Mitglied dieses Raums?
        if (!room || !room.members.includes(socket.userId).toString()) {
          throw new Error('Du bist kein Mitglied dieses Raums.'); // Fehler senden, falls der Benutzer nicht berechtigt ist
        }

        // Dem Raum beitreten
        socket.join(roomId);
        console.log(`User ${socket.userId} hat Raum ${roomId} betreten.`);

        // Raumdetails abrufen und an den Client senden
        const roomDetails = {
          name: room.name,
          members: (
            await User.find(
              { _id: { $in: room.members } },
              { name: 1, activeAt: 1 }
            )
          ).map(el => ({ userName: el.name, activeAt: el.activeAt })),
        };

        // Nachrichten des Raums abrufen und zwischenspeichern
        let roomMessages = await getRoomMessages(roomId, socket.userId);

        // Nachrichten durchgehen und userId speichern
        const roomMessagesUserIds = [
          ...new Set(roomMessages.map(el => el.userId)),
        ];

        // Username anhand der userId suchen
        const roomMessagesUser = await User.find(
          {
            _id: { $in: roomMessagesUserIds },
          },
          { name: 1 }
        ).lean();

        // userId und userName zusammenführen
        const userMap = new Map(
          roomMessagesUser.map(user => [user._id.toString(), user.name])
        );

        // Nachrichten mit userName zusammenführen und userId entfernen
        roomMessages = roomMessages.map(message => {
          const userName =
            userMap.get(message.userId.toString()) || 'Unbekannt';
          return {
            ...message.toObject(), // Konvertiere zu reinem Objekt
            userName: userName, // Füge den Namen hinzu
            userId: undefined, // Entferne die userId
          };
        });

        // Sende an den Client
        socket.emit('receiveRoomData', { roomDetails, roomMessages });
      } catch (error) {
        console.error('Fehler beim Betreten des Raums:', error.message);
        socket.emit('error', {
          message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
          details: error.message,
        }); // Fehler an den Client senden
      }
    });

    socket.on('exitRoom', async data => {
      const roomId = data.roomId;
      if (!roomId || typeof roomId !== 'string') {
        socket.emit('error', { message: 'Ungültige Raum-ID.' });
        return;
      }

      try {
        const room = exitRoom(roomId, socket.userId);

        if (room) {
          socket.leave(roomId);
          socket.emit('exitRoomSuccessfull');
        }
      } catch (error) {
        socket.emit('error', {
          message: 'Der Raum konnte nicht verlassen werden.',
          details: error.message,
        });
      }
    });

    /* Speichere eine neue Nachricht und sende an verbundende Clients */
    socket.on('sendChatMessage', async data => {
      const { roomId, textMessage } = data;

      if (!roomId || typeof roomId !== 'string') {
        socket.emit('error', { message: 'Ungültige Raum-ID.' });
        return;
      }

      if (!textMessage || typeof textMessage !== 'string') {
        socket.emit('error', { message: 'Ungültige Nachricht.' });
        return;
      }

      try {
        // Überprüfen, ob der Benutzer Mitglied im Raum ist
        const room = await getRoomByRoomIdAndUserId(roomId, socket.userId);

        if (!room || !room.members.includes(socket.userId).toString()) {
          throw new Error('Du bist kein Mitglied dieses Raums.');
        }

        // Nachricht erstellen
        let newMessage = await createMessage(
          roomId,
          socket.userId,
          textMessage
        );

        newMessage = newMessage.toObject();
        const newMessageUser = await getUserById(newMessage.userId);
        newMessage.userName = newMessageUser.name;
        newMessage.userId = undefined;

        // Nachricht an alle Mitglieder des Raums senden
        room.members.forEach(async roomMember => {
          const roomMemberUserId = roomMember.toString();
          // Räume für das Mitglied aktualisieren
          const foundRooms = await getRoomsByUserId(roomMemberUserId);

          const roomsWithLastMessage = await Promise.all(
            foundRooms.map(async el => {
              let lastMessage = await getRoomLastMessage(
                el._id,
                roomMemberUserId
              );

              if (lastMessage) {
                lastMessage = lastMessage.toObject();
                const senderUser = await getUserById(lastMessage.userId);
                lastMessage.userName = senderUser.name;
                lastMessage.userId = undefined;
              }

              return {
                ...el,
                lastMessage,
              };
            })
          );

          // Überprüfen, ob das Mitglied aktuell verbunden ist
          if (userSockets.has(roomMemberUserId)) {
            userSockets.get(roomMemberUserId).forEach(socketId => {
              // Räume aktualisieren
              io.to(socketId).emit('receiveRooms', roomsWithLastMessage);

              // Nachricht an den Raum senden (optional, falls aktiv)
              io.to(socketId).emit('receiveRoomData', {
                roomMessages: newMessage,
              });
            });
          }
        });

        console.log(
          `Nachricht erfolgreich gesendet an Mitglieder des Raums ${roomId}`
        );
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error.message);
        socket.emit('error', {
          message: 'Nachricht konnte nicht gesendet werden.',
          details: error.message,
        });
      }
    });

    /* Lade ältere Nachrichten */
    socket.on('loadChatMessagePrevious', async data => {
      if ((data.roomId, data.msgId)) {
        // Nachrichten des Raums abrufen und zwischenspeichern
        let roomMessages = await getRoomMessages(
          data.roomId,
          socket.userId,
          data.msgId
        );

        // Nachrichten durchgehen und userId speichern
        const roomMessagesUserIds = [
          ...new Set(roomMessages.map(el => el.userId)),
        ];

        // Username anhand der userId suchen
        const roomMessagesUser = await User.find(
          {
            _id: { $in: roomMessagesUserIds },
          },
          { name: 1 }
        ).lean();

        // userId und userName zusammenführen
        const userMap = new Map(
          roomMessagesUser.map(user => [user._id.toString(), user.name])
        );

        // Nachrichten mit userName zusammenführen und userId entfernen
        roomMessages = roomMessages.map(message => {
          const userName =
            userMap.get(message.userId.toString()) || 'Unbekannt';
          return {
            ...message.toObject(), // Konvertiere zu reinem Objekt
            userName: userName, // Füge den Namen hinzu
            userId: undefined, // Entferne die userId
          };
        });

        // Sende an den Client
        socket.emit('receiveRoomData', { roomMessages });
      }
    });

    // Aktualisiere den online Status und sende ggf Raum Details an den Client falls dieser sich aktuell im Raum befindet
    socket.on('updateOnlineStatus', async data => {
      const userId = socket.userId;
      if (!userId) return;
      updateUserOnlineStatusById(userId); // Aktualisiere Online Status

      if (!data.roomId) return; // Prüfe ob roomId vorhanden ist
      const roomId = data.roomId;

      const room = await getRoomByRoomIdAndUserId(roomId, userId); // Finde den Raum in der Datenbank

      // Sicherheitsprüfung: Ist der User ein Mitglied dieses Raums?
      if (!room || !room.members.includes(socket.userId).toString()) {
        socket.emit('error', {
          message: 'Du bist kein Mitglied dieses Raums.',
        }); // Fehler senden, falls der Benutzer nicht berechtigt ist
        socket.leave(roomId);
        return;
      }

      // Raumdetails abrufen und an den Client senden
      const roomDetails = {
        name: room.name,
        members: (
          await User.find(
            { _id: { $in: room.members } },
            { name: 1, activeAt: 1 }
          )
        ).map(el => ({ userName: el.name, activeAt: el.activeAt })),
      };

      socket.emit('receiveRoomData', { roomDetails });
    });
  });
};
