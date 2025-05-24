# Chat-Anwendung (Backend)

Dies ist das Backend der Chat-Anwendung, das mit Node.js und Express entwickelt wurde. Es stellt die API und WebSocket-Logik für die Echtzeit-Kommunikation bereit.

## Aktuelle Version

**Version:** `1.2.0`

---

## Changelog

### **1.2.0**

- **Token-Lebensdauer erweitert**:

  - Die Token-Gültigkeit wurde von **24 Stunde** auf **7 Tage** erhöht.

- **Nachricht gelesen / ungelesen**:
  - Funktionalitäten hinzugefügt. Services, Middleware erweitert.

### 1.1.0

- **Rate Limiter angepasst**:
  - Erhöhung der Anfragenbegrenzung von **100 Anfragen** auf **1000 Anfragen** pro **15 Minuten**.
- **Token-Lebensdauer erweitert**:
  - Die Token-Gültigkeit wurde von **1 Stunde** auf **24 Stunden** erhöht.
- **Ping-Mechanismus**:
  - Der Server sendet jetzt regelmäßige Pings, um die Verbindung zum Client aufrechtzuerhalten.
- **Cookie-Konfiguration optimiert**:
  - SameSite-Attribut auf **Lax** geändert, um die Browser-Kompatibilität zu verbessern.
  - Einführung neuer `.env`-Variablen:
    - **COOKIE_DOMAIN** für die Produktionsumgebung.
    - **COOKIE_DOMAIN_DEV** für die Entwicklungsumgebung.
- **Bugfix**:
  - Problem behoben, bei dem das Token im Frontend nicht korrekt gesetzt wurde.

### 1.0.1

- Aktivierung von `trust proxy` für Produktionsumgebungen.

### 1.0.0

- **Initialer Release mit den grundlegenden Funktionen**:
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

### Umgebungsvariablen

Erstelle eine `.env`-Datei im Stammverzeichnis und füge die folgenden Variablen hinzu:

```env
NODE_ENV=production

# Geheimschlüssel für JWT-Token (zur Authentifizierung)
JWT_SECRET=<SUCHDIRWASAUS>

# Domain für Cookies in Development
COOKIE_DOMAIN_PROD=localhost

# Domain für Cookies in Production
COOKIE_DOMAIN=example.com

# MongoDB-URI für die Entwicklungsumgebung
MONGODB_URI_DEV=mongodb://localhost:27017/chatDB

# MongoDB-URI für die Produktionsumgebung
MONGODB_URI=mongodb://localhost:27017/chatDB

# Client-URI für die Entwicklungsumgebung
CLIENT_URI_DEV=http://localhost:3000

# Client-URI für die Produktionsumgebung
CLIENT_URI=http://localhost:3000

# Server-Port für die Entwicklungsumgebung
SERVER_PORT_DEV=3001

# Server-Port für die Produktionsumgebung
SERVER_PORT=3001
```
