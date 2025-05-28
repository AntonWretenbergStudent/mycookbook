# 🍳 MyCookbook API

En fullständig backend-API för en matlagningsapplikation som låter användare hantera recept, skapa matdagböcker, bokmärka favoriter och få AI-genererade matförslag.

## Funktioner

- **Användarhantering**: Registrering och inloggning med JWT-autentisering
- **Recepthantering**: Skapa, läsa, uppdatera och ta bort recept med bilduppladdning
- **Bokmärken**: Spara och hantera favoritrecept
- **Matdagbok**: Spåra måltider och vattenintag per dag
- **AI-förslag**: Få receptförslag baserat på ingredienser (text eller bild)
- **Att-göra-listor**: Skapa och hantera att-göra-listor med olika teman

## Teknisk stack

- **Backend**: Node.js med Express.js
- **Databas**: MongoDB med Mongoose ODM
- **Autentisering**: JSON Web Tokens (JWT)
- **Bildhantering**: Cloudinary för bilduppladdning och lagring
- **AI-integration**: Google Gemini API för receptförslag
- **Säkerhet**: bcryptjs för lösenordshashning
- **Logging**: Morgan för request logging
- **Schemaläggning**: Cron jobs för server wake-up

## Projektstruktur

```
├── index.js                 # Huvudserverfil
├── lib/
│   ├── cloudinary.js       # Cloudinary konfiguration
│   ├── cron.js             # Cron job för server wake-up
│   └── db.js               # MongoDB anslutning
├── middleware/
│   └── auth.middleware.js  # JWT autentisering middleware
├── models/
│   ├── User.js             # Användarmodell
│   ├── Recipe.js           # Receptmodell
│   ├── Bookmark.js         # Bokmärkesmodell
│   ├── DiaryEntry.js       # Dagboksmodell
│   └── TodoList.js         # Att-göra-lista modell
└── routes/
    ├── authRoutes.js       # Autentiseringsrutter
    ├── recipesRoutes.js    # Receptrutter
    ├── bookmarkRoutes.js   # Bokmärkesrutter
    ├── diaryRoutes.js      # Dagboksrutter
    ├── aiRoutes.js         # AI-förslagsrutter
    └── todoListRoutes.js   # Att-göra-lista rutter
```

## Installation och setup

1. **Klona projektet**
   ```bash
   git clone [ditt-repo-url]
   cd mycookbook-api
   ```

2. **Installera dependencies**
   ```bash
   npm install
   ```

3. **Skapa .env fil**
   ```env
   PORT=4000
   MONGO_URI=din_mongodb_anslutningssträng
   JWT_SECRET=din_jwt_hemlighet
   CLOUDINARY_CLOUD_NAME=ditt_cloudinary_cloud_name
   CLOUDINARY_API_KEY=din_cloudinary_api_key
   CLOUDINARY_API_SECRET=din_cloudinary_api_secret
   GEMINI_API_KEY=din_gemini_api_key
   API_URI=din_deployed_api_url_för_cron
   ```

4. **Starta servern**
   ```bash
   npm start
   ```

   För utveckling med nodemon:
   ```bash
   npm run dev
   ```

## API Endpoints

### Autentisering
- `POST /api/auth/register` - Registrera ny användare
- `POST /api/auth/login` - Logga in användare

### Recept
- `GET /api/recipes` - Hämta alla recept (med pagination och sökning)
- `GET /api/recipes/user` - Hämta användarens recept
- `POST /api/recipes` - Skapa nytt recept
- `DELETE /api/recipes/:id` - Ta bort recept

### Bokmärken
- `GET /api/bookmarks` - Hämta användarens bokmärken
- `POST /api/bookmarks` - Lägg till bokmärke
- `DELETE /api/bookmarks/:recipeId` - Ta bort bokmärke
- `GET /api/bookmarks/check/:recipeId` - Kontrollera om recept är bokmärkt

### Matdagbok
- `GET /api/diary/:date` - Hämta dagboksinlägg för specifikt datum
- `POST /api/diary/:date` - Skapa/uppdatera dagboksinlägg
- `DELETE /api/diary/:date/:mealType` - Ta bort måltid från dagbok

### AI-förslag
- `POST /api/ai/suggestions` - Få AI-genererade receptförslag

### Att-göra-listor
- `GET /api/todolists` - Hämta användarens listor
- `GET /api/todolists/:id` - Hämta specifik lista
- `POST /api/todolists` - Skapa ny lista
- `PUT /api/todolists/:id` - Uppdatera lista
- `DELETE /api/todolists/:id` - Ta bort lista

## 🔐 Autentisering

API:et använder JWT (JSON Web Tokens) för autentisering. Efter lyckad inloggning får klienten en token som ska inkluderas i Authorization header:

```
Authorization: Bearer <din-jwt-token>
```

## AI-funktionalitet

API:et integrerar med Google Gemini för att ge receptförslag baserat på:
- **Textinmatning**: Lista av ingredienser
- **Bildinmatning**: Bild på ingredienser

AI:et returnerar strukturerade receptförslag med ingredienser och instruktioner.

## 📱 Frontend integration

Detta API är designat för att fungera med en React Native frontend-applikation och stöder:
- Bilduppladdning via base64-kodning
- JSON-baserad kommunikation
- Mobilvänliga endpoints

## Cron Jobs

API:et inkluderar en cron job som skickar GET-requests var 14:e minut för att hålla servern aktiv (användbart för deployment på tjänster som Heroku).

## Deployment

API:et är förberett för deployment med:
- Miljövariabler för konfiguration
- Error handling och logging
- CORS-stöd för frontend-integration
- Produktionsklara säkerhetsinställningar

## Licens

[MIT]
