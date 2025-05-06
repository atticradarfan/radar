// browser-compatible RadarUpdater.js
const product_abbv_dict = {
    'N0Q': 'p94r0',
    'N1Q': 'p94r1',
    'N2Q': 'p94r2',
    'N3Q': 'p94r3',
    'N0U': 'p99v0',
    'N1U': 'p99v1',
    'N2U': 'p99v2',
    'N3U': 'p99v3',
};

class RadarUpdater {
    constructor(nexrad_factory) {
        this.nexrad_factory = nexrad_factory;
        this.latest_date = undefined;

        if (nexrad_factory.nexrad_level === 2) {
            this.get_latest_url_func = window.loaders_nexrad.get_latest_level_2_url;
        } else if (nexrad_factory.nexrad_level === 3) {
            this.get_latest_url_func = window.loaders_nexrad.get_latest_level_3_url;

            if (nexrad_factory.storm_relative_velocity) {
                this.plot_func = (url) => {
                    const product = this._product_from_abbv(nexrad_factory.product_abbv);
                    window.loaders_nexrad.create_super_res_storm_relative_velocity(
                        nexrad_factory.station,
                        product,
                        (combinedFactory) => {
                            combinedFactory.plot();
                        }
                    );
                };
            } else {
                this.plot_func = window.loaders_nexrad.level_3_plot_from_url;
            }
        }
    }

    enable() {
        this._check_for_new_file();
        this.interval = setInterval(() => {
            this._check_for_new_file();
        }, 15000);
    }

    disable() {
        clearInterval(this.interval);
    }

    _check_for_new_file() {
        const formatted_now = luxon.DateTime.now().toFormat('h:mm.ss a ZZZZ');
        this.nexrad_factory.display_file_info();
        const product = this._product_from_abbv(this.nexrad_factory.product_abbv);
        this.get_latest_url_func(this.nexrad_factory.station, product, 0, (url, fetched_date) => {
            this._process_update_check(url, fetched_date, formatted_now);
        });
    }

    _product_from_abbv(product) {
        return product_abbv_dict.hasOwnProperty(product) ? product_abbv_dict[product] : product;
    }

    _process_update_check(url, fetched_date, formatted_now) {
        if (this.latest_date === undefined || fetched_date.getTime() > this.latest_date.getTime()) {
            console.log(`New radar scan at ${formatted_now}`);
            this.latest_date = fetched_date;
            this.plot_func(url);
        } else {
            console.log(`No new scan as of ${formatted_now}`);
        }
    }
}

// Make RadarUpdater globally available
window.RadarUpdater = RadarUpdater;
