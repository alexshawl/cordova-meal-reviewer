var destinationType;

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {
        // Verarbeiten der Cordova-Pause- und -Fortsetzenereignisse
        document.addEventListener('pause', onPause.bind(this), false);
        document.addEventListener('resume', onResume.bind(this), false);

        // Kamera
        if (!navigator.camera) {
            alert("Camera Failure");
        }
        // Kamera: Button Foto aufnehmen
        document.getElementById("btnTakePhoto").onclick = function () {
            handleCamera();
        };
        // Kamera: Button Foto löschen 
        document.getElementById("btnDelPhoto").onclick = function () {
            window.localStorage.removeItem("photo1");
            refreshPhoto(); // Änderung aktualisieren
        };

        // Standort: Button Location Update
        document.getElementById("btnUpdateLocation").onclick = function () {
            updateLocation();
        };
        // Standort: Button Location löschen
        document.getElementById("btnDelLocation").onclick = function () {
            window.localStorage.removeItem("locLat1");
            window.localStorage.removeItem("locLong1");
            refreshLocation();
        };

        // Google Maps Button Karte anzeigen
        document.getElementById("btnShowMap").onclick = function () {
            displayRestaurantMap();
        };

        // Device Test: Button Vibrationstest
        document.getElementById("btnVibrateTest").onclick = function () {
            navigator.vibrate(3000);
        };

    };

    /**
    Ruft die Native Kamera auf.
    Beim Aufnehmen des Fotos durch den Nutz wird dieses in der Galerie des Geräts gespeichert.
    */
    function handleCamera() {
        destinationType = navigator.camera.DestinationType;
        navigator.camera.getPicture(onCameraSuccess, onCameraFail, {
            quality: 75,
            destinationType: destinationType.FILE_URI,
            saveToPhotoAlbum: true, // in Galerie Speichern
            correctOrientation: true,
            encodingType: navigator.camera.EncodingType.JPEG
        });
    };

    /**
    onSuccess Funktion für die Kamera.
    Ändert das angezeigt Bild auf das neue aufgenommene.
    */
    function onCameraSuccess(imageData) {
        var lastPhotoContainer = document.getElementById("restaurantPhoto");
        lastPhotoContainer.src = imageData;

        // Pfad des Fotos in Local Storage speichern
        window.localStorage.setItem("photo1", imageData);

    };
    function onCameraFail(message) {
        alert("Camera failure: " + message);
    };

    /**
    Ruft aktuelle Koordinaten ab,speichert diese und zeigt sie in der App an.
    */
    function updateLocation() {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                localStorage.setItem("locLat1", position.coords.latitude); // Latitude speichern
                localStorage.setItem("locLong1", position.coords.longitude); // Longitude speichern
                refreshLocation(); // Anzeige der Location neu laden
            },
            function (error) {
                alert('Error getting location:' + error.code + " , " + error.message);
            });
        return false;
    };


    function onPause() {
        // TODO: Diese Anwendung wurde ausgesetzt. Speichern Sie hier den Anwendungszustand.
    };

    function onResume() {
        // TODO: Diese Anwendung wurde erneut aktiviert. Stellen Sie hier den Anwendungszustand wieder her.
    };
})();


/**
Bei Initialisierung der Restaurant-Detailseite gespeichertes Bild und Location laden.
*/
$(document).on("pageinit", "#restaurant", function () {
    refreshPhoto();
    refreshLocation();
});

/**
Aktualisiert das Foto in der App
*/
function refreshPhoto() {
    var currentPhoto = document.getElementById("restaurantPhoto");
    var savedPhoto = window.localStorage.getItem("photo1");

    // Wenn es ein gespeichertes Foto gibt, dieses laden
    if (savedPhoto != null) {
        currentPhoto.src = window.localStorage.getItem("photo1");
    } else { // Ansonsten "noimage" Foto anzeigen
        currentPhoto.src = "images/noimage.gif"
    }
};

