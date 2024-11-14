enum Role {
	SUPERUSER = "SUPERUSER",
	ADMIN = "ADMIN",
	MANAGER = "MANAGER",
	EMPLOYEE = "EMPLOYEE",
	CUSTOMER = "CUSTOMER"
}

type User = {
	name: string;
	role: Role;
};

const user_superuser: User = {
	name: "A",
	role: Role.SUPERUSER
};

const user_admin: User = {
	name: "B",
	role: Role.ADMIN
};

const user_manager: User = {
	name: "C",
	role: Role.MANAGER
};

const user_employee: User = {
	name: "D",
	role: Role.EMPLOYEE
};

const user_customer: User = {
	name: "E",
	role: Role.CUSTOMER
};

function roleRequired(role: Role[], user: User): boolean {
	return role.includes(user.role);
}

console.log(roleRequired([Role.SUPERUSER], user_superuser));
console.log(roleRequired([Role.SUPERUSER, Role.ADMIN], user_admin));
console.log(roleRequired([Role.CUSTOMER], user_customer));
console.log(roleRequired([Role.CUSTOMER, Role.EMPLOYEE], user_employee));
console.log(
	roleRequired([Role.CUSTOMER, Role.EMPLOYEE, Role.MANAGER], user_manager)
);
