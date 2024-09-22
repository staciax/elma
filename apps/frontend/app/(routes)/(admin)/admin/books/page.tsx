'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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
	DialogTrigger,
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
import { th } from 'date-fns/locale';
import { Check, ChevronsUpDown } from 'lucide-react';

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
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
import { Textarea } from '@/components/ui/textarea';
import { getBooks } from '@/lib/elma/actions/books';
import type { AuthorPublic } from '@/lib/elma/types/authors';
import type { BookPublic, BooksPublic } from '@/lib/elma/types/books';
import type { CategoryPublic } from '@/lib/elma/types/categories';
import type { PublisherPublic } from '@/lib/elma/types/publishers';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

// export function ComboboxDemo() {
// 	const [open, setOpen] = useState(false);
// 	const [value, setValue] = useState('');

// 	return (
// 		<Popover open={open} onOpenChange={setOpen} modal={true}>
// 			<PopoverTrigger asChild>
// 				<Button
// 					variant="outline"
// 					role="combobox"
// 					aria-expanded={open}
// 					className="w-[200px] justify-between"
// 				>
// 					{value
// 						? frameworks.find((framework) => framework.value === value)?.label
// 						: 'เลือกสำนักพิมพ์...'}
// 					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
// 				</Button>
// 			</PopoverTrigger>
// 			<PopoverContent className="w-[200px] p-0">
// 				<Command>
// 					<CommandInput placeholder="ค้นหา สำนักพิมพ์..." />
// 					<CommandList>
// 						<CommandEmpty>No framework found.</CommandEmpty>
// 						<CommandGroup>
// 							{frameworks.map((framework) => (
// 								<CommandItem
// 									key={framework.value}
// 									value={framework.value}
// 									onSelect={(currentValue) => {
// 										setValue(currentValue === value ? '' : currentValue);
// 										setOpen(false);
// 									}}
// 								>
// 									<Check
// 										className={cn(
// 											'mr-2 h-4 w-4',
// 											value === framework.value ? 'opacity-100' : 'opacity-0',
// 										)}
// 									/>
// 									{framework.label}
// 								</CommandItem>
// 							))}
// 						</CommandGroup>
// 					</CommandList>
// 				</Command>
// 			</PopoverContent>
// 		</Popover>
// 	);
// }

