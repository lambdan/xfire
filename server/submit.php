<?php
// some stuff from here: https://gist.github.com/bladeSk/6294d3266370868601a7d2e50285dbf5
$db = new SQLite3('gamedb.sqlite3', SQLITE3_OPEN_CREATE | SQLITE3_OPEN_READWRITE); // create db if it doesnt exist
$db->enableExceptions(true);
$db->query('CREATE TABLE IF NOT EXISTS "games" (game_name TEXT, last_played INTEGER, time_played INTEGER)'); // create table if it doesnt exist

// ChatGPT did most of this, and it did a great job :)
if ($_GET['game'] && $_GET['timestamp'] && $_GET['duration']) {
    $gameName = $_GET['game'];
    $timestamp = (int)$_GET['timestamp'];
    $duration = (int)$_GET['duration'];

    // Check if the game already exists in the database
    $existingGame = $db->querySingle("SELECT * FROM games WHERE game_name='$gameName'", true);

    if ($existingGame) {
        // Update the existing game entry
        $newLastPlayed = $timestamp;
        $newTimePlayed = $existingGame['time_played'] + $duration;

        $db->exec("UPDATE games SET last_played=$newLastPlayed, time_played=$newTimePlayed WHERE game_name='$gameName'");
    } else {
        // Insert a new game entry
        $db->exec("INSERT INTO games (last_played, game_name, time_played) VALUES ($timestamp, '$gameName', $duration)");
    }

    // Get the current date/time
    $currentDateTime = date('Y-m-d H:i:s');

    // Print the current date/time and indicate the success of the update
    echo "Update successful at $currentDateTime";

} else {
    echo "Invalid parameters";
}
?>

