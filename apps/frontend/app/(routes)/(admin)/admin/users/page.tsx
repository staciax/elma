import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { File, ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { useFormatter } from 'next-intl';
import Image from 'next/image';

import { getUsers } from '@/lib/elma/actions/users';
import type { UserRole } from '@/lib/elma/types/users';

const roleBadgeColors: Record<UserRole, string> = {
	SUPERUSER: 'bg-red-500 hover:bg-red-600',
	ADMIN: 'bg-purple-500 hover:bg-purple-600',
	MANAGER: 'bg-blue-500 hover:bg-blue-600',
	EMPLOYEE: 'bg-green-500 hover:bg-green-600',
	CUSTOMER: 'bg-gray-500 hover:bg-gray-600',
};

// https://www.builder.io/blog/relative-time
export function getRelativeTimeString(
	date: Date | number,
	lang = navigator.language,
): string {
	// Allow dates or times to be passed
	const timeMs = typeof date === 'number' ? date : date.getTime();

	// Get the amount of seconds between the given date and now
	const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

	// Array reprsenting one minute, hour, day, week, month, etc in seconds
	const cutoffs = [
		60,
		3600,
		86400,
		86400 * 7,
		86400 * 30,
		86400 * 365,
		Number.POSITIVE_INFINITY,
	];

	// Array equivalent to the above but in the string representation of the units
	const units: Intl.RelativeTimeFormatUnit[] = [
		'second',
		'minute',
		'hour',
		'day',
		'week',
		'month',
		'year',
	];

	// Grab the ideal cutoff unit
	const unitIndex = cutoffs.findIndex(
		(cutoff) => cutoff > Math.abs(deltaSeconds),
	);

	// Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
	// is one day in seconds, so we can divide our seconds by this to get the # of days
	const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

	// Intl.RelativeTimeFormat do its magic
	const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
	return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

function Relative(props: { date: Date | number; lang?: string }) {
	const timeString = getRelativeTimeString(props.date, props.lang); // ⬅️

	return <>{timeString}</>;
}

export default async function Page() {
	// const format = useFormatter();
	const result = await getUsers();

	return (
		<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-6">
			<div className="ml-auto flex items-center gap-2">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" size="sm" className="h-8 gap-1">
							<ListFilter className="h-3.5 w-3.5" />
							<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
								จัดเรียง
							</span>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel>จัดเรียง โดย</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuCheckboxItem checked>อีเมล</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>ชื่อ-สกุล</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>สิทธิ์</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>สถานะ</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>อัพเดทเมื่อ</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{/* <Button size="sm" variant="outline" className="h-8 gap-1">
					<File className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						Export
					</span>
				</Button> */}
				<Button size="sm" className="h-8 gap-1">
					<PlusCircle className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						เพิ่มบัญชีผู้ใช้
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>บัญชีผู้ใช้</CardTitle>
					<CardDescription>จัดการบัญชีผู้ใช้ของคุณ</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>อีเมล</TableHead>
								<TableHead>ชื่อ-สกุล</TableHead>
								<TableHead className="hidden md:table-cell">สิทธิ์</TableHead>
								<TableHead className="hidden md:table-cell">สถานะ</TableHead>
								{/* <TableHead className="hidden md:table-cell">อัพเดท</TableHead> */}
								<TableHead className="hidden md:table-cell">
									เข้าร่วมเมื่อ
								</TableHead>
								{/* <TableHead className="hidden md:table-cell">อัพเดทเมื่อ</TableHead> */}
								<TableHead>
									<span className="sr-only">Actions</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.data.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">{user.email}</TableCell>
									<TableCell className="font-medium">
										{user.first_name} {user.last_name || '-'}
									</TableCell>
									<TableCell className="hidden md:table-cell">
										<Badge
											className={`${roleBadgeColors[user.role || 'CUSTOMER']} text-white`}
										>
											{user.role}
										</Badge>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{user.is_active ? (
											<Badge className="bg-green-500">Active</Badge>
										) : (
											<Badge variant={'secondary'}>Inactive</Badge>
										)}
									</TableCell>
									{/* <TableCell className="hidden md:table-cell">
										{user.created_at
											? Relative({
													date: new Date(user.created_at),
													lang: 'th',
												})
											: '-'}
									</TableCell> */}
									<TableCell className="hidden md:table-cell">
										{user.updated_at
											? Relative({
													date: new Date(user.updated_at),
													lang: 'th',
												})
											: '-'}
									</TableCell>
									{/* <TableCell className="font-medium">{product.title}</TableCell> */}
									{/* <TableCell className="hidden md:table-cell">
										&#3647;{product.price}
									</TableCell> */}
									{/* <TableCell className="hidden md:table-cell">
										{product.publisher ? <>{product.publisher.name}</> : <>-</>}
									</TableCell> */}
									{/* <TableCell className="hidden md:table-cell">
										{product.is_active ? (
											<Badge className="bg-green-500">Active</Badge>
										) : (
											<Badge variant={'secondary'}>Inactive</Badge>
										)}
									</TableCell> */}
									<TableCell>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													aria-haspopup="true"
													size="icon"
													variant="ghost"
												>
													<MoreHorizontal className="h-4 w-4" />
													<span className="sr-only">Toggle menu</span>
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem>Edit</DropdownMenuItem>
												<DropdownMenuItem>Delete</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
				<CardFooter>
					<div className="text-muted-foreground text-xs">
						Showing <strong>1-10</strong> of <strong>{result.count}</strong>{' '}
						products
					</div>
				</CardFooter>
			</Card>
		</main>
	);
}
