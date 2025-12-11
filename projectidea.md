# Drehmoment - Wartungsplattform für Handwerksbetriebe

**Projektdefinition für Multi-Agent System**

## Projektzusammenfassung

**Typ:** SaaS-Anwendung (Web-basiert, Mobile-First)  
**Zielgruppe:** Selbstständige Heizungsbauer (Ein-Mann-Betriebe)  
**Problem:** Manuelle Excel-basierte Kundenverwaltung, vergessene Wartungstermine, zeitaufwändige telefonische Kundenorganisation  
**Lösung:** Automatisierte Wartungsmanagement-Plattform mit intelligenten Erinnerungen und mobiler Zugänglichkeit  
**Business Case:** Reduktion von ~€20.000/Jahr Opportunitätskosten pro Betrieb

**Branding:**

- **Produktname:** Drehmoment
- **Tagline:** "Der Hebel für dein Handwerk"
- **Domain:** drehmoment.de (primär) oder drehmoment.app (alternativ)
- **GmbH:** Drehmoment GmbH (bei Firmierung)
- **Positionierung:** Professionelle, moderne Wartungsplattform spezialisiert auf Handwerksbetriebe

---

## 1. Geschäftlicher Kontext

### 1.1 Primärer Nutzer: Max

**Profil:**

- Selbstständiger Heizungsbauer, Ein-Mann-Betrieb
- ~80 Wartungskunden + Ad-hoc-Reparaturen
- Technische Affinität: Mittel (nutzt Smartphone, Excel, Email)
- Aktuell: 8h/Woche für Administration (Excel, Telefonate, Terminplanung)

**Schmerzpunkte:**

- Manuelle Prüfung von Wartungsterminen in Excel
- Telefonische Kundenkontaktierung (15-20 Min pro Kunde)
- Vergessene Wartungen → Kundenunzufriedenheit
- Keine systematische Materialplanung vor Terminen
- Kundendaten verstreut (Excel, Handy-Kontakte, Notizen)

**Geschätzte Kosten des Status Quo:**

- Organisationsaufwand: €16.640/Jahr (8h/Woche × €40/h)
- Verpasste Wartungen: €3.000-5.000/Jahr Kundenverlust
- **Gesamt: ~€20.000/Jahr Opportunitätskosten**

### 1.2 Langfristige Vision

**Phase 1 (MVP - Q1 2025):** Max als Beta-Nutzer  
**Phase 2 (Beta - Q2 2025):** 5-10 Heizungsbauer in Max' Netzwerk  
**Phase 3 (SaaS - Q3/Q4 2025):** Öffentliches SaaS-Produkt, Multi-Mandanten-Fähigkeit  
**Phase 4 (Scale - 2026):** Expansion auf andere Handwerksberufe (Klempner, Elektriker, Schornsteinfeger)

**Marktpotenzial:**

- ~15.000 Ein-Mann-Heizungsbaubetriebe in Deutschland
- Konservativ: 50 Kunden × €29/Monat = €17.400/Jahr
- Realistisch: 100 Kunden × €39/Monat = €46.800/Jahr

---

## 2. Funktionale Anforderungen (MVP)

### 2.1 Kundenverwaltung

**Kernfunktionen:**

- Kunde anlegen mit: Name, Adresse, Telefon, Email (optional), Notizen
- Einem Kunden N Heizungen zuordnen (1:n Beziehung)
- Pro Heizung: Modell, Installationsdatum, Seriennummer, Wartungsintervall
- Intervalle: 1/3/6/12/24 Monate wählbar
- Kundenliste: Sortierbar, durchsuchbar, filterbar nach "Wartung fällig"
- Mobile-optimierte Eingabeformulare (große Touch-Targets)

**Acceptance Criteria:**

- Kunde anlegen in <60 Sekunden möglich
- Kundenliste lädt in <2 Sekunden
- Suche funktioniert in Echtzeit
- Mobile UI auf iPhone/Android optimiert

### 2.2 Wartungsmanagement

**Automatische Terminberechnung:**

```
Nächste Wartung = Letzte Wartung + Wartungsintervall
```

- Berechnung erfolgt automatisch beim Anlegen
- Neuberechnung nach jeder erledigten Wartung
- Anzeige: "in X Tagen" + konkretes Datum

