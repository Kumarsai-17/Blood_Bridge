// Quick test to verify locations data
import { states, getCitiesByState, statesAndCities } from './data/locations.js';

console.log('=== LOCATIONS DATA TEST ===');
console.log('Total states:', states.length);
console.log('First 5 states:', states.slice(0, 5));
console.log('Sample state data:', statesAndCities['Delhi']);
console.log('getCitiesByState("Delhi"):', getCitiesByState('Delhi'));
console.log('=== TEST COMPLETE ===');
