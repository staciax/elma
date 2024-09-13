import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { File, ListFilter, MoreHorizontal, PlusCircle } from 'lucide-react';
import Image from 'next/image';

import { getProducts } from '@/lib/elma/actions/products';

export default async function Page() {
	const result = await getProducts();

	return (
		<main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
			<Tabs defaultValue="all">
				<div className="flex items-center">
					<TabsList>
						<TabsTrigger value="all">All</TabsTrigger>
						<TabsTrigger value="active">Active</TabsTrigger>
						<TabsTrigger value="draft">Draft</TabsTrigger>
						<TabsTrigger value="archived">Archived</TabsTrigger>
					</TabsList>
					<div className="ml-auto flex items-center gap-2">
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8 gap-1">
									<ListFilter className="h-3.5 w-3.5" />
									<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuLabel>Filter by</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuCheckboxItem checked>Active</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem>Draft</DropdownMenuCheckboxItem>
								<DropdownMenuCheckboxItem>Archived</DropdownMenuCheckboxItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Button size="sm" variant="outline" className="h-8 gap-1">
							<File className="h-3.5 w-3.5" />
							<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
						</Button>
						<Button size="sm" className="h-8 gap-1">
							<PlusCircle className="h-3.5 w-3.5" />
							<span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Add Product</span>
						</Button>
					</div>
				</div>
				<TabsContent value="all">
					<Card x-chunk="dashboard-06-chunk-0">
						<CardHeader>
							<CardTitle>Products</CardTitle>
							<CardDescription>Manage your products and view their sales performance.</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className="hidden w-[100px] sm:table-cell">
											<span className="sr-only">Image</span>
										</TableHead>
										<TableHead>ชื่อ</TableHead>
										<TableHead>ผู้แต่ง</TableHead>
										<TableHead className="hidden md:table-cell">ราคา</TableHead>
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
												<Image
													alt="Product image"
													className="aspect-square rounded-md object-cover"
													height="64"
													src="/placeholder.svg"
													width="64"
												/>
											</TableCell>
											<TableCell className="font-medium">{product.title}</TableCell>
											<TableCell>
												{/* <Badge variant="outline">Draft</Badge> */}
												<div className="grid gap-1">
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
												</div>
											</TableCell>

											<TableCell className="hidden md:table-cell">&#3647;{product.price}</TableCell>
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
														<Button aria-haspopup="true" size="icon" variant="ghost">
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
								Showing <strong>1-10</strong> of <strong>{result.count}</strong> products
							</div>
						</CardFooter>
					</Card>
				</TabsContent>
			</Tabs>
		</main>
	);
}
