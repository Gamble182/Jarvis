# Drehmoment - Wartungsplattform für Handwerksbetriebe

## Requirements & Technical Specification

**Produktname:** Drehmoment  
**Tagline:** "Der Hebel für dein Handwerk"  
**Kunde:** Max (Ein-Mann-Heizungsbaubetrieb)  
**Vision:** MVP für Max → SaaS für Handwerksbetriebe  
**Datum:** 11. Dezember 2024  
**Version:** 2.0

---

## 📋 Executive Summary

**Drehmoment** ist eine **Web-basierte Wartungsmanagement-Plattform** für Heizungsbauer, die manuelle Excel-basierte Prozesse durch automatisierte Kundenbenachrichtigungen, intelligente Terminplanung und mobile Zugänglichkeit ersetzt.

**Hauptziel:** Max' organisatorischen Overhead um 60-70% reduzieren durch Automatisierung von Erinnerungen und Terminmanagement.

**Branding & Positionierung:**

- **Produktname:** Drehmoment
- **Tagline:** "Der Hebel für dein Handwerk"
- **Domain:** drehmoment.de (primär) oder drehmoment.app
- **Zielgruppe:** Selbstständige Handwerker (Ein-Mann-Betriebe), Start mit Heizungsbauern
- **USP:** Spezialisiert auf Wartungsintervalle, extrem einfach, mobile-first, günstiger als Wettbewerber

---

## 1. Business Case & Vision

### 1.1 Problem Statement

**Aktueller Zustand:**

- Max verwaltet ~50-100 Kunden mit Wartungsverträgen in Excel
- Manuelle Prüfung anstehender Wartungstermine
- Telefonische Kundenkontaktierung für Terminvereinbarung (15-20 Min pro Kunde)
- Keine systematische Materialplanung vor Terminen
- Vergessene Wartungen führen zu unzufriedenen Kunden
- Zeitaufwand: ~5-8h/Woche nur für Organisation

**Geschätzte Kosten:**

- Organisationsaufwand: 8h × €40/h = **€320/Woche** = **€16.640/Jahr**
- Verpasste Wartungen: ~5% Kundenverlust = **€3.000-5.000/Jahr**
- **Gesamt: ~€20.000/Jahr Opportunitätskosten**

### 1.2 Zielgruppe

**Primär (MVP):**

- **Max**: Selbstständiger Heizungsbauer, Ein-Mann-Betrieb
- **Alter:** ~35-50 Jahre
- **Tech-Affinität:** Niedrig bis mittel (nutzt Smartphone, WhatsApp, Excel)
- **Hauptgeräte:** Smartphone (im Einsatz), Laptop/PC (Büro)

**Sekundär (SaaS Phase):**

- Kleine Handwerksbetriebe (1-5 Mitarbeiter)
- Heizungsbauer, Klempner, Elektriker, Schornsteinfeger
- DACH-Region (Deutschland, Österreich, Schweiz)
- **Potenzial:** ~15.000 Ein-Mann-Betriebe in Deutschland

### 1.3 Value Proposition

**Für Max:**

- ⏱️ **Zeitersparnis:** 6-8h/Woche organisatorischer Aufwand
- 📧 **Automatisierung:** Kunden erhalten automatisch Wartungserinnerungen
- 📱 **Mobile-First:** Termine direkt beim Kunden abhaken
- 🔧 **Materialplanung:** Benötigte Teile pro Wartung auf einen Blick
- 📊 **Übersicht:** Alle Kundendaten, Wartungshistorie zentral

**Für Kunden von Max:**

- Proaktive Erinnerungen (keine verpassten Wartungen)
- Professionelle Kommunikation per Email
- Verlässliche Terminplanung

**Für spätere SaaS-Kunden:**

- Sofort einsatzbereit (kein Setup)
- Günstig (€29-49/Monat statt €20.000/Jahr Opportunitätskosten)
- DSGVO-konform out-of-the-box

### 1.4 Langfristige Vision

**Phase 1 (MVP - Q1 2025):** Max als Einzelkunde  
**Phase 2 (Beta - Q2 2025):** 5-10 Heizungsbauer in Max' Netzwerk  
**Phase 3 (SaaS - Q3/Q4 2025):** Öffentliches SaaS-Produkt, Multi-Mandanten  
**Phase 4 (Scale - 2026):** Expansion auf andere Handwerksberufe, Integrationen

---

## 2. User Persona: Max

### 2.1 Hintergrund

- **Beruf:** Selbstständiger Heizungsbauer seit 15 Jahren
- **Betrieb:** Ein-Mann-Betrieb, keine Angestellten
- **Kundenstamm:** ~80 Wartungskunden + Ad-hoc-Reparaturen
- **Tätigkeiten:** Wartung, Reparatur, Neuinstallation, Notdienst
- **Arbeitswoche:** 50-60h, davon 5-8h Administration

### 2.2 Schmerzpunkte (Pain Points)

**Organisatorisch:**

