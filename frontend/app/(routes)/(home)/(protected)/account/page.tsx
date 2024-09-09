// import AccountForm from './account-form';
import AccountForm from '@/components/forms/account';
import { getUserMe } from '@/lib/elma/actions/users';
import type { Metadata } from 'next';
import Link from 'next/link';

// TODO: account layout for account page navigation

export const metadata: Metadata = {
	title: 'รายละเอียดบัญชี',
};

export default async function Page() {
	const user = await getUserMe();

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
					<Link href="/account/order" className="transition-colors hover:text-[#5AB772]">
						ประวัติการสั่งซื้อ
					</Link>
				</div>
			</nav>
			{/* TODO: form update */}
			<AccountForm user={user} />
		</main>
	);
}
