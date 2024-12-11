
# Chat-Anwendung (Backend)

Dies ist das Backend der Chat-Anwendung, das mit Node.js und Express entwickelt wurde. Es stellt die API und WebSocket-Logik für die Echtzeit-Kommunikation bereit.

## Aktuelle Version

**Version:** `1.0.0` (Release)

---

## Changelog
### 1.0.0
- Initialer Release mit den grundlegenden Funktionen:
  - Benutzer-Authentifizierung (Registrierung und Login)
  - Raum-Management (Räume erstellen, betreten und verlassen)
  - Echtzeit-Kommunikation über Socket.IO

---

## Funktionen

- **Benutzer-Authentifizierung**: Registrierung und Login mit verschlüsselten Passwörtern.
- **Raum-Management**: Räume erstellen, betreten und verlassen.
- **Nachrichten-Management**: Senden und Empfangen von Nachrichten in Echtzeit.
- **Online-Status**: Zeigt den aktuellen Status der Benutzer.
- **Rate Limiting**: Schutz vor übermäßigen Anfragen.
- **Token-basierte Authentifizierung**: Sicherer Zugriff auf geschützte Endpunkte.

---

## Installation und Setup

### Voraussetzungen

- **Node.js**: Version 16.x oder höher.
- **NPM**: Version 7.x oder höher.
- **MongoDB**: Version 5.x oder höher (lokal oder remote verfügbar).

### Schritte

1. **Repository klonen**:
   ```bash
   git clone https://github.com/derlippo/chat-backend.git
   cd chat-backend
   ```

2. **Abhängigkeiten installieren**:
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**:
   Erstelle eine `.env`-Datei im Stammverzeichnis mit folgendem Inhalt:
   ```env
   PORT=3001
   MONGO_URI=mongodb://localhost:27017/chat
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

4. **Entwicklungsserver starten**:
   ```bash
   npm run start:dev
   ```

5. **Produktionsserver starten**:
   ```bash
   npm start
   ```

---

### Verwendete Technologien
- **Node.js**: Server-seitige Plattform für JavaScript.
- **Express.js**: Webframework für die Erstellung von APIs.
- **Socket.IO**: Echtzeit-Kommunikation mit WebSocket-Unterstützung.
- **Mongoose**: ODM-Bibliothek für MongoDB.
- **JSON Web Tokens (JWT)**: Authentifizierung und Autorisierung.
- **Bcrypt**: Verschlüsselung von Passwörtern.
- **dotenv**: Verwaltung von Umgebungsvariablen.
- **CORS**: Cross-Origin Resource Sharing.
- **Express Rate Limit**: Schutz vor DDoS- und Brute-Force-Angriffen.
