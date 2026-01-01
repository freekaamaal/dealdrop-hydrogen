import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';
import {useLocation} from '@remix-run/react';
import type {
  Menu,
  MenuItem,
  MoneyV2,
} from '@shopify/hydrogen/storefront-api-types';
import type {AppLoadContext} from '@shopify/remix-oxygen';
import React from 'react';

// --- Lovable UI Utils ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function missingClass(string?: string, prefix?: string) {
  if (!string) {
    return true;
  }

  const regex = new RegExp(` ?${prefix}`, 'g');
  return string.match(regex) === null;
}

export function formatText(input?: string | React.ReactNode) {
  if (!input) {
    return;
  }

  if (typeof input !== 'string') {
    return input;
  }

  return input
    .split('\n')
    .map((text, i) =>
      i === 0 ? text : [React.createElement('br', {key: i}), text],
    );
}

// --- Hydrogen Utils ---

export const DEFAULT_LOCALE = Object.freeze({
  language: 'EN',
  country: 'US',
  label: 'English (US)',
  pathPrefix: '',
});

export type I18nLocale = {
  language: string;
  country: string;
  pathPrefix: string;
  label: string;
};

export function getLocaleFromRequest(request: Request): I18nLocale {
  const url = new URL(request.url);
  const firstPathPart = url.pathname.split('/')[1]?.toUpperCase() ?? '';

  if (firstPathPart === 'DE') {
    return {
      language: 'DE',
      country: 'DE',
      pathPrefix: '/de',
      label: 'German (DE)',
    };
  }

  return DEFAULT_LOCALE;
}

export function usePrefixPathWithLocale(path: string) {
  const {pathname} = useLocation();
  const selectedLocale = DEFAULT_LOCALE; // Simplified for now to avoid hook complexity if not necessary
  // Ideally useRouteLoaderData('root') but that requires generic type.
  return path;
}

export function useIsHomePath() {
  const {pathname} = useLocation();
  return pathname === '/' || pathname === '/go-live'; // simplistic check
}

export type EnhancedMenu = Menu & {
  items: ChildEnhancedMenuItem[];
};

export type ChildEnhancedMenuItem = MenuItem & {
  to: string;
  target: string;
  isExternal?: boolean;
  items: ChildEnhancedMenuItem[];
};

export function parseMenu(
  menu: Menu,
  primaryDomain: string,
  env: AppLoadContext['env'],
  customPrefixes: Record<string, string> = {},
): EnhancedMenu {
  if (!menu?.items) {
    return {
      ...menu,
      items: [],
    };
  }

  const items = menu.items.map((item) => {
    const parsedItem = parseMenuItem(item, primaryDomain, env, customPrefixes);

    return parsedItem;
  });

  return {
    ...menu,
    items,
  };
}

function parseMenuItem(
  item: MenuItem,
  primaryDomain: string,
  env: AppLoadContext['env'],
  customPrefixes: Record<string, string>,
): ChildEnhancedMenuItem {
  const {url, type, tags, ...rest} = item;
  let to = url;
  let target = '_self';

  try {
    const urlObj = new URL(url as string);
    to = urlObj.pathname;
    if (
      urlObj.hostname !== new URL(primaryDomain).hostname &&
      !urlObj.hostname.includes('myshopify')
    ) {
      to = url as string;
      target = '_blank';
    }
  } catch (e) {
    // If it's a relative path or invalid URL, keep it as is
  }

  const subItems = (item.items || []).map((subItem) =>
    parseMenuItem(subItem, primaryDomain, env, customPrefixes),
  );

  return {
    ...rest,
    url,
    type,
    to,
    target,
    items: subItems,
  };
}

export function getInputStyleClasses(isInvalid: boolean | undefined = false) {
  return twMerge(
    clsx(
      'flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      isInvalid ? 'border-red-500 animate-pulse' : 'focus:border-primary/50',
    ),
  );
}

export function isDiscounted(price: MoneyV2, compareAtPrice?: MoneyV2) {
  if (
    compareAtPrice?.amount &&
    parseFloat(compareAtPrice.amount) > parseFloat(price.amount)
  ) {
    return true;
  }
  return false;
}

export function isNewArrival(date: string) {
  return (
    new Date(date).valueOf() > new Date().valueOf() - 30 * 24 * 60 * 60 * 1000
  );
}

export function getExcerpt(text: string, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function statusMessage(status: string) {
  const translations: Record<string, string> = {
    ATTEMPTED_DELIVERY: 'Attempted delivery',
    CANCELED: 'Canceled',
    CONFIRMED: 'Confirmed',
    DELIVERED: 'Delivered',
    FAILURE: 'Failure',
    FULFILLED: 'Fulfilled',
    IN_PROGRESS: 'In Progress',
    IN_TRANSIT: 'In transit',
    LABEL_PRINTED: 'Label printed',
    LABEL_PURCHASED: 'Label purchased',
    LABEL_VOIDED: 'Label voided',
    MARKED_AS_FULFILLED: 'Marked as fulfilled',
    NOT_DELIVERED: 'Not delivered',
    ON_HOLD: 'On Hold',
    OPEN: 'Open',
    OUT_FOR_DELIVERY: 'Out for delivery',
    PARTIALLY_FULFILLED: 'Partially Fulfilled',
    PENDING_FULFILLMENT: 'Pending',
    PICKED_UP: 'Picked up',
    READY_FOR_PICKUP: 'Ready for pickup',
    RESTOCKED: 'Restocked',
    SCHEDULED: 'Scheduled',
    SUBMITTED: 'Submitted',
    UNFULFILLED: 'Unfulfilled',
  };
  try {
    return translations?.[status];
  } catch (error) {
    return status;
  }
}

export function parseAsCurrency(value: number, locale: I18nLocale) {
  return new Intl.NumberFormat(`${locale.language}-${locale.country}`, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function isLocalPath(url: string) {
  try {
    return !new RegExp('^([a-z]+:|//)', 'i').test(url);
  } catch (error) {
    return false;
  }
}
