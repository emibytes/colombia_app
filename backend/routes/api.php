<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\ConfederationController;
use App\Http\Controllers\Api\FederationController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SelectionController;
use App\Http\Controllers\Api\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Auth — credentials
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout',         [AuthController::class, 'logout']);
        Route::get('me',              [AuthController::class, 'me']);
        Route::post('accept-consent', [AuthController::class, 'acceptConsent']);
    });
    // OAuth — redirect + callback
    Route::get('{provider}/redirect',  [SocialAuthController::class, 'redirect']);
    Route::get('{provider}/callback',  [SocialAuthController::class, 'callback']);
});

Route::prefix('selections')->group(function () {
    Route::post('/',     [SelectionController::class, 'store']);
    Route::get('/stats', [SelectionController::class, 'stats']);
});

Route::get('confederations', [ConfederationController::class, 'index']);

Route::prefix('federations')->group(function () {
    Route::get('/',               [FederationController::class, 'index']);
    Route::get('/{code}',         [FederationController::class, 'show']);
    Route::get('/{code}/players', [FederationController::class, 'players']);
});

Route::get('clubs', [ClubController::class, 'index']);
Route::get('players/{slug}', [PlayerController::class, 'show']);

// Admin — requires auth + admin role
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::apiResource('players', \App\Http\Controllers\Admin\PlayerController::class);
    Route::apiResource('clubs',   \App\Http\Controllers\Admin\ClubController::class);
});
