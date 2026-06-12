'use client';

import type { ActionResult } from '@/app/shop/actions';
import Link from 'next/link';
import { useActionState } from 'react';

type AuthFormProps = {
  title: string;
  submitLabel: string;
  action: (prev: ActionResult | null, formData: FormData) => Promise<ActionResult>;
  alternate: { prompt: string; href: string; label: string };
  showNameFields?: boolean;
};

export function AuthForm({
  title,
  submitLabel,
  action,
  alternate,
  showNameFields = false,
}: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <div className="max-w-md mx-auto w-full">
      <h1 className="dp-page-header">{title}</h1>
      <form action={formAction} className="space-y-4">
        {showNameFields ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="dp-form-label">
                First name
              </label>
              <input id="first_name" name="first_name" type="text" autoComplete="given-name" className="dp-form-input" />
            </div>
            <div>
              <label htmlFor="last_name" className="dp-form-label">
                Last name
              </label>
              <input id="last_name" name="last_name" type="text" autoComplete="family-name" className="dp-form-input" />
            </div>
          </div>
        ) : null}
        <div>
          <label htmlFor="email" className="dp-form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="dp-form-input"
          />
        </div>
        <div>
          <label htmlFor="password" className="dp-form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={showNameFields ? 'new-password' : 'current-password'}
            className="dp-form-input"
          />
        </div>
        {state && !state.ok ? (
          <p className="text-red-400 font-cormorant_garamond text-lg" role="alert">
            {state.error}
          </p>
        ) : null}
        <button type="submit" disabled={pending} className="dp-form-button w-full sm:w-auto">
          {pending ? 'Please wait…' : submitLabel}
        </button>
      </form>
      <p className="mt-6 font-cormorant_garamond text-lg text-gray-300">
        {alternate.prompt}{' '}
        <Link href={alternate.href} className="dp-link">
          {alternate.label}
        </Link>
      </p>
    </div>
  );
}
