<?php

use App\Http\Controllers\Api\ClubController;
use App\Http\Controllers\Api\ConfederationController;
use App\Http\Controllers\Api\FederationController;
use App\Http\Controllers\Api\PlayerController;
use App\Http\Controllers\Api\SelectionController;
use Illuminate\Support\Facades\Route;

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
