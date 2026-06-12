'use client';

import {
  parsePlaceAddressComponents,
  type ParsedPlaceAddress,
  type PlaceAddressComponentLike,
} from '@/app/lib/google-places';
import { useEffect, useRef } from 'react';

type PlacePredictionSelectEvent = Event & {
  placePrediction: {
    toPlace: () => google.maps.places.Place;
  };
};

type PlaceAutocompleteElementCtor = new (options?: {
  includedRegionCodes?: string[];
}) => HTMLElement;

type PlacesLibraryWithAutocomplete = google.maps.PlacesLibrary & {
  PlaceAutocompleteElement: PlaceAutocompleteElementCtor;
};

function readAutocompleteText(element: HTMLElement): string {
  if ('value' in element && typeof (element as HTMLInputElement).value === 'string') {
    return (element as HTMLInputElement).value;
  }
  return element.querySelector('input')?.value ?? '';
}

type AddressPlaceAutocompleteProps = {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected: (address: ParsedPlaceAddress) => void;
  required?: boolean;
  className?: string;
};

export function AddressPlaceAutocomplete({
  id,
  name,
  value,
  onChange,
  onPlaceSelected,
  required,
  className,
}: AddressPlaceAutocompleteProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLElement | null>(null);
  const onPlaceSelectedRef = useRef(onPlaceSelected);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectedRef.current = onPlaceSelected;
  }, [onPlaceSelected]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;
    const current = readAutocompleteText(widget);
    if (current !== value) {
      const input = widget.querySelector('input');
      if (input) input.value = value;
    }
  }, [value]);

  useEffect(() => {
    const host = hostRef.current;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();
    if (!host || !apiKey) return;

    let cancelled = false;
    let widget: HTMLElement | undefined;

    const handleSelect = (event: Event) => {
      void (async () => {
        const { placePrediction } = event as PlacePredictionSelectEvent;
        const place = placePrediction.toPlace();
        await place.fetchFields({ fields: ['addressComponents'] });
        if (!place.addressComponents?.length) return;

        const parsed = parsePlaceAddressComponents(
          place.addressComponents as PlaceAddressComponentLike[]
        );
        onPlaceSelectedRef.current(parsed);
        if (parsed.address1) onChangeRef.current(parsed.address1);
      })();
    };

    const handleInput = () => {
      if (!widget) return;
      onChangeRef.current(readAutocompleteText(widget));
    };

    void import('@googlemaps/js-api-loader')
      .then(({ setOptions, importLibrary }) => {
        if (cancelled) return;
        setOptions({ key: apiKey });
        return importLibrary('places');
      })
      .then((placesLibrary) => {
        if (cancelled || !hostRef.current) return;

        const { PlaceAutocompleteElement } =
          placesLibrary as PlacesLibraryWithAutocomplete;

        widget = new PlaceAutocompleteElement({
          includedRegionCodes: ['ca', 'us'],
        });
        widget.id = id;
        widget.className = className ?? 'dp-place-autocomplete';
        if (required) widget.setAttribute('required', '');

        widgetRef.current = widget;
        hostRef.current.appendChild(widget);

        widget.addEventListener('gmp-select', handleSelect);
        widget.addEventListener('input', handleInput);
      });

    return () => {
      cancelled = true;
      if (widget) {
        widget.removeEventListener('gmp-select', handleSelect);
        widget.removeEventListener('input', handleInput);
        widget.remove();
      }
      widgetRef.current = null;
    };
  }, [className, id, required]);

  return (
    <div>
      <input type="hidden" name={name} value={value} required={required} />
      <div ref={hostRef} className="address-place-autocomplete-host" />
      <p className="mt-1 font-cormorant_garamond text-sm text-gray-500">
        Start typing to search addresses. Powered by Google.
      </p>
    </div>
  );
}
