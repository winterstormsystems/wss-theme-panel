import type { ReactNode } from 'react';
import Form from '@/components/form/Form';
import { copy } from '../terminology';

interface Props {
    form: { handleSubmit: () => unknown };
    title?: string;
    className?: string;
    children: ReactNode;
}

/**
 * Card around the auth forms (replaces core's LoginFormContainer via a one-line seam, same
 * props). Same Form wrapper and fields; the Pterodactyl mascot and footer are gone.
 */
export default function AuthCard({ form, title, className, children }: Props) {
    const mapped = title ? copy.auth.titles.get(title) : undefined;
    const heading = mapped?.title ?? title;
    const subtitle = mapped?.subtitle;

    return (
        <div className={'w-full'}>
            {heading && (
                <div className={'mb-6'}>
                    <h1 className={'text-2xl font-semibold text-foreground'}>{heading}</h1>
                    {subtitle && <p className={'mt-1 text-sm text-muted-foreground'}>{subtitle}</p>}
                </div>
            )}
            <Form form={form} className={className}>
                <div className={'w-full rounded-lg border border-border bg-card p-6 text-card-foreground sm:p-8'}>
                    <div className={'w-full'}>{children}</div>
                </div>
            </Form>
        </div>
    );
}