- ⏰ Excel-Listen manuell pflegen nervt
- 📞 Kunden einzeln anrufen kostet Zeit
- 🤦 Termine vergessen → Kundenunzufriedenheit
- 📋 Materialplanung chaotisch (was brauche ich morgen?)

**Technisch:**

- 📱 Excel auf Handy umständlich
- 🔍 Kundendaten verstreut (Excel, Handy-Kontakte, Notizen)
- 📧 Emails manuell schreiben zeitaufwändig

**Finanziell:**

- 💸 Verpasste Wartungen = entgangene Einnahmen
- ⏱️ Admin-Zeit = keine abrechenbare Arbeitszeit

### 2.3 Ziele

- Mehr Zeit für bezahlbare Arbeitszeit (Handwerk statt Büro)
- Professionelleres Auftreten gegenüber Kunden
- Keine vergessenen Wartungstermine mehr
- Bessere Planbarkeit seines Arbeitsalltags

### 2.4 Technische Affinität

- **Smartphone:** Täglich im Einsatz (WhatsApp, Telefon, Google Maps)
- **Computer:** Excel, Email, Online-Banking
- **Lernbereitschaft:** Hoch, wenn Software einfach ist
- **Erwartung:** "Sollte so einfach wie WhatsApp sein"

---

## 3. Funktionale Requirements

### 3.1 MVP - Phase 1 (MUST-HAVE)

#### 3.1.1 Kundenverwaltung

**FR-001: Kunde anlegen**

- **Als:** Admin (Max)
- **Möchte ich:** Neue Kunden mit allen relevanten Daten anlegen
- **Damit:** Ich einen vollständigen Kundenstamm digital verwalten kann

**Felder:**

- Name (Pflicht)
- Adresse (Straße, PLZ, Ort) (Pflicht)
- Telefonnummer (Pflicht)
- Email-Adresse (Optional, aber empfohlen)
- Notizen (Optional)

**Validierung:**

- Email-Format prüfen
- Telefonnummer-Format prüfen
- Duplikatsprüfung (gleicher Name + Adresse)

**Acceptance Criteria:**

- ✅ Kunde kann in <60 Sekunden angelegt werden
- ✅ Fehlermeldungen bei ungültigen Eingaben
- ✅ Erfolgsbestätigung nach Anlegen
- ✅ Automatischer Redirect zur Heizungskonfiguration

---

**FR-002: Heizung zuordnen**

- **Als:** Admin (Max)
- **Möchte ich:** Einem Kunden eine oder mehrere Heizungen zuordnen
- **Damit:** Ich weiß, welche Anlagen gewartet werden müssen

**Felder:**

- Heizungsmodell/Hersteller (Text, z.B. "Viessmann Vitodens 200")
- Installationsdatum (Optional)
- Seriennummer (Optional)
- Wartungsintervall (Dropdown: 1 Monat, 3 Monate, 6 Monate, 12 Monate, 24 Monate)
- Letzte Wartung (Datum)
- Nächste Wartung (Wird automatisch berechnet)

**Beziehung:**

- 1 Kunde kann N Heizungen haben (1:n)

**Acceptance Criteria:**

- ✅ Intervall-Auswahl intuitiv
- ✅ Nächste Wartung wird automatisch berechnet
- ✅ Kunde kann mehrere Heizungen haben
- ✅ Heizung kann bearbeitet/gelöscht werden

---

**FR-003: Kundenliste anzeigen**

- **Als:** Max
- **Möchte ich:** Eine übersichtliche Liste aller Kunden sehen
- **Damit:** Ich schnell Zugriff auf Kundendaten habe

**Ansicht:**

- Tabellarische Liste
- Sortierbar nach: Name, nächste Wartung, letzte Wartung
- Suchfunktion (Name, Adresse)
- Filter: "Wartung fällig", "Alle Kunden"

**Pro Kunde anzeigen:**

- Name
- Adresse
- Telefonnummer
- Anzahl Heizungen
- Nächste Wartung (Datum + Countdown in Tagen)

**Acceptance Criteria:**

- ✅ Liste lädt in <2 Sekunden
- ✅ Suche funktioniert in Echtzeit
- ✅ Mobile Ansicht optimiert
- ✅ Click auf Kunde öffnet Detailansicht

---

#### 3.1.2 Wartungsmanagement

**FR-004: Wartungstermin automatisch berechnen**

- **Als:** System
- **Möchte ich:** Basierend auf Intervall automatisch den nächsten Wartungstermin berechnen
- **Damit:** Max keine manuellen Berechnungen machen muss

**Logik:**

```
Nächste Wartung = Letzte Wartung + Intervall
```

**Beispiele:**

- Letzte Wartung: 15.01.2024, Intervall: 12 Monate → Nächste: 15.01.2025
- Letzte Wartung: 01.06.2024, Intervall: 6 Monate → Nächste: 01.12.2024

**Acceptance Criteria:**

- ✅ Berechnung erfolgt automatisch beim Anlegen
- ✅ Berechnung erfolgt automatisch nach Wartungsabschluss
- ✅ Anzeige im Format "in 45 Tagen" + Datum

