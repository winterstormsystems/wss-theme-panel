<?php

use Illuminate\Support\Facades\Route;
use Wss\Http\Controllers\StatusController;

// Final URL: GET /api/client/extensions/wss/status
Route::get('/status', StatusController::class)->name('status');
