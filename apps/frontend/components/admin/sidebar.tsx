import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import {
	BookText,
	ChartBarStacked,
	Home,
	MoonStar,
	PencilLine,
	Printer,
	Settings,
	ShoppingCart,
	Users2,
} from 'lucide-react';
import Link from 'next/link';

export default function SideBar() {
	const navigation = [
		{ name: 'Dashboard', href: '/admin', icon: Home },
		{ name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
		{ name: 'หนังสือ', href: '/admin/books', icon: BookText },
		{ name: 'บัญชีผู้ใช้', href: '/admin/users', icon: Users2 },
		{ name: 'ผู้แต่ง', href: '/admin/authors', icon: PencilLine },
		{ name: 'สำนักพิมพ์', href: '/admin/publishers', icon: Printer },
		{ name: 'หมวดหมู่', href: '/admin/categories', icon: ChartBarStacked },
	];

	return (
		<aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
			<nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
				<Link
					href="#"
					className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary font-semibold text-lg text-primary-foreground md:h-8 md:w-8 md:text-base"
				>
					<MoonStar className="h-4 w-4 transition-all group-hover:scale-110" />
					<span className="sr-only">Elma</span>
				</Link>
				{navigation.map((item) => (
					<Tooltip key={item.name}>
						<TooltipTrigger asChild>
							<Link
								href={item.href}
								className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
							>
								{/* <Home className="h-5 w-5" /> */}
								<item.icon className="h-5 w-5" />
								<span className="sr-only">{item.name}</span>
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">{item.name}</TooltipContent>
					</Tooltip>
				))}
			</nav>
			<nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
				<Tooltip>
					<TooltipTrigger asChild>
						<Link
							href="#"
							className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
						>
							<Settings className="h-5 w-5" />
							<span className="sr-only">Settings</span>
						</Link>
					</TooltipTrigger>
					<TooltipContent side="right">Settings</TooltipContent>
				</Tooltip>
			</nav>
		</aside>
	);
}
