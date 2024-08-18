function Header() {
	return (
		<header>
			<div className="container mx-auto flex flex-row items-center justify-between ">
				<div>
					<span className="text-2xl">STACIA.</span>
				</div>
				<div>
					<input type="text" className="indent-2" />
				</div>
				<div>auth</div>
			</div>
		</header>
	);
}

export default Header;