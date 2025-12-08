Technischer Gesamt-Prompt: Heizungsbauer-Wartungsplattform (Konzept, Anforderungen, MVP)
1. Kontext

Ein selbstständiger Heizungsbauer (Ein-Mann-Betrieb, Name: Max) möchte seine organisatorischen Prozesse digitalisieren, ohne zusätzliche Mitarbeiter einzustellen.
Er verwaltet derzeit Kunden, Wartungsintervalle, Termine und Ersatzteile in Excel und führt Kommunikation manuell per Telefon durch.

Die Idee:
Eine Web-basierte Anwendung (Web-App + Mobile-optimiert), die Organisation und Kundenkommunikation automatisiert.
Langfristig: Möglichkeit, das System als SaaS für weitere Handwerksbetriebe zu vertreiben.

2. Kernprobleme von Max

Kundenverwaltung unübersichtlich (Excel).

Wartungsintervalle müssen manuell überwacht werden.

Kunden müssen telefonisch informiert werden (zeitaufwändig).

Ersatzteilbedarf je Kunde / Gerät ist nicht standardisiert.

Erinnerungen, Terminorganisation und Materialplanung kosten viel Zeit.

3. Zielsetzung

Eine Web-App soll:

Kunden verwalten

Wartungsintervalle automatisiert berechnen

Automatische Erinnerungs-E-Mails versenden

Ersatzteillisten je Wartung/Anlage hinterlegen

Terminbuchung über Kalender ermöglichen

Mobile Nutzung im Einsatz (Smartphone) unterstützen

Pilotphase: Betrieb nur für Max.
Später: Multi-Mandanten-Fähigkeit & SaaS-Modell.

4. Funktionsumfang (MVP + Erweiterungen)
4.1 MVP-Funktionen
Kundenverwaltung

Kundendaten anlegen/bearbeiten (Name, Adresse, Kontakt, E-Mail, Gerät/Heizungsmodell).

Hinterlegen eines Wartungsintervalls (z. B. 3/6/12 Monate).

Letzte Wartung + nächste Wartung automatisch berechnet.

Automatisierte Benachrichtigung

System erkennt: „Wartung in 4 Wochen fällig.“

Automatisierte E-Mail an Kunden (SMTP, SendGrid etc.).

Max erhält interne Erinnerung (“Wartung XY steht an”).

Ersatzteil-/Materialverwaltung pro Kunde

Je Heizungsmodell definierte Ersatzteile.

Verknüpfung Kunde → Heizung → benötigtes Material.

Option: Teile frühzeitig bestellen (kein Lager nötig).

Terminplanung (Basisversion)

Kunde kann über Link/Portal passende Zeiten im Kalender auswählen.

Max kann verfügbare Slots definieren.

Termin wird bestätigt und eingetragen.

4.2 Erweiterungen (für spätere Version)
Wartungshistorie

Checklisten

Notizen, Fotos

„Material verbraucht“ buchen

Kalender-Integration

iCal / Google / Outlook Sync

Materialbestandsführung

Niedrige Bestände erkennen

Bestellvorschläge

Rechnungs-/Angebotsintegration

Schnittstellen zu Lexoffice, SevDesk etc.

Multi-User-/Multi-Mandanten-Modus

Für spätere SaaS-Version

Rollen: Admin, Techniker, Bürokraft

DSGVO-Module

Datenschutzerklärung

AV-Vertrag (falls SaaS)

E-Mail-Opt-in

5. Technische Überlegungen (neutral formuliert, keine Entscheidung vorweggenommen)
Backend-Optionen

Node.js + TypeScript

Java / Spring

Python / FastAPI

(Falls SAP-bezug gewünscht: CAP Node)

Frontend

React / Next.js

Vue

SvelteKit

Datenbank

PostgreSQL (präferiert)

MySQL

SQLite als lokale MVP-Option

Hosting / Infrastruktur

Cloud (AWS, Azure, GCP, Render, Cloudflare, Railway)

Docker-basierte Umgebung

Mail-Service: SendGrid, Mailgun, Postmark

Benachrichtigungen

Cronjobs / Scheduler

Background Worker (z. B. BullMQ, Celery)

API

REST oder GraphQL

Auth via JWT oder OAuth2

Verschlüsselung & DSGVO-Konformität

Mobile Nutzung

Responsive Web-App

Optional später PWA

6. Risiko- und Aufwandsfaktoren

UI muss extrem simpel sein, da Nutzer technisch geringaffin.

Kalenderlogik ist fehleranfällig (Zeitzonen, Verfügbarkeit).

E-Mail-Zustellung muss zuverlässig funktionieren (Spamfilter!).

Feature-Creep vermeiden → klarer MVP.

Für SaaS nötig: Mandantenfähigkeit, Billing, Support.

7. Gesamtfazit (neutral, technisch)

Das Projekt ist technisch realistisch, wirtschaftlich sinnvoll und besitzt erhebliches Potenzial für spätere Kommerzialisierung im Handwerkssektor.
Der MVP kann kompakt gehalten werden, hat aber genügend Erweiterungspotenzial für ein skalierbares SaaS-Produkt.

8. Prompt-Instruktion

Dieser Prompt dient als vollständige technische Grundlage für:

Architekturplanung

Implementierungsstrategie

Aufwandsschätzung

MVP-Definition

Skalierungs- und SaaS-Bewertung

UX-/UI-Konzeption

Bitte verwende alle oben stehenden Informationen, um strukturierte, präzise und realistische Vorschläge zur technischen Umsetzung zu entwickeln.