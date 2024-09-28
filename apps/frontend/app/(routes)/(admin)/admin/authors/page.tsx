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
import { getAuthors } from '@/lib/elma/actions/authors';
import type { AuthorPublic } from '@/lib/elma/types';
import { File, ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	const [count, setCount] = useState(0);
	const [authors, setAuthors] = useState<AuthorPublic[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			const result = await getAuthors();
			setCount(result.count);
			setAuthors(result.data);
			setIsLoading(false);
		}
		fetchData();
	}, []);

	const [isOpen, setIsOpen] = useState(false);
	const [editingAuthor, setEditingAuthor] = useState<AuthorPublic | null>(null);
	const [newAuthorName, setNewAuthorName] = useState('');

	const handleOpenModal = (author?: AuthorPublic) => {
		setEditingAuthor(author || null);
		setNewAuthorName(author ? author.name : '');
		// setNewAuthorBiography(author ? author.biography : '');
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setEditingAuthor(null);
		setNewAuthorName('');
		// setNewAuthorBiography('');
	};

	const handleSaveAuthor = (e: React.FormEvent) => {
		e.preventDefault();
		if (newAuthorName.trim()) {
			if (editingAuthor) {
				setAuthors(
					authors.map((author) =>
						author.id === editingAuthor.id
							? { ...author, name: newAuthorName }
							: author,
					),
				);
			} else {
				const newAuthor: AuthorPublic = {
					id: String(Date.now()),
					name: newAuthorName,
					// biography: newAuthorBiography,
				};
				setAuthors([...authors, newAuthor]);
			}
			handleCloseModal();
		}
	};

	if (isLoading) {
		return (
			<main className="grid flex-1 items-center justify-center">
				<File className="h-16 w-16 text-primary-foreground animate-spin" />
			</main>
		);
	}

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
						<DropdownMenuCheckboxItem>Bio</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					size="sm"
					className="h-8 gap-1"
					onClick={() => handleOpenModal()}
				>
					<PlusCircle className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						เพิ่มผู้แต่ง
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>ผู้แต่ง</CardTitle>
					<CardDescription>จัดการผู้แต่ง</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ชื่อ</TableHead>
								<TableHead className="hidden md:table-cell">Bio</TableHead>
								<TableHead>การดำเนินการ</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{authors.map((author) => (
								<TableRow key={author.id}>
									<TableCell className="font-medium">{author.name}</TableCell>
									<TableCell className="hidden md:table-cell">
										author.bio
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
							{editingAuthor ? 'แก้ไขผู้แต่ง' : 'เพิ่มผู้แต่งใหม่'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSaveAuthor} className="space-y-4">
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
							<Label htmlFor="authorName">ชื่อผู้แต่ง</Label>
							<Input
								id="authorName"
								value={newAuthorName}
								onChange={(e) => setNewAuthorName(e.target.value)}
								placeholder="ใส่ชื่อผู้แต่ง"
								required
							/>
						</div>
						<Button type="submit">
							{editingAuthor ? 'บันทึกการแก้ไข' : 'เพิ่มผู้แต่ง'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
