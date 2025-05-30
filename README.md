# MyCookbook – Mobilapplikation

MyCookbook är en mobilapp byggd med **React Native** och **Expo** där du kan skapa, hantera och spara recept, föra matdagbok och få AI-genererade matförslag. Appen kommunicerar med ett eget backend-API.

---

## Funktioner

- Användarregistrering och inloggning med JWT-autentisering
- Skapa, redigera och ta bort recept med bilder
- Få AI-förslag genom att fota eller skriva in ingredienser
- Spara favoritrecept med bokmärken
- Håll koll på måltider och vattenintag i matdagboken
- Skapa inköpslistor och att-göra-listor
- Smart sökning bland recept
- Stöd för både iOS och Android

---

## Teknisk översikt

| Teknologi         | Beskrivning                          |
|-------------------|--------------------------------------|
| **Framework**     | React Native med Expo                |
| **Navigation**    | React Navigation (Stack & Tabs)      |
| **State**         | Context API och useState             |
| **API**           | Axios                                |
| **Lokal lagring** | AsyncStorage                         |
| **Bildhantering** | Expo ImagePicker                     |
| **Autentisering** | JWT-token                            |
| **Databas**       | MongoDB Atlas (via Mongoose)         |
| **Styling**       | Flexbox & StyleSheet                 |
---

## Kom igång

### Förutsättningar

- Node.js (v14+)
- npm eller yarn
- Expo CLI installerat globalt
- Expo Go app (för testning på mobil)

### Installation

```bash
git clone [repo-url]
cd mycookbook-mobile
npm install
```

### Konfiguration

Skapa eller uppdatera `config.js`:

```js
export const API_BASE_URL = 'http://localhost:4000/api';
// Eller produktion:
// export const API_BASE_URL = 'https://your-api.com/api';
```

### Starta utvecklingsservern

```bash
npx expo start
```

Öppna med Expo Go eller använd en emulator.

---

## Autentisering

Appen använder JWT-token som lagras i AsyncStorage. Inloggning och utloggning hanteras säkert, och token uppdateras automatiskt vid behov.

---

## Kamerafunktioner

- Ta bilder eller välj från galleriet till recept
- Fota ingredienser för att få AI-baserade receptförslag
- Bilder komprimeras automatiskt innan uppladdning

---

## UI och UX

- Anpassad för olika skärmstorlekar
- Smidiga navigationsövergångar
- Pull-to-refresh och tydliga laddningsindikatorer
- Användarvänlig felhantering

---

## API Endpoints

| Funktion       | Endpoint                     |
|----------------|------------------------------|
| Auth           | `/api/auth/*`                |
| Recept         | `/api/recipes/*`             |
| Bokmärken      | `/api/bookmarks/*`           |
| Matdagbok      | `/api/diary/*`               |
| AI-förslag     | `/api/ai/suggestions`        |
| Att-göra-listor| `/api/todolists/*`           |

---

## Testning

```bash
npm test       # Om testscript finns
npm run lint   # Kodstilskontroll
```

---

## Miljövariabler

Skapa en `.env`-fil i projektroten med:

```env
PORT=4000
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
API_URL=https://your-api.com/api
MONGO_URI=mongodb+srv://...
GEMINI_API_KEY=your_key
```

---

## Vanliga problem

**Metro bundler-fel:**
```bash
npx expo start --clear
```

**API-anslutning fungerar inte:**
- Kontrollera att backend kör
- Kontrollera att API_URL är korrekt

**Build-fel:**
```bash
npx expo install --fix
```
---

## Licens

MIT
