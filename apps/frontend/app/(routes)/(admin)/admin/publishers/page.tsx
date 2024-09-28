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
import { getPublishers } from '@/lib/elma/actions/publishers';
import type { PublisherPublic } from '@/lib/elma/types';
import { ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Page() {
	const [count, setCount] = useState(0);
	const [publishers, setPublishers] = useState<PublisherPublic[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		async function fetchData() {
			const result = await getPublishers();
			setCount(result.count);
			setPublishers(result.data);
			setIsLoading(false);
		}
		fetchData();
	}, []);

	const [isOpen, setIsOpen] = useState(false);
	const [editingPublisher, setEditingPublisher] =
		useState<PublisherPublic | null>(null);
	const [newPublisherName, setNewPublisherName] = useState('');
	const [newPublisherWebsite, setNewPublisherWebsite] = useState('');

	const handleOpenModal = (publisher?: PublisherPublic) => {
		setEditingPublisher(publisher || null);
		setNewPublisherName(publisher ? publisher.name : '');
		setNewPublisherWebsite(publisher ? 'publisher.website' : '');
		setIsOpen(true);
	};

	const handleCloseModal = () => {
		setIsOpen(false);
		setEditingPublisher(null);
		setNewPublisherName('');
		setNewPublisherWebsite('');
	};

	const handleSavePublisher = (e: React.FormEvent) => {
		e.preventDefault();
		if (newPublisherName.trim()) {
			if (editingPublisher) {
				setPublishers(
					publishers.map((pub) =>
						pub.id === editingPublisher.id
							? { ...pub, name: newPublisherName, website: newPublisherWebsite }
							: pub,
					),
				);
			} else {
				const newPublisher: PublisherPublic = {
					id: String(Date.now()),
					name: newPublisherName,
				};
				setPublishers([...publishers, newPublisher]);
			}
			handleCloseModal();
		}
	};

	const _handleDeletePublisher = (id: string) => {
		setPublishers(publishers.filter((pub) => pub.id !== id));
	};

	if (isLoading) {
		return <div>Loading...</div>;
	}

	// const result = await getPublishers();
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
						<DropdownMenuCheckboxItem>ที่อยู่</DropdownMenuCheckboxItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					size="sm"
					className="h-8 gap-1"
					onClick={() => handleOpenModal()}
				>
					<PlusCircle className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						เพิ่มสำนักพิมพ์ใหม่
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>สำนักพิมพ์</CardTitle>
					<CardDescription>จัดการสำนักพิมพ์</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ชื่อ</TableHead>
								<TableHead className="hidden md:table-cell">เว็บไซต์</TableHead>
								<TableHead>การดำเนินการ</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{publishers.map((publisher) => (
								<TableRow key={publisher.id}>
									<TableCell className="font-medium">
										{publisher.name}
									</TableCell>
									<TableCell className="hidden md:table-cell">
										publisher.website
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
							{editingPublisher ? 'แก้ไขสำนักพิมพ์' : 'เพิ่มสำนักพิมพ์ใหม่'}
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handleSavePublisher} className="space-y-4">
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
							<Label htmlFor="publisherName">ชื่อสำนักพิมพ์</Label>
							<Input
								id="publisherName"
								value={newPublisherName}
								onChange={(e) => setNewPublisherName(e.target.value)}
								placeholder="ใส่ชื่อสำนักพิมพ์"
								required
							/>
						</div>
						{/* <div>
							<Label htmlFor="publisherWebsite">เว็บไซต์</Label>
							<Input
								id="publisherWebsite"
								value={newPublisherWebsite}
								onChange={(e) => setNewPublisherWebsite(e.target.value)}
								placeholder="https://www.example.com"
								type="url"
							/>
						</div> */}
						<Button type="submit">
							{editingPublisher ? 'บันทึกการแก้ไข' : 'เพิ่มสำนักพิมพ์'}
						</Button>
					</form>
				</DialogContent>
			</Dialog>
		</main>
	);
}
