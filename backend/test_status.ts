import { HTTPError } from '@/errors';
import type { InvertedStatusMap, StatusMap } from 'elysia';

type StatusNumber = keyof InvertedStatusMap;
type StatusPharse = keyof StatusMap;

function testStatusPharseType(status: StatusPharse | number) {
	console.log(status);
}

function testStatusNumberType(status: StatusNumber | number) {
	console.log(status);
}

testStatusNumberType(100);

testStatusPharseType('Continue');
testStatusPharseType('OK');

new HTTPError(100);

new HTTPError(300);

const e4 = new HTTPError(400, 'Bad Request');
console.log('e4.status', e4.status);
console.log('e4.message', e4.message);

new HTTPError('hehe');
new HTTPError(600);
