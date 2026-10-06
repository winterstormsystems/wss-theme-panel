import { useSiteSettings } from '@pterodactyl/sdk';

/**
 * `auth.login.before`: WSS identity band above the panel's login form, aligned to the
 * form's own widths. Text only: no production logo asset is available yet (see docs).
 */
export default function LoginBrand() {
    const { name } = useSiteSettings();

    return (
        <div className={'wss:mx-auto wss:px-1 wss:sm:w-4/5 wss:md:px-10 wss:lg:w-3/5 wss:xl:w-full wss:xl:max-w-auth'}>
            <div className={'wss:brand-gradient-diagonal wss:mx-1 wss:rounded-lg wss:px-6 wss:py-5 wss:shadow-sm'}>
                <p className={'wss:text-xs wss:font-semibold wss:uppercase wss:tracking-widest wss:text-white/80'}>
                    {name}
                </p>
                <p className={'wss:mt-1 wss:text-xl wss:font-semibold wss:text-white'}>Bot Hosting Panel</p>
            </div>
        </div>
    );
}
