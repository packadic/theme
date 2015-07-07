///<reference path="../typings/tsd.d.ts"/>
import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';
import Chart = require('plugins/chartjs');
import _$epc = require('plugins/easypiechart'); _$epc;
import _$sparkline = require('plugins/sparkline'); _$sparkline;
import _$flot = require('flot'); _$flot;
import _$flotpie = require('flot.pie'); _$flotpie;





class DashboardDemo {
    private app:packadic.App;

    constructor(app:packadic.App){
        this.app = app;
        $.fn.sparkline.defaults.common.width = '100px';
        $.fn.sparkline.defaults.common.height = '100px';
    }

    public init(){
        this.initRealtimeMonitor();
    }

    protected initRealtimeMonitor(){
        if ( ! jQuery.plot ) {
            return;
        }

        var $rtm = $("#dashboard-rtm");

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

        if ( $rtm.size() != 1 ) {
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
            colors: [this.app.colors['amber'], this.app.colors['teal']],
            grid  : {
                tickColor  : "#eee",
                borderWidth: 0,
            }
        };

        var updateInterval:number = 30;
        var plot:jquery.flot.plot = $.plot($rtm, [getRandomData()], options);
        var $rtmParent:JQuery = $rtm.parent();
        var checkSizeIntervalId:number;

        console.log('plot dashboard-rtm');

        function checkSize(){
            console.log('plot dashboard-rtm checkSize');
            var minimalWidth:number = $rtmParent.width() - ($rtmParent.outerWidth() - $rtmParent.width());
            if(plot.width() < minimalWidth){
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

        this.app.on('layout:resize', function(){
            plot.resize();
            plot.setupGrid();
        });

        update();
    }
}
export = DashboardDemo;
