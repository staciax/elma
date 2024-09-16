export type UserPublic = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
};

export type UserRole = 'SUPERUSER' | 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CUSTOMER';

export type User = UserPublic & {
	hashed_password: string;
	role: UserRole;
	is_active: boolean;
	created_at: string;
	updated_at: string;
};
