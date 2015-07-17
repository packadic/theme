///<reference path="../types.d.ts"/>
/// <amd-dependency path="amcharts/serial">
/// <amd-dependency path="amcharts/themes/light">

import $ = require('jquery');
import packadic = require('packadic');
import {defined,def,cre} from 'app/util';
import amcharts = require('amcharts/amcharts');

interface GAColumnHeader {
    columnType?:string;
    dataType?:string;
    name?:string;
    key?:number;
}

class GoogleAnalyticsDataWrapper {
    protected data:any;

    protected columnNameRowKeys:any;

    constructor(data:any) {
        this.data = data;
        this.columnNameRowKeys = {};
    }

    public getAllSorted() {
        var self:GoogleAnalyticsDataWrapper = this;
        var all = [];

        _.each(self.data.rows, function (row, rowi) {
            var thisRow = {};
            _.each(self.data.columnHeaders, function (col:GAColumnHeader, coli:number) {
                // console.log('each coldata', col, coli);
                // console.log(col.name, row, rowi, coli, row[coli]);
                thisRow[col.name] = row[coli];
            });
            all.push(thisRow);
        });
        return all;
    }

    public hasMetric(metricName:string):boolean {
        return defined(this.data.query.metrics[metricName]);
    }

    public hasColumn(columnName:string):boolean {
        return _.where(this.data.columnHeaders, {'name': columnName}).length > 0;
    }

    public getColumn(columnName:string):GAColumnHeader {
        var key;
        if (defined(this.columnNameRowKeys[columnName])) {
            key = this.columnNameRowKeys[columnName];
        } else {
            key = _.findKey(this.data.columnHeaders, {'name': columnName});
            if (defined[key]) {
                this.columnNameRowKeys[columnName] = parseInt(key);
            }
        }
        if (!defined(key)) return {};

        var column = _.clone(this.data.columnHeaders[key]);
        column['key'] = parseInt(key);
        return column;
    }

    public getRows(columnName:string):any {
        if (!this.hasColumn(columnName)) {
            return {};
        }
        var column:GAColumnHeader = this.getColumn(columnName);
        var rows = _.map(this.data.rows, function (v:any) {
            return v[column.key]
        });
        return rows;
    }

    public get length():number {
        return this.data.totalResults;
    }

    public getTotals() {
        return _.map(this.data.totalsForAllResults, function (v:any) {
            return v.replace('ga:', '');
        });
    }

    public getTotal(name:string):any {
        if (!defined(this.data.totalsForAllResults[name])) return null;
        return this.data.totalsForAllResults[name]
    }

}
class AmChartsDemo {
    private app:packadic.App;

    constructor(app:packadic.App) {
        this.app = app;
    }

    public init() {
        $(function () {
            this.initChart1();
        }.bind(this));
    }


    protected getData(type:string = 'overview'):JQueryXHR {
        var opts:any = {
            url: '/demo/google-analytics-' + type + '.json',
            dataType: 'json',
            /*success: function (data:any) {
             console.log('google data:', data);
             var gdata = new GoogleAnalyticsDataWrapper(data);
             window['gdata'] = gdata;
             var col = gdata.getColumn('ga:pageviews');
             console.log('col:', col);
             var rows = gdata.getRows('ga:pageviews');
             console.log('rows: ', rows);
             console.log('length: ', gdata.length);
             console.log('totals: ', gdata.getTotals());
             console.log('total pageviews: ', gdata.getTotal('ga:pageviews'));
             },
             error: function () {
             console.log('getdata fail', arguments);
             }*/
        };
        return $.ajax(opts);
    }

    public initChart1() {
        var containerElement:HTMLElement = document.getElementById('demo-chart1');
        var chartData:any = {
            "type": "serial",
            "categoryField": "category",
            "angle": 30,
            "depth3D": 30,
            "startDuration": 1,
            "theme": "light",
            "categoryAxis": {
                "gridPosition": "start"
            },
            "trendLines": [],
            "graphs": [
                {
                    "balloonText": " [[value]] [[title]] ([[category]])",
                    "fillAlphas": 1,
                    "gapPeriod": 1,
                    "id": "pageviews",
                    "lineThickness": 0,
                    "title": "Pageviews",
                    "type": "column",
                    "valueField": "ga:pageviews",
                    "xField": "ga:day"
                }
            ],
            "guides": [],
            "valueAxes": [
                {
                    "id": "ValueAxis-1",
                    "title": "Pageviews"
                }
            ],
            "allLabels": [],
            "balloon": {},
            "legend": {
                "useGraphSettings": true
            },
            "titles": [
                {
                    "id": "Title-1",
                    "size": 15,
                    "text": "Pageviews last month"
                }
            ],
            "dataProvider": [],

            "export": {
                "enabled": true
            }

        };

        this.getData().then(function (data:any) {
            var gdata = new GoogleAnalyticsDataWrapper(data);
            window['gdata'] = gdata;
            chartData['dataProvider'] = _.map(gdata.getAllSorted(), function (row) {
                row['category'] = row['ga:day'] + '/' + row['ga:month'];
                return row;
            });
            var chart:AmCharts.AmSerialChart = amcharts.makeChart(containerElement, chartData);
            chart.write(containerElement);

        }, function () {
            console.log('getdata fail', arguments);
        });
    }
}
export = AmChartsDemo;
