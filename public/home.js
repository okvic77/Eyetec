jQuery(document).ready(function($) {
    
    
    var socket = io();
    
    socket.on('connect', function () {
        
        console.log('Success to server');
        
//     socket.emit('ferret', 'tobi', function (data) {
//       console.log(data); // data will be 'woot'
//     });
  });
    
    socket.on('connect_error', function(){ console.log('Error connecting'); });
    socket.on('connect_timeout', function(){ console.log('fuera de tiempo'); })
    socket.on('reconnect', function(){ console.log('reconectandos'); })
    socket.on('reconnect_attempt', function(){ console.log('intento'); })
    socket.on('reconnecting', function(){ console.log('verbo reconectar'); })
    socket.on('reconnect_error', function(){ console.log('error reconectando'); })
    socket.on('reconnect_failed', function(){ console.log('fallido'); })
    
    socket.on('disconnect', function(){ console.log('error reconectando'); })
    socket.on('reconnect_attempt', function(){ console.log('fallido'); })

    socket.on('reconnect_error ', function(){ console.log('fallido'); })

    socket.on('reconnect_failed', function(){ console.log('fallido'); })

        
    
    
    var actual;
    var barrido = false,
        barridotimer;
    var cambiarmodo = $('.eyetec_mode_ch');
    
    function swapp(){
        if (barrido) {
            clearInterval(barridotimer);
        } else {
            barridotimer = setInterval(function() {
                console.log('move');
                actual = $('.eyetec .active').removeClass('active');
                var next = actual.next().addClass('active');
                if (next.length == 0) {
                    //actual.closest('.eyetec').find('div').eq(0).addClass('active');
                    var next_ = actual.closest('.eyetec').next();
                    if (next_.length == 0) next_ = $('.eyetec').eq(0); // Regresar
                    next = next_.find('div').eq(0).addClass('active');
                } // Regresar                
                $('html, body').animate({
                    scrollTop: next.offset().top
                }, 300);
            }, 2000);
        }
        
        barrido = !barrido;
    }
    
    
    cambiarmodo.click(swapp);
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
    var getData = function(data) {
        if (data.hasOwnProperty('action')) switch (data.action) {
            case 'sos':
                player.jPlayer('play');
                break;
        };
        if (barrido && data.hasOwnProperty('count') && data.count > 0) senal(3);
        else if (data.hasOwnProperty('count') && $.inArray(data.count, [1, 2, 3, 4]) != -1) senal(data.count);
    };
    //     var pusher = new Pusher('7a9aba4b837efde74b82');
    //     var channel = pusher.subscribe('prototipe');
    //     channel.bind('evento', getData);
    var pubnub = PUBNUB.init({
        subscribe_key: 'sub-c-92faa9d2-4467-11e4-908d-02ee2ddab7fe'
    });
    pubnub.subscribe({
        channel: "prototipo",
        callback: getData
    });
    moment.locale('es');
    var codesk = [-1, 49, 50, 51, 52, 53];
    $("body").keydown(function(e) {
        var tmp = $.inArray(e.keyCode, codesk);
        if (tmp != -1) {
            if (barrido) senal(3);
            else senal(tmp);
        }
    });
    var datos;
    var selectIn, selectIn_ = function() {
            senal(3);
        };
    var selectNow = function(datos) {
        if (datos != undefined) $.post('/insert', datos, function(d) {
            console.log(d);
        });
        last.find('h2').text(datos.text);
        last.find('span').livestamp(new Date());
    };
    var last = $('.eyetec_last');

    function senal(valor) {
        actual = $('.eyetec .active');
        
        if (valor <= 4)
            actual.removeClass('active');
        switch (valor) {
            case 1:
                var next = actual.next().addClass('active');
                if (next.length == 0) actual.closest('.eyetec').find('div').eq(0).addClass('active'); // Regresar
                break;
            case 2:
                var next_ = actual.closest('.eyetec').next();
                if (next_.length == 0) next_ = $('.eyetec').eq(0); // Regresar
                next_.find('div').eq(actual.index()).addClass('active');
                break;
            case 3:
                selectNow(actual.data());
                reset();
                break;
            case 4:
                if (selectIn) clearTimeout(selectIn);
                reset();
                break;
            case 5:
                swapp();
                break;                
        }
        if (valor == 1 || valor == 2) {
            if (selectIn) clearTimeout(selectIn);
            selectIn = setTimeout(selectIn_, 3000);
        }
        $('html, body').animate({
            scrollTop: $('.eyetec .active').offset().top
        }, 300);
    }

    function reset() {
        if (selectIn) clearTimeout(selectIn);
        $('.eyetec:eq(0) div:eq(0)').addClass('active');
    }
});