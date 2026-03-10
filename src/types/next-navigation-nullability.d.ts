import 'next/navigation';

declare module 'next/navigation' {
  export function usePathname(): string;
  export function useSearchParams(): ReadonlyURLSearchParams;
  export function useParams<T extends Record<string, string | string[]>>(): T;
}
