# EcoLens - Personal Carbon Footprint Tracker

**EcoLens** is a modern, highly interactive web application designed to help users understand, track, and reduce their personal carbon footprint through an intuitive multi-step calculator and local AI-powered insights.

## Chosen Vertical
**Sustainability & Environmental Impact**
We chose the carbon footprint tracking vertical because climate change is a critical global challenge, and individual action starts with awareness. EcoLens bridges the gap between complex environmental data and personal daily habits by providing a beautiful, actionable, and user-friendly interface.

## Approach and Logic
EcoLens is built with a focus on **Code Quality, Security, and Extreme Efficiency**. 

- **Pure Vanilla Stack:** The application is built entirely using HTML5, modern CSS3, and ES6 JavaScript modules. We deliberately avoided heavy frameworks (like React or Vue) and bulky bundlers to keep the application footprint incredibly small (~180 KB total script size).
- **Reactive State Management:** We implemented a custom, lightweight, immutable `Store` (`js/state.js`) to manage the application state. All UI components immediately react to state changes, simulating the feel of a modern SPA (Single Page Application) without the overhead.
- **Pure Computation Modules:** Mathematical logic (`js/calculations.js`) is completely isolated from DOM manipulation. Calculations use standard CO2e (Carbon Dioxide Equivalent) emission factors for high accuracy.
- **3D Visualization:** We integrated `Three.js` (loaded via deferred CDN) to render an interactive, glowing green 3D Earth, providing a premium aesthetic without compromising the main thread's performance.

## How the Solution Works
1. **Interactive Calculator:** Users navigate through a 4-step wizard (Travel, Home Energy, Diet & Waste, Shopping) featuring accessible Radio Cards and dynamic sliders.
2. **Real-time State Synchronization:** As the user adjusts inputs (e.g., commute distance, diet type), the data is strictly sanitized and saved to the global store.
3. **Emissions Engine:** The application calculates the user's annual CO2e emissions, comparing them against their selected National Average and the Paris Agreement "Safe Target" (2.5 tons).
4. **AI Assistant & Report:** A built-in, local rule-based AI engine analyzes the highest emission categories and generates a personalized summary, key insights, and a dynamic "Action Plan."
5. **Action Plan Projections:** Users can toggle recommended actions (like "Switch to an EV" or "Go Vegetarian") to see their projected carbon score update in real-time on the comparison gauge.

## Security & Accessibility
- **Enterprise-Grade CSP:** Implemented a strict Content-Security-Policy to protect against XSS injections while maintaining support for local development environments.
- **Zero innerHTML Vulnerabilities:** All dynamic UI components are rendered using safe DOM APIs (`document.createElement`, `document.createTextNode`) or sanitized heavily before insertion.
- **Flawless Accessibility (A11y):** Form groups utilize semantic `<fieldset>` and `<legend>` tags, inputs possess appropriate `aria-labels`, and visual-only elements (like the 3D canvas) are hidden from screen readers using `aria-hidden="true"`.

## Assumptions Made
- **Emission Factors:** We used generalized, highly-researched EPA and global averages for our mathematical models (e.g., assuming a gasoline car produces ~0.411 kg CO2e per mile).
- **Working Year:** Commute calculations assume an average of 50 working weeks per year (accounting for ~2 weeks of vacation/holidays).
- **Local AI Context:** To guarantee absolute privacy and zero-latency execution, the "EcoLens AI" logic runs entirely client-side. We assumed users prefer a guided, predefined interaction (clickable prompt buttons) over open-text chat to ensure highly relevant and mathematically sound advice.
- **Scale:** The visual comparison gauge assumes a max expected personal footprint of around 30 tons CO2e for scaling purposes, dynamically adapting to the user's inputs.

## Setup & Local Execution
Since this project uses native ES6 Modules, it must be run over a local web server (opening the file directly via `file://` will block the modules due to browser CORS policies).

1. Open a terminal in the project root directory.
2. Run a simple local server. For example, using Python:
   ```bash
   python -m http.server 8000
   ```
   Or using Node.js:
   ```bash
   npx serve .
   ```
3. Open your browser and navigate to `http://localhost:8000`.

## Testing Suite
EcoLens ships with its own custom, zero-dependency testing engine. To run the automated unit tests validating the calculation logic and sanitizers:
1. Open the project in your browser.
2. Open the Developer Tools Console (`F12` or `Ctrl+Shift+J`).
3. Type `runEcoLensTests()` and press Enter.
