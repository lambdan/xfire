<?php
$db = new SQLite3('gamedb.sqlite3');

$result = $db->query("SELECT * FROM games");
$data = array();

while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
//	$row['last_played_datetime'] = date('Y-m-d H:i:s', $row['last_played']);
//	$row['last_played_date'] = date('Y-m-d', $row['last_played']);

    $row['last_played_timestamp'] = $row['last_played'];
    $row['time_played_as_seconds'] = $row['time_played'];
    unset($row['time_played']); // remove original time_played (its the same as _seconds)
    unset($row['last_played']);
    $data[] = $row;
}

$db->close();
$jsonData = json_encode($data, JSON_PRETTY_PRINT);

header('Content-Type: application/json');
echo $jsonData;
?>


