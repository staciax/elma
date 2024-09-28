'use client';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Circle, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { format } from 'date-fns';
// 23 ก.ย. 2024 15:01 น.
import { th } from 'date-fns/locale';

// console.log(format(new Date(), 'd MMM yyy p', { locale: th }));

interface User {
	id: string;
	email: string;
	first_name: string | null;
	last_name: string | null;
}

interface Book {
	id: string;
	title: string;
	price: number;
	authors: string[];
}

interface OrderItem {
	book_id: string;
	price: number;
}

interface Payment {
	id: string;
	amount: number;
	method: string;
	status: 'รอชำระเงิน' | 'ชำระเงินแล้ว' | 'ชำระเงินไม่สำเร็จ' | 'คืนเงินแล้ว';
	created_at: string;
	updated_at: string;
}

interface Order {
	id: string;
	user_id: string;
	total_price: number;
	status: 'รอดำเนินการ' | 'กำลังดำเนินการ' | 'เสร็จสมบูรณ์' | 'ยกเลิก';
	created_at: string;
	updated_at: string;
	items: OrderItem[];
	payment: Payment;
	user: User;
}

const statusColors = {
	รอดำเนินการ: 'text-yellow-500',
	กำลังดำเนินการ: 'text-blue-500',
	เสร็จสมบูรณ์: 'text-green-500',
	ยกเลิก: 'text-red-500',
};

const paymentStatusColors = {
	รอชำระเงิน: 'text-yellow-500',
	ชำระเงินแล้ว: 'text-green-500',
	ชำระเงินไม่สำเร็จ: 'text-red-500',
	คืนเงินแล้ว: 'text-blue-500',
};

// Mock function to fetch orders - replace with actual API call
const fetchOrders = async (): Promise<Order[]> => {
	// Simulating API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return [
		{
			id: '019231f2-9bd2-7818-a2b6-e7f350829f28',
			user_id: 'USR001',
			total_price: 89.98,
			status: 'เสร็จสมบูรณ์',
			created_at: '2024-09-26T10:00:00Z',
			updated_at: '2024-09-26T10:10:00Z',
			items: [
				{ book_id: 'BOOK001', price: 39.99 },
				{ book_id: 'BOOK002', price: 49.99 },
			],
			payment: {
				id: 'PAY001',
				amount: 89.98,
				method: 'บัตรเครดิต',
				status: 'ชำระเงินแล้ว',
				created_at: '2024-09-26T10:05:00Z',
				updated_at: '2024-09-26T10:10:00Z',
			},
			user: {
				id: 'USR001',
				email: 'john.doe@example.com',
				first_name: 'stacia',
				last_name: 'dev',
			},
		},
		{
			id: '019231f2-74e6-7bca-aa37-7aab8fdeb7b0',
			user_id: 'USR002',
			total_price: 29.99,
			status: 'รอดำเนินการ',
			created_at: '2023-09-25T14:30:00Z',
			updated_at: '2023-09-25T14:30:00Z',
			items: [{ book_id: 'BOOK003', price: 29.99 }],
			payment: {
				id: 'PAY002',
				amount: 29.99,
				method: 'PayPal',
				status: 'รอชำระเงิน',
				created_at: '2023-09-25T14:35:00Z',
				updated_at: '2023-09-25T14:35:00Z',
			},
			user: {
				id: 'USR002',
				email: 'jane.smith@example.com',
				first_name: 'lunaria',
				last_name: 'moon',
			},
		},
	];
};

// Mock function to fetch books - replace with actual API call
const fetchBooks = async (): Promise<Book[]> => {
	// Simulating API call
	await new Promise((resolve) => setTimeout(resolve, 500));
	return [
		{
			id: 'BOOK001',
			title: 'พื้นฐาน React',
			price: 39.99,
			authors: ['จอห์น จอห์นสัน'],
		},
		{
			id: 'BOOK002',
			title: 'TypeScript ขั้นสูง',
			price: 49.99,
			authors: ['เอมิลี่ ทอมป์สัน', 'ไมเคิล บราวน์'],
		},
		{
			id: 'BOOK003',
			title: 'เชี่ยวชาญ CSS',
			price: 29.99,
			authors: ['ซาร่า เดวิส'],
		},
	];
};