/**
Aktualisiert die Geolocation Anzeige in der App.
*/
function refreshLocation() {
    var currentLocLat = document.getElementById("locationLat");
    var currentLocLong = document.getElementById("locationLong");
    var savedLocLat = window.localStorage.getItem("locLat1");
    var savedLocLong = window.localStorage.getItem("locLong1");


    if (savedLocLat != null) { // Wenn gespeicherte Location-Latitude vorhanden diese anzeigen
        currentLocLat.innerHTML = "Latitude=" + savedLocLat;
    } else { // Ansonsten keine Location Daten anzeigen
        currentLocLat.innerHTML = "No Latitude Data";
    }
    if (savedLocLong != null) { // Wenn gespeicherte Location-Longitude vorhanden diese anzeigen
        currentLocLong.innerHTML = "Longitude=" + savedLocLong;
    } else { // Ansonsten keine Location Daten anzeigen
        currentLocLong.innerHTML = "No Longitude Data";
    }
};

/*
Google Maps Karte anzeigen
*/
function displayRestaurantMap() {
    var lat = window.localStorage.getItem("locLat1");
    var long = window.localStorage.getItem("locLong1");
    if (lat != null && long != null) { // Wenn gespeicherte Koordinaten vorhanden, Karte zeichnen
        document.getElementById("map-canvas").hidden = false;
        document.getElementById("locErrArea").innerHTML = "";
        drawMap(new google.maps.LatLng(lat, long));
    } else { // Ansonsten keine Daten anzeigen
        document.getElementById("map-canvas").hidden = true;
        document.getElementById("locErrArea").innerHTML = "No Location Data";
    }
};
/*
Google Maps Karte zeichnen
*/
function drawMap(latlng) {
    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
    // Pin sitzen
    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        title: "Pin"
    });
};

/*
Initialisierung der Device-Test Seite
*/
$(document).on("pageinit", "#stuffHome", function () {
    var watchId;
    // Eventlistener für Tasten des Geräts
    document.addEventListener("backbutton", onBackKeyDown, false); // Zurück-Button
    document.addEventListener("menubutton", onMenuKeyDown, false); // Menü-Button
    document.addEventListener("volumedownbutton", onVolumeDownKeyDown, false); // Lautstärke leiser-Button
    document.addEventListener("volumeupbutton", onVolumeUpKeyDown, false); // Lautstärker lauter-Button
    window.addEventListener("batterystatus", onBatteryStatus, false); // Batterie + Ladezustand 
    document.getElementById("btnDeviceInfo").onclick = function () { // Device Info anzeigen
        navigator.notification.alert("Running Cordova version: " + device.cordova + "\nDevice Model: " + device.model + "\nDevice Platform: " + device.platform + " " + device.version + "\nDevice UUI: " + device.uuid, null, "Device Info");
    }

    // Batteriestatus aktualisieren. Wird ausgelöst sobald sich der Ladezustand um mind. 1% ändert oder das Ladekabel an- oder abgesteckt wird
    function onBatteryStatus(info) {
        var status;
        status = "The Battery Level is <b>" + info.level + "</b>% and the cable is <b>";
        if (info.isPlugged) {
            status += "plugged in";
        } else if (!info.isPlugged) {
            status += "not plugged in";
        } else {
            status += "unknown";
        }
        status += "</b>";
        document.getElementById("pluggedStatus").innerHTML = status;
    }
    // Slider auf 1 setzen, wenn LautstärkeKnopf-Lauter gedrückt wird
    function onVolumeUpKeyDown() {
        $("#slider-2").val(1).slider("refresh");
    }
    // Slider auf 0 setzen, wenn Lautstärkeknopf-Leiser gedrückt wird
    function onVolumeDownKeyDown() {
        $("#slider-2").val(0).slider("refresh");
    }
    // Anzeigen, ob der Menüknopf auf dem Gerät gedrückt wurde
    function onMenuKeyDown() {
        alert("Menu key pressed");
    }
    // Anzeigen, ob der zurück-Knopf auf dem Gerät gedrückt wurde
    function onBackKeyDown() {
        alert("Back button pressed");
    }
    // Verbindungsstatus anzeigen
    function checkConnection() {
        var networkState = navigator.connection.type; // Netzwerkstatus abrufen

        var states = {}; //Übersetzung der entsprechenden Status
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';
        // Anzeige des Netzwerkstatus
        document.getElementById("networkStatus").innerHTML = "The device is connected via: <b>" + states[networkState] + "</b>";
    }
    checkConnection();
});

