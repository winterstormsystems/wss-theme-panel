// WSS core patch: the settings page composition is owned by WSS (wss/panel/settings/SettingsWorkspace.tsx),
// which renders core's RenameServerBox and ReinstallServerBox. Upstream version: see wss/core-patches.json.
export { WssSettingsWorkspace as default } from '@/wss/settings';