export default function AdminOrders() {
	const [orders, setOrders] = useState<Order[]>([]);
	const [books, setBooks] = useState<Book[]>([]);
	const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [statusChangeDialog, setStatusChangeDialog] = useState<{
		isOpen: boolean;
		orderId: string;
		newStatus: Order['status'];
	}>({ isOpen: false, orderId: '', newStatus: 'รอดำเนินการ' });

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			const [ordersData, booksData] = await Promise.all([
				fetchOrders(),
				fetchBooks(),
			]);
			setOrders(ordersData);
			setBooks(booksData);
			setIsLoading(false);
		};
		loadData();
	}, []);

	const handleStatusChangeRequest = (
		orderId: string,
		newStatus: Order['status'],
	) => {
		const order = orders.find((o) => o.id === orderId);
		if (order) {
			if (newStatus === 'เสร็จสมบูรณ์' && order.payment.status !== 'ชำระเงินแล้ว') {
				toast({
					title: 'ไม่สามารถเปลี่ยนสถานะได้',
					description:
						"สถานะคำสั่งซื้อสามารถเปลี่ยนเป็น 'เสร็จสมบูรณ์' ได้เฉพาะเมื่อสถานะการชำระเงินเป็น 'ชำระเงินแล้ว' เท่านั้น",
					variant: 'destructive',
				});
				return;
			}
			setStatusChangeDialog({ isOpen: true, orderId, newStatus });
		}
	};

	const handleStatusChange = async () => {
		const { orderId, newStatus } = statusChangeDialog;
		// In a real application, you would make an API call here to update the status
		setOrders(
			orders.map((order) =>
				order.id === orderId ? { ...order, status: newStatus } : order,
			),
		);
		setStatusChangeDialog({
			isOpen: false,
			orderId: '',
			newStatus: 'รอดำเนินการ',
		});
		toast({
			title: 'อัปเดตสถานะสำเร็จ',
			description: `คำสั่งซื้อ ${orderId} ได้ถูกอัปเดตเป็นสถานะ ${newStatus}`,
		});
	};

	const handleDeleteOrder = async (orderId: string) => {
		// In a real application, you would make an API call here to delete the order
		setOrders(orders.filter((order) => order.id !== orderId));
		toast({
			title: 'ลบคำสั่งซื้อสำเร็จ',
			description: `คำสั่งซื้อ ${orderId} ได้ถูกลบออกจากระบบ`,
		});
	};

	const toggleOrderExpansion = (orderId: string) => {
		setExpandedOrder(expandedOrder === orderId ? null : orderId);
	};

	const getBookDetails = (bookId: string) => {
		return (
			books.find((book) => book.id === bookId) || {
				title: 'หนังสือที่ไม่รู้จัก',
				price: 0,
				authors: [],
			}
		);
	};

	if (isLoading) {
		return <div className="text-center mt-8">กำลังโหลด...</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">จัดการคำสั่งซื้อ</h1>
			<div className="mb-4 flex justify-between items-center">
				<Input placeholder="ค้นหาคำสั่งซื้อ..." className="max-w-sm" />
				<Select>
					<SelectTrigger className="w-[180px]">
						<SelectValue placeholder="กรองตามสถานะ" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">ทั้งหมด</SelectItem>
						<SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
						<SelectItem value="กำลังดำเนินการ">กำลังดำเนินการ</SelectItem>
						<SelectItem value="เสร็จสมบูรณ์">เสร็จสมบูรณ์</SelectItem>
						<SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						{/* <TableHead className="w-[100px]">รหัสคำสั่งซื้อ</TableHead> */}
						<TableHead>ลูกค้า</TableHead>
						<TableHead>วัน/เวลาซื้อ</TableHead>
						<TableHead>จำนวน</TableHead>
						<TableHead className="text-right">ราคาสุทธิ</TableHead>
						<TableHead>สถานะคำสั่งซื้อ</TableHead>
						<TableHead>สถานะการชำระเงิน</TableHead>
						<TableHead className="text-right">การดำเนินการ</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{orders.map((order) => (
						<>
							<TableRow key={order.id}>
								{/* <TableCell className="font-medium">{order.id}</TableCell> */}
								<TableCell>{`${order.user.first_name} ${order.user.last_name}`}</TableCell>
								<TableCell>
									{/* {new Date(order.created_at).toLocaleDateString('th-TH')} */}
									{format(new Date(order.created_at), 'd MMM yyy HH:mm น.', {
										locale: th,
									})}
								</TableCell>
								<TableCell className="text-right">
									{order.items.length} รายการ
								</TableCell>
								<TableCell className="text-right">
									{order.total_price.toFixed(2)} บาท
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										<Circle
											className={`h-3 w-3 ${statusColors[order.status]}`}
										/>
										<Select
											value={order.status}
											onValueChange={(value) =>
												handleStatusChangeRequest(
													order.id,
													value as Order['status'],
												)
											}
										>
											<SelectTrigger className="w-[130px]">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="รอดำเนินการ">รอดำเนินการ</SelectItem>
												<SelectItem value="กำลังดำเนินการ">
													กำลังดำเนินการ
												</SelectItem>
												<SelectItem value="เสร็จสมบูรณ์">เสร็จสมบูรณ์</SelectItem>
												<SelectItem value="ยกเลิก">ยกเลิก</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-2">
										<Circle
											className={`h-3 w-3 ${paymentStatusColors[order.payment.status]}`}
										/>
										<span>{order.payment.status}</span>
									</div>
								</TableCell>
								<TableCell className="text-right">
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" className="h-8 w-8 p-0">
												<span className="sr-only">เปิดเมนู</span>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuLabel>การดำเนินการ</DropdownMenuLabel>
											<DropdownMenuItem
												onClick={() => toggleOrderExpansion(order.id)}
											>
												ดูรายละเอีย
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												onClick={() => handleDeleteOrder(order.id)}
											>
												ลบคำสั่งซื้อ
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
							{expandedOrder === order.id && (
								<TableRow>
									<TableCell colSpan={7}>
										<div className="bg-muted p-4 rounded-md">
											<h3 className="font-semibold mb-2">รายการสินค้า:</h3>
											<ul>
												{order.items.map((item) => {
													const book = getBookDetails(item.book_id);
													return (
														<li
															key={item.book_id}
															className="flex justify-between"
														>
															<span>
																{book.title} โดย {book.authors.join(', ')}
															</span>
															<span>{item.price.toFixed(2)} บาท</span>
														</li>
													);
												})}
											</ul>
											<h3 className="font-semibold mt-4 mb-2">ข้อมูลลูกค้า:</h3>
											<p>
												ชื่อ: {order.user.first_name} {order.user.last_name}
											</p>
											<p>อีเมล: {order.user.email}</p>
											<h3 className="font-semibold mt-4 mb-2">
												รายละเอียดการชำระเงิน:
											</h3>
											<p>วิธีการชำระเงิน: {order.payment.method}</p>
											<p>จำนวนเงิน: {order.payment.amount.toFixed(2)} บาท</p>
											<p>สถานะ: {order.payment.status}</p>
											<p>
												วันที่สร้าง:{' '}
												{new Date(order.payment.created_at).toLocaleString(
													'th-TH',
												)}
											</p>
											<p>
												อัปเดตล่าสุด:{' '}
												{new Date(order.payment.updated_at).toLocaleString(
													'th-TH',
												)}
											</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</>
					))}
				</TableBody>
			</Table>

			<Dialog
				open={statusChangeDialog.isOpen}
				onOpenChange={(isOpen) =>
					setStatusChangeDialog((prev) => ({ ...prev, isOpen }))
				}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>ยืนยันการเปลี่ยนสถานะ</DialogTitle>
						<DialogDescription>
							คุณแน่ใจหรือไม่ว่าต้องการเปลี่ยนสถานะของคำสั่งซื้อ{' '}
							{statusChangeDialog.orderId} เป็น {statusChangeDialog.newStatus}?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() =>
								setStatusChangeDialog((prev) => ({ ...prev, isOpen: false }))
							}
						>
							ยกเลิก
						</Button>
						<Button onClick={handleStatusChange}>ยืนยัน</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
