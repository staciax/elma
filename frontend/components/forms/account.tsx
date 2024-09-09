'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserPublic } from '@/lib/elma/types';
import type React from 'react';

type Props = {
	user: UserPublic;
};

// TODO: zod validation

export default function AccountForm({ user }: Props) {
	const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const _formData = new FormData(event.currentTarget);
	};

	return (
		<section className=" w-full bg-[rgba(144,200,75,0.1)]">
			<form onSubmit={onSubmit}>
				<div className="mx-auto w-full max-w-[50rem] px-4 pt-10 pb-12 ">
					<div className="rounded-md bg-white p-8 shadow-md">
						<h3 className="font-semibold text-2xl">บัญชีของฉัน</h3>
						{/* TODO: react hook form + zod */}
						<div className="mt-4 grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label htmlFor="first-name">ชื่อ</Label>
								<Input
									id="first-name"
									name="first_name"
									type="text"
									placeholder="ชื่อ"
									maxLength={255}
									defaultValue={user.first_name}
								/>
							</div>
							<div className="grid gap-2">
								<Label htmlFor="last-name">นามสกุล</Label>
								<Input
									id="last_name"
									name="last_name"
									type="text"
									placeholder="นามสกุล"
									maxLength={255}
									defaultValue={user.last_name}
								/>
							</div>
							<div>
								<Label htmlFor="email">อีเมล</Label>
								<Input
									id="email"
									name="email"
									type="email"
									placeholder="อีเมล"
									maxLength={255}
									readOnly={true}
									className="cursor-not-allowed"
									defaultValue={user.email}
								/>
							</div>
							<div>
								<Label htmlFor="phone-number">เบอร์โทรศัพท์</Label>
								<Input
									id="phone_number"
									name="phone_number"
									type="text"
									placeholder="เบอร์โทรศัพท์"
									maxLength={15}
									defaultValue={'***REMOVED***'}
								/>
							</div>
							{/* TODO: format phone when unforcus and when focus show default */}
						</div>
						<div className="mt-4">
							<Button type="submit">บันทึก</Button>
						</div>
					</div>
				</div>
			</form>
		</section>
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
