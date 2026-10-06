import { useLocation } from '@tanstack/react-router';
import { KeyRound, Mail, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useCurrentUser } from '@/api/account/queries';
import ConfigureTwoFactorForm from '@/components/dashboard/forms/ConfigureTwoFactorForm';
import UpdateEmailAddressForm from '@/components/dashboard/forms/UpdateEmailAddressForm';
import UpdatePasswordForm from '@/components/dashboard/forms/UpdatePasswordForm';
import { Alert } from '@/components/elements/alert';
import PageContentBlock from '@/components/elements/PageContentBlock';
import Slot from '@/extensions/Slot';
import Card, { Badge } from '../ui/Card';

/**
 * Account overview composition (replaces core's AccountOverviewContainer via a one-line seam).
 * The forms are core's (same validation, mutations, dialogs and recovery codes); WSS only
 * arranges them: a prominent security card for two-step verification, then email and password.
 * Core's slots (account.overview.before/after) stay in place.
 */
export default function AccountOverview() {
    const state = useLocation().state as { twoFactorRedirect?: boolean } | null;
    const totp = useCurrentUser().useTotp;

    return (
        <PageContentBlock title={'Account Overview'}>
            {state?.twoFactorRedirect && (
                <div className={'mb-6'}>
                    <Alert title={'Two-step verification required'} type={'danger'}>
                        Your account must have two-step verification enabled in order to continue.
                    </Alert>
                </div>
            )}
            <Slot name={'account.overview.before'} />
            <div className={'space-y-6'}>
                <Card
                    icon={totp ? ShieldCheck : ShieldAlert}
                    title={'Two-step verification'}
                    description={'Protect your account with a one-time code from an authenticator app.'}
                    aside={
                        totp ? (
                            <Badge tone={'success'} icon={ShieldCheck}>
                                Enabled
                            </Badge>
                        ) : (
                            <Badge tone={'warning'} icon={ShieldAlert}>
                                Not enabled
                            </Badge>
                        )
                    }
                    className={totp ? undefined : 'border-warning/40'}
                >
                    <ConfigureTwoFactorForm />
                </Card>
                <div className={'grid gap-6 lg:grid-cols-2'}>
                    <Card icon={Mail} title={'Email address'} description={'Used to sign in and for account notices.'}>
                        <UpdateEmailAddressForm />
                    </Card>
                    <Card icon={KeyRound} title={'Password'} description={'Also your SFTP password.'}>
                        <UpdatePasswordForm />
                    </Card>
                </div>
            </div>
            <Slot name={'account.overview.after'} />
        </PageContentBlock>
    );
}
