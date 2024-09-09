export default function Page({ params }: { params: { id: string } }) {
	// TODO: validate id, mayne with zod
	return <div>ID: {params.id}</div>;
}
