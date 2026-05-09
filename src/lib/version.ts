const env = (import.meta as ImportMeta & { env?: Record<string, unknown> }).env ?? {};
const rawAppVersion: unknown = env.VITE_APP_VERSION;
const rawGitCommit: unknown = env.VITE_GIT_COMMIT;

export const appVersion = typeof rawAppVersion === 'string' ? rawAppVersion : '0.1.0-dev';
export const gitCommit = typeof rawGitCommit === 'string' ? rawGitCommit : 'local';

export const repositoryUrl = 'https://github.com/baditaflorin/urban-farm-year';
export const paypalUrl = 'https://www.paypal.com/paypalme/florinbadita';
export const liveUrl = 'https://baditaflorin.github.io/urban-farm-year/';