function CategorySelectScrollable() {
	return (
		<Select>
			<SelectTrigger className="w-[280px]">
				<SelectValue placeholder="เลือกหมวดหมู่" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>สำนักพิมพ์</SelectLabel>
					<SelectItem value="category-1">หมวดหมู่ 1</SelectItem>
					<SelectItem value="category-2">หมวดหมู่ 2</SelectItem>
					<SelectItem value="category-3">หมวดหมู่ 3</SelectItem>
					<SelectItem value="category-4">หมวดหมู่ 4</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

function PublisherSelectScrollable() {
	return (
		<Select>
			<SelectTrigger className="w-[280px]">
				<SelectValue placeholder="เลือกสำนักพิมพ์" />
			</SelectTrigger>
			<SelectContent>
				<SelectGroup>
					<SelectLabel>สำนักพิมพ์</SelectLabel>
					<SelectItem value="publisher-1">สำนักพิมพ์ 1</SelectItem>
					<SelectItem value="publisher-2">สำนักพิมพ์ 2</SelectItem>
					<SelectItem value="publisher-3">สำนักพิมพ์ 3</SelectItem>
					<SelectItem value="publisher-4">สำนักพิมพ์ 4</SelectItem>
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}

const allPublishers: PublisherPublic[] = [
	{ id: '1', name: 'Scribner' },
	{ id: '2', name: 'J. B. Lippincott & Co.' },
	{ id: '3', name: 'Penguin Books' },
];

const allCategories: CategoryPublic[] = [
	{ id: '1', name: 'Classic Literature' },
	{ id: '2', name: 'Science Fiction' },
	{ id: '3', name: 'Mystery' },
];

export default function Page() {
	const [result, setResult] = useState<BooksPublic>({ data: [], count: 0 });

	useEffect(() => {
		const fetchBooks = async () => {
			const response = await getBooks();
			setResult(response);
			setBooks(response.data);
		};

		fetchBooks();
	}, []);

	const [books, setBooks] = useState<BookPublic[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [editingBook, setEditingBook] = useState<BookPublic | null>(null);
	const [newAuthor, setNewAuthor] = useState('');
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [showNewAuthorInput, setShowNewAuthorInput] = useState(false);

	const [newPublisher, setNewPublisher] = useState('');
	const [showNewPublisherInput, setShowNewPublisherInput] = useState(false);

	const [newCategory, setNewCategory] = useState('');
	const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

	const handleOpenModal = (book?: BookPublic) => {
		setEditingBook(
			book ||
				({
					id: '',
					title: '',
					description: '',
					isbn: '',
					price: 0,
					physical_price: 0,
					published_date: '',
					cover_image: null,
					is_active: true,
					category: null,
					publisher: null,
					authors: [],
				} as BookPublic),
		);
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setEditingBook(null);
		setNewAuthor('');
	};

	const handleSaveBook = (e: React.FormEvent) => {
		e.preventDefault();
		if (editingBook) {
			if (editingBook.id) {
				setBooks(
					books.map((book) =>
						book.id === editingBook.id ? editingBook : book,
					),
				);
			} else {
				setBooks([...books, { ...editingBook, id: String(books.length + 1) }]);
			}
			handleCloseModal();
		}
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		if (editingBook) {
			setEditingBook({ ...editingBook, [e.target.name]: e.target.value });
		}
	};

	const handleSwitchChange = (checked: boolean) => {
		if (editingBook) {
			setEditingBook({ ...editingBook, is_active: checked });
		}
	};

	// Sample authors data
	const allAuthors: AuthorPublic[] = [
		{ id: '1', name: 'F. Scott Fitzgerald' },
		{ id: '2', name: 'Harper Lee' },
		{ id: '3', name: 'George Orwell' },
		{ id: '4', name: 'Jane Austen' },
	];

	const handleAddExistingAuthor = (authorId: string) => {
		const authorToAdd = allAuthors.find((author) => author.id === authorId);
		if (editingBook && authorToAdd) {
			setEditingBook({
				...editingBook,
				authors: [...(editingBook.authors || []), authorToAdd],
			});
		}
	};

	const handleAddNewAuthor = () => {
		if (editingBook && newAuthor) {
			const newAuthorObj = { id: String(Date.now()), name: newAuthor };
			setEditingBook({
				...editingBook,
				authors: [...(editingBook.authors || []), newAuthorObj],
			});
			setNewAuthor('');
			setShowNewAuthorInput(false);
		}
	};

	const handleRemoveAuthor = (authorId: string) => {
		if (editingBook) {
			setEditingBook({
				...editingBook,
				authors:
					editingBook.authors?.filter((author) => author.id !== authorId) || [],
			});
		}
	};

	const handleSelectPublisher = (publisherId: string) => {
		const selectedPublisher = allPublishers.find(
			(pub) => pub.id === publisherId,
		);
		if (editingBook && selectedPublisher) {
			setEditingBook({
				...editingBook,
				publisher: selectedPublisher,
			});
		}
	};

	const handleAddNewPublisher = () => {
		if (editingBook && newPublisher) {
			const newPublisherObj = { id: String(Date.now()), name: newPublisher };
			setEditingBook({
				...editingBook,
				publisher: newPublisherObj,
			});
			setNewPublisher('');
			setShowNewPublisherInput(false);
		}
	};

	const handleSelectCategory = (categoryId: string) => {
		const selectedCategory = allCategories.find((cat) => cat.id === categoryId);
		if (editingBook && selectedCategory) {
			setEditingBook({
				...editingBook,
				category: selectedCategory,
			});
		}
	};

	const handleAddNewCategory = () => {
		if (editingBook && newCategory) {
			const newCategoryObj = { id: String(Date.now()), name: newCategory };
			setEditingBook({
				...editingBook,
				category: newCategoryObj,
			});
			setNewCategory('');
			setShowNewCategoryInput(false);
		}
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
						<DropdownMenuCheckboxItem checked>ชื่อ</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>ราคา</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>ผู้แต่ง</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>สำนักพิมพ์</DropdownMenuCheckboxItem>
						<DropdownMenuCheckboxItem>สถานะ</DropdownMenuCheckboxItem>
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
						เพิ่มหนังสือ
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>หนังสือ</CardTitle>
					<CardDescription>จัดการหนังสือของคุณ</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="hidden w-[100px] sm:table-cell">
									<span className="sr-only">Image</span>
								</TableHead>
								<TableHead>ชื่อ</TableHead>
								{/* <TableHead>ISBN</TableHead> */}
								<TableHead>ราคา</TableHead>
								{/* <TableHead className="hidden md:table-cell">
									ประเภทไฟล์
								</TableHead> */}
								<TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
								{/* <TableHead className="hidden md:table-cell">ราคาปก</TableHead> */}
								<TableHead className="hidden md:table-cell">ผู้แต่ง</TableHead>
								<TableHead className="hidden md:table-cell">สำนักพิมพ์</TableHead>
								{/* <TableHead className="hidden md:table-cell">อัพเดท</TableHead> */}
								<TableHead className="hidden md:table-cell">สถานะ</TableHead>
								<TableHead>
									<span className="sr-only">Actions</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.data.map((product) => (
								<TableRow key={product.id}>
									<TableCell className="hidden sm:table-cell">
										{/* <Image
											alt="Product image"
											className="aspect-square rounded-md object-cover"
											height="64"
											src="/placeholder.svg"
											width="64"
										/> */}
										<img
											src={
												product.cover_image ||
												'https://cdn-local.mebmarket.com/meb/server1/240836/Thumbnail/book_detail_large.gif'
											}
											alt="Book Cover"
											width={64}
											className="aspect-auto rounded-md object-cover"
										/>
									</TableCell>
									<TableCell className="font-medium">{product.title}</TableCell>
									{/* <TableCell className="font-medium">{product.isbn}</TableCell> */}

									<TableCell>&#3647;{product.price}</TableCell>
									<TableCell className="hidden md:table-cell">
										{product.category?.name}
									</TableCell>
									{/* <TableCell className="hidden md:table-cell">
										{product.physical_price ? (
											<>&#3647;{product.physical_price}</>
										) : (
											'-'
										)}
									</TableCell> */}
									<TableCell className="hidden md:table-cell">
										{/* <Badge variant="outline">Draft</Badge> */}
										{/* <div className="grid gap-1">
											{product.authors ? (
												product.authors.map((author) => (
													<span
														key={author.id}
														className="inline-block rounded-full bg-muted px-2 py-1 text-muted-foreground text-xs"
													>
														{author.name}
													</span>
												))
											) : (
												<>-</>
											)}
										</div> */}
										<div className="grid gap-1">
											{product.authors?.map((author) => (
												<Badge
													key={author.id}
													variant="secondary"
													className="mr-1"
												>
													{author.name}
												</Badge>
											))}
										</div>
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{product.publisher ? <>{product.publisher.name}</> : <>-</>}
									</TableCell>
									<TableCell className="hidden md:table-cell">
										{product.is_active ? (
											<Badge className="bg-green-500">Active</Badge>
										) : (
											<Badge variant={'secondary'}>Inactive</Badge>
										)}
									</TableCell>
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
												<DropdownMenuItem
													onClick={() => handleOpenModal(product)}
												>
													แก้ไข
												</DropdownMenuItem>
												<DropdownMenuItem>ลบ</DropdownMenuItem>
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
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogContent className="max-w-xl overflow-y-scroll max-h-screen">
					<DialogHeader>
						<DialogTitle>
							{editingBook?.id ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือ'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveBook} className="space-y-4">
						<div>
							<Label htmlFor="title">ชื่อ</Label>
							<Input
								id="title"
								name="title"
								defaultValue={editingBook?.title || ''}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="description">คำอธิบาย</Label>
							<Textarea
								id="description"
								name="description"
								defaultValue={editingBook?.description || ''}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div>
							<Label htmlFor="isbn">ISBN</Label>
							<Input
								id="isbn"
								name="isbn"
								defaultValue={editingBook?.isbn || ''}
								onChange={handleInputChange}
								required
							/>
						</div>
						<div className="flex gap-4">
							<div className="flex-1">
								<Label htmlFor="price">ราคา</Label>
								<Input
									id="price"
									name="price"
									type="number"
									step="0.01"
									min="0"
									defaultValue={editingBook?.price || ''}
									onChange={handleInputChange}
									required
								/>
							</div>
							{/* <div className="flex-1">
								<Label htmlFor="physical_price">ราคาปก</Label>
								<Input
									id="physical_price"
									name="physical_price"
									type="number"
									step="0.01"
									min="0"
									defaultValue={editingBook?.physical_price || ''}
									onChange={handleInputChange}
									required
								/>
							</div> */}
							<div className="flex-1">
								<Label htmlFor="physical_price">ราคาปก</Label>
								<Input
									id="physical_price"
									name="physical_price"
									type="number"
									step="0.01"
									min="0"
									placeholder="ไม่บังคับ"
									defaultValue={editingBook?.physical_price || ''}
									onChange={handleInputChange}
									required
								/>
							</div>
						</div>

						<div className="grid gap-4">
							<Label htmlFor="published_date">เผยแพร่เมื่อ</Label>
							{/* <Input
								id="published_date"
								name="published_date"
								type="date"
								defaultValue={editingBook?.published_date || ''}
								onChange={handleInputChange}
								required
							/> */}
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<Button
										variant={'outline'}
										className={cn(
											'w-[280px] justify-start text-left font-normal',
											!date && 'text-muted-foreground',
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{date ? (
											format(date, 'PPP', {
												locale: th,
											})
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0">
									<Calendar
										mode="single"
										selected={
											editingBook?.published_date
												? new Date(editingBook.published_date)
												: undefined
										}
										onSelect={setDate}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
						</div>

						{/* <div>
							<Label htmlFor="category">หมวดหมู่</Label>
							<div className="flex gap-2">
								{showNewCategoryInput ? (
									<>
										<Input
											value={newCategory}
											onChange={(e) => setNewCategory(e.target.value)}
											placeholder="ชื่อหมวดหมู่ใหม่"
										/>
										<Button type="button" onClick={handleAddNewCategory}>
											เพิ่ม
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowNewCategoryInput(false)}
										>
											ยกเลิก
										</Button>
									</>
								) : (
									<>
										<Select onValueChange={handleSelectCategory}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="เลือกหมวดหมู่" />
											</SelectTrigger>
											<SelectContent>
												{allCategories.map((category) => (
													<SelectItem key={category.id} value={category.id}>
														{category.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											type="button"
											onClick={() => setShowNewCategoryInput(true)}
										>
											<Plus className="mr-2 h-4 w-4" /> เพิ่มหมวดหมู่ใหม่
										</Button>
									</>
								)}
							</div>
						</div> */}

						{/* <div className="flex gap-4">
							<div className="grid gap-1.5">
								<Label htmlFor="authors">สำนักพิมพ์</Label>
								<PublisherSelectScrollable />
							</div>

							<div className="grid gap-1.5">
								<Label htmlFor="authors">หมวดหมู่</Label>
								<CategorySelectScrollable />
							</div>
						</div> */}

						{/* <div>
							<Label htmlFor="publisher">สำนักพิมพ์</Label>
							<div className="flex gap-2">
								{showNewPublisherInput ? (
									<>
										<Input
											value={newPublisher}
											onChange={(e) => setNewPublisher(e.target.value)}
											placeholder="ชื่อสำนักพิมพ์ใหม่"
										/>
										<Button type="button" onClick={handleAddNewPublisher}>
											เพิ่ม
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowNewPublisherInput(false)}
										>
											ยกเลิก
										</Button>
									</>
								) : (
									<>
										<Select onValueChange={handleSelectPublisher}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="เลือกสำนักพิมพ์" />
											</SelectTrigger>
											<SelectContent>
												{allPublishers.map((publisher) => (
													<SelectItem key={publisher.id} value={publisher.id}>
														{publisher.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											type="button"
											onClick={() => setShowNewPublisherInput(true)}
										>
											<Plus className="mr-2 h-4 w-4" /> เพิ่มสำนักพิมพ์ใหม่
										</Button>
									</>
								)}
							</div>
						</div> */}

						{/* <div>
							<Label htmlFor="authors">ผู้แต่ง</Label>
							<div className="flex flex-wrap gap-2 mb-2">
								{editingBook?.authors?.map((author) => (
									<Badge
										key={author.id}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{author.name}
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-4 w-4 p-0"
											onClick={() => handleRemoveAuthor(author.id)}
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								))}
							</div>

							<div className="flex gap-2">
								{showNewAuthorInput ? (
									<>
										<Input
											value={newAuthor}
											onChange={(e) => setNewAuthor(e.target.value)}
											placeholder="ชื่อผู้แต่งใหม่"
										/>
										<Button type="button" onClick={handleAddNewAuthor}>
											เพิ่ม
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowNewAuthorInput(false)}
										>
											ยกเลิก
										</Button>
									</>
								) : (
									<>
										<Select onValueChange={handleAddExistingAuthor}>
											<SelectTrigger className="w-full">
												<SelectValue placeholder="เลือกผู้แต่ง" />
											</SelectTrigger>
											<SelectContent>
												{allAuthors.map((author) => (
													<SelectItem key={author.id} value={author.id}>
														{author.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											type="button"
											onClick={() => setShowNewAuthorInput(true)}
										>
											<Plus className="mr-2 h-4 w-4" /> เพิ่มผู้แต่งใหม่
										</Button>
									</>
								)}
							</div>
						</div> */}

						{/* <div>
							<Label htmlFor="authors">ผู้แต่ง</Label>
							<div className="flex flex-wrap gap-2 mb-2">
								{editingBook?.authors?.map((author) => (
									<Badge
										key={author.id}
										variant="secondary"
										className="flex items-center gap-1"
									>
										{author.name}
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="h-4 w-4 p-0"
											onClick={() => handleRemoveAuthor(author.id)}
										>
											<X className="h-3 w-3" />
										</Button>
									</Badge>
								))}
							</div>
							<div className="flex gap-2">
								<Input
									id="new-author"
									value={newAuthor}
									onChange={(e) => setNewAuthor(e.target.value)}
									placeholder="Add new author"
								/>
								<Button type="button" onClick={handleAddAuthor}>
									Add
								</Button>
							</div>
						</div> */}
						{/* <ComboboxDemo /> */}

						{/* <div className="grid gap-1.5">
							<Label htmlFor="authors">สำนักพิมพ์</Label>
							<PublisherSelectScrollable />
						</div>

						<div className="grid gap-1.5">
							<Label htmlFor="authors">หมวดหมู่</Label>
							<CategorySelectScrollable />
						</div> */}

						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="book-cover">รูปหน้าปก</Label>
							<Input id="book-cover" type="file" accept="image/*" />
						</div>

						<div className="grid w-full max-w-sm items-center gap-1.5">
							<Label htmlFor="ebook-file">ไฟล์อีบุ๊ค</Label>
							<Input id="ebook-file" type="file" accept=".pdf, .epub" />
						</div>
						<div className="flex items-center space-x-2">
							<Switch
								id="is_active"
								checked={editingBook?.is_active || false}
								onCheckedChange={handleSwitchChange}
							/>
							<Label htmlFor="is_active">สถานะ</Label>
						</div>
						<Button type="submit">บันทึก</Button>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
