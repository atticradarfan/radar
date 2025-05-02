const nexrad_locations = require('../libnexrad/nexrad_locations').NEXRAD_LOCATIONS;
const { get_date_diff } = require('../../core/misc/get_date_diff');
const { DateTime } = require('luxon');
const ut = require('../../core/utils');

var alreadyClicked = false;
function _position_footer() {
    if (!alreadyClicked) {
        alreadyClicked = true;
        var offset;
        if (require('../../core/misc/detect_mobile_browser')) {
            offset = $(window).height() * (5 / 100);
        } else {
            offset = 0;
        }
        // show the parent div for the PSM
        $('#productMapFooter').show();
        //$('#productMapFooter').height('30px');
        var productFooterBottomMargin = parseInt($('#map').css('bottom'));
        var productFooterHeight = parseInt($('#productMapFooter').height());
        $('#productMapFooter').css('bottom', productFooterBottomMargin - offset);
        ut.setMapMargin('bottom', productFooterBottomMargin + productFooterHeight);
    }
}

function _display_time_diff() {
    const date_diff = get_date_diff(this.get_date(), 'radar_plot');

    $('#top-right').removeClass();
    $('#top-right').addClass(date_diff.class);
    $('#top-right').html(date_diff.formatted);
}

/**
 * This function is called using ".apply()", so "this" is a reference to an instance of the L3Factory class.
 */
function display_file_info() {
    _position_footer();

    // make sure the file upload stuff is hidden
    $('#fileUploadSpan').hide();
    $('#radarInfoSpan').show();

    // set some DOM content
    $('#radarStation').html(this.station);
    var radar_name = nexrad_locations[this.station]?.name;
    if (radar_name == undefined) { radar_name = 'Unknown'; }
    $('#radarLocation').html(radar_name);

    // set the date box content
    var fileDateObj;
    if (this.nexrad_level == 2) {
        fileDateObj = this.get_date(this.elevation_number);
    } else {
        fileDateObj = this.get_date();
    }
    var formattedDateObj = DateTime.fromJSDate(fileDateObj).setZone(ut.userTimeZone);
    var formattedRadarDate = formattedDateObj.toFormat('L/d/yyyy');
    var formattedRadarTime = formattedDateObj.toFormat('h:mm a ZZZZ');
    $('#radarDateTime').show().html(`${formattedRadarDate}<br>${formattedRadarTime}`);
    // display the time difference
    _display_time_diff.apply(this);

    // show the main box containing station name, vcp, etc.
    $('#radarInfoSpan').show();

    // show the text to open the product selection menu
    $('#productsDropdownTrigger').show();

    // display the VCP
    var radar_vcp = ut.vcpObj[this.vcp];
    if (radar_vcp == undefined) { radar_vcp = 'Unknown'; }
    $('#radarVCP').html(`VCP: ${this.vcp} (${radar_vcp})`);

    // display the elevation angle
    $('#extraProductInfo').show().html(`Elevation: ${this.elevation_angle.toFixed(1)}°`);

    if (window.atticData.from_file_upload && this.nexrad_level == 3) {
        $('#productsDropdownTriggerText').hide();
    } else {
        $('#productsDropdownTriggerText').show();
    }

    // function showTimeDiff() { getTimeDiff(fileDateObj) }
    // if (window.countInterval && !$('#dataDiv').data('fromFileUpload')) {
    //     clearInterval(window.countInterval)
    // }
    // showTimeDiff();
    // // update the time difference every 10 seconds
    // if (!$('#dataDiv').data('fromFileUpload')) { window.countInterval = setInterval(showTimeDiff, 10000) }
    // if ($('#dataDiv').data('fromFileUpload')) {
    //     document.getElementById('top-right').innerHTML += ' ago';
    //     $('#top-right').addClass('uploaded-file');
    //     // shrink the map header because the file upload box is no longer there
    //     $('#radarHeader').css('height', '-=25px');
    //     $('.progressBar').css('top', '-=25px');
    //     ut.setMapMargin('top', '-=25px');
    //     $('#productsSelectionMenu').html('<b>No product selections avaliable for a Level 3 file.</b>')
    // }
}

module.exports = display_file_info;