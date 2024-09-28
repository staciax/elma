import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Download } from 'lucide-react';

export default function Page() {
	return (
		<main className="flex justify-center items-center">
			<Card>
				<CardHeader className="flex items-center">
					<h3 className="text-3xl font-semibold">ชำระเงินด้วยQR พร้อมเพย์</h3>
					<h3 className="text-2xl">เลขคำสั่งซื้อ 00000001</h3>
				</CardHeader>
				<CardContent className="grid gap-4 justify-center">
					<img
						src="https://ui.shadcn.com/placeholder.svg?height=300&width=300"
						alt=""
						width={300}
					/>
					<Button className="flex gap-2">
						<Download className="w-5 h-5" />
						บันทึก QR Code
					</Button>
				</CardContent>
			</Card>
		</main>
	);
}
