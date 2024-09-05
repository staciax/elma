import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import Link from 'next/link';

function Header() {
	return (
		<header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
			<div>
				<Link href="/">
					<span className="font-semibold text-xl">ELMA</span>
				</Link>
			</div>
			<div className="flex w-full items-center gap-4 md:mx-auto md:gap-2 lg:gap-4">
				<form className="mx-auto flex-1 sm:flex-initial">
					<div className="relative">
						<button type="submit" className="absolute top-2.5 right-2.5">
							<Search className="h-4 w-4 text-muted-foreground" />
						</button>
						<Input
							name="q"
							type="text"
							placeholder="ค้นหาสินค้า..."
							className="pl-4 sm:w-[300px] md:w-[200px] lg:w-[300px]"
						/>
					</div>
				</form>
			</div>
			<nav>NAV</nav>
		</header>
	);
}

export default Header;
