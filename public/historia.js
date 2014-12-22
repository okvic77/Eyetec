moment.locale('es');
jQuery(document).ready(function($) {
    var historia = $('ul.eyetec_historia');
    var player = $("#jquery_jplayer_1");
    player.jPlayer({
        ready: function() {
            $(this).jPlayer("setMedia", {
                mp3: "/audio/siren.mp3"
            });
        },
        swfPath: "/assets/jplayer/jquery.jplayer/",
        supplied: "mp3"
    });
    //     var pusher = new Pusher('7a9aba4b837efde74b82');
    //     var channel = pusher.subscribe('prototipe');
    //     channel.bind('evento', getData);
    var pubnub = PUBNUB.init({
        subscribe_key: 'sub-c-92faa9d2-4467-11e4-908d-02ee2ddab7fe'
    });
    pubnub.subscribe({
        channel: "prototipo",
        callback: function(data) {
        if (data.hasOwnProperty('action')) switch (data.action) {
            case 'sos':
                player.jPlayer('play');
                break;
        };
        if (data.hasOwnProperty('add')) {
            
            var newAction = $('<li />');
            newAction.data(data.add).text(data.add.text).append( $('<span />').livestamp(data.add.date).attr('title', data.add.date) );
            
            historia.prepend(newAction);
        }
    }
    });
    

});