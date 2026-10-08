import React, { forwardRef } from 'react';
import { Form } from 'formik';
import styled from 'styled-components/macro';
import { breakpoint } from '@/theme';
import FlashMessageRender from '@/components/FlashMessageRender';
import tw from 'twin.macro';

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

const Container = styled.div`
    ${breakpoint('sm')`
        ${tw`w-4/5 mx-auto`}
    `};

    ${breakpoint('md')`
        ${tw`p-10`}
    `};

    ${breakpoint('lg')`
        ${tw`w-3/5`}
    `};

    ${breakpoint('xl')`
        ${tw`w-full`}
    `};

    max-width: 440px;
    ${tw`mx-auto`};
`;

// WSS: Winter Storm Systems sign-in card (no mascot), WSS footer with Pterodactyl attribution.
export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => (
    <Container>
        <div css={tw`flex flex-col items-center text-center pt-6 pb-2`}>
            <img
                src={'/wss/brand/wss-mark-80.webp'}
                alt={''}
                width={64}
                height={64}
                css={tw`block w-16 h-16 select-none`}
            />
            <p css={tw`mt-3 text-sm font-semibold tracking-wide text-neutral-100`}>Winter Storm Systems</p>
            <p css={tw`text-xs text-neutral-400`}>Bot Hosting Panel</p>
        </div>
        {title && <h2 css={tw`text-2xl text-center text-neutral-100 font-semibold py-4`}>{title}</h2>}
        <FlashMessageRender css={tw`mb-2 px-1`} />
        <Form {...props} ref={ref}>
            <div css={tw`w-full bg-neutral-700 border border-neutral-600 rounded-lg p-6 md:p-8 mx-auto`}>
                {props.children}
            </div>
        </Form>
        <p css={tw`text-center text-neutral-400 text-xs mt-6`}>
            &copy; {new Date().getFullYear()} Winter Storm Systems &middot; Powered by{' '}
            <a
                rel={'noopener nofollow noreferrer'}
                href={'https://pterodactyl.io'}
                target={'_blank'}
                css={tw`no-underline text-neutral-400 hover:text-neutral-200`}
            >
                Pterodactyl
            </a>
        </p>
    </Container>
));