**Wartung erledigen (Mobile-optimiert):**

1. Kunde/Heizung öffnen
2. Button "Wartung erledigt"
3. Datum bestätigen (default: heute)
4. Optional: Notizfeld "Was wurde gemacht?"
5. Optional: Fotos hochladen (Kamera direkt)
6. System berechnet nächste Wartung automatisch

**Wartungshistorie:**

- Chronologische Auflistung aller Wartungen
- Pro Eintrag: Datum, Notizen, Fotos
- Fotos als Thumbnails, klickbar für Vollbild
- Filterbar (letztes Jahr, letzte 5 Wartungen)

**Technische Details:**

- Offline-Fähigkeit: Wartungen können offline abgehakt werden
- Automatische Synchronisation bei Verbindung
- Service Worker für PWA-Funktionalität

### 2.3 Automatisierte Benachrichtigungen

**Email an Kunde (4 Wochen vorher):**

- Cronjob läuft täglich 6:00 Uhr
- Prüft: Wartung in exakt 28 Tagen fällig?
- Sendet personalisierte Email mit:
  - Kundenname, Heizungsmodell
  - Voraussichtliches Datum
  - Max' Kontaktdaten
  - Abmelde-Link (DSGVO!)
- Nur wenn: Email-Adresse hinterlegt + Opt-In + noch nicht gesendet

**Email an Kunde (1 Woche vorher):**

- Erinnerungs-Email 7 Tage vor Wartung
- Nur wenn noch kein Termin im System

**Wöchentliche Übersicht für Max:**

- Jeden Montag 7:00 Uhr Email an Max
- Gruppiert:
  - Überfällige Wartungen
  - Diese Woche fällig
  - Nächste Woche fällig
- Pro Kunde: Name, Adresse, Telefon, Datum
- Benötigte Teile (basierend auf Heizungsmodellen)
- Direktlinks zu Kundenprofilen

**Kunden ohne Email:**

- Separater Bereich in Max' Dashboard
- Liste: "Telefonisch zu kontaktieren"
- Click-to-Call Links
- "Kontaktiert" Button (entfernt aus Liste)

### 2.4 Materialverwaltung (Basic)

**Teileliste pro Heizungsmodell:**

- In Heizungskonfiguration hinterlegbar
- Freitextfeld pro Teil (z.B. "Brennerplatte", "Luftfilter")
- Anzeige bei Wartung: "Benötigte Teile für diesen Termin"
- Auflistung in wöchentlicher Email: "Diese Woche brauchst du: ..."

**Phase 2 Features (nicht MVP):**

- Lagerbestand tracken
- Automatische Bestellvorschläge
- Integration mit Lieferanten

### 2.5 Mobile & PWA

**Progressive Web App (PWA):**

- Installierbar auf Android/iOS Homescreen
- Funktioniert wie native App
- Offline-Fähigkeit durch Service Worker
- Kundenliste wird gecached
- Push-Benachrichtigungen (später)

**Mobile-First Design-Prinzipien:**

- Touch-Targets: Mindestens 44×44px
- Wichtigste Aktionen prominent platziert
- Minimales Scrolling erforderlich
- Keine Pinch-to-Zoom nötig
- Große, gut lesbare Schrift (16px+)
- Hochformat-optimiert

---

## 3. Nicht-Funktionale Anforderungen

### 3.1 Performance

- **Ladezeiten:**

  - Initial Page Load: <3 Sekunden (3G Mobile)
  - Kundenliste: <2 Sekunden
  - Wartung abhaken: <1 Sekunde
  - API Response: <500ms (p95)

- **Offline-Fähigkeit:**
  - Kundenliste offline verfügbar (gecached)
  - Wartungen können offline abgehakt werden
  - Automatischer Sync bei Verbindung

### 3.2 Sicherheit & Datenschutz

- **Authentifizierung:** Email + Passwort, Session-basiert (JWT)
- **Verschlüsselung:** HTTPS obligatorisch, Passwörter gehasht (bcrypt)
- **Backups:** Tägliche automatische Backups, 30 Tage Retention

**DSGVO-Konformität:**

