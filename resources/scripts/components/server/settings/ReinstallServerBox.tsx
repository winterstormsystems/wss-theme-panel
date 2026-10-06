import TitledGreyBox from '@/components/elements/TitledGreyBox';
import Button from '@/components/elements/Button';
import { Dialog } from '@/components/elements/dialog';
import { useCurrentServer, useReinstallServer } from '@/api/server/queries';
import { canReinstallServer, SKIPPED_INSTALL_SCRIPT_MESSAGE } from '@/lib/serverStatus';
import { copy } from '@/wss/copy';

const ReinstallServerBox = () => {
    const server = useCurrentServer()!;
    const reinstallServer = useReinstallServer();
    const canReinstall = canReinstallServer(server.attributes.status, server.attributes.skip_scripts);

    const reinstall = async (close: () => void) => {
        try {
            await reinstallServer.mutateAsync({ path: { server_uuid: server.attributes.uuid } });
            close();
        } catch {
            // Error toast is handled by the mutation.
        }
    };

    return (
        <TitledGreyBox title={copy.settings.reinstallTitle} className={'relative'}>
            <p className={'text-sm'}>
                {copy.settings.reinstallBody}&nbsp;
                <strong className={'font-medium'}>{copy.settings.reinstallWarning}</strong>
            </p>
            {!canReinstall && <p className={'mt-3 text-sm text-muted-foreground'}>{SKIPPED_INSTALL_SCRIPT_MESSAGE}</p>}
            <Dialog.ConfirmTrigger
                title={copy.settings.reinstallConfirmTitle}
                confirm={copy.settings.reinstallConfirm}
                onConfirmed={(_event, close) => reinstall(close)}
                trigger={({ onClick }) => (
                    <div className={'mt-6 text-right'}>
                        <Button.Danger isSecondary disabled={!canReinstall} onClick={onClick}>
                            {copy.settings.reinstallTitle}
                        </Button.Danger>
                    </div>
                )}
            >
                {copy.settings.reinstallDialog}
            </Dialog.ConfirmTrigger>
        </TitledGreyBox>
    );
};

export default ReinstallServerBox;
