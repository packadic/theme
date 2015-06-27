'use strict';
var path = require('path');
var eachAsync = require('each-async');
var assign = require('object-assign');
var sass = require('node-sass');
var fs = require('fs-extra');

module.exports = function (grunt) {
	grunt.verbose.writeln('\n' + sass.info + '\n');

	grunt.registerMultiTask('sassc', 'Compile Sass to CSS using the C libsass', function () {
		eachAsync(this.files, function (el, i, next) {
			var opts = this.options({
				precision: 10
			});

			var src = el.src[0];

			if (!src || path.basename(src)[0] === '_') {
				next();
				return;
			}

			sass.render(assign({}, opts, {
				file: src,
				outFile: el.dest
			}), function (err, res) {
				if (err) {
					grunt.log.error(err.message + '\n  ' + 'Line ' + err.line + '  Column ' + err.column + '  ' + path.relative(process.cwd(), err.file) + '\n');
					grunt.warn('');
					next(err);
					return;
				}


				grunt.file.write(el.dest, res.css);

				if (opts.sourceMap) {
					grunt.file.write(this.options.sourceMap, res.map.toString().replace(/(?:\.\.\/)*src/g, '/home/radic/theme/src'));
                    //grunt.log.writeln(res.map.toString().replace('a', 'm').replace(/(?:\.\.\/)*src/g, '/home/radic/theme/src'));
                    //var news = fs.readFileSync(this.options.sourceMap, 'UTF-8');
                    //fs.writeFileSync
                    //grunt.log.writeln(res.map);
				}

				next();
			});
		}.bind(this), this.async());
	});
};