---

**FR-005: Wartung als erledigt markieren**

- **Als:** Max (mobil beim Kunden)
- **Möchte ich:** Eine Wartung schnell als erledigt markieren
- **Damit:** Der nächste Termin automatisch berechnet wird

**Workflow:**

1. Max öffnet Kunde/Heizung
2. Button "Wartung erledigt"
3. Popup: "Wartung durchgeführt am [Heute]" (anpassbar)
4. Optional: Notizfeld "Was wurde gemacht?"
5. Optional: Fotos hochladen
6. Bestätigen
7. System berechnet nächste Wartung automatisch
8. System sendet Bestätigungs-Email an Kunde (optional)

**Acceptance Criteria:**

- ✅ Vorgang dauert <30 Sekunden
- ✅ Auch offline nutzbar (Sync bei Verbindung)
- ✅ Bestätigung angezeigt
- ✅ Historie wird aktualisiert

---

**FR-006: Wartungshistorie anzeigen**

- **Als:** Max
- **Möchte ich:** Alle vergangenen Wartungen einer Heizung sehen
- **Damit:** Ich nachvollziehen kann, was beim letzten Mal gemacht wurde

**Anzeige pro Wartung:**

- Datum der Wartung
- Notizen (was wurde gemacht?)
- Hochgeladene Fotos (Thumbnail, klickbar)
- Durchgeführt von (bei Multi-User später)

**Sortierung:** Neueste zuerst

**Acceptance Criteria:**

- ✅ Historie wird chronologisch angezeigt
- ✅ Fotos können in Vollbild angesehen werden
- ✅ Historie kann gefiltert werden (letztes Jahr, letzte 5 etc.)

---

#### 3.1.3 Automatisierte Benachrichtigungen

**FR-007: Email-Erinnerung an Kunde (4 Wochen vorher)**

- **Als:** System
- **Möchte ich:** 4 Wochen vor fälliger Wartung automatisch Email an Kunde senden
- **Damit:** Kunde proaktiv informiert wird

**Email-Inhalt:**

```
Betreff: Wartungserinnerung für Ihre Heizung

Sehr geehrte/r [Kundenname],

Ihre Heizung ([Heizungsmodell]) ist in ca. 4 Wochen
(voraussichtlich [Datum]) wieder zur Wartung fällig.

Wir werden uns zeitnah bei Ihnen melden, um einen
Termin zu vereinbaren.

Mit freundlichen Grüßen
Max [Nachname]
[Telefonnummer]

---
Sie möchten keine Erinnerungen mehr? [Abmelden]
```

**Technisch:**

- Cronjob läuft täglich um 6:00 Uhr
- Prüft alle Wartungen mit Status "in 28 Tagen"
- Sendet Email nur wenn:
  - Kunde hat Email-Adresse hinterlegt
  - Kunde hat nicht abgemeldet
  - Email wurde noch nicht gesendet (Flag setzen)

**Acceptance Criteria:**

- ✅ Email kommt exakt 28 Tage vorher an
- ✅ Email wird nur 1x gesendet
- ✅ Personalisierung funktioniert
- ✅ Abmelde-Link funktioniert (DSGVO!)

---

**FR-008: Email-Erinnerung an Kunde (1 Woche vorher)**

- **Als:** System
- **Möchte ich:** 1 Woche vor fälliger Wartung nochmals Email senden
- **Damit:** Termin nicht vergessen wird

**Email-Inhalt:**

```
Betreff: Erinnerung: Wartung Ihrer Heizung nächste Woche

Sehr geehrte/r [Kundenname],

Ihre Heizung ist nächste Woche zur Wartung fällig.

Sollten wir noch keinen Termin vereinbart haben,
melden Sie sich gerne unter [Telefonnummer].

Mit freundlichen Grüßen
Max [Nachname]
```

**Acceptance Criteria:**

- ✅ Email kommt exakt 7 Tage vorher
- ✅ Nur wenn noch kein Termin im Kalender

---

**FR-009: Wöchentliche Übersicht für Max**

- **Als:** Max
- **Möchte ich:** Jeden Montag 7:00 Uhr eine Email mit anstehenden Wartungen
- **Damit:** Ich die Woche planen kann

**Email-Inhalt:**

```
Betreff: Deine anstehenden Wartungen (KW [X])

Hallo Max,

Diese Woche stehen folgende Wartungen an:

**Dringend (überfällig):**
- [Kunde 1] - [Adresse] - [Tel] - (seit 5 Tagen überfällig)

**Diese Woche fällig:**
- [Kunde 2] - [Adresse] - [Tel] - am [Datum]
- [Kunde 3] - [Adresse] - [Tel] - am [Datum]

**Nächste Woche:**
- [Kunde 4] - [Adresse] - [Tel] - am [Datum]

Benötigte Teile (basierend auf Heizungsmodellen):
- Brennerplatte (2x)
- Filter (3x)
- ...

Viel Erfolg!
Deine Wartungsplattform
```

