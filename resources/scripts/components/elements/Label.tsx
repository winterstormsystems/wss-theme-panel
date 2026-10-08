import styled from 'styled-components/macro';
import tw from 'twin.macro';

// WSS: sentence-case labels; the auth ("light") variant sits on the dark WSS card.
const Label = styled.label<{ isLight?: boolean }>`
    ${tw`block text-sm font-medium text-neutral-200 mb-1 sm:mb-2`};
    ${(props) => props.isLight && tw`text-neutral-200`};
`;

export default Label;
