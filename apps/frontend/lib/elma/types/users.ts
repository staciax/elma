export type UserRole =
	| 'SUPERUSER'
	| 'ADMIN'
	| 'MANAGER'
	| 'EMPLOYEE'
	| 'CUSTOMER';

export type UserPublic = {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone_number: string;
	// hashed_password: string;
	role?: UserRole;
	is_active?: boolean;
	created_at?: string;
	updated_at?: string;
};

export type UsersPublic = {
	count: number;
	data: UserPublic[];
};
