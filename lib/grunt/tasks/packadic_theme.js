/*
 * grunt-minscript-tpl
 *
 *
 * Copyright (c) 2014 Robin Radic
 * Licensed under the MIT license.
 */

'use strict';
var radic = require( 'radic' ),
    util = radic.util,
    bin = radic.binwraps,
    git = radic.git,
    path = require( 'path' ),
    fs = require( 'fs-extra' ),
    async = require( 'async' ),
    _ = require( 'lodash' ),
    glob = require( 'glob' ),
    globule = require( 'globule' ),
    rimraf = require( 'rimraf' ),
    preprocess = require( 'preprocess' );


module.exports = function ( grunt ) {

    function clean( pattern, options ) {

        glob.sync( pattern, {} ).forEach( function ( filepath ) {

            // Only delete cwd or outside cwd if --force enabled. Be careful, people!
            if ( !options.force ) {
                if ( grunt.file.isPathCwd( filepath ) ) {
                    grunt.verbose.error();
                    grunt.fail.warn( 'Cannot delete the current working directory.' );
                    return false;
                } else if ( !grunt.file.isPathInCwd( filepath ) ) {
                    grunt.verbose.error();
                    grunt.fail.warn( 'Cannot delete files outside the current working directory.' );
                    return false;
                }
            }

            try {
                // Actually delete. Or not.
                if ( !options[ 'no-write' ] ) {
                    rimraf.sync( filepath );
                }
                grunt.verbose.writeln( (options[ 'no-write' ] ? 'Not actually cleaning ' : 'Cleaning ') + filepath + '...' );
            } catch (e) {
                grunt.log.error();
                grunt.fail.warn( 'Unable to delete "' + filepath + '" file (' + e.message + ').', e );
            }
        } );
    }

    grunt.registerTask( 'packadic', 'Intialize the project', function ( target ) {
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options( {
            variables: {},
            dir: 'dev',
            dist: 'dist',
            distRepo: 'packadic/packadic.github.io',
            distBranch: 'master',
            srcRepo: 'packadic/ghpages-theme',
            header: {
                path: 'dev/threading'

            }

        } );

        if ( target === 'init' ) {
            // create dist dir & chdir into it
            fs.mkdirpSync( options.affwdir );
            process.chdir( 'dist' );
            ok( 'created dist' );

            // check out the remote
            git( 'init' );
            git( 'remote', 'add', 'origin', 'https://github.com/' + options.distRepo );
            git( 'pull origin ' + options.distBranch );
            ok( 'pulled origin ' + options.distBranch );


            process.chdir( cwd );
        }

        taskDone();
    } );

    grunt.registerTask( 'packadic_src2dev', 'The best Grunt plugin ever.', function () {
        var self = this;
        var taskDone = this.async();
        var cwd = process.cwd();
        var ok = grunt.log.ok;
        var options = this.options( {
            variables: {},
            dir: 'dev',
            clean: true
        } );

        // clean first
        if(options.clean) {
            clean( options.dir + '/*', {force: false, 'no-write': false} );
            ok( 'Cleaned up dir: ' + options.dir );
        }
        fs.ensureDirSync( options.dir );
        ok( 'Created dir: ' + options.dir );
        globule.find(['src/*','!src/Guardfile'] ).forEach(function(file){
            grunt.log.ok(file);
            fs.copySync( file, file.replace('src/', options.dir + '/' ));
        });

        ok( 'Copied all files: ' + options.dir );

        var dirs = [
            path.join( options.dir, '_includes/_layouts' )
        ];
        dirs.forEach( function ( dir ) {
            var files = fs.readdirSync( dir );
            files.forEach( function ( file ) {
                var filePath = path.join( dir, file )
                preprocess.preprocessFileSync( filePath, filePath, options.variables );
                ok( 'Preprocessed ' + filePath );
            } );
        } );
        //fs.removeSync(path.join(options.dir, '_includes/partials'));
        //ok('Removed partials');

        taskDone();
    } );

};
