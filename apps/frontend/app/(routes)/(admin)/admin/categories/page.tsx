'use client';

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
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { getCategories } from '@/lib/elma/actions/categories';
import type { CategoryPublic } from '@/lib/elma/types/categories';

import { ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	const [categories, setCategories] = useState<CategoryPublic[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [editingCategory, setEditingCategory] = useState<CategoryPublic | null>(
		null,
	);
	const [newCategoryName, setNewCategoryName] = useState('');

	const handleOpenModal = (category?: CategoryPublic) => {
		setEditingCategory(category || null);
		setNewCategoryName(category ? category.name : '');
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setEditingCategory(null);
		setNewCategoryName('');
	};

	const handleSaveCategory = (e: React.FormEvent) => {
		e.preventDefault();
		if (newCategoryName.trim()) {
			if (editingCategory) {
				setCategories(
					categories.map((cat) =>
						cat.id === editingCategory.id
							? { ...cat, name: newCategoryName }
							: cat,
					),
				);
			} else {
				const newCategory: CategoryPublic = {
					id: String(Date.now()),
					name: newCategoryName,
				};
				setCategories([...categories, newCategory]);
			}
			handleCloseModal();
		}
	};

	useEffect(() => {
		async function fetchCategories() {
			const result = await getCategories();
			setCategories(result.data);
		}

		fetchCategories();
	}, []);

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
						<DropdownMenuCheckboxItem checked>ชื่อ</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>คำอธิบาย</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					size="sm"
					className="h-8 gap-1"
					onClick={() => handleOpenModal()}
				>
					<PlusCircle className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						เพิ่มประเภท
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>ประเภท</CardTitle>
					<CardDescription>จัดการประเภท</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ชื่อ</TableHead>
								{/* <TableHead className="hidden md:table-cell">คำอธิบาย</TableHead> */}
								<TableHead>
									<span className="sr-only">Actions</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{categories.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									{/* <TableCell className="hidden md:table-cell">
										category.description
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
						Showing <strong>1-10</strong> of{' '}
						<strong>{categories.length}</strong> products
					</div>
				</CardFooter>
			</Card>
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingCategory ? 'แก้ไขประเภท' : 'เพิ่มประเภทใหม่'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveCategory} className="space-y-4">
						{/* TODO: remove id  */}
						<div>
							<Label htmlFor="id">ไอดี</Label>
							<Input
								id="id"
								type="text"
								name="id"
								className="w-full mt-1"
								required
							/>
						</div>
						<div>
							<Label htmlFor="categoryName">ชื่อประเภท</Label>
							<Input
								id="categoryName"
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								placeholder="ใส่ชื่อประเภท"
								required
							/>
						</div>
						<Button type="submit">
							{editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มประเภท'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
