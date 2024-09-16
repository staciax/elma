export type CategoryPublic = {
	id: string;
	name: string;
};

export type CategoriesPublic = {
	count: number;
	data: CategoryPublic[];
};
