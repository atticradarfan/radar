const ut = require('../../core/utils');
const product_colors = require('../colormaps/colormaps');

const product_units = {
    'REF': 'dBZ', // level 2 reflectivity
    'VEL': 'mph', // level 2 velocity
    'SW': 'mph', // level 2 spectrum width
    'ZDR': 'dB', // level 2 differential reflectivity
    'RHO': '%', // level 2 correlation coefficient
    'PHI': 'deg', // level 2 differential phase shift

    153: 'dBZ', // super-res reflectivity
    154: 'mph', // super-res velocity
    161: '%', // correlation coefficient
    159: 'dB', // differential reflectivity
    // 'NSW': 'mph', // spectrum width
    94: 'dBZ', // digital reflectivity
    99: 'mph', // digital base velocity
    134: 'kg/m²', // vertically integrated liquid
    // 'N0S': 'knots', // storm relative velocity
    163: 'deg/km', // specific differential phase

    180: 'dBZ', // tdwr short-range reflectivity
    186: 'dBZ', // tdwr long-range reflectivity
    182: 'mph', // tdwr base velocity
}

function decode_and_format(color, cmin, cmax) {
    // decode the rgb data
    var scaled = color[0] / Math.pow(255, 1) + color[1] / Math.pow(255, 2) + color[2] / Math.pow(255, 3);
    // if it isn't 255 alpha (opaque), there is no radar data to read
    if (color[3] == 255) {
        const orig_value = scaled * (cmax - cmin) + cmin;
        var value = orig_value;
        value = format_value(value);

        return [value, orig_value];
    } else {
        return [null, null];
    }
}

function format_value(value) {
    // const product = window.atticData.product;
    const product_code = window.atticData.product_code;

    if (value != null) {
        if (Math.round(value) == product_colors.range_folded_val) {
            value = 'Range Folded';
        } else {
            if (
            product_code == 'REF' || product_code == 153 /* N0B */ || product_code == 94 /* NXQ */ || product_code == 180 /* TZ0 */ || product_code == 186 /* TZL */ || // reflectivity
            product_code == 'SW' /* || product_code == 'NSW' */ // spectrum width
            ) {
                // round to the nearest 0.5
                value = Math.floor(value * 2) / 2;
            } else if (
                product_code == 154 /* N0G */ || product_code == 99 /* N0U */ || product_code == 182 /* TVX */ || product_code == 'VEL' // velocity
            ) {
                // round to the nearest 0.5 m/s
                value = Math.floor(value * 2) / 2;
    
                // convert to mph
                value = value * 2.23694;
                value = Math.round(value * 10) / 10;
            } else if (
            product_code == 159 /* N0X */ || product_code == 'ZDR' || // differential reflectivity
            product_code == 134 /* DVL */ // vertically integrated liquid
            ) {
                value = parseFloat(value.toFixed(2));
            } else if (
            product_code == 163 // specific differential phase
            ) {
                value = parseFloat(value.toFixed(1));
            } else if (
            product_code == 161 /* N0C */ || product_code == 'RHO' || // correlation coefficient
            product_code == 'PHI' // differential phase shift
            ) {
                // round to the nearest 16th
                value = parseFloat(value.toFixed(3));
            } else if (
                product_code == 165 || product_code == 177 // hydrometer classification || hybrid hydrometer classification
            ) {
                var hycValues = {
                    0: 'Below Threshold', // ND
                    10: 'Biological', // BI
                    20: 'Ground Clutter', // GC
                    30: 'Ice Crystals', // IC
                    40: 'Dry Snow', // DS
                    50: 'Wet Snow', // WS
                    60: 'Light-Mod. Rain', // RA
                    70: 'Heavy Rain', // HR
                    80: 'Big Drops', // BD
                    90: 'Graupel', // GR
                    100: 'Hail / Rain', // HA
                    110: 'Large Hail', // LH
                    120: 'Giant Hail', // GH,
                    130: 'Unused', // ??
                    140: 'Unknown', // UK
                    150: 'Range Folded' // RF
                }
                value = hycValues[Math.floor(value / 10) * 10];
            }

            if (parseFloat(value) % 1 == 0) {
                value = `${value}.0`;
            }

            // we don't need to add units to hydrometer classification
            if (product_code != 165 /* N0H */ && product_code != 177 /* HHC */) {
                value = `${value} ${product_units[product_code]}`;
            }
        }
        return value;
    } else {
        return null;
    }
}

module.exports = {
    decode_and_format,
    format_value
};
