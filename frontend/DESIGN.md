# XenoCopilot Enterprise Design System

## Objective

Redesign the entire XenoCopilot application using a unified enterprise SaaS design language.

Do NOT copy Mixpanel exactly, but take inspiration from:

* Mixpanel
* Linear
* Stripe Dashboard
* Vercel
* Ramp
* Retool
* Notion

The result should feel like a modern AI Revenue Intelligence platform used by growth teams, CRM managers, revenue operations teams, and executives.

---

# Core Design Principles

### 1. Product First

Every screen should feel like a working business application.

Never feel like:

* a landing page
* a marketing site
* a startup showcase
* an AI demo

Every screen must feel operational.

---

### 2. Information Density

Increase useful information.

Show:

* metrics
* actions
* trends
* opportunities
* insights

above the fold.

Every screen should provide immediate value.

---

### 3. Consistent Layout

Use the same structure everywhere.

```txt
┌──────────────────────────────┐
│ Global Sidebar               │
├──────────────────────────────┤
│ Page Header                  │
│ Title                        │
│ Description                  │
│ Primary Action               │
├──────────────────────────────┤
│ KPI Row                      │
├──────────────────────────────┤
│ Main Content Area            │
│ Tables                       │
│ Insights                     │
│ Opportunities                │
│ Simulations                  │
└──────────────────────────────┘
```

No random layouts.
No unique page structures.

---

# Sidebar

Permanent left sidebar.

Width: `280px`

Style:
* White background
* Right border
* Sticky
* Full height

Sections:

```txt
GROWTH
Revenue Opportunities
Campaign Copilot

CUSTOMERS
Customer Intelligence
Personas

EXECUTION
Campaigns

ANALYTICS
Revenue Intelligence
```

Bottom:
```txt
Workspace
User
Settings
```

Exactly one active state. Blue highlight.

---

# Page Header

Every page starts with:

```txt
Title

Description

Actions
```

Example:

```txt
Revenue Opportunities

AI-generated opportunities discovered from
customer behavior and revenue patterns.

[ Generate Analysis ]
```

Title:
* Size: `48px`
* Weight: `700`
* Color: `#0F172A`

Description:
* Size: `18px`
* Color: `#64748B`

---

# KPI Row

Directly below header.
Always.
4-6 KPI cards.

Example:

```txt
Recoverable Revenue
₹17,20,000

Dormant Customers
428

VIP Risk
98

Cross Sell
126
```

Card style:
* white background
* thin border
* 12px radius
* no shadows

---

# Card System

All cards follow same design.

```css
background: white;
border: 1px solid #E2E8F0;
border-radius: 12px;
padding: 24px;
```

Never use:
* glassmorphism
* gradients
* floating cards
* heavy shadows

---

# Tables

Tables should be the primary UI pattern.
Mixpanel gets this right.
Every business object should be a table.

Examples:

### Opportunities
| Opportunity | Audience | Revenue | Confidence | Action |

### Customers
| Customer | Health | Personas | Revenue | Next Action |

### Campaigns
| Campaign | Channel | Status | Revenue | ROI |

Tables should occupy most of the screen.

---

# Insight Panels

Every page must contain AI insights.

Style: Small panel.

```txt
AI Insight

VIP engagement declined 11%
during the last 30 days.

Potential revenue impact:
₹18,000
```

Do NOT make insights giant cards. Keep them concise.

---

# Page-Specific Structures

### Revenue Opportunities Page
```txt
Header
KPI Row
Opportunity Table
AI Explanation Panel
Recommended Actions
```
Opportunity table should dominate the screen. Not giant cards.

### Campaign Copilot
Replace card-heavy layout. Use:
```txt
Audience Selection
Campaign Simulator
Generated Variants
Expected Revenue
Approval Panel
```
Two-column enterprise layout. Like a financial terminal. Not stacked cards.

### Customer Intelligence
```txt
KPI Row
Customer Table
Customer Drawer
AI Recommendations
```
Customer table should occupy 70% of page. Selecting a row opens a side panel.

### Personas
```txt
Persona Overview
Revenue Contribution
Audience Size
Risk Trend
Recommended Campaign
```
Use compact analytics blocks. Avoid huge empty cards.

### Revenue Intelligence
Inspired by Mixpanel dashboards.
```txt
Key Insight
Key Risk
Key Opportunity
KPI Row
Revenue Attribution Table
Channel Performance Table
Persona Performance Table
```
No oversized charts. Tables first. Insights second. Charts third.

---

# Charts

Charts should support decisions. Never dominate pages.

Use:
* Line charts
* Area charts
* Revenue trends

Height: `280px` max. No giant dashboard charts.

---

# Typography

Primary: **Inter**

* Headings: `700`
* Body: `500`
* Numbers: `700`
* Color: `#0F172A`
* Muted: `#64748B`

---

# Colors

* Background: `#FFFFFF`
* Primary Text: `#0F172A`
* Secondary Text: `#64748B`
* Border: `#E2E8F0`
* Primary Accent: `#2563EB`
* Success: `#10B981`
* Warning: `#F59E0B`
* Danger: `#EF4444`

**Strict Rule:** No gradients. No neon. No glowing effects.

---

# Spacing

Use 8px spacing scale.

* Page padding: `48px`
* Section gap: `32px`
* Card gap: `24px`

---

# AI-Specific Rule

Every screen must answer:
1. What happened?
2. Why did it happen?
3. How much revenue is affected?
4. What should the user do next?

If a component does not help answer one of these questions, remove it.

---

# Final Goal

The entire application should feel like:

**"Mixpanel for Revenue Intelligence powered by AI."**

Not a CRM demo. Not a hackathon project. Not an AI-generated dashboard.
A serious enterprise product where every page looks cohesive, information-dense, operational, and executive-ready.
