export function getServerApiUrl() {
  return process.env.BACKEND_URL ?? 'http://localhost:4000';
}