- Email-Opt-In erforderlich (Double-Opt-In Mechanismus)
- Abmelde-Link in jeder automatisierten Email
- Datenschutzerklärung
- Betroffenenrechte: Auskunft (CSV-Export), Löschung, Datenportabilität
- Dokumentation der Rechtsgrundlagen

**Wichtig:** Auftragsverarbeitung - Max ist Verantwortlicher, Plattform ist Auftragsverarbeiter

### 3.3 Usability

- **Lernkurve:** Max sollte System in <30 Minuten verstehen
- **Keine Dokumentation nötig:** Intuitive UI, Tooltips für wichtige Funktionen
- **Accessibility:** WCAG 2.1 Level AA anstreben
- **Kontrast:** Mindestens 4.5:1 für Text
- **Fehlerbehandlung:** Klare, hilfreiche Fehlermeldungen

### 3.4 Skalierbarkeit

- **MVP:** Bis 100 Kunden pro Nutzer
- **SaaS:** Bis 10.000 Kunden pro Mandant
- **Multi-Tenancy:** Bis 1.000 Mandanten

---

## 4. Technische Constraints & Empfehlungen

### 4.1 Tech Stack (Empfehlung)

**Frontend:**

```
Framework:    Next.js 14 (App Router)
Language:     TypeScript
Styling:      Tailwind CSS + shadcn/ui
State:        React Context + Zustand (für komplexe State)
Forms:        React Hook Form + Zod (Validierung)
PWA:          next-pwa Plugin
Icons:        Lucide React
```

**Backend:**

```
API:          Next.js API Routes (kein separates Backend)
ORM:          Prisma (Type-safe Database Access)
Database:     PostgreSQL (Supabase Free Tier: 500MB)
Auth:         NextAuth.js
Jobs:         Vercel Cron (für tägliche Email-Jobs)
Email:        Resend (3.000 Emails/Monat kostenlos)
Templates:    React Email
```

**File Storage:**

```
Service:      Supabase Storage (1GB kostenlos)
Fallback:     Vercel Blob
CDN:          Inklusive bei beiden
```

**Hosting:**

```
Frontend/API:  Vercel (Free Plan für MVP)
Database:      Supabase (Free Plan: 500MB, 2 CPU)
Monitoring:    Sentry (Error Tracking)
Analytics:     Vercel Analytics

Kosten MVP:    €0/Monat
Kosten SaaS:   ~€45/Monat (Vercel Pro + Supabase Pro)
```

**Rationale:**

- ✅ Next.js: SSR, API Routes, File-based Routing in einem
- ✅ TypeScript: Type Safety, weniger Bugs
- ✅ Prisma: Type-safe DB, automatische Migrations
- ✅ Supabase: Kostenlose PostgreSQL, Auth, Storage
- ✅ Resend: Entwickler-freundlich, gute Deliverability
- ✅ Vercel: Zero-Config Deployment, automatische CI/CD

### 4.2 Datenmodell (High-Level)

**Entitäten:**

```
User (Max)
  ├─ id, email, passwordHash, name, phone

Customer
  ├─ id, name, street, zipCode, city, phone, email
  ├─ emailOptIn (Boolean, für DSGVO)
  ├─ notes
  └─ userId (Foreign Key)

Heater
  ├─ id, model, serialNumber, installationDate
  ├─ maintenanceInterval (Integer: Monate)
  ├─ lastMaintenance (Date)
  ├─ nextMaintenance (Date, berechnet)
  ├─ requiredParts (JSON Array)
  └─ customerId (Foreign Key)

Maintenance
  ├─ id, date, notes
  ├─ photos (String Array: URLs)
  ├─ heaterId (Foreign Key)
  └─ userId (Foreign Key)

EmailLog
  ├─ id, customerId, type, sentAt
  ├─ opened (Boolean), clicked (Boolean)
  └─ für Tracking & DSGVO-Dokumentation
```

**Beziehungen:**

- User 1:N Customer
- Customer 1:N Heater
- Heater 1:N Maintenance
- User 1:N Maintenance

### 4.3 Architektur