**Acceptance Criteria:**

- ✅ Email kommt jeden Montag 7:00 Uhr
- ✅ Gruppierung: überfällig / diese Woche / nächste Woche
- ✅ Direktlinks zu Kundenprofilen

---

**FR-010: Erinnerung für Kunden ohne Email**

- **Als:** Max
- **Möchte ich:** Bei Kunden ohne Email eine In-App-Benachrichtigung bekommen
- **Damit:** Ich diese Kunden telefonisch kontaktieren kann

**Logik:**

- Kunde hat keine Email → Keine automatische Email
- Stattdessen: Eintrag in Max' Dashboard
- Sektion: "Kunden ohne Email - Telefonisch kontaktieren"
- Liste mit: Name, Telefonnummer, Wartungsdatum

**Acceptance Criteria:**

- ✅ Übersicht im Dashboard prominent
- ✅ Click-to-Call Link (tel:[nummer])
- ✅ "Kontaktiert" Button (entfernt aus Liste)

---

#### 3.1.4 Mobile Optimierung

**FR-011: Progressive Web App (PWA)**

- **Als:** Max
- **Möchte ich:** Die App auf meinem Handy installieren können
- **Damit:** Sie wie eine native App aussieht

**Features:**

- Installierbar auf Android/iOS
- App-Icon auf Homescreen
- Offline-Nutzung (Service Worker)
- Push-Benachrichtigungen (später)

**Acceptance Criteria:**

- ✅ "Zum Homescreen hinzufügen" funktioniert
- ✅ App startet ohne Browser-UI
- ✅ Offline: Kundenliste wird gecached
- ✅ Sync bei Verbindung

---

**FR-012: Mobile-First UI**

- **Als:** Max
- **Möchte ich:** Eine auf Smartphone optimierte Oberfläche
- **Damit:** Ich beim Kunden schnell arbeiten kann

**Design-Prinzipien:**

- Große Touch-Targets (min. 44x44px)
- Wichtigste Aktionen oben
- Minimale Scrolling
- Kein Pinch-to-Zoom nötig

**Acceptance Criteria:**

- ✅ Kundenliste auf iPhone 12 perfekt lesbar
- ✅ Wartung abhaken ohne Scroll
- ✅ Fotos mit Kamera-Button direkt aufnehmbar

---

#### 3.1.5 Materialverwaltung (Basic)

**FR-013: Teileliste pro Heizungsmodell**

- **Als:** Max
- **Möchte ich:** Pro Heizungsmodell hinterlegen, welche Teile bei Wartung nötig sind
- **Damit:** Ich vor Termin weiß, was ich einpacken muss

**Beispiel:**

```
Heizungsmodell: "Viessmann Vitodens 200"
Benötigte Teile bei Wartung:
- Brennerplatte (1x)
- Luftfilter (1x)
- O-Ringe Set (1x)
```

**Verwaltung:**

- In Heizungskonfiguration
- Freitextfeld pro Teil (später: Artikelnummer)

**Anzeige:**

- In Wartungsübersicht für Max
- "Für Termin morgen benötigt: ..."

**Acceptance Criteria:**

- ✅ Teileliste bei Termin sichtbar
- ✅ Liste in wöchentlicher Email
- ✅ Editierbar pro Heizungsmodell

---

### 3.2 Phase 2 - Nach MVP (SHOULD-HAVE)

#### 3.2.1 Erweiterte Terminplanung

**FR-020: Termin-Status-Verwaltung**

- Stati: Ausstehend → Bestätigt → Durchgeführt
- Max kann Termine manuell eintragen
- Kalenderansicht (Monatsansicht)

**FR-021: Terminvorschläge generieren**

- System schlägt 3-4 Termine vor basierend auf:
  - Max' Verfügbarkeit
  - Geografischer Nähe zu anderen Terminen
  - Kunde-Präferenzen

**FR-022: Google Calendar Integration**

- Sync mit Max' Google Calendar
- Termine automatisch eintragen
- Änderungen bidirektional synchronisieren

**FR-023: Kunden-Selbstbuchung**

- Kunde erhält Link mit verfügbaren Slots
- Kunde wählt Termin selbst
- Bestätigung per Email an beide

---

#### 3.2.2 Erweiterte Wartungshistorie

**FR-030: Checklisten pro Wartung**

- Vordefinierte Checkliste pro Heizungsmodell
- Abhaken während Wartung
- Gespeichert in Historie

**FR-031: Unterschrift des Kunden**

- Signature Pad (Touch-Signatur)
- PDF-Generation mit Unterschrift
- Versand an Kunde per Email

**FR-032: Wartungsprotokolle**

- Automatische PDF-Generierung
- Enthält: Was gemacht, Fotos, Unterschrift
- Archivierung in Kundenprofil

---

#### 3.2.3 Bestellmanagement

**FR-040: Lagerbestand tracken**

- Liste aller Teile mit Bestand
- Mindestbestand definieren
- Warnung bei niedrigem Bestand

