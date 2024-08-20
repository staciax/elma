// import { prisma } from '@/lib/prisma';
import type { UserCreate, UserUpdate } from '@/schemas/users';
import { getPasswordHash } from '@/security';

// import type { Prisma, User } from '@prisma/client';
import type { UnwrapSchema } from 'elysia';

// async function findUserById(id: string, omit?: Prisma.UserOmit) {
// 	return prisma.user.findUnique({
// 		where: {
// 			id,
// 		},
// 		omit,
// 	});
// }

// async function findUserByEmail(email: string, omit?: Prisma.UserOmit) {
// 	return prisma.user.findFirst({
// 		where: {
// 			email,
// 		},
// 		omit,
// 	});
// }

// async function createUser(
// 	userCreateDTO: UnwrapSchema<typeof UserCreate>,
// 	omit?: Prisma.UserOmit,
// ) {
// 	const { email, password } = userCreateDTO;
// 	const hashedPassword = await getPasswordHash(password);
// 	return prisma.user.create({
// 		data: {
// 			...userCreateDTO,
// 			email: email.toLowerCase(),
// 			hashed_password: hashedPassword,
// 		},
// 		omit,
// 	});
// }

// async function updateUser(
// 	user: User,
// 	userUpdateDTO: UnwrapSchema<typeof UserUpdate>,
// 	omit?: Prisma.UserOmit,
// ) {
// 	const { email, password } = userUpdateDTO;
// 	const hashedPassword = password ? await getPasswordHash(password) : undefined;

// 	return prisma.user.update({
// 		where: {
// 			id: user.id,
// 		},
// 		data: {
// 			...(email && { email: email.toLowerCase() }),
// 			...(hashedPassword && { hashedPassword }),
// 			...userUpdateDTO,
// 		},
// 		omit,
// 	});
// }

// async function deleteUser(userId: string, omit?: Prisma.UserOmit) {
// 	return prisma.user.delete({
// 		where: {
// 			id: userId,
// 		},
// 		omit,
// 	});
// }

// export { findUserById, findUserByEmail, createUser, updateUser, deleteUser };
