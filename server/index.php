<!-- ChatGPT did most of this. I just added the sortable -->

<html>
<head>
<title>Xfire</title>
<meta charset="utf8">
<script src="https://www.kryogenix.org/code/browser/sorttable/sorttable.js"></script>
<style>
body {
	background-color: #282923;
	color: #67d6e7;
	font-family: sans-serif;
}
table {
        border: 1px solid #f92472;
        border-collapse: collapse;
}
td,th {
        padding: 8px;
}
</style>
</head>

<body>


<?php
// Connect to the SQLite database
$db = new SQLite3('gamedb.sqlite3');

// Fetch data from the 'games' table, ordered by time_played in descending order
$result = $db->query("SELECT * FROM games ORDER BY time_played DESC");

// Display the data in a table
echo '<table border=1  class="sortable">
        <tr>
            <th>Game</th>
            <th>Last Played</th>
            <th>Time Played</th>
        </tr>';

while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
    echo "<tr>";
    echo "<td>" . $row['game_name'] . "</td>";
    
    // Format last_played to human-readable format
    $lastPlayed = date('Y-m-d H:i:s', $row['last_played']);
    echo "<td>" . $lastPlayed . "</td>";

    // Convert time_played to hours
    $timePlayedHours = $row['time_played'] / 3600;
    echo "<td>" . number_format($timePlayedHours, 1) . " hrs</td>";

    echo "</tr>";
}

echo "</table>";

// Close the database connection
$db->close();
?>