**FR-041: Automatische Bestellvorschläge**

- Basierend auf anstehenden Wartungen
- "Nächste Woche brauchst du: 5x Brennerplatte"
- Link zu Lieferanten (später: API-Integration)

**FR-042: Bestellhistorie**

- Wann wurde was bestellt
- Tracking-Nummern
- Zuordnung zu Wartungen

---

#### 3.2.4 Rechnungsstellung

**FR-050: Rechnungserstellung**

- Wartung abschließen → Rechnung generieren
- PDF mit Logo, Steuernummer etc.
- Versand per Email

**FR-051: Lexoffice/SevDesk Integration**

- Export zu Buchhaltungssoftware
- Automatische Rechnungsstellung

---

### 3.3 Phase 3 - SaaS Features (NICE-TO-HAVE)

#### 3.3.1 Multi-Mandanten-Fähigkeit

**FR-060: Mandantenverwaltung**

- Jeder Heizungsbauer = eigener Mandant
- Vollständige Datentrennung
- Eigenes Branding (Logo, Farben)

**FR-061: Rollen & Berechtigungen**

- Admin (Inhaber)
- Mitarbeiter (nur Termine + Wartungen)
- Bürokraft (nur Kundenverwaltung)

**FR-062: Lizenzverwaltung**

- Subscription Management
- Stripe/Paddle Integration
- Rechnungsstellung

---

#### 3.3.2 Erweiterte Features

**FR-070: Statistiken & Reporting**

- Wartungen pro Monat
- Umsatz pro Kunde
- Auslastung

**FR-071: Angebotserstellung**

- Für Reparaturen/Neuinstallationen
- Templates
- Versand per Email

**FR-072: Notdienst-Modul**

- Separate Verwaltung für Ad-hoc-Einsätze
- GPS-Tracking (optional)

---

## 4. Nicht-Funktionale Requirements

### 4.1 Performance

**NFR-001: Ladezeiten**

- Initial Page Load: <3 Sekunden (3G Mobile)
- Kundenliste: <2 Sekunden
- Wartung abhaken: <1 Sekunde
- API Response: <500ms (p95)

**NFR-002: Offline-Fähigkeit**

- Kundenliste offline verfügbar
- Wartungen können offline abgehakt werden
- Sync bei Verbindung automatisch

### 4.2 Sicherheit

**NFR-010: Authentifizierung**

- Login mit Email + Passwort
- Session-basiert (JWT)
- Passwort-Reset per Email

**NFR-011: Datenverschlüsselung**

- HTTPS obligatorisch
- Datenbank verschlüsselt (at rest)
- Passwörter gehasht (bcrypt)

**NFR-012: Backups**

- Tägliche automatische Backups
- 30 Tage Retention
- Point-in-time Recovery möglich

### 4.3 DSGVO & Datenschutz

**NFR-020: Rechtsgrundlagen**

- Auftragsverarbeitung (Max = Verantwortlicher)
- Datenschutzerklärung
- Email-Opt-In (Double-Opt-In)

**NFR-021: Betroffenenrechte**

- Recht auf Auskunft (Export als CSV)
- Recht auf Löschung (Kunde löschen)
- Recht auf Datenportabilität

**NFR-022: Email-Abmeldung**

- Abmelde-Link in jeder Email
- Sofortige Deaktivierung
- Dokumentation der Abmeldung

### 4.4 Usability

**NFR-030: Lernkurve**

- Max sollte System in <30 Minuten verstehen
- Keine Dokumentation zum Start nötig
- Tooltips für wichtige Funktionen

**NFR-031: Accessibility**

- WCAG 2.1 Level AA (soweit möglich)
- Kontrastverhältnis 4.5:1
- Touch-Targets min. 44x44px

### 4.5 Skalierbarkeit

**NFR-040: Datenbank**

- Skaliert bis 10.000 Kunden pro Mandant
- Skaliert bis 1.000 Mandanten (SaaS)

**NFR-041: Verfügbarkeit**

- Uptime: 99.5% (MVP)
- Uptime: 99.9% (SaaS)

---

## 5. Technische Constraints

### 5.1 Budget

- **Entwicklung:** Hybridmodell (siehe Business Model)
- **Hosting:** €0-10/Monat (MVP)
- **Email-Service:** Kostenlos bis 3.000 Emails/Monat

### 5.2 Timeline

- **MVP:** 6-8 Wochen Entwicklung
- **Beta:** +4 Wochen Testing mit Max
- **SaaS:** +8 Wochen Multi-Tenant + Billing

### 5.3 Hosting & Infrastruktur

- **Anforderung:** Einfaches Deployment
- **Präferenz:** Vercel (Frontend) + Supabase (DB)
- **Alternative:** Railway (All-in-One)

---

## 6. Tech Stack Empfehlung

### 6.1 Frontend

```
Framework:    Next.js 14 (App Router)
Language:     TypeScript
Styling:      Tailwind CSS + shadcn/ui
State:        React Context + Zustand
PWA:          next-pwa Plugin
Forms:        React Hook Form + Zod
```

