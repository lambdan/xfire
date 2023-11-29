var JSON_URL = '../json.php';
var JSON_DATA = '';

function Start() // runs when page is loaded
{
    GrabJSON();
}

function GotJSON() // runs when we got the json
{
    console.log(JSON_DATA);
    GenerateHTML();
}

function GenerateHTML()
{
    var output = '';
    output += '<ul class="list-group list-group-numbered">';


    $.each(JSON_DATA, function(id,game) {
        output += '<li class="list-group-item d-flex justify-content-between align-items-start">';
            output += '<div class="ms-2 me-auto">';
                output += '<div class="fw-bold">' + game.game_name + '</div>';
                    output += '' + SecsToPretty(game.time_played_as_seconds) + '';
            output += '</div>';
        output += '<small>';
            output += 'Last played: ' + TimestampToHuman(game.last_played_timestamp) + '';
        output += '</small>';
        output += '</li>';
    });

    output += '</ul>';

    $('#game-list').html(output);
}

function SecsToPretty(secs)
{
    if(secs > 3600) {
        return secs / 3600 + " hrs";
    } else if (secs > 60) {
        return secs / 60 + " mins";
    }
    return secs + " secs";

}

function TimestampToHuman(ts)
{
    var ms = new Date(ts * 1000);
    return ms.toLocaleDateString("sv-SE");
}


function GrabJSON()
{
	$.getJSON(JSON_URL, function(data) {
        JSON_DATA = data;
        GotJSON();
	});
}