```
┌─────────────────────────────────────────┐
│  Max's Smartphone (PWA)                 │
│  - Offline-fähig (Service Worker)       │
│  - Installierbar (Add to Homescreen)    │
│  - Push-Benachrichtigungen (später)     │
└──────────────┬──────────────────────────┘
               │ HTTPS / REST API
               ▼
┌─────────────────────────────────────────┐
│  Next.js Application (Vercel)           │
│  ┌─────────────────────────────────┐    │
│  │ App Router (React Server Comp.) │    │
│  │ - /dashboard                    │    │
│  │ - /customers                    │    │
│  │ - /maintenance                  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ API Routes                      │    │
│  │ - /api/customers                │    │
│  │ - /api/maintenance              │    │
│  │ - /api/cron/send-emails         │    │
│  └─────────────────────────────────┘    │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │   Resend    │
│ (Supabase)  │  │   (Email)   │
│             │  │             │
│ - Users     │  │ - SMTP      │
│ - Customers │  │ - Tracking  │
│ - Heaters   │  │ - Templates │
│ - Mainten.  │  └─────────────┘
│ - EmailLog  │
└─────────────┘

Cronjob (Vercel Cron):
- Täglich 6:00 Uhr: Wartungserinnerungen prüfen
- Montags 7:00 Uhr: Wöchentliche Übersicht
```

### 4.4 Budget & Timeline

**Entwicklungskosten:**

- Vereinbarung: Hybridmodell
- Einmalig von Max: €3.000 (für MVP-Entwicklung)
- Equity Split: 70% Developer / 30% Max (bei SaaS-Skalierung)

**Hosting-Kosten:**

- MVP (Max alleine): €0/Monat (Free Tiers)
- SaaS (bis 100 Nutzer): €45/Monat (Vercel Pro + Supabase Pro)
- Skalierung: Pay-as-you-grow

**Entwicklungs-Timeline:**

```
Woche 1:     Projekt-Setup, Datenbank-Schema, Auth
Woche 2-3:   Kundenverwaltung (CRUD, UI)
Woche 4:     Wartungsmanagement (Abhaken, Historie)
Woche 5:     Automatisierung (Emails, Cronjobs)
Woche 6:     PWA-Setup, Mobile-Optimierung
Woche 7:     Testing mit Max, Bug-Fixes
Woche 8:     Datenmigration (Excel → System)
Woche 9:     Go-Live, Max startet mit echten Kunden
Woche 10-12: Iteration basierend auf Max' Feedback

MVP-Fertigstellung: 8-10 Wochen
```

---

## 5. Risiken & Mitigation

### 5.1 Technische Risiken

**RISK-001: Email-Zustellung (Spam-Filter)**

- **Impact:** Hoch (Kern-Feature)
- **Mitigation:**
  - Resend nutzen (etablierte Reputation)
  - SPF/DKIM/DMARC korrekt konfigurieren
  - Warmer Absender (max@drehmoment.de, nicht noreply@)
  - Opt-In dokumentieren
  - Email-Öffnungsraten monitoren

**RISK-002: Offline-Sync-Konflikte**

- **Impact:** Mittel
- **Mitigation:**
  - Last-Write-Wins Strategie
  - Konflikt-Flag bei Sync
  - Max erhält Warnung bei erkanntem Konflikt

**RISK-003: Excel-Migration fehlerhaft**

- **Impact:** Hoch (Datenverlust)
- **Mitigation:**
  - CSV-Import-Tool mit Vorschau
  - Testlauf vor finalem Import
  - Excel-Backup vor Migration

### 5.2 Business Risks

**RISK-010: Max nutzt System nicht aktiv**

- **Impact:** Sehr hoch (Projekt-Scheitern)
- **Mitigation:**
  - Intensive 2h Schulung zu Projektstart
  - Wöchentliche Check-Ins ersten Monat
  - Kontinuierlicher Feedback-Loop
  - Einfachheit absolut priorisieren
  - Quick-Wins aufzeigen (Zeitersparnis messbar machen)

**RISK-011: Keine Abnehmer für SaaS**

