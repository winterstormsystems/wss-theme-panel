import { Outlet } from '@tanstack/react-router';
import NavigationBar from '@/components/NavigationBar';
import { useWssCustomerRoute, WssAppShell } from '@/wss/shell';

export default function AuthenticatedLayout() {
    // WSS core patch: customer routes use the WSS shell (wss/panel/shell); admin keeps this layout.
    if (useWssCustomerRoute()) {
        return (
            <WssAppShell>
                <Outlet />
            </WssAppShell>
        );
    }

    return (
        <>
            <NavigationBar />
            <Outlet />
        </>
    );
}
