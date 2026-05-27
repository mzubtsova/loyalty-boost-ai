# LoyaltyBoost AI 🏆
> **An AI-powered CRM dashboard to plan loyalty promotions, visualize digital wallet pass customer experiences, and audit campaign mechanics against behavioral psychology scores.**

LoyaltyBoost AI is an interactive web platform designed for loyalty program managers, CRM strategists, and marketing technologists. It helps bridge the gap between business objectives (e.g., *"increase weekday afternoon sales"*) and loyalty structures (e.g., points multipliers, tier-based challenges) by generating optimized reward mechanics, simulating the visual experience on a digital wallet pass, and auditing customer friction and fatigue pre-deployment.

---

## 🛠️ The Problem It Solves

Managing modern customer loyalty programs (like PAR Punchh, Starbucks Rewards, or Sephora Beauty Insider) involves key complexities:
1. **Structuring Promos**: Designing multipliers (e.g. 2x, 3x points) or entry gates that match business goals without causing margin erosion can be challenging.
2. **Personalization & QA Visuals**: Visualizing what the promotion will look like inside a customer's digital wallet app (Apple Wallet or Google Pay) usually requires extensive manual mockup drafting.
3. **Behavioral Economics Auditing**: It's hard to predict if an offer will cause friction, trigger customer fatigue, or leverage psychological drivers like Loss Aversion (FOMO) before spending campaign budget.

**LoyaltyBoost AI** provides an interactive, client-side QA and design portal to automate and validate this entire planning pipeline.

---

## ✨ Core Features

### 1. AI Promotion Planner
* **Goal-oriented Mechanics**: Input your brand name and campaign objective. Select which loyalty tiers are eligible (Bronze, Silver, Gold, Standard).
* **Automated Logic Drafting**: Gemini automatically designs custom point multipliers, visual taglines, and marketing copy (Email subject, Push notifications, In-app messaging) containing Liquid tags.
* **Pre-baked Demo Mode**: If no API key is saved, the app runs on a simulated engine pre-seeded with Starbucks/Coffee Double-Star afternoon campaigns for easy presentation.

### 2. Smartphone Wallet Visualizer
* **Interactive Mobile Mockup**: Renders a simulated iOS/Android smartphone screen displaying a digital rewards pass.
* **Live Dynamic Tiers**: The pass visual layout and card background gradient automatically shift colors depending on the customer's active tier (Bronze, Silver, Gold, or Standard).
* **Profile Barcode Simulator**: Marketers can edit mock user parameters (Name, Points Balance, Tier, and Favorite Drink/Product) to immediately preview how the progress bar and personalized notifications adapt.
* **Liquid Personalization QA**: Substitutes active customer variables directly inside the push notifications and email subject lines in real time.

### 3. Behavioral Economics Critique
* **Loss Aversion Audit (Urgency & FOMO)**: Scores how well the campaign uses scarcity and time-boxed rules.
* **Participation Friction Audit (Usability)**: Evaluates checkout delay and registration ease.
* **Fatigue Risk Audit (Margin Protection)**: Scores whether the campaign runs risk of oversaturating the list.
* **Actionable Psychology Copy**: Displays color-coded progress bars (Green/Amber/Red) and written critique from a virtual behavioral economist to optimize offer mechanics.

### 4. Shared Settings Portal
* **Shared Gemini Credentials**: Uses the same API Key storage key as our sister project, **SmartCanvas AI**. Saving your key in one app automatically unlocks live generation in the other!

---

## 💻 Tech Stack

* **Framework**: React (Vite SPA)
* **Styling**: Vanilla CSS3 Custom Design System (HSL tokens, mobile phone mockup visual wraps, tier color gradients, hover transitions)
* **Icons**: Lucide React
* **AI Engine**: Google Gemini API (`gemini-3.5-flash` model via HTTP POST client-side calls)

---

## 🚀 Getting Started

### Installation

1. Navigate to the project directory:
   ```bash
   cd loyalty-boost-ai
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open the development link printed in your terminal (typically [http://localhost:5173](http://localhost:5173) or [http://localhost:5174](http://localhost:5174)).
