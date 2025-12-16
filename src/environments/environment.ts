export const environment = {
  production: false,
  apiUrl: (typeof window !== 'undefined' && (window as any).API_URL) || 'http://localhost:3000/games'
};