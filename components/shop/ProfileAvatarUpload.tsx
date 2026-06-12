'use client';

import type { ActionResult } from '@/app/shop/actions';
import { removeCustomerAvatarAction, uploadCustomerAvatarAction } from '@/app/shop/actions';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';

type ProfileAvatarUploadProps = {
  avatarUrl: string | null;
  displayName: string;
  uploadEnabled: boolean;
};

function AvatarMessage({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  if (!state.ok) {
    return (
      <p className="text-red-400 font-cormorant_garamond text-base" role="alert">
        {state.error}
      </p>
    );
  }
  return (
    <p className="text-green-400 font-cormorant_garamond text-base" role="status">
      Profile photo updated.
    </p>
  );
}

export function ProfileAvatarUpload({
  avatarUrl,
  displayName,
  uploadEnabled,
}: ProfileAvatarUploadProps) {
  const router = useRouter();
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadCustomerAvatarAction,
    null
  );
  const [removePending, setRemovePending] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  useEffect(() => {
    if (uploadState?.ok) {
      router.refresh();
    }
  }, [uploadState, router]);

  const handleRemove = async () => {
    setRemovePending(true);
    setRemoveError(null);
    const result = await removeCustomerAvatarAction();
    setRemovePending(false);
    if (!result.ok) {
      setRemoveError(result.error);
      return;
    }
    router.refresh();
  };

  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const avatar = (
    <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-[var(--dp-gray-600)] bg-[var(--dp-gray-800)] flex items-center justify-center">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={96}
          height={96}
          className="object-cover w-full h-full"
        />
      ) : (
        <span className="font-cinzel text-2xl text-[var(--dp-light-red)]" aria-hidden>
          {initials || '?'}
        </span>
      )}
    </div>
  );

  return (
    <div className="mb-6">
      {!uploadEnabled ? (
        <div className="flex items-start gap-4">
          {avatar}
          <p className="dp-form-label mb-0 pt-0.5 font-cormorant_garamond text-base text-gray-400 font-normal">
            Profile photo upload is not configured on this environment.
          </p>
        </div>
      ) : (
        <form action={uploadAction} encType="multipart/form-data">
          <div className="flex items-start gap-4">
            {avatar}
            <div className="min-w-0 flex-1 space-y-3">
              <label htmlFor="profile_avatar" className="dp-form-label mb-0 block">
                Profile photo
              </label>
              <input
                id="profile_avatar"
                name="avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="dp-form-input file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[var(--dp-dark-red)] file:text-white file:font-cinzel file:text-sm"
              />
              <p className="font-cormorant_garamond text-sm text-gray-400">
                JPEG, PNG, WebP, or GIF. Max 2 MB.
              </p>
              <AvatarMessage state={uploadState} />
              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="submit"
                  disabled={uploadPending}
                  className="dp-form-button text-sm px-3 py-1.5"
                >
                  {uploadPending ? 'Uploading…' : 'Upload'}
                </button>
                {avatarUrl ? (
                  <button
                    type="button"
                    disabled={removePending || uploadPending}
                    onClick={handleRemove}
                    className="font-cinzel text-base text-red-400 hover:text-red-300 bg-transparent border-0 p-0 cursor-pointer disabled:opacity-50"
                  >
                    {removePending ? 'Removing…' : 'Remove photo'}
                  </button>
                ) : null}
              </div>
              {removeError ? (
                <p className="text-red-400 font-cormorant_garamond text-base" role="alert">
                  {removeError}
                </p>
              ) : null}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
