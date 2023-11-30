var JSON_URL = '../json?stats=1';
var JSON_DATA = ''; // will contain the original data
var JSON_SORTED = '';

var Mode = 0; // 0 = most recent, 1 = most played, 2 = alphabetically
var bNumberedList = false;

function Start() // runs when page is loaded
{
    GrabJSON();

    // refresh every 30s
    window.setInterval(function() {
        GrabJSON();
    }, 30000);

    window.setInterval(function() {
        Refresh();
    }, 1000);
}

function GotJSON() // runs when we got the json
{
    //console.log(JSON_DATA);
    Refresh();
}

function Refresh()
{
    if (Mode == 0){
        SortByMostRecent();
    } else if (Mode == 1){
        SortByMostPlayed();
    }

}


function SortByMostPlayed()
{
    Mode = 1;
    bNumberedList = true;

    JSON_SORTED = JSON_DATA.sort(function(b,a){
        return a.time_played_as_seconds - b.time_played_as_seconds;
    });

    GenerateHTML();
}


function SortByMostRecent()
{
    Mode = 0;
    bNumberedList = false;

    JSON_SORTED = JSON_DATA.sort(function(b,a){
        return a.last_played_timestamp - b.last_played_timestamp;
    });

    GenerateHTML();
}

function SortAlphabetically()
{
    Mode = 2;
    bNumberedList = false;
    JSON_SORTED = JSON_DATA.sort(function(a,b){
        var nameA = a.game_name.toUpperCase();
        var nameB = b.game_name.toUpperCase();
        if(nameA<nameB){
            return -1;
        }
        if (nameA > nameB){
            return 1;
        }
        return 0;
    });
    GenerateHTML();
}



function GenerateHTML()
{
    var output = '';
    output += '<ul class="list-group';
    if (bNumberedList) { // should it be a numbered list?
        output += ' list-group-numbered';
    }
    output += '">';


    $.each(JSON_SORTED, function(id,game) {
        output += '<li class="list-group-item d-flex justify-content-between align-items-start';
        if(IsPlayingNow(game.last_played_timestamp)){
            output += ' active';
        }
        output += '">';
            output += '<div class="ms-2 me-auto">';
                output += '<div class="fw-bold">' + game.game_name + '</div>';
                    output += '' + SecsToPretty(game.time_played_as_seconds) + '';
            output += '</div>';
        output += '<small title="' + TimestampToHuman(game.last_played_timestamp) + '">';
            if(IsPlayingNow(game.last_played_timestamp))
            {
                output += "playing now...";
            }
            else
            {
                output += 'Last played: ' + TimeSince(game.last_played_timestamp) + '';
            }
        output += '</small>';
        output += '</li>';
    });

    output += '</ul>';
    $('#game-list').html(output);

    // end stats section
    var stats = '<p>Total time played: ' + SecsToPretty(TotalTimePlayed()) + '</p>';
    $('#end-stats').html(stats);
}

function SecsToPretty(secs)
{
    if(secs > 3600) {
        return Math.floor(secs / 3600) + " hrs";
    } else if (secs > 60) {
        return Math.floor(secs / 60) + " mins";
    }
    return secs + " secs";

}

function TimestampToHuman(ts)
{
    var ms = new Date(ts * 1000);
    return ms.toLocaleString("sv-SE");
}

function IsPlayingNow(ts)
{
    var now = Date.now() / 1000;
    var delta = now - ts;
    return delta < 30;
}

function TotalTimePlayed()
{
    var sum = 0;
    for(var i = 0; i < JSON_DATA.length; i++){
        sum += JSON_DATA[i].time_played_as_seconds;
    }
    return sum;
}

function TimeSince(ts)
{
    var now = Date.now() / 1000; // js has timestamp in ms
    var delta = now - ts;

    if(delta > (365*24*3600*40)) // over 40 years ago... so likely 1970 date == unknown
    {
        return "?";
    }

    var hours = Math.floor(delta / 3600);
    delta %= 3600;
    var mins = Math.floor(delta / 60);
    delta %= 60;
    var secs = Math.floor(delta);

    if(hours > (24*365))
    {
        var years = Math.floor(hours / (24*365));
        if(years == 1){
            return "1 year ago";
        } else {
            return years + " years ago";
        }
    }

    if(hours > 48){
        return Math.floor(hours / 24) + " days ago"
    }


    if(hours > 0){
        return hours + "h " + mins + "m " + secs + "s ago";
    }

    if(mins > 0){
        return mins + "m " + secs + "s ago";

    }
    return secs + "s ago";
}


function GrabJSON()
{
    console.log("Grabbing json...");
	$.getJSON(JSON_URL, function(data) {
        JSON_DATA = data;
        GotJSON();
	});
}