// Shake-Funktionen laden
$(document).on("pagebeforeshow", "#shakeHome", function () {
    var accelX, accelY, accelZ, time;
    // Erkennen, ob das Gerät geschüttelt wurde
    var onShake = function () {
        navigator.accelerometer.getCurrentAcceleration(function (acceleration) {
            accelX = acceleration.x;
            accelY = acceleration.y;
            accelZ = acceleration.z;
            time = acceleration.timestamp;
            navigator.notification.alert("Device has been shaken!\nAcceleration Data:\nAcceleration X: " + accelX + "\nAcceleration Y: " + accelY + "\nAcceleration Z: " + accelZ + "\nTimestamp: " + time, null, "Shake success");
        }, function () {
            alert("Accelerometer Error ");
        });

    };
    shake.startWatch(onShake, 30);
});

// Shake-Funktionen stoppen
$(document).on("pagebeforehide", "#shakeHome", function () {
    shake.stopWatch();
});

// Compass Funktion starten
$(document).on("pagebeforeshow", "#compassHome", function () {
    function onCompassSuccess(heading) {
        var element = document.getElementById('heading');
        element.innerHTML = 'Heading: ' + heading.magneticHeading;
    };

    function onCompassError(compassError) {
        alert('Compass error: ' + compassError.code);
    };

    var compassOptions = {
        frequency: 1000
    }; // Jede Sekunde aktualisieren

    watchID = navigator.compass.watchHeading(onCompassSuccess, onCompassError, compassOptions);
});

//Compass Funktion stoppen
$(document).on("pagebeforehide", "#compassHome", function () {
    navigator.compass.clearWatch(watchID);
});

// Kontaktseite laden
$(document).on("pageinit", "#contactsHome", function () {
    var contactOptions = new ContactFindOptions();
    contactOptions.filter = "";
    contactOptions.multiple = true;
    var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name];
    navigator.contacts.find(fields, onContactSuccess, onContactError, contactOptions);

    function onContactSuccess(contacts) {
        console.log("Found " + contacts.length + "Contacts");

        var number;
        for (var i = 0; i < contacts.length; i++) {
            // console.log(JSON.stringify(contacts[i]));
            if (contacts[i].phoneNumbers != null) {
                number = contacts[i].phoneNumbers[0].value;
                $("#contact-data").append("<li data-icon='false'><a href='tel:" + number + "'<h1>" + contacts[i].name.formatted + "</h1><p>" + number + "</p></a>");
            }
        }
        $("#contact-data").listview("refresh");
    }
    function onContactError() {
        alert("Some Error Occured");
    }
});

/*
Initialisierung der Media-Test Seite
*/
$(document).on("pageinit", "#mediaHome", function () {
    var pathToFile; // Pfad für Audi-File
    // Play Audio Button
    document.getElementById("playAudio").onclick = function () {
        playAudio(pathToFile);
    };
    // Record Button
    document.getElementById("startRecord").onclick = function () {
        navigator.device.capture.captureAudio(captureSuccess, captureError, { limit: 1 }); // Nativen Audiorekorder starten
    };
    // capture callback
    var captureSuccess = function (mediaFiles) {
        var i, len;
        for (i = 0, len = mediaFiles.length; i < len; i += 1) {
            pathToFile = mediaFiles[i].fullPath;
            pathToFile = pathToFile.substr(6, pathToFile.length);
            pathToFile = "file:///" + pathToFile;
        };
    };

    // capture error callback
    var captureError = function (error) {
        alert('Error code: ' + error.code, null, 'Capture Error');
    };


    // Play audio
    function playAudio(url) {
        // Play the audio file at url
        var audioFile = new Media(url,
            // success callback
            function () {
                console.log("playAudio():Audio Success");
            },
            // error callback
            function (err) {
                console.log("playAudio():Audio Error: " + err.message);
            }
        );
        // Play audio
        audioFile.play();
    }
});
