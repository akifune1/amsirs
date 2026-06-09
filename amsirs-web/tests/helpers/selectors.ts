/**
 * Reusable DOM Selectors for AMSIRS E2E Tests
 */

export const SELECTORS = {
  sidebar: {
    container: 'aside',
    navLinks: 'aside nav a',
    logo: 'aside >> text=AMSIRS',
    signOutButton: 'aside form button',
    userInfoBlock: 'aside .bg-zinc-50',
  },

  login: {
    emailInput: 'input[name="email"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
    errorMessage: '.alert-error',
    registerLink: 'a[href="/register"]',
  },

  tables: {
    wrapper: '.sys-table-wrapper',
    table: '.sys-table',
    headerRow: '.table-header-row',
    headerCell: '.table-th',
    bodyCell: '.table-td',
    emptyState: 'td[colspan]',
  },

  cards: {
    sysCard: '.sys-card',
    sysCardHeader: '.sys-card-header',
    statCardPrimary: '.stat-card-primary',
    statCardOrange: '.stat-card-orange',
    statCard: '.stat-card',
  },

  headings: {
    sysTitle: '.sys-title',
    sysSubtitle: '.sys-subtitle',
    sysLabel: '.sys-label',
  },

  forms: {
    inputField: '.input-field',
    inputFieldAlt: '.input-field-alt',
    formLabel: '.form-label',
    btnPrimary: '.btn-primary',
    btnText: '.btn-text',
    btnOutline: '.btn-outline',
    alertSuccess: '.alert-success',
    alertError: '.alert-error',
  },
} as const;
