// Set COOKBOOK_ADMIN=off at build time to leave the admin page out of a deployment.
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
export const adminEnabled = env.COOKBOOK_ADMIN !== 'off';
