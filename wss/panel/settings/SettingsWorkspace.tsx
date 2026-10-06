import type { ReactNode } from 'react';
import { useCurrentUser } from '@/api/account/queries';
import { useCurrentServer } from '@/api/server/queries';
import Button from '@/components/elements/Button';
import Can from '@/components/elements/Can';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Label from '@/components/elements/Label';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import { TextInput } from '@/components/form/controls';
import ReinstallServerBox from '@/components/server/settings/ReinstallServerBox';
import RenameServerBox from '@/components/server/settings/RenameServerBox';
import { ip } from '@/lib/formatters';
import { copy } from '../terminology';

function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
    return (
        <section className={'rounded-lg border border-border bg-card p-5'}>
            <h3 className={'text-sm font-semibold text-foreground'}>{title}</h3>
            {description && <p className={'mt-1 text-sm text-muted-foreground'}>{description}</p>}
            <div className={'mt-4'}>{children}</div>
        </section>
    );
}

/**
 * Settings page composition (replaces core's SettingsContainer via a one-line seam). The rename
 * and reinstall forms are core components with their own mutations and confirmations; each is
 * rendered only when the user has the matching permission, exactly as before.
 */
export default function SettingsWorkspace() {
    const username = useCurrentUser().username;
    const server = useCurrentServer()!;
    const { identifier: id, uuid, node, sftp_details: sftp } = server.attributes;
    const sftpUrl = `sftp://${ip(sftp.ip)}:${sftp.port}`;

    return (
        <ServerContentBlock title={'Settings'}>
            <div className={'grid gap-6 lg:grid-cols-2'}>
                <div className={'space-y-6'}>
                    <Can action={'settings.rename'}>
                        <RenameServerBox />
                    </Can>
                    <Can action={'file.sftp'}>
                        <Panel
                            title={'SFTP access'}
                            description={'Your SFTP password is the same password you use to sign in here.'}
                        >
                            <div>
                                <Label>{copy.settings.sftpAddress}</Label>
                                <CopyOnClick text={sftpUrl}>
                                    <TextInput type={'text'} value={sftpUrl} readOnly />
                                </CopyOnClick>
                            </div>
                            <div className={'mt-4'}>
                                <Label>Username</Label>
                                <CopyOnClick text={`${username}.${id}`}>
                                    <TextInput type={'text'} value={`${username}.${id}`} readOnly />
                                </CopyOnClick>
                            </div>
                            <div className={'mt-4 text-right'}>
                                <a href={`sftp://${username}.${id}@${ip(sftp.ip)}:${sftp.port}`}>
                                    <Button.Text isSecondary>Launch SFTP</Button.Text>
                                </a>
                            </div>
                        </Panel>
                    </Can>
                </div>
                <div className={'space-y-6'}>
                    <Panel title={'Technical details'}>
                        <dl className={'space-y-2 text-sm'}>
                            <div className={'flex items-center justify-between gap-3'}>
                                <dt className={'text-muted-foreground'}>Node</dt>
                                <dd>
                                    <code className={'rounded-sm bg-muted px-2 py-1 font-mono text-xs'}>{node}</code>
                                </dd>
                            </div>
                            <CopyOnClick text={uuid}>
                                <div className={'flex items-center justify-between gap-3'}>
                                    <dt className={'text-muted-foreground'}>{copy.settings.botId}</dt>
                                    <dd className={'min-w-0'}>
                                        <code
                                            className={'block truncate rounded-sm bg-muted px-2 py-1 font-mono text-xs'}
                                        >
                                            {uuid}
                                        </code>
                                    </dd>
                                </div>
                            </CopyOnClick>
                        </dl>
                    </Panel>
                    <Can action={'settings.reinstall'}>
                        <section
                            aria-labelledby={'wss-danger-zone'}
                            className={'rounded-lg border border-destructive/40 p-1'}
                        >
                            <h3
                                id={'wss-danger-zone'}
                                className={
                                    'px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-destructive'
                                }
                            >
                                Danger zone
                            </h3>
                            <ReinstallServerBox />
                        </section>
                    </Can>
                </div>
            </div>
        </ServerContentBlock>
    );
}
