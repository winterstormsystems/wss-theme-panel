// WSS core patch: the account overview composition is owned by WSS (wss/panel/account/AccountOverview.tsx),
// which renders core's password, email and two-step verification forms. Upstream version: see wss/core-patches.json.
export { WssAccountOverview as default } from '@/wss/account';
