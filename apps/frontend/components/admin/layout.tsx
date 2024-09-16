export default function AdminPanelLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<main>{children}</main>
		</>
	);
}
