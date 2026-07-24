export function isHutchisonEmail(email: string | null | undefined) {
  return Boolean(email && email.toLowerCase().endsWith("@hutchisonports.com"));
}

// Legacy Microsoft auth config retired for demo mode.
export const isEntraConfigured = false;
