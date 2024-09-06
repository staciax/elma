import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
	// request.cookies.set('ac-token', 'test');
	// const cookie = request.cookies.get('ac-token');
	// console.log('cookie', cookie);
	return NextResponse.next();
	// return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
	matcher: '/account/:path*',
};
