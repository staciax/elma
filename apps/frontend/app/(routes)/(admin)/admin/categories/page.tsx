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

import { getCategories } from '@/lib/elma/actions/categories';

export default async function Page() {
	const result = await getCategories();
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
				<Button size="sm" className="h-8 gap-1">
					<PlusCircle className="h-3.5 w-3.5" />
					<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
						เพิ่มหมวดหมู่
					</span>
				</Button>
			</div>
			<Card x-chunk="dashboard-06-chunk-0">
				<CardHeader>
					<CardTitle>หมวดหมู่</CardTitle>
					<CardDescription>จัดการหมวดหมู่</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ชื่อ</TableHead>
								<TableHead className="hidden md:table-cell">คำอธิบาย</TableHead>
								<TableHead>
									<span className="sr-only">Actions</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{result.data.map((category) => (
								<TableRow key={category.id}>
									<TableCell className="font-medium">{category.name}</TableCell>
									<TableCell className="hidden md:table-cell">
										category.description
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
						Showing <strong>1-10</strong> of <strong>{result.count}</strong>{' '}
						products
					</div>
				</CardFooter>
			</Card>
		</main>
	);
}
