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
    }, 60000);

    /*window.setInterval(function() {
        Refresh();
    }, 1000);*/
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
    } else if (Mode == 2){
        SortAlphabetically();
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
    var output = '<table class="table">';

    output += '<thead>';
        output += '<tr>';
            if(bNumberedList) {
                output += '<th scope="col">#</th>';
            }
            output += '<th scope="col">Game</th>';
            output += '<th scope="col">Played</th>';
            output += '<th scope="col">Last Played</th>';
        output += '</tr>';
    output += '</thead>';

    output += '<tbody>';

    $.each(JSON_SORTED, function(id,game) {
        if(IsPlayingNow(game.last_played_timestamp)){
            // mark row as active
        }

        output += '<tr>';
            if(bNumberedList){
                output += '<th scope="row">' + (id+1) + '</th>';
            }
            output += '<td>' + game.game_name + '</td>';
            output += '<td title="' + game.time_played_as_seconds + ' secs">' + SecsToPretty(game.time_played_as_seconds) + '</td>';

            if(IsPlayingNow(game.last_played_timestamp)) {
                output += '<td><b>playing now</b></td>';
            } else {
                output += '<td title="' + TimestampToHuman(game.last_played_timestamp) + '">' + TimeSince(game.last_played_timestamp) + '</td>';
            }

        output += '</tr>';
    });

    output += '</tbody>';
    output += '</table>';
    $('#game-list').html(output);

    // end stats section
    var stats = '<p>Total time played: ' + SecsToPretty(TotalTimePlayed()) + '</p>';
    $('#end-stats').html(stats);
}

function SecsToPretty(secs)
{
    var hours = Math.floor(secs / 3600);
    if(hours > 0){
        if(hours==1){return "1 hour";}
        return hours + " hours";
    }

    var mins = Math.floor(secs / 60);
    if(mins > 0){
        if(mins==1){return "1 minute";}
        return mins + " minutes";
    }

    return "<1 minute";

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

    var years = Math.floor(delta / (365*24*3600));
    var days = Math.floor(delta / (24*3600));
    var hours = Math.floor(delta / 3600);
    var mins = Math.floor(delta / 60);

    if(years > 0)
    {
        if(years==1){return "1 year ago";}
        return years + " years ago";
    }

    if(days > 0)
    {
        if(days==1){return "1 day ago";}
        return days + " days ago";
    }


    if(hours > 0){
        if(hours==1){return "1 hour ago";}
        return hours + " hours ago";
    }

    if(mins > 0){
        if(mins==1){return "1 minute ago";}
        return mins + " minutes ago";
    }

    return "<1 minute ago";
}


function GrabJSON()
{
    console.log("Grabbing json...");
	$.getJSON(JSON_URL, function(data) {
        JSON_DATA = data;
        GotJSON();
	});
}
