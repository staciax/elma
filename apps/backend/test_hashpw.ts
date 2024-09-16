import { getPasswordHash } from './src/security';

const pw1 = 'password';
const hash1 = await getPasswordHash(pw1);
console.log(hash1, hash1.length);
