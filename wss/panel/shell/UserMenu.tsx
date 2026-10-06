import { useNavigate } from '@tanstack/react-router';
import { ChevronDown, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useCurrentUser } from '@/api/account/queries';
import { useLogout } from '@/api/auth/queries';
import Avatar from '@/components/Avatar';
import DropdownMenu, { DropdownMenuItem } from '@/components/elements/dropdown/DropdownMenu';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { terms } from '../terminology';

/** Account menu: core logout mutation and routes, WSS presentation. */
export default function UserMenu() {
    const user = useCurrentUser();
    const logout = useLogout();
    const navigate = useNavigate();

    return (
        <>
            <SpinnerOverlay visible={logout.isPending} />
            <DropdownMenu
                triggerClassName={
                    'flex h-10 items-center gap-2 rounded-md px-2 text-sm text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-ring data-[popup-open]:bg-secondary'
                }
                triggerContent={
                    <>
                        <span className={'flex size-7 overflow-hidden rounded-full'}>
                            <Avatar.User size={28} />
                        </span>
                        <span className={'hidden max-w-40 truncate font-medium sm:inline'}>{user.username}</span>
                        <ChevronDown className={'size-4 text-muted-foreground'} aria-hidden />
                        <span className={'sr-only'}>Open account menu</span>
                    </>
                }
            >
                <div className={'px-2.5 pb-2 pt-1'}>
                    <p className={'truncate text-sm font-medium text-foreground'}>{user.username}</p>
                    <p className={'truncate text-xs text-muted-foreground'}>{user.email}</p>
                </div>
                <DropdownMenuItem icon={UserRound} onClick={() => navigate({ to: '/account' })}>
                    {terms.account} settings
                </DropdownMenuItem>
                {user.rootAdmin && (
                    <DropdownMenuItem icon={ShieldCheck} onClick={() => navigate({ to: '/panel' })}>
                        Administration
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem icon={LogOut} danger onClick={() => logout.mutate({})}>
                    Sign out
                </DropdownMenuItem>
            </DropdownMenu>
        </>
    );
}
