import { generateSingleRouteUrl, generateMultiStopUrl } from './dashboard';

// Simple tests
console.log('Testing generateSingleRouteUrl...');
const url1 = generateSingleRouteUrl('Rua A, 123');
const expected1 = 'https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=Rua%20A%2C%20123&travelmode=driving';
if (url1 === expected1) {
  console.log('PASS: Single Route URL matches.');
} else {
  console.error('FAIL: Expected', expected1, 'but got', url1);
  process.exit(1);
}

console.log('Testing generateMultiStopUrl...');
const addresses = ['Rua A, 123', 'Av. B, 456', 'Rua C, 789'];
const url2 = generateMultiStopUrl(addresses);
// Expected:
// destination: Rua C, 789 (last)
// waypoints: Rua A, 123 | Av. B, 456 (first two)
// Order: Origin -> A -> B -> C (Destination)
// But wait, my implementation:
// const destination = addresses[addresses.length - 1];
// const waypoints = addresses.slice(0, -1).map(addr => encodeURIComponent(addr)).join('|');
// Correct.

const expected2 = 'https://www.google.com/maps/dir/?api=1&origin=Meu+Local&destination=Rua%20C%2C%20789&waypoints=Rua%20A%2C%20123|Av.%20B%2C%20456&travelmode=driving';

if (url2 === expected2) {
  console.log('PASS: Multi-stop URL matches.');
} else {
  console.error('FAIL: Expected', expected2, 'but got', url2);
  process.exit(1);
}
