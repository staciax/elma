import Link from 'next/link';

function Footer() {
	return (
		<footer className="bg-background">
			<section className="flex h-10 items-center justify-center space-x-6">
				<span className="text-[#737373] text-sm">&copy; 2024 Latte Book Store., Ltd. All rights reserved</span>
				<div className="space-x-4">
					<Link href="#" className="select-none text-xs">
						ข้อกำหนดและเงื่อนไขการใช้งาน
					</Link>
					<Link href="#" className="select-none text-xs">
						นโยบายความเป็นส่วนตัว
					</Link>
					<Link href="#" className="select-none text-xs">
						นโยบายการใช้งานคุกกี้
					</Link>
				</div>
			</section>
		</footer>
	);
}

export default Footer;
