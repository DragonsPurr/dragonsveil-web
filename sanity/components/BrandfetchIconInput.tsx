'use client';

import type { BrandfetchIconOption } from '@/app/lib/brandfetch';
import {
  brandDomainFromUrl,
  buildBrandfetchAssetUrl,
  normalizeBrandDomain,
  type BrandfetchAssetFormat,
  type BrandfetchAssetTheme,
  type BrandfetchAssetType,
} from '@/app/lib/brandfetch';
import { Box, Button, Card, Flex, Grid, Select, Spinner, Stack, Text } from '@sanity/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ObjectInputProps, set, unset, useFormValue } from 'sanity';

type BrandfetchIconValue = {
  type?: string;
  theme?: string;
  format?: string;
};

type LogosApiResponse = {
  source?: string;
  options?: BrandfetchIconOption[];
  error?: string;
};

type SocialLinkParent = {
  url?: string;
  brandDomain?: string;
  customIcon?: { asset?: unknown };
};

type PickerOption = {
  id: string;
  label: string;
  type: BrandfetchAssetType;
  theme: BrandfetchAssetTheme;
  format: BrandfetchAssetFormat;
};

function resolveDomain(parent: SocialLinkParent | undefined): string | null {
  if (!parent) return null;
  let domain: string | null = null;
  if (typeof parent.brandDomain === 'string' && parent.brandDomain.trim()) {
    domain = normalizeBrandDomain(parent.brandDomain);
  } else if (typeof parent.url === 'string' && parent.url.trim()) {
    domain = brandDomainFromUrl(parent.url);
  }
  // Strict hostname allowlist before any CDN URL construction.
  if (!domain || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
    return null;
  }
  return domain;
}

function isAssetType(value: string): value is BrandfetchAssetType {
  return value === 'icon' || value === 'symbol' || value === 'logo';
}

function isAssetTheme(value: string): value is BrandfetchAssetTheme {
  return value === 'light' || value === 'dark';
}

function isAssetFormat(value: string): value is BrandfetchAssetFormat {
  return value === 'svg' || value === 'png' || value === 'jpeg';
}

function toPickerOptions(options: BrandfetchIconOption[]): PickerOption[] {
  const result: PickerOption[] = [];
  for (const opt of options) {
    if (!isAssetType(opt.type) || !isAssetTheme(opt.theme) || !isAssetFormat(opt.format)) continue;
    result.push({
      id: `${opt.type}:${opt.theme}:${opt.format}`,
      label: `${opt.type} · ${opt.theme} · ${opt.format.toUpperCase()}`,
      type: opt.type,
      theme: opt.theme,
      format: opt.format,
    });
  }
  return result;
}

function selectionMatches(value: BrandfetchIconValue | undefined, option: PickerOption): boolean {
  return (
    value?.type === option.type &&
    value?.theme === option.theme &&
    value?.format === option.format
  );
}

/**
 * Sanity input: dropdown + grid of Brandfetch logo variants for the current link domain.
 */
