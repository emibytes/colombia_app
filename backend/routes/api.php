<?php

use App\Http\Controllers\Api\SelectionController;
use Illuminate\Support\Facades\Route;

Route::prefix('selections')->group(function () {
    Route::post('/',     [SelectionController::class, 'store']);
    Route::get('/stats', [SelectionController::class, 'stats']);
});
