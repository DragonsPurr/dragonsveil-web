import { retrieveLoggedInCustomer } from '@/app/lib/medusa-auth';
import { signupAction } from '@/app/shop/actions';
import { AuthForm } from '@/components/shop/AuthForm';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Sign up',
  description: 'Create a shop account.',
};

export default async function SignupPage() {
  const customer = await retrieveLoggedInCustomer();
  if (customer) redirect('/shop/account');

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <AuthForm
        title="Sign up"
        submitLabel="Create account"
        action={signupAction}
        showNameFields
        alternate={{ prompt: 'Already have an account?', href: '/shop/login', label: 'Log in' }}
      />
    </div>
  );
}
