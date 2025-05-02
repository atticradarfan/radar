const fetch_data = require('./fetch_data');
const armFunctions = require('../core/menu/atticRadarMenu');
const map = require('../core/map/map');

const div_elem = '#surfaceFrontsMenuItemDiv';
const icon_elem = '#surfaceFrontsMenuItemIcon';

const surface_fronts_layers = [
    'fronts_layer',
    'pressure_points_layer',
    'front_symbols_layer',
];
window.atticData.surface_fronts_layers = surface_fronts_layers;

armFunctions.toggleswitchFunctions($('#armrSurfaceFrontsBtnSwitchElem'), function() {
    if (map.getLayer(surface_fronts_layers[0])) {
        for (var i = 0; i < surface_fronts_layers.length; i++) {
            // surface fronts layers already exist, simply toggle visibility here
            map.setLayoutProperty(surface_fronts_layers[i], 'visibility', 'visible');
        }
    } else {
        // surface fronts layers do not exist, load them into the map style
        fetch_data();
    }
}, function() {
    for (var i = 0; i < surface_fronts_layers.length; i++) {
        // hide the surface fronts layers
        map.setLayoutProperty(surface_fronts_layers[i], 'visibility', 'none');
    }
})