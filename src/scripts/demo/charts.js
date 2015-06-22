require([
    'jquery', 'fn/defined', 'fn/default', 'fn/cre', 'plugins/chartjs',
    'flot', 'flot.pie'
], function ($, defined, def, cre, Chart) {
    "use strict";
    Chart.defaults.global = packadic.config.chartjsGlobal;


    function init(){
        var data = {
            labels: ["January", "February", "March", "April", "May", "June", "July"],
            datasets: [
                {
                    label: "My First dataset",
                    fillColor: "rgba(220,220,220,0.2)",
                    strokeColor: "rgba(220,220,220,1)",
                    pointColor: "rgba(220,220,220,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(220,220,220,1)",
                    data: [65, 59, 80, 81, 56, 55, 40]
                },
                {
                    label: "My Second dataset",
                    fillColor: "rgba(151,187,205,0.2)",
                    strokeColor: "rgba(151,187,205,1)",
                    pointColor: "rgba(151,187,205,1)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgba(151,187,205,1)",
                    data: [28, 48, 40, 19, 86, 27, 90]
                }
            ]
        };

        return {
            lineChart:  new Chart($('#chartjs_line').get(0).getContext("2d")).Line(data, {
                bezierCurve: false
            }),
            barChart: new Chart($('#chartjs_bar').get(0).getContext("2d")).Bar(data, {
                barShowStroke: false
            }),
            radarChart: new Chart($('#chartjs_radar').get(0).getContext("2d")).Radar(data, {
                pointDot: false
            })
        };
    };

    $(function(){
        window.packadic.demoCharts = init();
        window.packadic.demoCharts.doit = function() {
            $.each(window.packadic.demoCharts, function (i, chart) {
                chart.chart.width = $(chart.chart.canvas).closest('section').innerWidth();
                chart.chart.height = $(chart.chart.canvas).closest('section').innerHeight();
                chart.resize();
                chart.reflow();
                chart.update();
            })
        };
    });

});