**Rationale:**

- ✅ Next.js: SSR + API Routes in einem
- ✅ TypeScript: Type Safety
- ✅ Tailwind: Schnelle UI-Entwicklung
- ✅ shadcn/ui: Schöne, kopierbare Components

### 6.2 Backend

```
API:          Next.js API Routes
ORM:          Prisma
Database:     PostgreSQL (Supabase)
Auth:         NextAuth.js
Jobs:         Vercel Cron / Inngest
```

**Rationale:**

- ✅ Kein separates Backend nötig
- ✅ Prisma: Type-safe DB Access
- ✅ Supabase: 500MB Free DB
- ✅ Vercel Cron: Tägliche Email-Jobs

### 6.3 Email

```
Service:      Resend
Templates:    React Email
```

**Rationale:**

- ✅ 3.000 Emails/Monat kostenlos
- ✅ Entwickler-freundlich
- ✅ Gute Deliverability

### 6.4 File Storage

```
Service:      Supabase Storage
Fallback:     Vercel Blob
```

**Rationale:**

- ✅ 1GB kostenlos (Supabase)
- ✅ CDN inklusive

### 6.5 Hosting

```
Frontend/API:  Vercel (Free Plan)
Database:      Supabase (Free Plan)
Total:         €0/Monat (MVP)
```

**Bei Skalierung:**

- Vercel Pro: $20/Monat
- Supabase Pro: $25/Monat
- **Total: $45/Monat**

---

## 7. Business Model

### 7.1 Pricing für Max (MVP)

**Empfehlung: Hybrid-Modell** ✅

**Phase 1 - Entwicklung (MVP):**

```
Einmalige Zahlung:     €3.000
Gegenleistung:         - Komplette MVP-Entwicklung
                       - 6 Monate Hosting inklusive
                       - Bug-Fixes in ersten 3 Monaten
                       - 1 Schulungssession (2h)

Zeit-Investment:       ~60-80 Stunden Entwicklung
Dein Stundensatz:      €37-50/h (unter Wert, aber okay für MVP)
```

**Phase 2 - SaaS-Partnerschaft:**

```
Equity-Split:
  - Du:   70% (Entwicklung, Betrieb, Marketing)
  - Max:  30% (Idee, Beta-Testing, Kundenkontakte)

Max' Beitrag:
  - Aktive Unterstützung bei Beta-Tests
  - Empfehlungen an 5-10 Heizungsbauer
  - Feedback für Product-Market-Fit

Vesting:               4 Jahre mit 1 Jahr Cliff
                       (Standard bei Startups)
```

### 7.2 SaaS-Pricing (Phase 3)

**Monatliches Abo-Modell:**

| Plan             | Preis/Monat | Kunden     | Features                |
| ---------------- | ----------- | ---------- | ----------------------- |
| **Solo**         | €29         | bis 50     | Basis-Features          |
| **Professional** | €49         | bis 150    | + Rechnungen + Kalender |
| **Enterprise**   | €99         | unbegrenzt | + Multi-User + API      |

**Revenue-Projektion (Jahr 1 nach Launch):**

```
Konservativ:  50 Kunden × €39 Ø = €1.950/Monat = €23.400/Jahr
Realistisch: 100 Kunden × €39 Ø = €3.900/Monat = €46.800/Jahr
Optimistisch: 200 Kunden × €39 Ø = €7.800/Monat = €93.600/Jahr

Bei 70/30 Split:
  - Du (70%):    €16.380 - €65.520/Jahr
  - Max (30%):   €7.020 - €28.080/Jahr
```

### 7.3 Wettbewerb

**Existierende Lösungen:**

- **Handwerker-Office:** €30-60/Monat, komplex, für größere Betriebe
- **meetergo:** €39/Monat, fokus auf Termine, keine Wartungsintervalle
- **simpleSystem:** €79/Monat, überladen für Ein-Mann-Betriebe

**Dein USP:**

- ✅ Spezialisiert auf Wartungsintervalle (nicht Allzweck)
- ✅ Extrem einfach (für Ein-Mann-Betriebe)
- ✅ Günstig (€29 statt €79)
- ✅ Modern (PWA, Mobile-First)

---

## 8. Success Metrics

### 8.1 KPIs für Max (MVP)

**Effizienz:**

- ⏱️ Zeit für Kundenanlage: <60 Sekunden
- ⏱️ Zeit für Wartung abhaken: <30 Sekunden
- ⏱️ Wöchentlicher Admin-Aufwand: <2 Stunden (vorher 8h)

**Qualität:**

- 📧 Email-Zustellrate: >95%
- 🎯 Keine verpassten Wartungen
- 😊 Max-Zufriedenheit: 8/10+

**Adoption:**

- 📱 Tägliche App-Nutzung
- 📊 Alle Kunden in System migriert (innerhalb 4 Wochen)

### 8.2 KPIs für SaaS (Phase 3)

