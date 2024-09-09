'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Book, CircleUser, Search, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

// TODO: add my book to navbar

export default function Header() {
	const isAuthenticated = true;

	const [showMobileSearch, setShowMobileSearch] = useState(false);
	const mobileSearchRef = useRef<HTMLInputElement>(null);

	const toggleMobileSearch = () => {
		setShowMobileSearch((prev) => !prev);
	};

	useEffect(() => {
		if (showMobileSearch && mobileSearchRef.current) {
			mobileSearchRef.current.focus();
		}
	}, [showMobileSearch]);

	const handleMobileSearchBlur = (e: React.FocusEvent) => {
		if (!e.currentTarget.contains(e.relatedTarget as Node)) {
			setShowMobileSearch(false);
		}
	};

	return (
		<header className="border-b bg-background px-4 py-4 sm:px-6 lg:px-8">
			<div className="container flex items-center justify-between">
				{/* Logo */}
				<div className="w-[20%]">
					<Link href="/" className="flex items-center space-x-2">
						<Book className="h-6 w-6" />
						<span className="font-bold text-lg">ELMA</span>
					</Link>
				</div>

				{/* Desktop Search Bar */}
				<div className="mx-4 hidden flex-1 justify-center sm:flex">
					<form className="relative w-full max-w-md">
						<Input type="search" placeholder="ค้้นหาหนังสือ" className="w-full pr-10" />
						<Button type="submit" variant="ghost" size="icon" className="absolute top-0 right-0 h-full">
							<Search className="h-5 w-5" />
							<span className="sr-only">Search</span>
						</Button>
					</form>
				</div>

				{/* Shopping Bag, Search Icon, and Register/Login */}
				{/* TODO: after auth show button for bookshelf or profile or something */}

				<div className="flex w-[20%] items-center justify-end space-x-4">
					<Button variant="ghost" size="icon" className="sm:hidden" onClick={toggleMobileSearch}>
						<Search className="h-5 w-5" />
						<span className="sr-only">Search</span>
					</Button>

					<Button variant="ghost" size="icon" className="hover:text-[#5AB772]">
						<Link href="/cart">
							<ShoppingBag className="h-6 w-6 " />
						</Link>
						<span className="sr-only">Shopping Bag</span>
					</Button>

					{isAuthenticated ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="icon" className="overflow-hidden rounded-full">
									{/* <Image
										src="/placeholder-user.jpg"
										width={36}
										height={36}
										alt="Avatar"
										className="overflow-hidden rounded-full"
									/> */}
									<CircleUser className="h-5 w-5" />
									<span className="sr-only">Toggle user menu</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
								<DropdownMenuSeparator />
								{/* หรือเพิ่ม login, register ตรงนี้้แทน */}
								<DropdownMenuItem asChild>
									<Link href="/account">
										<span>โปรไฟล์</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/account">
										<span>ชั้นหนังสือ</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem>ช่วยเหลือ</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>ออกจากระบบ</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button variant="outline" className="hidden items-center space-x-2 sm:flex">
								<Link href="/register">
									<span className="text-sm transition-colors hover:text-[#5AB772]">สมัครสมาชิก</span>
								</Link>
								<span className="text-sm">/</span>
								<Link href="/login">
									<span className="text-sm transition-colors hover:text-[#5AB772]">เข้าสู่ระบบ</span>
								</Link>
							</Button>
							<Button variant="outline" size="icon" className="sm:hidden">
								<User className="h-5 w-5" />
								<span className="sr-only">สมัครสมาชิก / เข้าสู่ระบบ</span>
							</Button>
						</>
					)}
				</div>
			</div>

			{/* Mobile Search Bar */}
			{showMobileSearch && (
				<div className="mt-4 sm:hidden">
					<form className="relative" onBlur={handleMobileSearchBlur}>
						<Input ref={mobileSearchRef} type="search" placeholder="ค้้นหาหนังสือ" className="w-full pr-10" />
						<Button type="submit" variant="ghost" size="icon" className="absolute top-0 right-0 h-full">
							<Search className="h-5 w-5" />
							<span className="sr-only">Search</span>
						</Button>
					</form>
				</div>
			)}
		</header>
	);
}
