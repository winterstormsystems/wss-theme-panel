<?php

namespace Wss;

use Pterodactyl\Extensions\ExtensionProvider;
use Pterodactyl\Services\Extensions\ExtensionSettingDefinition;
use Pterodactyl\Services\Extensions\ExtensionSettingsDefinition;

class WssProvider extends ExtensionProvider
{
    public function register(): void
    {
        // Container bindings go here.
    }

    public function boot(): void
    {
        // Mounts routes/client.php at /api/client/extensions/wss.
        $this->registerApiRoutes();

        // External links shown in the customer sidebar. Empty by default, so nothing is shown
        // until an administrator configures them (Admin > Extensions > Winter Storm Systems).
        // WHMS-lite will provide the billing portal; no URL is hardcoded here.
        $this->registerSettings(new ExtensionSettingsDefinition($this->settings(), [
            ExtensionSettingDefinition::make('billing_url', 'billing_url', '', ['nullable', 'string', 'url:https', 'max:255'])
                ->label('Billing portal URL')
                ->help('HTTPS link shown as "Billing" in the customer sidebar. Leave empty to hide it.')
                ->frontend()
                ->frontendType('string'),
            ExtensionSettingDefinition::make('support_url', 'support_url', '', ['nullable', 'string', 'url:https', 'max:255'])
                ->label('Support URL')
                ->help('HTTPS link shown as "Support" in the customer sidebar. Leave empty to hide it.')
                ->frontend()
                ->frontendType('string'),
        ]));

        // WSS favicons and app icons, served from the WSS theme assets (php artisan p:theme:apply wss).
        $this->registerHeadTags([
            ['tag' => 'link', 'rel' => 'icon', 'type' => 'image/png', 'sizes' => '32x32', 'href' => '/assets/theme/brand/favicon-32.png'],
            ['tag' => 'link', 'rel' => 'apple-touch-icon', 'sizes' => '180x180', 'href' => '/assets/theme/brand/apple-touch-icon.png'],
        ]);
    }
}