- **Impact:** Hoch (keine Skalierung)
- **Mitigation:**
  - MVP mit Max validiert Product-Market-Fit
  - Beta-Gruppe (5-10 Nutzer aus Max' Netzwerk)
  - Feedback einholen vor großem Launch
  - Iteratives Vorgehen

**RISK-012: Wettbewerber kopiert Feature**

- **Impact:** Mittel
- **Mitigation:**
  - Fokus auf Nische (Ein-Mann-Betriebe)
  - Schnelle Iteration, Features basierend auf Feedback
  - Customer Success (persönlicher Support als USP)

### 5.3 Legal Risks

**RISK-020: DSGVO-Verstoß**

- **Impact:** Sehr hoch (Bußgeld bis €20 Mio oder 4% Jahresumsatz)
- **Mitigation:**
  - Rechtsanwalt konsultieren (Budget: €500-1.000)
  - Double-Opt-In Mechanismus implementieren
  - AV-Vertrag mit Supabase (Auftragsverarbeiter)
  - Datenschutzerklärung prominent platziert
  - Regelmäßige DSGVO-Audits

---

## 6. Success Metrics

### 6.1 KPIs für Max (MVP-Phase)

**Effizienz:**

- ⏱️ Kundenanlage: <60 Sekunden (vs. Excel: ~3 Minuten)
- ⏱️ Wartung abhaken: <30 Sekunden (vs. Excel: ~2 Minuten + Telefonat)
- ⏱️ Wöchentlicher Admin-Aufwand: <2 Stunden (vorher: 8 Stunden)
- 💰 ROI: Einsparung €6.000+/Jahr (durch Zeitersparnis)

**Qualität:**

- 📧 Email-Zustellrate: >95%
- 🎯 Keine verpassten Wartungen (0% im ersten Jahr)
- 😊 Max-Zufriedenheit: 8/10+ (Umfrage nach 3 Monaten)

**Adoption:**

- 📱 Max nutzt App täglich
- 📊 80% der Kunden im System migriert (nach 4 Wochen)
- 🔄 Alle Wartungen über System abgewickelt (nach 2 Monaten)

### 6.2 KPIs für SaaS-Phase

**Wachstum:**

- 👥 Neue Nutzer: 10/Monat (Jahr 1 nach SaaS-Launch)
- 💰 MRR: €3.000+ nach 12 Monaten
- 📈 Churn: <5%/Monat
- 🎯 Customer Acquisition Cost: <€100/Kunde

**Engagement:**

- 🔁 Weekly Active Users: 60%+
- 📧 Email Open Rate: 40%+ (Erinnerungen)
- 💬 NPS Score: 40+

**Finanziell:**

- ⚖️ CAC:LTV Ratio: >3:1
- 📊 Gross Margin: >80% (typisch für SaaS)

---

## 7. Projektphasen & Deliverables

### Phase 1: MVP (Wochen 1-8)

**Deliverables:**

- ✅ Vollständige Kundenverwaltung (CRUD)
- ✅ Heizungskonfiguration mit Wartungsintervallen
- ✅ Wartung-Abhaken-Flow (Mobile-optimiert)
- ✅ Wartungshistorie mit Foto-Upload
- ✅ Automatische Email-Erinnerungen (4 Wochen, 1 Woche)
- ✅ Wöchentliche Übersicht für Max
- ✅ PWA-Installation möglich
- ✅ Offline-Fähigkeit (Kundenliste, Wartung abhaken)
- ✅ Basis-Materialverwaltung (Teileliste)
- ✅ CSV-Export für DSGVO
- ✅ Datenschutzerklärung & Opt-In Flow

**Nicht im MVP:**

- Kalender-Integration
- Automatische Terminvorschläge
- Lagerbestandsverwaltung
- Bestellmanagement
- Rechnungsstellung
- Multi-User-Verwaltung

### Phase 2: Beta-Testing (Wochen 9-12)

**Fokus:**

- Max migriert alle Kunden
- Wöchentliche Feedback-Sessions
- Bug-Fixes & UI-Tweaks
- Performance-Optimierung
- Erste Feature-Erweiterungen basierend auf Max' Input

### Phase 3: SaaS-Vorbereitung (Monat 4-6)

**Deliverables:**

- Multi-Tenancy Architektur
- Stripe/Paddle Integration (Billing)
- Marketing-Website
- Onboarding-Flow für neue Nutzer
- Beta-Programm (5-10 Nutzer aus Max' Netzwerk)

### Phase 4: SaaS-Launch (Monat 6+)

**Deliverables:**

- Öffentlicher Launch
- Marketing-Kampagne
- Customer Support System
- Erweiterte Features (Kalender, Rechnungen)

---

## 8. Besondere Anforderungen für Agent-System

### 8.1 Business Strategy Agent

**Aufgaben:**

- Business Model Canvas erstellen (basierend auf Max' Use Case)
- MVP-Features priorisieren (MoSCoW-Methode)
- Pricing-Strategie entwickeln (Solo/Pro/Enterprise Tiers)
- Go-to-Market-Strategie (Beta → SaaS)
- Wettbewerbsanalyse (Handwerker-Office, meetergo, simpleSystem)

**Wichtige Inputs:**

- Opportunitätskosten: €20.000/Jahr
- Marktgröße: 15.000 Ein-Mann-Betriebe Deutschland
- Budget: Bootstrap (€3.000 initial)

### 8.2 Technical Architecture Agent

**Aufgaben:**

- Tech Stack Validierung/Optimierung
- System-Architektur-Diagramm (C4 Model)
- Datenbank-Schema detaillieren (Prisma Schema)
- API-Struktur definieren (REST Endpoints)
- Deployment-Strategie (Vercel + Supabase)
- Performance-Strategie (Caching, CDN)
- Skalierungs-Plan (MVP → SaaS)

**Wichtige Inputs:**

- Offline-First Requirement
- Mobile-First Requirement
- PWA erforderlich
- Budget: €0/Monat für MVP

### 8.3 Compliance & Legal Agent

**Aufgaben:**

- DSGVO-Checkliste erstellen
- Datenschutzerklärung Template
- Email-Opt-In Flow spezifizieren
- AV-Vertrag Requirements (Supabase)
- Data Retention Policy
- Betroffenenrechte implementieren (Export, Löschung)
- ROPA (Record of Processing Activities)

**Wichtige Inputs:**

- Auftragsverarbeitung: Max = Verantwortlicher
- Email-Marketing: Opt-In erforderlich
- Kundendaten: Name, Adresse, Telefon, Email
- Fotos von Heizungen (potenziell sensibler Kontext)

### 8.4 UX Design Agent (Phase 2)

**Aufgaben:**

- Mobile-First Wireframes
- User Journey Mapping (Max' typischer Tag)
- Accessibility Audit
- Usability Testing Plan
- Design System (Farben, Typography, Components)

**Wichtige Inputs:**

- Zielgruppe: 35-50 Jahre, mittlere Tech-Affinität
- Nutzungskontext: Beim Kunden, oft schlechtes Licht, dreckige Hände
- Hauptaktion: Wartung abhaken (<30 Sekunden)

---

## 9. Offene Fragen für Agent-Analyse

**Für Business Strategy Agent:**

1. Welche SaaS-Pricing-Tier-Struktur ist optimal? (2 Tiers vs. 3 Tiers)
2. Freemium-Modell sinnvoll? (Kostenlos bis 10 Kunden?)
3. Wie sollte Go-to-Market aussehen? (Direct Sales vs. Content Marketing)

**Für Technical Architecture Agent:**

1. Next.js App Router vs. Pages Router für diesen Use Case?
2. Alternative zu Supabase? (Neon, PlanetScale)
3. Sollte Offline-Sync optimistisch oder pessimistisch sein?
4. Redis für Caching sinnvoll bei dieser Größenordnung?

**Für Compliance Agent:**

1. Ist Double-Opt-In Pflicht oder reicht Single-Opt-In? (Deutschland)
2. Welche Aufbewahrungsfristen für Wartungsprotokolle?
3. Foto-Uploads: Besondere DSGVO-Anforderungen?
4. Newsletter vs. transaktionale Email: Rechtliche Unterschiede?

**Für UX Design Agent (später):**

1. Material Design vs. iOS Human Interface Guidelines?
2. Dark Mode sinnvoll für Handwerker-Kontext?
3. Gestenerkennung (Swipe to complete) vs. Buttons?

---

## 10. Constraints für Agent-System

**Technische Constraints:**

- Keine nativen iOS/Android Apps (nur PWA)
- Keine Offline-First Database (z.B. PouchDB) - zu komplex für MVP
- Keine Echtzeit-Collaboration nötig (nur Max nutzt System)
- Keine Video-Calls oder Screen-Sharing

**Business Constraints:**

- Bootstrap-Budget (kein Venture Capital)
- Entwickler = Einzelperson (keine Teams)
- Max ist einziger Beta-Tester
- Go-Live innerhalb 8-10 Wochen gewünscht

**Legal Constraints:**

- DSGVO-Konformität nicht verhandelbar
- Deutscher Markt (deutsche Datenschutzerklärung)
- Keine Speicherung außerhalb EU (Supabase: Frankfurt oder Ireland)

**UX Constraints:**

- System muss ohne Schulung verständlich sein (Max = nicht technikaffin)
- Mobile muss ohne Desktop-Ansicht funktionieren
- Keine komplexen Dashboards oder Analytics (zumindest MVP)

---

## Anhang: Beispiel-Workflows

### Workflow 1: Kunde anlegen (Max)

1. Max öffnet App auf Handy
2. Klickt "+" für neuen Kunden
3. Füllt Formular aus (Name, Adresse, Tel, Email)
4. Klickt "Heizung hinzufügen"
5. Wählt Modell, Intervall (z.B. "12 Monate")
6. Trägt letzte Wartung ein (z.B. "15.01.2024")
7. System berechnet automatisch: Nächste Wartung = 15.01.2025
8. Speichert
9. **Zeit: <60 Sekunden**

### Workflow 2: Wartung erledigen (Max beim Kunden)

1. Max öffnet App
2. Sucht Kunden
3. Öffnet Heizung
4. Sieht: "Wartung heute fällig!"
5. Sieht: "Benötigte Teile: Brennerplatte, Filter"
6. Nach Wartung: Klickt "Wartung erledigt"
7. Macht optional Foto von Heizung
8. Trägt kurze Notiz ein: "Alles ok, Filter getauscht"
9. Speichert
10. System berechnet automatisch: Nächste Wartung = 15.01.2026
11. **Zeit: <30 Sekunden**

### Workflow 3: Automatische Email (System)

1. Cronjob läuft täglich 6:00 Uhr
2. System prüft: Welche Wartungen in 28 Tagen?
3. Findet: "Max Mustermann, Wartung 15.02.2025"
4. Prüft: Hat Kunde Email? Ja (max.mustermann@example.com)
5. Prüft: Hat Kunde Opt-In? Ja
6. Prüft: Wurde Email schon gesendet? Nein
7. System sendet Email:

```
Betreff: Wartungserinnerung für Ihre Heizung

Sehr geehrter Herr Mustermann,

Ihre Heizung (Viessmann Vitodens 200) ist in ca. 4 Wochen
(voraussichtlich am 15. Februar 2025) wieder zur Wartung fällig.

Wir werden uns zeitnah bei Ihnen melden, um einen Termin zu vereinbaren.

Mit freundlichen Grüßen
Max Wagner
Heizungsbau Wagner
Tel: 0123-456789

---
Sie möchten keine Erinnerungen mehr erhalten? [Hier abmelden]
```

8. System setzt Flag: "Email gesendet = true"
9. Tracking: Email-Öffnung wird in EmailLog gespeichert

### Workflow 4: Wöchentliche Planung (Max)

1. Montag 7:00 Uhr: Max erhält Email
2. Überschrift: "Deine anstehenden Wartungen (KW 7)"
3. Sieht:
   - **Überfällig:** 1 Kunde (seit 3 Tagen)
   - **Diese Woche:** 3 Kunden
   - **Nächste Woche:** 2 Kunden
4. Sieht benötigte Teile: "5x Brennerplatte, 3x Filter"
5. Plant seine Woche
6. Bestellt fehlende Teile
7. **Zeitersparnis: 2-3 Stunden** (vorher: Excel durchgehen + Kunden einzeln anrufen)

---

**Ende der Projektdefinition**

_Version 2.0 - Aktualisiert für finales Requirement_  
_Optimiert für Multi-Agent System Generierung_  
_Projekt: Heizungsbauer-Wartungsplattform_
