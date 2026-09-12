// Never loaded before the user opts in. No automatic provider fallback.
// Policy reviewed 2026-09-12: https://operations.osmfoundation.org/policies/tiles/
export const streetTiles = {
 url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
 attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>',
 maxZoom: 18, referrerPolicy: 'strict-origin', crossOrigin: 'anonymous', updateWhenIdle: true, keepBuffer: 0,
};
