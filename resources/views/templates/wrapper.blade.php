<!DOCTYPE html>
<html>
    <head>
        <title>{{ config('app.name', 'Pterodactyl') }}</title>

        @section('meta')
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            {{-- WSS: zoom allowed (WCAG 1.4.4); WSS favicons and theme colour (public/wss/brand). --}}
            <meta content="width=device-width, initial-scale=1" name="viewport">
            <meta name="csrf-token" content="{{ csrf_token() }}">
            <meta name="robots" content="noindex">
            <link rel="apple-touch-icon" sizes="180x180" href="/wss/brand/apple-touch-icon.png">
            <link rel="icon" type="image/png" href="/wss/brand/favicon-32.png" sizes="32x32">
            <link rel="icon" type="image/png" href="/wss/brand/favicon-16.png" sizes="16x16">
            <link rel="manifest" href="/wss/brand/manifest.json">
            <link rel="shortcut icon" href="/wss/brand/favicon.ico">
            <meta name="theme-color" content="#0d141b">
        @show

        @section('user-data')
            @if(!is_null(Auth::user()))
                <script>
                    window.PterodactylUser = {!! json_encode(Auth::user()->toVueObject()) !!};
                </script>
            @endif
            @if(!empty($siteConfiguration))
                <script>
                    window.SiteConfiguration = {!! json_encode($siteConfiguration) !!};
                </script>
            @endif
        @show

        @yield('assets')

        @include('layouts.scripts')
    </head>
    <body class="{{ $css['body'] ?? 'bg-neutral-50' }}">
        @section('content')
            @yield('above-container')
            @yield('container')
            @yield('below-container')
        @show
        @section('scripts')
            {!! $asset->js('main.js') !!}
        @show
    </body>
</html>
