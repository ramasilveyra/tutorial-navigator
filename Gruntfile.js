var pkg = require('./package');

var minorVersion = pkg.version.replace(/\.(\d)*$/, '');
var majorVersion = pkg.version.replace(/\.(\d)*\.(\d)*$/, '');
var path = require('path');
var join = path.join;
var fs = require('fs');
var read = fs.readFileSync;

module.exports = function (grunt) {

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    connect: {
      dev: {
        options: {
          // base: "test",
          hostname: '*',
          // base: ['.','example'],
          port: 8989,
          middleware: function (connect, options) {
            return [
              connect.static(__dirname),
              function routing(req, res, next) {
                if (!/^\/routing/.test(req.originalUrl)) return next();
                res.end(read(join(__dirname, 'example/routing.html')));
              },
              function basic(req, res, next) {
                res.end(read(join(__dirname, 'example/index.html')));
              }
            ]
          }
        }
      },
    },
    watch: {
      dev: {
        files: ['*', 'lib/**/*'],
        tasks: ["shell:component_install", "shell:component_build"]
      }
    },
    clean: [
      'release/'
    ],

    shell: {
      component_install: {
        command: './node_modules/.bin/component-install'
      },
      component_build: {
        command: './node_modules/.bin/component-build'
      },
      component_build_release: {
        command: './node_modules/.bin/component-build --out release'
      }
    },

    s3: {
      options: {
        key:    process.env.S3_KEY,
        secret: process.env.S3_SECRET,
        bucket: process.env.S3_BUCKET,
        access: 'public-read',
        headers: {
          'Cache-Control':  'public, max-age=300'
        }
      },
      clean: {
        del: [
          // { src:     'tutorial-navigator-' + majorVersion + '/index.html', },
          // { src:     'tutorial-navigator-' + majorVersion + '/index.css', },
          // { src:     'tutorial-navigator-' + minorVersion + '/index.html', },
          // { src:     'tutorial-navigator-' + minorVersion + '/index.css', },
          // { src:     'tutorial-navigator/' + pkg.version  + '/index.html', },
          // { src:     'tutorial-navigator/' + pkg.version  + '/index.css', },
          // { src:     'tutorial-navigator/index.html', },
          // { src:     'tutorial-navigator/index.css', },
        ]
      },
      publish: {
        upload: [{
          // src:    'release/*',
          // dest:   'tutorial-navigator/' + minorVersion + '/',
          // options: { gzip: false }
        // }, {
          // src:    'release/*',
          // dest:   'tutorial-navigator-' + majorVersion + '/',
          // options: { gzip: false }
        // }, {
          rel:    'release',
          src:    'release/**/*',
          dest:   'tutorial-navigator/' + pkg.version + '/',
          options: { gzip: false }
        // }, {
        //   src:    'release/*',
        //   dest:   'tutorial-navigator/',
        //   options: { gzip: false }
        }]
      }
    },
    maxcdn: {
      purgeCache: {
        options: {
          companyAlias:   process.env.MAXCDN_COMPANY_ALIAS,
          consumerKey:    process.env.MAXCDN_CONSUMER_KEY,
          consumerSecret: process.env.MAXCDN_CONSUMER_SECRET,
          zone_id:        process.env.MAXCDN_ZONE_ID,
          method:         'delete'
        },
        files: [
          // { src:     'tutorial-navigator-' + majorVersion + '/index.html', },
          // { src:     'tutorial-navigator-' + majorVersion + '/index.css', },
          // { src:     'tutorial-navigator-' + minorVersion + '/index.html', },
          // { src:     'tutorial-navigator-' + minorVersion + '/index.css', },
          // { src:     'tutorial-navigator-' + pkg.version  + '/index.html', },
          // { src:     'tutorial-navigator-' + pkg.version  + '/index.css', },
          // { src:     'tutorial-navigator/index.html', },
          // { src:     'tutorial-navigator/index.css', }
        ],
      },
    }
  });

  grunt.registerTask('dev', ['connect', 'watch'])
  grunt.registerTask('build', ['clean', 'shell:component_install', 'shell:component_build_release']);
  grunt.registerTask('cdn', ['build', 's3', 'maxcdn']);
  grunt.registerTask('default', ['build']);
};