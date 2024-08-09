export type User = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	hashedPassword: string;
	isSuperuser: boolean;
	isStaff: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};
