import { retrieveLoggedInCustomer } from '@/app/lib/medusa-auth';
import { AuthForm } from '@/components/shop/AuthForm';
import { MedusaConfigAlert } from '@/components/shop/MedusaConfigAlert';
import { loginAction } from '@/app/shop/actions';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your shop account.',
};

export default async function LoginPage() {
  const customer = await retrieveLoggedInCustomer();
  if (customer) redirect('/shop/account');

  return (
    <div className="container mx-auto w-full">
      <MedusaConfigAlert />
      <AuthForm
        title="Login"
        submitLabel="Sign in"
        action={loginAction}
        alternate={{ prompt: 'Need an account?', href: '/shop/signup', label: 'Sign up' }}
      />
    </div>
  );
}