**Wachstum:**

- 👥 Neue Nutzer: 10/Monat (Jahr 1)
- 💰 MRR: €3.000+ (nach 12 Monaten)
- 📈 Churn: <5%/Monat

**Engagement:**

- 🔁 Weekly Active Users: 60%+
- 📧 Email Open Rate: 40%+

---

## 9. Risks & Mitigation

### 9.1 Technische Risiken

**RISK-001: Email-Zustellung**

- **Risk:** Emails landen im Spam
- **Impact:** Hoch (Kern-Feature)
- **Mitigation:**
  - Resend nutzen (gute Reputation)
  - SPF/DKIM/DMARC konfigurieren
  - Absender: max@wartung-plattform.de (nicht noreply@)
  - Opt-In dokumentieren

**RISK-002: Offline-Sync-Konflikte**

- **Risk:** Max hakt Wartung offline ab, gleichzeitig ändert System was
- **Impact:** Mittel
- **Mitigation:**
  - Last-Write-Wins Strategie
  - Konflikt-Flag bei Sync
  - Max bekommt Warnung bei Konflikt

**RISK-003: Datenbank-Migration**

- **Risk:** Excel-Import fehlerhaft
- **Impact:** Hoch (Datenverlust)
- **Mitigation:**
  - CSV-Import-Tool mit Preview
  - Testlauf vor finalem Import
  - Backup von Excel vor Migration

### 9.2 Business Risks

**RISK-010: Max nutzt System nicht**

- **Risk:** Zu kompliziert, Max fällt zurück auf Excel
- **Impact:** Sehr hoch
- **Mitigation:**
  - Intensive Schulung (2h)
  - Wöchentliche Check-Ins ersten Monat
  - Feedback-Loop etablieren
  - Einfachheit priorisieren

**RISK-011: Keine Abnehmer für SaaS**

- **Risk:** Andere Heizungsbauer nicht interessiert
- **Impact:** Hoch
- **Mitigation:**
  - MVP mit Max validiert Product-Market-Fit
  - Beta-Gruppe (5-10 Nutzer) vor Launch
  - Feedback einholen vor großem Marketing-Push

**RISK-012: Wettbewerber kopiert Idee**

- **Risk:** Große Anbieter fügen Feature hinzu
- **Impact:** Mittel
- **Mitigation:**
  - Fokus auf Nische (Ein-Mann-Betriebe)
  - Schnell iterieren
  - Customer Success (persönlicher Support)

### 9.3 Legal Risks

**RISK-020: DSGVO-Verstoß**

- **Risk:** Emails ohne Einwilligung, Datenleck
- **Impact:** Sehr hoch (Bußgeld)
- **Mitigation:**
  - Rechtsanwalt konsultieren (€500-1.000)
  - Double-Opt-In für Emails
  - AV-Vertrag mit Supabase
  - Datenschutzerklärung prominent

---

## 10. Nächste Schritte

### 10.1 Phase 0: Vorbereitung (Woche 1)

- [ ] Business-Modell mit Max finalisieren (€3.000 Einmalzahlung + 30% Equity?)
- [ ] Schriftlicher Vertrag aufsetzen (Entwicklungsauftrag + Partnerschaftsvereinbarung)
- [ ] Domain kaufen (drehmoment.de oder drehmoment.app - €12-20/Jahr)
- [ ] Vercel + Supabase Accounts anlegen
- [ ] Resend Account anlegen (Email)
- [ ] Repository auf GitHub anlegen

### 10.2 Phase 1: MVP Entwicklung (Woche 2-7)

**Woche 2-3: Core Setup**

- [ ] Next.js Projekt aufsetzen
- [ ] Datenbank-Schema (Prisma)
- [ ] Auth (NextAuth.js)
- [ ] Basic UI Components (shadcn/ui)

**Woche 4-5: Kundenverwaltung**

- [ ] Kunde anlegen/bearbeiten/löschen
- [ ] Heizung zuordnen
- [ ] Kundenliste mit Suche/Filter
- [ ] Mobile UI optimieren

**Woche 6: Wartungsmanagement**

- [ ] Wartung abhaken Flow
- [ ] Automatische Terminberechnung
- [ ] Wartungshistorie
- [ ] Foto-Upload

**Woche 7: Automatisierung**

- [ ] Email-Templates (React Email)
- [ ] Cronjob Setup (Vercel Cron)
- [ ] Email-Versand (4 Wochen vorher)
- [ ] Email-Versand (1 Woche vorher)
- [ ] Wöchentliche Übersicht für Max

### 10.3 Phase 2: Testing & Launch (Woche 8-10)

**Woche 8: Testing**

- [ ] Max-Schulung (2h Session)
- [ ] Gemeinsam 5 Test-Kunden anlegen
- [ ] Bug-Fixes
- [ ] Performance-Optimierung

**Woche 9: Migration**

- [ ] CSV-Import-Tool bauen
- [ ] Excel-Daten migrieren (mit Max zusammen)
- [ ] Validierung aller Daten

