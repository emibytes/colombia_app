<?php

/**
 * Official head coach squad selection for World Cup 2026 comparison.
 *
 * Set DT_SQUAD_IDS in .env as a comma-separated list of player IDs
 * from the players table when the official squad is announced.
 * Leave empty (default) to disable the DT comparison feature on the frontend.
 */

return [
    'squad_player_ids' => env('DT_SQUAD_IDS', ''),
];
