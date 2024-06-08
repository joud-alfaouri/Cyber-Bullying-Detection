// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}

getYear();

/** google_map js 

function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}
**/
function toggleDrawer() {
    console.log("toggleDrawer called"); // Check if this logs in the browser console
    var drawer = document.getElementById("drawer");
    if (drawer.style.width === '250px') {
        drawer.style.width = '0';
    } else {
        drawer.style.width = '250px';
    }
}
