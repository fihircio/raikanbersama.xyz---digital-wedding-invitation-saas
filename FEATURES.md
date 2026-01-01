# Project Documentation: RaikanBersama.xyz

RaikanBersama.xyz is a premium Digital Wedding Invitation SaaS (Software as a Service) tailored for the Malaysian market. It allows users to create, customize, and manage elegant digital invitations with integrated AI assistance.

## 🚀 Tech Stack
- **Frontend:** React 19 (ESM)
- **Styling:** Tailwind CSS (Utility-first)
- **Routing:** React Router v7 (Hash-based for static hosting compatibility)
- **AI Engine:** Google Gemini 3 Flash (via `@google/genai`)
- **Icons/UI:** Custom SVG icons & CSS-based Glassmorphism

---

## 🎨 1. The Invitation Experience (End-User View)

### A. Cover Section (Splash Screen)
- **Visuals:** A beautiful full-screen high-resolution background with a soft blur overlay and elegant typography.
- **Content:** Displays Event Type (e.g., Walimatulurus), Bride & Groom names, formatted date, and location.
- **Interaction:** Features a "BUKA" (Open) button with an envelope icon.
- **Animation:** Clicking "Buka" triggers a smooth slide-up animation that reveals the main content while hiding the cover.

### B. Main Invitation Layout
- **Hero Header:** Dynamic greeting (e.g., Assalammualaikum) and a custom hero title.
- **Host Information:** Clearly displays the names of the hosts (parents/family).
- **Couple Identity:** Large, elegant cursive typography for the bride and groom.
- **Countdown Timer:** Real-time countdown to the event day.
- **Digital Calendar:** A minimalist interactive calendar component highlighting the event date.
- **Itinerary:** A vertical timeline showcasing the "Atur Cara Majlis" (Event Program).
- **Location Suite:** Integrated address display with dedicated links for Google Maps and Waze.
- **Gallery:** A 2-column grid for wedding photos.

### C. Interactive Features
- **RSVP System:** A floating "Sahkan Kehadiran" button that opens a modal form. Includes:
  - Name input.
  - Attendance toggle (Hadir/Maaf).
  - Guest count (Pax) selector.
  - Custom message/wish input.
- **Guestbook:** A dedicated section displaying wishes and prayers from guests with a soft-shadow card design.
- **Money Gift (E-Angpow):** Displays bank details and a QR code for DuitNow/TNG e-wallet contributions.

---

## 🛠️ 2. Editor Studio (Creator View)

The Editor Studio features a **Live Preview Mobile virtualization**—an on-screen mobile device that updates in real-time as the user changes settings.

### A. Tab-Based Configuration
1. **Utama (Main):**
   - Identity: Edit names of Bride, Groom, and Hosts.
   - Wording: Customize the Greeting, Hero Title, and Invitation Text.
   - Styling: Individual color pickers and font-size sliders for names, headings, and body text.
2. **Butiran (Details):**
   - Date & Time: Native date/time pickers.
   - Location: Edit location name, full address, and Google Maps embed URLs.
   - Itinerary: Add, edit, or remove event program items.
3. **Media:**
   - Template Selection: Switch between "Modern Classic" and "Minimal Light" layouts.
   - Theme Colors: Quick-selection palette for the primary theme color.
   - Backgrounds: Change the main background image URL.
   - Gallery Management: Upload and remove photos for the memory grid.
4. **Tetamu (Contacts):**
   - Family Contacts: Add multiple contact persons (Parents, Siblings) with direct WhatsApp links.
5. **Hadiah (Gifts):**
   - E-Angpow Toggle: Enable/Disable the digital gift section.
   - Bank Details: Input bank name and account number.
   - QR Upload: Upload a DuitNow/TNG QR code image.

### B. AI Assistants
- **Magic Pantun:** Uses Google Gemini to generate traditional 4-line Malay wedding poems based on the couple's names.
- **Magic Story:** Generates a romantic "Our Story" narrative based on a chosen theme.

---

## 📊 3. Management Dashboard

### A. Analytics Overview
- **View Tracker:** Counts how many times the card has been opened.
- **RSVP Statistics:** Total Pax count, number of confirmed groups, and total wishes received.

### B. Guest Management
- **Guest List:** A detailed table of all RSVPs with guest names, phone numbers, pax, and attendance status.
- **Magic Link Laboratory:**
  - A tool to generate "Personalized Links".
  - By entering a guest's name, the system generates a unique URL (e.g., `?to=Ahmad`).
  - When the guest opens the link, the card greets them personally ("Khas buat Ahmad").
  - Includes a direct "Send WhatsApp" integration.

---

## 📂 4. Design Catalog (Templates)

- **Listing Page:** A professional 5-column grid showcasing 15+ design presets.
- **Filtering:** Category-based filtering (Popular, Minimalist, Elegant, Floral).
- **Pagination:** Clean navigation through multiple pages of designs.
- **Direct Integration:** Clicking "Tempah" on any catalog design immediately opens the Editor with that specific background applied.

---

## 🛡️ Technical Implementation Details

- **Mobile First:** The invitation templates are optimized specifically for mobile viewports, mirroring common social media sharing habits.
- **Performance:** Optimized CSS animations and SVG usage ensure low latency on mobile networks.
- **Personalization Engine:** Uses URL search parameters to inject dynamic content (Guest Names) without requiring a database for every view.
- **API Safety:** Gemini API keys are handled via environment variables with safe fallback logic.
