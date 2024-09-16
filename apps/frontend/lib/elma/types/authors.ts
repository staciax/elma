export type AuthorPublic = {
	id: string;
	name: string;
};

export type AuthorsPublic = {
	count: number;
	data: AuthorPublic[];
};
