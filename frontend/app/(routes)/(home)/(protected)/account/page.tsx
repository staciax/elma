import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import React from 'react';

export default function Page() {
	return (
		<main className="grid flex-1 p-4">
			<section className="w-full bg-white">
				<div>PROFILE</div>
			</section>
			<nav className="w-full bg-white">
				<div className="flex h-10 items-center justify-center gap-4">
					<Link href="/account" className="transition-colors hover:text-[#5AB772]">
						รายละเอียดบัญชี
					</Link>
					<Link href="/order" className="transition-colors hover:text-[#5AB772]">
						ประวัติการสั่งซื้อ
					</Link>
				</div>
			</nav>
			{/* TODO: form update */}
			<section className=" w-full bg-[rgba(144,200,75,0.1)]">
				<div className="mx-auto w-full max-w-[50rem] px-4 pt-10 pb-12 ">
					<div className="rounded-md bg-white p-8 shadow-md">
						<h3 className="font-semibold text-2xl">บัญชีของฉัน</h3>
						{/* TODO: react hook form + zod */}
						<div className="mt-4 grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="first-name">ชื่อ</Label>
								<Input id="first-name" type="text" placeholder="ชื่อ" maxLength={255} value={'stacia'} />
							</div>
							<div className="grid gap-2">
								<Label htmlFor="last-name">นามสกุล</Label>
								<Input id="last-name" type="text" placeholder="นามสกุล" maxLength={255} value={'dev'} />
							</div>
							<div>
								<Label htmlFor="email">อีเมล</Label>
								<Input
									id="email"
									type="email"
									placeholder="อีเมล"
									maxLength={255}
									readOnly={true}
									className="cursor-not-allowed"
									value={'test@test.com'}
								/>
							</div>
							<div>
								<Label htmlFor="phone-number">เบอร์โทรศัพท์</Label>
								<Input id="phone-number" type="text" placeholder="เบอร์โทรศัพท์" maxLength={15} value={'***REMOVED***'} />
							</div>
							{/* TODO: format phone when unforcus and when focus show default */}
						</div>
						<div className="mt-4">
							<Button type="submit">บันทึก</Button>
						</div>
					</div>
				</div>
			</section>
		</main>
	);
}

// <section>
// <span>บัญชีของฉัน</span>
// <Input type="text" placeholder="ชื่ิอที่อยู่" maxLength={255} />
// <Input type="text" placeholder="ที่อยู่" maxLength={255} />
// <div className="grid grid-cols-2">
// 	<Input type="text" placeholder="จัดหวัด" maxLength={255} />
// 	<Input type="text" placeholder="เขตอำเภอ/เขต" maxLength={255} />
// 	<Input type="email" placeholder="คำบล/แขวง" maxLength={255} />
// 	{/* TODO: format phone when unforcus and when focus show default */}
// 	<Input type="text" placeholder="รหัสไปรษณีย์" maxLength={15} />
// </div>
// </section>
