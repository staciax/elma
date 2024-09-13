export type PublisherPublic = {
	id: string;
	name: string;
};

export type PublishersPublic = {
	count: number;
	data: PublisherPublic[];
};
