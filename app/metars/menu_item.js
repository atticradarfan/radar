const fetchMETARData = require('./fetch_data');
const useData = require('./use_data');
var map = require('../core/map/map');

const divElem = '#metarStationMenuItemDiv';
const iconElem = '#metarStationMenuItemIcon';

$(iconElem).on('click', function() {
    if (!$(iconElem).hasClass('menu_item_selected')) {
        $(iconElem).addClass('menu_item_selected');
        $(iconElem).removeClass('menu_item_not_selected');

        if (map.getLayer('metarSymbolLayer')) {
            // layer does exist - toggle the visibility to on
            useData.toggleMETARStationMarkers('show');
        } else {
            // layer doesn't exist - load it onto the map for the first time
            fetchMETARData.fetchMETARData();
        }
    } else if ($(iconElem).hasClass('menu_item_selected')) {
        $(iconElem).removeClass('menu_item_selected');
        $(iconElem).addClass('menu_item_not_selected');

        // layer does exist - toggle the visibility to off
        useData.toggleMETARStationMarkers('hide');
    }
})