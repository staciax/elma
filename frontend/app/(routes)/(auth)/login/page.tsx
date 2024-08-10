import SignInForm from '@/components/forms/sign-in';
import { Button } from '@/components/ui/button';

async function Page() {
	return (
		<div>
			<SignInForm />
			<Button>Sign in</Button>
		</div>
	);
}

export default Page;
