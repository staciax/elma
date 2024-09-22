'use client';

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
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getUsers } from '@/lib/elma/actions/users';
import type { UserPublic, UserRole } from '@/lib/elma/types/users';
import { ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
// import { useFormatter } from 'next-intl';
import { useEffect, useState } from 'react';
// import Image from 'next/image';

const roleBadgeColors: Record<UserRole, string> = {
	SUPERUSER: 'bg-red-500 hover:bg-red-600',
	ADMIN: 'bg-purple-500 hover:bg-purple-600',
	MANAGER: 'bg-blue-500 hover:bg-blue-600',
	EMPLOYEE: 'bg-green-500 hover:bg-green-600',
	CUSTOMER: 'bg-gray-500 hover:bg-gray-600',
};

// https://www.builder.io/blog/relative-time
function getRelativeTimeString(
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

export default function Page() {
	const [count, setCount] = useState(0);
	const [users, setUsers] = useState<UserPublic[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isOpen, setIsOpen] = useState(false);
	const [editingUser, setEditingUser] = useState<UserPublic | null>(null);
	const [newUserName, setNewUserName] = useState('');
	const [newUserEmail, setNewUserEmail] = useState('');
	const [newUserRole, setNewUserRole] = useState<UserRole>('CUSTOMER');
	const [newUserIsActive, setNewUserIsActive] = useState(true);
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

	// const format = useFormatter();

	useEffect(() => {
		async function fetchData() {
			const result = await getUsers();
			if (result) {
				setCount(result.count);
				setUsers(result.data);
				setIsLoading(false);
			}
		}
		fetchData();
	}, []);

	if (isLoading) {
		return <div>loading...</div>;
	}

	const handleOpenModal = (user?: UserPublic) => {
		if (user) {
			setEditingUser(user);
			setNewUserName(user.first_name);
			setNewUserEmail(user.email);
			//   setNewUserRole(user.role);
			// setNewUserIsActive(user.is_active);
		} else {
			setEditingUser(null);
			setNewUserName('');
			setNewUserEmail('');
			setNewUserRole('CUSTOMER');
			setNewUserIsActive(true);
		}
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setEditingUser(null);
	};

	const handleSaveUser = (e: React.FormEvent) => {
		e.preventDefault();
		if (newUserName.trim() && newUserEmail.trim()) {
			const updatedUser: UserPublic = {
				id: editingUser ? editingUser.id : String(Date.now()),
				first_name: newUserName,
				last_name: '',
				email: newUserEmail,
				role: newUserRole,
				phone_number: '',
				is_active: newUserIsActive,
				created_at: editingUser
					? editingUser.created_at
					: new Date().toISOString(),
			};

			if (editingUser) {
				setUsers(
					users.map((user) =>
						user.id === editingUser.id ? updatedUser : user,
					),
				);
			} else {
				setUsers([...users, updatedUser]);
			}
			handleCloseModal();
		}
	};

	// const handleDeleteUser = (id: string) => {
	// 	setUsers(users.filter((user) => user.id !== id));
	// };

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		return new Date(dateString).toLocaleDateString(undefined, options);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (editingUser) {
			setEditingUser({ ...editingUser, [e.target.name]: e.target.value });
		}
	};

	const handleRoleChange = (value: UserRole) => {
		if (editingUser) {
			setEditingUser({ ...editingUser, role: value });
		}
	};

	const handleActiveChange = (checked: boolean) => {
		if (editingUser) {
			setEditingUser({ ...editingUser, is_active: checked });
		}
	};

	const handleDeleteUser = (id: string) => {
		setUsers(users.filter((user) => user.id !== id));
		setSelectedUsers(selectedUsers.filter((userId) => userId !== id));
	};

	const handleSelectUser = (id: string) => {
		setSelectedUsers((prev) =>
			prev.includes(id)
				? prev.filter((userId) => userId !== id)
				: [...prev, id],
		);
	};

	const handleSelectAllUsers = () => {
		if (selectedUsers.length === users.length) {
			setSelectedUsers([]);
		} else {
			setSelectedUsers(users.map((user) => user.id));
		}
	};

	const handleDeleteSelectedUsers = () => {
		setUsers(users.filter((user) => !selectedUsers.includes(user.id)));
		setSelectedUsers([]);
	};

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
						<DropdownMenuCheckboxItem>ชื่อ</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>บทบาท</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>สถานะ</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>เข้าร่วมเมื่อ</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
				{/* <Button size="sm" variant="outline" className="h-8 gap-1">
					<File className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						Export
					</span>
				</Button> */}
				<Button
					size="sm"
					className="h-8 gap-1"
					onClick={() => handleOpenModal()}
				>
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
								<TableHead>ชื่อ</TableHead>
								<TableHead>อีเมล</TableHead>
								<TableHead className="hidden md:table-cell">บทบาท</TableHead>
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
							{users.map((user) => (
								<TableRow key={user.id}>
									<TableCell className="font-medium">
										{user.first_name} {user.last_name || '-'}
									</TableCell>
									<TableCell className="font-medium">{user.email}</TableCell>
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
						Showing <strong>1-10</strong> of <strong>{count}</strong> products
					</div>
				</CardFooter>
			</Card>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingUser?.id ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveUser} className="space-y-4">
						{/* <div>
							<Label htmlFor="first_name">ชื่อ</Label>
							<Input
								id="first_name"
								type="text"
								name="first_name"
								placeholder="ชื่อ"
								value={editingUser?.first_name || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="last_name">นามสกุล</Label>
							<Input
								id="last_name"
								type="text"
								name="last_name"
								placeholder="นามสกุล"
								value={editingUser?.last_name || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div> */}
						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="first_name">ชื่อ</Label>
								<Input
									id="first_name"
									type="text"
									name="first_name"
									placeholder="ชื่อ"
									value={editingUser?.first_name || ''}
									onChange={handleInputChange}
									className="w-full mt-1"
									required
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="last_name">นามสกุล</Label>
								<Input
									id="last_name"
									type="text"
									name="last_name"
									placeholder="นามสกุล"
									value={editingUser?.last_name || ''}
									onChange={handleInputChange}
									className="w-full mt-1"
									required
								/>
							</div>
						</div>
						<div>
							<Label htmlFor="email">อีเมล</Label>
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="อีเมล"
								value={editingUser?.email || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="password">รหัสผ่าน</Label>
							<Input
								id="password"
								type="password"
								name="password"
								// placeholder="อีเมล"
								// value={editingUser?.email || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="password">ยืนยันรหัสผ่าน</Label>
							<Input
								id="password"
								type="password"
								name="password"
								// placeholder="อีเมล"
								// value={editingUser?.email || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="phone_number">เบอร์โทรศัพท์</Label>
							<Input
								id="phone_number"
								type="tel"
								name="phone_number"
								placeholder="เบอร์โทรศัพท์"
								value={editingUser?.phone_number || ''}
								onChange={handleInputChange}
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="role">บทบาท</Label>
							<Select
								onValueChange={handleRoleChange}
								value={editingUser?.role}
							>
								<SelectTrigger className="w-full mt-1">
									<SelectValue placeholder="เลือกบทบาท" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="SUPERUSER">Superuser</SelectItem>
									<SelectItem value="ADMIN">Admin</SelectItem>
									<SelectItem value="MANAGER">Manager</SelectItem>
									<SelectItem value="EMPLOYEE">Employee</SelectItem>
									<SelectItem value="CUSTOMER">Customer</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="is_active"
								checked={editingUser?.is_active}
								onCheckedChange={handleActiveChange}
							/>
							<Label htmlFor="is_active">เปิดใช้งาน</Label>
						</div>
						<Button type="submit" className="w-full">
							{editingUser?.id ? 'บันทึกการแก้ไข' : 'เพิ่มผู้ใช้'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