export function BrandfetchIconInput(props: ObjectInputProps) {
  const { value, onChange, readOnly, path } = props;
  const typedValue = value as BrandfetchIconValue | undefined;

  const parentPath = Array.isArray(path) ? path.slice(0, -1) : [];
  const parent = useFormValue(parentPath) as SocialLinkParent | undefined;

  const domain = useMemo(() => resolveDomain(parent), [parent]);
  const hasCustomIcon = Boolean(parent?.customIcon?.asset);

  const [options, setOptions] = useState<PickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [availableIds, setAvailableIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAvailableIds(new Set());
  }, [domain]);

  useEffect(() => {
    if (!domain || hasCustomIcon) {
      setOptions([]);
      setError(null);
      setSource(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/brandfetch/logos?domain=${encodeURIComponent(domain)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = (await res.json()) as LogosApiResponse;
        if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
        setOptions(toPickerOptions(data.options ?? []));
        setSource(data.source ?? null);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setOptions([]);
        setError(err instanceof Error ? err.message : 'Failed to load Brandfetch logos');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [domain, hasCustomIcon]);

  const visibleOptions = useMemo(() => {
    if (source === 'cdn-catalog') {
      return options.filter((opt) => availableIds.has(opt.id));
    }
    return options;
  }, [options, availableIds, source]);

  const markAvailable = useCallback((id: string) => {
    setAvailableIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const selectOption = useCallback(
    (option: PickerOption | null) => {
      if (readOnly) return;
      if (!option) {
        onChange(unset());
        return;
      }
      onChange(
        set({
          type: option.type,
          theme: option.theme,
          format: option.format,
        }),
      );
    },
    [onChange, readOnly],
  );

  if (hasCustomIcon) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>
          Custom icon is set. Clear it to choose a Brandfetch logo.
        </Text>
      </Card>
    );
  }

  if (!domain) {
    return (
      <Card padding={3} radius={2} tone="caution" border>
        <Text size={1}>Add a URL (or brand domain) to load Brandfetch logos.</Text>
      </Card>
    );
  }

  const selectedId = typedValue?.type
    ? `${typedValue.type}:${typedValue.theme}:${typedValue.format}`
    : '';

  return (
    <Stack space={3}>
      <Flex align="center" gap={2}>
        <Text size={1} weight="semibold">
          Brandfetch logos for {domain}
        </Text>
        {loading ? <Spinner muted /> : null}
      </Flex>

      {error ? (
        <Card padding={3} radius={2} tone="critical" border>
          <Text size={1}>{error}</Text>
        </Card>
      ) : null}

      {source === 'cdn-catalog' && domain
        ? options.map((opt) => {
            const previewSrc = buildBrandfetchAssetUrl(domain, opt);
            if (!previewSrc) return null;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`probe-${opt.id}`}
                src={previewSrc}
                alt=""
                width={1}
                height={1}
                style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
                onLoad={() => markAvailable(opt.id)}
              />
            );
          })
        : null}

      <Select
        fontSize={1}
        value={selectedId}
        disabled={readOnly || loading || (source === 'cdn-catalog' && visibleOptions.length === 0)}
        onChange={(event) => {
          const id = event.currentTarget.value;
          if (!id) {
            selectOption(null);
            return;
          }
          selectOption(options.find((opt) => opt.id === id) ?? null);
        }}
      >
        <option value="">Automatic (best available)</option>
        {visibleOptions.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </Select>

      {visibleOptions.length > 0 && domain ? (
        <Grid columns={[2, 3, 4]} gap={2}>
          {visibleOptions.map((opt) => {
            const selected = selectionMatches(typedValue, opt);
            const previewSrc = buildBrandfetchAssetUrl(domain, opt);
            if (!previewSrc) return null;
            return (
              <Button
                key={opt.id}
                mode={selected ? 'default' : 'ghost'}
                tone={selected ? 'primary' : 'default'}
                padding={2}
                disabled={readOnly}
                onClick={() => selectOption(opt)}
                style={{ height: 'auto' }}
              >
                <Stack space={2} style={{ alignItems: 'center' }}>
                  <Box
                    style={{
                      width: 40,
                      height: 40,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#111',
                      borderRadius: 4,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewSrc}
                      alt=""
                      width={28}
                      height={28}
                      style={{ objectFit: 'contain', maxWidth: 28, maxHeight: 28 }}
                    />
                  </Box>
                  <Text size={0} align="center">
                    {opt.label}
                  </Text>
                </Stack>
              </Button>
            );
          })}
        </Grid>
      ) : null}

      {typedValue?.type ? (
        <Button
          text="Clear selection"
          mode="bleed"
          tone="critical"
          fontSize={1}
          disabled={readOnly}
          onClick={() => selectOption(null)}
        />
      ) : (
        <Text size={1} muted>
          Automatic uses symbol/icon first, then logo when those are missing.
        </Text>
      )}
    </Stack>
  );
}
