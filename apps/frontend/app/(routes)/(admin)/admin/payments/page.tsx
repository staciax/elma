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
import { useToast } from '@/hooks/use-toast';
import { ArrowUpDown, Circle, MoreHorizontal, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Payment {
	id: string;
	orderId: string;
	amount: number;
	method: string;
	status: 'รอชำระเงิน' | 'ชำระเงินแล้ว' | 'ชำระเงินไม่สำเร็จ' | 'คืนเงินแล้ว';
	customerName: string;
	createdAt: string;
	updatedAt: string;
}

const paymentStatusColors = {
	รอชำระเงิน: 'text-yellow-500',
	ชำระเงินแล้ว: 'text-green-500',
	ชำระเงินไม่สำเร็จ: 'text-red-500',
	คืนเงินแล้ว: 'text-blue-500',
};

// Mock function to fetch payments - replace with actual API call
const fetchPayments = async (): Promise<Payment[]> => {
	// Simulating API call
	await new Promise((resolve) => setTimeout(resolve, 1000));
	return [
		{
			id: 'PAY001',
			orderId: 'ORD001',
			amount: 1500.0,
			method: 'บัตรเครดิต',
			status: 'ชำระเงินแล้ว',
			customerName: 'สมชาย ใจดี',
			createdAt: '2023-09-26T10:00:00Z',
			updatedAt: '2023-09-26T10:05:00Z',
		},
		{
			id: 'PAY002',
			orderId: 'ORD002',
			amount: 750.5,
			method: 'โอนเงินผ่านธนาคาร',
			status: 'รอชำระเงิน',
			customerName: 'สมหญิง รักดี',
			createdAt: '2023-09-26T11:30:00Z',
			updatedAt: '2023-09-26T11:30:00Z',
		},
		{
			id: 'PAY003',
			orderId: 'ORD003',
			amount: 2000.0,
			method: 'พร้อมเพย์',
			status: 'ชำระเงินไม่สำเร็จ',
			customerName: 'วิชัย มั่งมี',
			createdAt: '2023-09-25T15:45:00Z',
			updatedAt: '2023-09-25T16:00:00Z',
		},
	];
};

export default function AdminPaymentReview() {
	const { toast } = useToast();

	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [sortColumn, setSortColumn] = useState<keyof Payment>('createdAt');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
	const [filterStatus, setFilterStatus] = useState<Payment['status'] | 'all'>(
		'all',
	);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	useEffect(() => {
		const loadData = async () => {
			setIsLoading(true);
			const paymentsData = await fetchPayments();
			setPayments(paymentsData);
			setIsLoading(false);
		};
		loadData();
	}, []);

	const handleSort = (column: keyof Payment) => {
		if (column === sortColumn) {
			setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
		} else {
			setSortColumn(column);
			setSortDirection('asc');
		}
	};

	const handleStatusChange = async (
		paymentId: string,
		newStatus: Payment['status'],
	) => {
		// In a real application, you would make an API call here to update the status
		setPayments(
			payments.map((payment) =>
				payment.id === paymentId
					? {
							...payment,
							status: newStatus,
							updatedAt: new Date().toISOString(),
						}
					: payment,
			),
		);
		toast({
			title: 'อัปเดตสถานะสำเร็จ',
			description: `การชำระเงิน ${paymentId} ได้ถูกอัปเดตเป็นสถานะ ${newStatus}`,
		});
	};

	const filteredAndSortedPayments = payments
		.filter(
			(payment) => filterStatus === 'all' || payment.status === filterStatus,
		)
		.filter(
			(payment) =>
				payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
				payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
				payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()),
		)
		.sort((a, b) => {
			if (a[sortColumn] < b[sortColumn])
				return sortDirection === 'asc' ? -1 : 1;
			if (a[sortColumn] > b[sortColumn])
				return sortDirection === 'asc' ? 1 : -1;
			return 0;
		});

	const openPaymentDetails = (payment: Payment) => {
		setSelectedPayment(payment);
		setIsDialogOpen(true);
	};

	if (isLoading) {
		return <div className="text-center mt-8">กำลังโหลด...</div>;
	}

	return (
		<div className="container mx-auto p-6">
			<h1 className="text-2xl font-bold mb-6">ตรวจสอบการชำระเงิน</h1>
			<div className="mb-4 flex justify-between items-center">
				<div className="flex items-center space-x-2">
					<Input
						placeholder="ค้นหาการชำระเงิน..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="max-w-sm"
					/>
					<Select
						value={filterStatus}
						onValueChange={(value) =>
							setFilterStatus(value as Payment['status'] | 'all')
						}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="กรองตามสถานะ" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">ทั้งหมด</SelectItem>
							<SelectItem value="รอชำระเงิน">รอชำระเงิน</SelectItem>
							<SelectItem value="ชำระเงินแล้ว">ชำระเงินแล้ว</SelectItem>
							<SelectItem value="ชำระเงินไม่สำเร็จ">ชำระเงินไม่สำเร็จ</SelectItem>
							<SelectItem value="คืนเงินแล้ว">คืนเงินแล้ว</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[100px]">
							<Button variant="ghost" onClick={() => handleSort('id')}>
								รหัสชำระเงิน
								{sortColumn === 'id' && (
									<ArrowUpDown className="ml-2 h-4 w-4" />
								)}
							</Button>
						</TableHead>
						<TableHead>
							<Button variant="ghost" onClick={() => handleSort('orderId')}>
								รหัสคำสั่งซื้อ
								{sortColumn === 'orderId' && (
									<ArrowUpDown className="ml-2 h-4 w-4" />
								)}
							</Button>
						</TableHead>
						<TableHead>
							<Button
								variant="ghost"
								onClick={() => handleSort('customerName')}
							>
								ลูกค้า
								{sortColumn === 'customerName' && (
									<ArrowUpDown className="ml-2 h-4 w-4" />
								)}
							</Button>
						</TableHead>
						<TableHead className="text-right">
							<Button variant="ghost" onClick={() => handleSort('amount')}>
								จำนวนเงิน
								{sortColumn === 'amount' && (
									<ArrowUpDown className="ml-2 h-4 w-4" />
								)}
							</Button>
						</TableHead>
						<TableHead>วิธีการชำระเงิน</TableHead>
						<TableHead>
							<Button variant="ghost" onClick={() => handleSort('status')}>
								สถานะ
								{sortColumn === 'status' && (
									<ArrowUpDown className="ml-2 h-4 w-4" />
								)}
							</Button>
						</TableHead>
						<TableHead className="text-right">การดำเนินการ</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filteredAndSortedPayments.map((payment) => (
						<TableRow key={payment.id}>
							<TableCell className="font-medium">{payment.id}</TableCell>
							<TableCell>{payment.orderId}</TableCell>
							<TableCell>{payment.customerName}</TableCell>
							<TableCell className="text-right">
								{payment.amount.toFixed(2)} บาท
							</TableCell>
							<TableCell>{payment.method}</TableCell>
							<TableCell>
								<div className="flex items-center space-x-2">
									<Circle
										className={`h-3 w-3 ${paymentStatusColors[payment.status]}`}
									/>
									<span>{payment.status}</span>
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
											onClick={() => openPaymentDetails(payment)}
										>
											ดูรายละเอียด
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												handleStatusChange(payment.id, 'ชำระเงินแล้ว')
											}
										>
											อัปเดตเป็น: ชำระเงินแล้ว
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() =>
												handleStatusChange(payment.id, 'ชำระเงินไม่สำเร็จ')
											}
										>
											อัปเดตเป็น: ชำระเงินไม่สำเร็จ
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => handleStatusChange(payment.id, 'คืนเงินแล้ว')}
										>
											อัปเดตเป็น: คืนเงินแล้ว
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>รายละเอียดการชำระเงิน</DialogTitle>
					</DialogHeader>
					{selectedPayment && (
						<div className="mt-4">
							<p>
								<strong>รหัสชำระเงิน:</strong> {selectedPayment.id}
							</p>
							<p>
								<strong>รหัสคำสั่งซื้อ:</strong> {selectedPayment.orderId}
							</p>
							<p>
								<strong>ลูกค้า:</strong> {selectedPayment.customerName}
							</p>
							<p>
								<strong>จำนวนเงิน:</strong> {selectedPayment.amount.toFixed(2)}{' '}
								บาท
							</p>
							<p>
								<strong>วิธีการชำระเงิน:</strong> {selectedPayment.method}
							</p>
							<p>
								<strong>สถานะ:</strong> {selectedPayment.status}
							</p>
							<p>
								<strong>วันที่สร้าง:</strong>{' '}
								{new Date(selectedPayment.createdAt).toLocaleString('th-TH')}
							</p>
							<p>
								<strong>อัปเดตล่าสุด:</strong>{' '}
								{new Date(selectedPayment.updatedAt).toLocaleString('th-TH')}
							</p>
						</div>
					)}
					<DialogFooter>
						<Button onClick={() => setIsDialogOpen(false)}>ปิด</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
