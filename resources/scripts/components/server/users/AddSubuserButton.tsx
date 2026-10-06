import { useParams } from '@tanstack/react-router';
import { NewLinkButton } from '@/components/elements/NewButton';
import { copy } from '@/wss/copy';

const AddSubuserButton = () => {
    const { id } = useParams({ strict: false });

    return <NewLinkButton to={`/server/${id}/users/new`}>{copy.team.invite}</NewLinkButton>;
};

export default AddSubuserButton;