**Woche 10: Go-Live**

- [ ] Produktions-Deployment
- [ ] Monitoring aufsetzen (Sentry für Errors)
- [ ] Max startet mit echten Kunden
- [ ] Tägliches Feedback-Call erste Woche

### 10.4 Phase 3: Iteration (Woche 11-14)

- [ ] Bug-Fixes basierend auf Max' Feedback
- [ ] UI-Tweaks
- [ ] Performance-Optimierung
- [ ] Erste Feature-Requests (Prio nach Max' Input)

### 10.5 Phase 4: SaaS Vorbereitung (ab Monat 4)

- [ ] Multi-Tenancy implementieren
- [ ] Stripe/Paddle Integration
- [ ] Marketing-Website
- [ ] Beta-Programm starten (5-10 Nutzer aus Max' Netzwerk)

---

## 11. Open Questions

### Noch zu klären mit Max:

**Funktional:**

- [ ] Welche Heizungsmodelle hat Max am häufigsten? (für Test-Daten)
- [ ] Gibt es Standard-Notizen/Checklisten pro Modell?
- [ ] Wann ist beste Zeit für wöchentliche Email? (Montag 7 Uhr ok?)

**Business:**

- [ ] Ist €3.000 einmalig + 30% Equity ok für Max?
- [ ] Wie viele Heizungsbauer kennt Max persönlich? (für Beta)
- [ ] Gibt es Innungen/Verbände für Marketing später?

**Legal:**

- [ ] Hat Max bereits Datenschutzerklärung für seinen Betrieb?
- [ ] Nutzt Max aktuell ein Impressum? (können wir übernehmen)

**Technisch:**

- [ ] Welches Smartphone hat Max? (Android/iOS - für Testing)
- [ ] Hat Max Google Workspace oder privaten Gmail? (für Kalender später)

---

## Anhang A: Datenmodell (Entwurf)

```prisma
model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String
  phone         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relation
  customers     Customer[]
  maintenances  Maintenance[]
}

model Customer {
  id            String   @id @default(cuid())
  name          String
  street        String
  zipCode       String
  city          String
  phone         String
  email         String?
  emailOptIn    Boolean  @default(false)
  notes         String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  heaters       Heater[]
}

model Heater {
  id                String   @id @default(cuid())
  model             String
  serialNumber      String?
  installationDate  DateTime?
  maintenanceInterval Int    // in Monaten
  lastMaintenance   DateTime?
  nextMaintenance   DateTime?
  requiredParts     String?  // JSON Array
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Relations
  customerId        String
  customer          Customer @relation(fields: [customerId], references: [id])
  maintenances      Maintenance[]
}

model Maintenance {
  id            String   @id @default(cuid())
  date          DateTime
  notes         String?
  photos        String[] // Array of URLs
  createdAt     DateTime @default(now())

  // Relations
  heaterId      String
  heater        Heater   @relation(fields: [heaterId], references: [id])
  userId        String
  user          User     @relation(fields: [userId], references: [id])
}

model EmailLog {
  id            String   @id @default(cuid())
  customerId    String
  type          String   // "4week_reminder", "1week_reminder"
  sentAt        DateTime
  opened        Boolean  @default(false)
  clicked       Boolean  @default(false)
}
```

---

## Anhang B: Wireframes (High-Level)

### Mobile - Kundenliste

```
┌─────────────────────┐
│ 🏠 Wartungsplaner   │
│ ────────────────    │
│ 🔍 Suche...         │
│ ────────────────    │
│ ⚠️ Wartung fällig   │
│                     │
│ ┌─────────────────┐ │
│ │ Max Mustermann  │ │
│ │ 📍 Berlin       │ │
│ │ 📞 0123-456789  │ │
│ │ ⏰ In 3 Tagen   │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ Anna Schmidt    │ │
│ │ 📍 Hamburg      │ │
│ │ 📞 0987-654321  │ │
│ │ ⏰ In 12 Tagen  │ │
│ └─────────────────┘ │
│                     │
│        [+]          │ <- Neuer Kunde
└─────────────────────┘
```

### Mobile - Wartung abhaken

```
┌─────────────────────┐
│ ← Max Mustermann    │
│ ────────────────    │
│ Viessmann Vitodens  │
│                     │
│ Letzte Wartung:     │
│ 15.01.2024          │
│                     │
│ Nächste Wartung:    │
│ 🔴 Heute fällig!    │
│                     │
│ ┌─────────────────┐ │
│ │ Benötigte Teile │ │
│ │ • Brennerplatte │ │
│ │ • Luftfilter    │ │
│ └─────────────────┘ │
│                     │
│ 📷 Fotos (3)        │
│                     │
│ ┌─────────────────┐ │
│ │ ✅ Wartung      │ │
│ │    erledigt     │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

**Ende des Requirements-Dokuments**

_Version 1.0 - 11. Dezember 2024_  
_Erstellt für: Drehmoment - Wartungsplattform für Handwerksbetriebe_  
_Autor: Development Team_
