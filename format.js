#!/usr/bin/env node
var exec  = require('child_process').exec,
    spawn = require('child_process').spawn;
var stdin = process.openStdin();
var styles = {
    default: {
        cmd: [ 'log', 'master', '--date=short', "--format=[%cd](https://github.com/robinradic/blade-extensions/commit/%H) %gs %s", '--shortstat', '--since="2015-02-01"' ],
        exp: new RegExp('\[(\d\d\d\d-\d\d-\d\d)\]\((.*)\)\s(.*)\n\n(.*)', 'g'),
        fn: function(data){
            var matches = this.exp.exec(data);
            console.log(data, matches, matches.length);
            process.exit();
        }
    }
};
var data = "";

var args = process.argv;
var arg = args[ 2 ];

function a(){
    var start = (new Date()).getTime() / 1000;

    var fs = require('fs');
    var filePath = process.cwd() + '/.tmpf';
    fs.unlinkSync(filePath);
    var file = fs.createWriteStream(filePath);

    var cmd = spawn('git', styles[ arg ].cmd);
    data = "";
    cmd.stdout.on('data', function( data ){
        file.write(data);
    });

    cmd.stdout.on('end', function( data ){
        file.end();
        var content = fs.readFileSync(filePath, 'utf-8');
        styles[arg ].fn(content);
        var end = (new Date()).getTime() / 1000;
        console.log(end - start);
    });

    cmd.on('exit', function( code ){
        if( code != 0 ){
            console.log('Failed: ' + code);
        } else {
            console.log('done');
        }
    });

}

function b(){
    var start = (new Date()).getTime() / 1000;
    exec('git ' + styles[ arg ].cmd.join(' ') + ' > .temp', function(err, stdout, stderr){
        styles[arg ].fn(stdout);
        var end = (new Date()).getTime() / 1000;
        console.log(end - start);

        process.exit();
    });
}
a();
