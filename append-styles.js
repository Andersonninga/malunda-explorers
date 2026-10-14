const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'wp-content', 'themes', 'malunda-explorers', 'assets', 'css', 'main.css');
const extraCss = `
/* ==========================================================================
   FLOATING WHATSAPP BUTTON & WIDGET
   ========================================================================== */
.whatsapp-floating-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #25D366;
  color: #ffffff !important;
  font-family: var(--font-body);
  font-size: 0.95rem;
  font-weight: 700;
  padding: 12px 20px 12px 16px;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.45);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.whatsapp-floating-btn:hover {
  background: #20ba5a;
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 30px rgba(37, 211, 102, 0.55);
}
.whatsapp-icon-svg {
  width: 24px;
  height: 24px;
  fill: currentColor;
}
@media (max-width: 768px) {
  .whatsapp-floating-btn {
    bottom: 80px;
    right: 18px;
    padding: 10px 14px;
    font-size: 0.85rem;
  }
  .whatsapp-label {
    display: none;
  }
}

/* ==========================================================================
   DYNAMIC PRICING CALCULATOR PANEL (PACKAGE DETAIL)
   ========================================================================== */
.package-calc-card {
  background: #ffffff;
  border-radius: 18px;
  border: 2px solid var(--color-accent);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}
.calc-header {
  background: var(--color-primary-dark);
  color: #ffffff;
  padding: 1.8rem;
}
.calc-price-lead {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--color-accent);
}
.calc-form-body {
  padding: 1.8rem;
}
.calc-field-group {
  margin-bottom: 1.2rem;
}
.calc-field-group label {
  display: block;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-dark-muted);
  margin-bottom: 0.4rem;
}
.calc-field-group select,
.calc-field-group input {
  width: 100%;
  padding: 0.65rem 0.9rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 0.92rem;
}
.calc-breakdown-box {
  background: var(--color-sand-light);
  border: 1px solid var(--color-border-subtle);
  border-radius: 10px;
  padding: 1.2rem;
  margin: 1.2rem 0;
}
.calc-breakdown-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: var(--color-dark-muted);
}
.calc-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--color-primary-dark);
  border-top: 1px solid rgba(24,51,33,0.12);
  padding-top: 0.6rem;
  margin-top: 0.6rem;
}

/* ==========================================================================
   CUSTOMER DASHBOARD & TIMELINE
   ========================================================================== */
.cust-dashboard-wrap {
  padding: 4rem 1.5rem;
  background: var(--color-sand-light);
  min-height: 80vh;
}
.cust-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  padding: 2.5rem;
  margin-bottom: 2rem;
}
.timeline-track {
  display: flex;
  justify-content: space-between;
  position: relative;
  margin: 2.5rem 0 1.5rem;
}
.timeline-track::before {
  content: '';
  position: absolute;
  top: 18px;
  left: 20px;
  right: 20px;
  height: 4px;
  background: #e2ddd3;
  z-index: 1;
}
.timeline-step {
  position: relative;
  z-index: 2;
  text-align: center;
  flex: 1;
}
.timeline-dot {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #ffffff;
  border: 3px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.6rem;
  font-weight: 700;
  font-size: 0.85rem;
  color: #777;
}
.timeline-step.completed .timeline-dot {
  background: #183321;
  border-color: #183321;
  color: #ffffff;
}
.timeline-step.active .timeline-dot {
  background: #c8933b;
  border-color: #c8933b;
  color: #ffffff;
  box-shadow: 0 0 0 5px rgba(200, 147, 59, 0.25);
}
.timeline-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-dark-muted);
}
.timeline-step.completed .timeline-title,
.timeline-step.active .timeline-title {
  color: var(--color-primary-dark);
}

/* ==========================================================================
   ADMIN TABS & COMPONENTS
   ========================================================================== */
.admin-tab-nav {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid #ddd;
  margin-bottom: 1.5rem;
  overflow-x: auto;
}
.admin-tab-btn {
  padding: 0.8rem 1.4rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-family: inherit;
  font-size: 0.95rem;
  font-weight: 700;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.admin-tab-btn:hover {
  color: var(--color-primary);
}
.admin-tab-btn.active {
  color: var(--color-primary);
  border-bottom-color: var(--color-accent);
}
.admin-tab-content {
  display: none;
}
.admin-tab-content.active {
  display: block;
}
`;

fs.appendFileSync(cssPath, extraCss, 'utf8');
console.log('Extra CSS appended successfully');
