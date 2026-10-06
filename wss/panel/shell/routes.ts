import { useLocation } from '@tanstack/react-router';

/** Customer routes get the WSS shell; the admin area (`/panel`) keeps core's layout. */
export function useWssCustomerRoute(): boolean {
    const { pathname } = useLocation();
    return !(pathname === '/panel' || pathname.startsWith('/panel/'));
}
