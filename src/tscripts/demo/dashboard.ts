///<reference path="../types.d.ts"/>
import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';
import Chart = require('plugins/chartjs');
import _$epc = require('plugins/easypiechart');
_$epc;
import _$sparkline = require('plugins/sparkline');
_$sparkline;
import _$flot = require('flot');
_$flot;
import _$flotpie = require('flot.pie');
_$flotpie;
import amcharts = require('amcharts/amcharts');
import _$amcharts = require('amcharts/serial'); _$amcharts;
import _$amchartsTheme = require('amcharts/themes/light'); _$amchartsTheme;


class DashboardDemo {
    private app:packadic.App;

    constructor(app:packadic.App) {
        this.app = app;
        $.fn.sparkline.defaults.common.width = '100px';
        $.fn.sparkline.defaults.common.height = '100px';
    }

    public init() {
        this.initRealtimeMonitor();
        this.initAmcharts();
    }

    protected initAmcharts() {
        var chartData = generateChartData();
        console.log(AmCharts);

        var containerElement:HTMLElement = document.getElementById('demo-amchart');

        var chart:AmCharts.AmSerialChart = AmCharts.makeChart(containerElement, {
            "type": "serial",
            "theme": "light",
            "marginRight": 80,
            "dataProvider": chartData,
            "valueAxes": [{
                "position": "left",
                "title": "Unique visitors"
            }],
            "graphs": [{
                "id": "g1",
                "fillAlphas": 0.4,
                "valueField": "visits",
                "balloonText": "<div style='margin:5px; font-size:19px;'>Visits:<b>[[value]]</b></div>"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount": true,
                "color": "#AAAAAA"
            },
            "chartCursor": {
                "categoryBalloonDateFormat": "JJ:NN, DD MMMM",
                "cursorPosition": "mouse"
            },
            "categoryField": "date",
            "categoryAxis": {
                "minPeriod": "mm",
                "parseDates": true
            },
            "export": {
                "enabled": true
            }
        });

        chart.addListener("dataUpdated", zoomChart);

        // when we apply theme, the dataUpdated event is fired even before we add listener, so
        // we need to call zoomChart here
        zoomChart();
        // this method is called when chart is first inited as we listen for "dataUpdated" event
        function zoomChart() {
            // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
            chart.zoomToIndexes(chartData.length - 250, chartData.length - 100);
        }

        chart.write(containerElement);
        // generate some random data, quite different range
        function generateChartData() {
            var chartData = [];
            // current date
            var firstDate:Date = new Date();
            // now set 500 minutes back
            firstDate.setMinutes(firstDate.getDate() - 1000);

            // and generate 500 data items
            for (var i = 0; i < 500; i++) {
                var newDate:Date = new Date(firstDate.toString());
                // each time we add one minute
                newDate.setMinutes(newDate.getMinutes() + i);
                // some random number
                var visits = Math.round(Math.random() * 40 + 10 + i + Math.random() * i / 5);
                // add data item to the array
                chartData.push({
                    date: newDate,
                    visits: visits
                });
            }
            return chartData;
        }
    }

    protected initRealtimeMonitor() {
        if (!jQuery.plot) {
            return;
        }

        var $rtm = $("#dashboard-rtm");

        var data = [];
        var totalPoints = 250;

        // random data generator for plot charts

        function getRandomData() {
            if (data.length > 0) data = data.slice(1);
            // do a random walk
            while (data.length < totalPoints) {
                var prev = data.length > 0 ? data[data.length - 1] : 50;
                var y = prev + Math.random() * 10 - 5;
                if (y < 0) y = 0;
                if (y > 100) y = 100;
                data.push(y);
            }
            // zip the generated y values with the x values
            var res = [];
            for (var i = 0; i < data.length; ++i) {
                res.push([i, data[i]]);
            }

            return res;
        }

        if ($rtm.size() != 1) {
            return;
        }
        //server load
        var options = {
            series: {
                shadowSize: 1
            },
            lines: {
                show: true,
                lineWidth: 0.5,
                fill: true,
                fillColor: {
                    colors: [{
                        opacity: 0.1
                    }, {
                        opacity: 1
                    }]
                }
            },
            yaxis: {
                min: 0,
                max: 100,
                tickColor: "#eee",
                tickFormatter: function (v) {
                    return v + "%";
                }
            },
            xaxis: {
                show: false,
            },
            colors: [this.app.colors['amber'], this.app.colors['teal']],
            grid: {
                tickColor: "#eee",
                borderWidth: 0,
            }
        };

        var updateInterval:number = 30;
        var plot:jquery.flot.plot = $.plot($rtm, [getRandomData()], options);
        var $rtmParent:JQuery = $rtm.parent();
        var checkSizeIntervalId:number;

        console.log('plot dashboard-rtm');

        function checkSize() {
            console.log('plot dashboard-rtm checkSize');
            var minimalWidth:number = $rtmParent.width() - ($rtmParent.outerWidth() - $rtmParent.width());
            if (plot.width() < minimalWidth) {
                plot.resize();
                plot.setupGrid();
                clearInterval(checkSizeIntervalId);
                console.log('plot dashboard-rtm checkSize clearInterval');
            }
        }

        function update() {
            plot.setData([getRandomData()]);
            plot.draw();
            setTimeout(update, updateInterval);
        }

        checkSizeIntervalId = setInterval(checkSize, 100);

        this.app.on('layout:resize', function () {
            plot.resize();
            plot.setupGrid();
        });

        update();
    }
}
export = DashboardDemo;
