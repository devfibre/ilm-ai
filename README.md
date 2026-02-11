# ILM AI - Islamisches Wissens-Q&A-System

Eine production-ready Next.js-Anwendung für ein AI-gestütztes Q&A-System zu islamischem Wissen (ʿIlm).

## 🎯 Überblick

Diese Anwendung ermöglicht es Nutzern, Fragen zum Islam zu stellen (Aqidah, Fiqh, Ibadah, Akhlaq, Sira, Alltag) und erhält Antworten über die DevFibre API. Das System verwendet einen Polling-Mechanismus, da die API kein Streaming unterstützt.

## 🚀 Features

- ✅ Respektvolle, wissensorientierte Benutzeroberfläche
- ✅ Question → Answer Flow mit Polling-Mechanismus
- ✅ Sichere API-Integration über Next.js Route Handlers
- ✅ Markdown-Unterstützung für formatierte Antworten
- ✅ LocalStorage-Persistenz für Chat-Verlauf
- ✅ Responsive Design mit Tailwind CSS
- ✅ TypeScript für Type-Safety
- ✅ Deutsche Sprache

## 📋 Voraussetzungen

- Node.js 18+ 
- DevFibre API Key

## 🔧 Installation

1. **Projekt klonen oder ZIP herunterladen**

2. **Dependencies installieren**
```bash
npm install
```

3. **Environment Variables einrichten**

Erstellen Sie eine `.env.local`-Datei im Projektroot:

```env
DEVFIBRE_API_BASE_URL=https://gpt.devfibre.com
DEVFIBRE_API_KEY=your_api_key_here
```

4. **Development Server starten**
```bash
npm run dev
```

Die App läuft nun auf [http://localhost:3000](http://localhost:3000)

## 🏗️ Projektstruktur

```
app/
├── page.tsx                          # Landing Page
├── chat/page.tsx                     # Chat Interface
├── layout.tsx                        # Root Layout
├── globals.css                       # Globale Styles & Design Tokens
└── api/
    └── devfibre/
        ├── question/new/route.ts     # POST /api/devfibre/question/new
        └── answer/[questionId]/route.ts  # GET /api/devfibre/answer/:id

components/
├── chat-window.tsx                   # Haupt-Chat-Komponente
├── message-bubble.tsx                # Einzelne Nachricht
├── prompt-chips.tsx                  # Beispielfragen
└── ui/                               # shadcn/ui Komponenten

lib/
└── devfibre/
    ├── types.ts                      # TypeScript Types
    └── client.ts                     # Client-seitige API Helpers
```

## 🔄 Polling-Mechanismus

Da die DevFibre API kein Streaming unterstützt, verwendet die App einen Polling-Ansatz:

### Ablauf:

1. **Frage senden**: User gibt Frage ein → POST zu `/api/devfibre/question/new`
2. **Question ID erhalten**: API gibt `questionId` zurück
3. **Polling starten**: 
   - Alle **1500ms** (1,5 Sekunden) wird GET `/api/devfibre/answer/{questionId}` aufgerufen
   - Maximum **30 Sekunden** lang
4. **Antwort erhalten**: Sobald `answer` verfügbar ist, wird Polling gestoppt
5. **Anzeige**: Markdown-formatierte Antwort wird gerendert

### Code-Beispiel:

```typescript
const pollForAnswer = async (questionId: string) => {
  const startTime = Date.now();
  
  const poll = async () => {
    const result = await getAnswer(questionId);
    
    if (result && result.answer) {
      // Antwort erhalten - Polling stoppen
      return;
    }

    if (Date.now() - startTime > MAX_POLLING_DURATION) {
      throw new Error('Timeout');
    }

    // Weiter pollen
    setTimeout(poll, POLLING_INTERVAL);
  };

  poll();
};
```

## 🔐 Sicherheit

- ✅ **API-Key nur auf dem Server**: Der DevFibre API-Key wird niemals im Client exponiert
- ✅ **Route Handlers als Proxy**: Alle API-Calls laufen über Next.js Route Handlers
- ✅ **Environment Variables**: Sensible Daten in `.env.local`
- ✅ **Input Validation**: Alle User-Inputs werden validiert

## 📡 API Endpoints

### Verwendete DevFibre API Endpoints:

#### 1. Neue Frage erstellen
```
POST https://gpt.devfibre.com/v1/question/new
Header: X-API-KEY: <key>
Body: { "text": "Frage...", "lang": "de" }
Response: { "questionId": "..." }
```

#### 2. Antwort abrufen
```
GET https://gpt.devfibre.com/v1/answer/{questionId}
Header: X-API-KEY: <key>
Response: { 
  "answer": "Markdown-Text...",
  "referencedDocumentIds": [...]
}
```

### Interne Next.js API Routes:

- `POST /api/devfibre/question/new` - Proxy für Fragenerstellung
- `GET /api/devfibre/answer/:id` - Proxy für Antwortabruf

## 🎨 Design

Die App verwendet ein beruhigendes, respektvolles Design:

- **Primärfarbe**: Teal/Grün (symbolisiert Wissen und Ruhe)
- **Hintergrund**: Sanfte Off-White/Grau-Töne
- **Typografie**: Geist Sans (klar und lesbar)
- **Komponenten**: shadcn/ui mit Custom-Theming

## 📱 Responsive Design

- Mobile-first Ansatz
- Optimiert für alle Bildschirmgrößen
- Touch-freundliche Bedienelemente

## 🛠️ Development

```bash
# Development Server
npm run dev

# Production Build
npm run build

# Production Start
npm start

# Linting
npm run lint
```

## 📝 Wichtige Hinweise

1. **Kein Fatwa-Ersatz**: Die App zeigt einen deutlichen Disclaimer
2. **Polling-Timeouts**: Nach 30 Sekunden wird das Polling abgebrochen
3. **LocalStorage**: Chat-Verlauf wird lokal gespeichert (kein Backend nötig)
4. **Error Handling**: Alle API-Fehler werden benutzerfreundlich dargestellt

## 🚀 Deployment

Die App kann problemlos auf Vercel deployed werden:

1. Repository auf GitHub pushen
2. Mit Vercel verbinden
3. Environment Variables in Vercel Dashboard setzen:
   - `DEVFIBRE_API_BASE_URL`
   - `DEVFIBRE_API_KEY`
4. Deploy!

## 📄 Lizenz

Dieses Projekt wurde für IFW - ILM AI erstellt.

## 🤝 Support

Bei Fragen oder Problemen:
1. Überprüfen Sie die Environment Variables
2. Stellen Sie sicher, dass der API-Key gültig ist
3. Checken Sie die Browser Console für Fehler
4. Prüfen Sie die Network-Requests im DevTools

---

**Entwickelt mit ❤️ und Respekt für islamisches Wissen**
