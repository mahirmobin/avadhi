# 🌧️ Avadhi - Kerala Rain Holiday Tracker

![Avadhi Tracker](https://img.shields.io/badge/Status-Fully%20Automated-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

**Avadhi** (അവധി) is a highly-resilient, autonomous dashboard engineered to monitor, aggregate, and visualize district-level educational holiday declarations across Kerala during severe monsoons and localized weather events. 

Built natively with Next.js and Tailwind CSS, the platform synthesizes real-time data from 14 distinct municipal administration streams with real-time Meteorological Department insights, drastically mitigating fake news and establishing an absolute central source-of-truth for students and parents statewide.

---

## ⚡ Core Features

- **Automated RSS Ingestion:** Directly taps into all 14 official District Collector Facebook RSS streams without relying on manual API limits.
- **NLP Strict-Filtering:** Natively executes a custom Natural Language Processing (NLP) filter to interpret complex Malayalam grammar variations, successfully isolating phrases like "Not Applicable to Exams" while shielding against false positives (fake news posts).
- **Chronological Assessment Engine:** Parses publication timestamps converting them through UTC-to-IST logic. Announcements dropping randomly post-noon seamlessly resolve as explicit targeting for the *subsequent day*, keeping the UI hyper-accurate.
- **Native IMD Symbiosis:** Directly scrapes DOM-injected HEX metadata emitted by the Indian Meteorological Department (IMD-TVM) to perpetually overlay strict Red/Orange/Yellow district severity alerts around the holiday cards.
- **Bilingual Interface:** Entirely fluid rendering switching instantly between English and strict local-dialect Malayalam without relying on unreliable machine translation integrations.

---

## ⚙️ System Architecture

### 1. Hybrid Node.js Backend (`scripts/fetch-status.js`)
Serving as the chronological backbone, the Node.js script eliminates database overhead by exporting raw data mapping strings entirely natively as static JSON datasets into the `public/status.json` layer.
- Sub-components sweep the RSS bridges (via FetchRSS mappings) specifically detecting semantic keyword anchors (`അവധി`, `സ്ഥാപനങ്ങൾക്ക്`) inside JSON subtrees.
- If an RSS feed falters (e.g., Cache Delays/Server limits) the engine fails gracefully into a **Google News Aggregator Pipeline** searching explicitly against 14 localized district-specific ML search filters, catching missed bulletins identically.

### 2. The Frontend Engine (Next.js App Router)
Driven entirely by modern Next.js asynchronous layouts and Tailwind CSS static constraints.
- Employs strict bounds mapping (`break-words`, `whitespace-pre-wrap`) preventing aggressive Malayalam multi-byte compound terms from warping the DOM.
- Converts conditional JSON objects dynamically mapping Card component gradients precisely corresponding to IMD severity indicators (Red Alert = Deep Red Gradient).
- Fully embraces offline, zero-hydration caching protocols to instantaneously serve static structural trees even under severe localized bandwidth constraints (e.g., heavy storms).

### 3. CI/CD Operations Engine (GitHub Actions)
Fully zero-maintenance structure completely free of human dependency.
- CRON job triggers `check-holiday.yml` precisely every 15 minutes checking for Collector parameter drift. 
- Overwrites and forces automated deployment payload loops instantly refreshing Next.js cache targets guaranteeing real-time parity under zero hosting maintenance costs.

---

## 🚀 Local Development Setup

To run Avadhi's scraper algorithms and test UI alterations locally:

```bash
# 1. Clone the repository
git clone https://github.com/your-username/avadhi-rain-tracker.git
cd avadhi-rain-tracker

# 2. Install Dependencies
npm install

# 3. Start the UI Development Server
npm run dev

# 4. (Optional) Run the Hybrid NLP Scraper locally to forcefully reset the JSON structure 
node scripts/fetch-status.js
```

### 🤝 Contributing 
Found a new structural lexical clause a collector used that the script currently dropped? Feel free to propose patches against the internal specific negator-arrays directly within `fetch-status.js`.

---
*Built to bring algorithmic reliability to the Kerala monsoons.*
