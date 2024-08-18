import type { Environment } from '@/config';

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Environment {}
	}
}
