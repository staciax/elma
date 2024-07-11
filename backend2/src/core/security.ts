import { jwt as elysia_jwt } from "@elysiajs/jwt";
import { t } from 'elysia'

const ALGORITHM = 'HS256';
const EXPIRES_IN = '1d';

export const jwt = elysia_jwt({
    name: 'jwt',
    secret: 'test', // process.env.JWT_SECRETS
    sub: 'auth',
    // iss: 'stacia-dev.com',
    alg: ALGORITHM,
    exp: EXPIRES_IN,
    schema: t.Object({
        name: t.String()
    })
});


// async function getAccessToken(auth: any) {
//     auth.set({
//         value: await jwt.sign(params),
//         httpOnly: true,
//         maxAge: 7 * 86400,
//         path: '/profile',
//     });
//     return 
// }

