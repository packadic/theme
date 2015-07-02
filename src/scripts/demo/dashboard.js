require([
    'jquery', 'theme', 'fn/defined', 'fn/default', 'fn/cre', 'plugins/chartjs',

    'plugins/easypiechart', 'plugins/sparkline', 'flot', 'flot.pie'
], function ($, theme, defined, def, cre, Chart) {
    "use strict";
    $.fn.sparkline.defaults.common.width = '100px';
    $.fn.sparkline.defaults.common.height = '100px';

    $(function () {

        var PieCharts = function () {
            return;
            var charts = $('.percentage');
            var barColors = ['amber-dark', 'green', 'teal', 'cyan'];
            charts.each(function (i) {
                var $chart = $(this);
                $chart.easyPieChart({
                    animate : 1000,
                    onStep  : function (value) {
                        this.$el.find('span').text(~ ~ value);
                    },
                    barColor: App.colors[barColors[i]],
                    size    : 85
                }).css({'margin': '0px 15px'});
            });
            charts.on('click', function (e) {
                e.preventDefault();
                charts.each(function () {
                    $(this).data('easyPieChart').update(Math.floor(100 * Math.random()));
                });
            });
        }.call();


        (function RealTimeMonitor() {
            if ( ! jQuery.plot ) {
                return;
            }

            var data = [];
            var totalPoints = 250;

            // random data generator for plot charts

            function getRandomData() {
                if ( data.length > 0 ) data = data.slice(1);
                // do a random walk
                while (data.length < totalPoints) {
                    var prev = data.length > 0 ? data[data.length - 1] : 50;
                    var y = prev + Math.random() * 10 - 5;
                    if ( y < 0 ) y = 0;
                    if ( y > 100 ) y = 100;
                    data.push(y);
                }
                // zip the generated y values with the x values
                var res = [];
                for (var i = 0; i < data.length; ++ i) {
                    res.push([i, data[i]]);
                }

                return res;
            }

            if ( $('#dashboard-rtm').size() != 1 ) {
                return;
            }
            //server load
            var options = {
                series: {
                    shadowSize: 1
                },
                lines : {
                    show     : true,
                    lineWidth: 0.5,
                    fill     : true,
                    fillColor: {
                        colors: [{
                            opacity: 0.1
                        }, {
                            opacity: 1
                        }]
                    }
                },
                yaxis : {
                    min          : 0,
                    max          : 100,
                    tickColor    : "#eee",
                    tickFormatter: function (v) {
                        return v + "%";
                    }
                },
                xaxis : {
                    show: false,
                },
                colors: [App.colors['amber'], App.colors['teal']],
                grid  : {
                    tickColor  : "#eee",
                    borderWidth: 0,
                }
            };

            var updateInterval = 30;
            var plot = $.plot($("#dashboard-rtm"), [getRandomData()], options);

            function update() {
                plot.setData([getRandomData()]);
                plot.draw();
                setTimeout(update, updateInterval);
            }

            update();
        }.call());
    });
});


