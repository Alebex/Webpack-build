"use strict";

const NODE_ENV = process.env.NODE_ENV || 'development';

const webpack = require( 'webpack' ),
    path = require( 'path' ),
    ExtractTextPlugin = require( 'extract-text-webpack-plugin' ),
    CopyWebpackPlugin = require( 'copy-webpack-plugin' ),
    CleanWebpackPlugin = require( 'clean-webpack-plugin' ),
    BowerWebpackPlugin = require( 'bower-webpack-plugin' ),
    HtmlWebpackPlugin = require( 'html-webpack-plugin' ),
    BrowserSyncPlugin = require( 'browser-sync-webpack-plugin' ),
    getEntries = require( 'webpack-entry' );

//==============================
// -- helper function
//==============================
function addHTML( fileName ) {
    let minifyOption = {
        caseSensitive              : true,
        collapseBooleanAttributes  : true,
        collapseInlineTagWhitespace: true,
        collapseWhitespace         : true,
        conservativeCollapse       : true,
        removeComments             : true
    };
    return {
        title   : fileName + ' HTML',
        filename: path.join( config.paths.main, fileName + '.html' ),
        template: path.join( config.paths.view, fileName + '.twig' ),
        inject  : 'body',
        chunks  : [ 'common', fileName ],
        minify  : NODE_ENV == 'production' ? minifyOption : false
    }
}

function entryPoint() {
    const pathToPages = path.join( __dirname, 'frontend', 'js', 'pages' );
    let getEntryPoint = getEntries( pathToPages );
    let entryPoint = {};

    for( let keys in getEntryPoint ) {
        let pathParse = path.parse( getEntryPoint[ keys ] );
        if( NODE_ENV == 'production' && pathParse.name == 'index' ) {
            continue;
        } else {
            entryPoint[ pathParse.name ] = './' + pathParse.name;
        }
    }

    return entryPoint;
}

function addHtmlPlugin( obj ) {
    for( let keys in obj ) {
        plugins.push(
            new HtmlWebpackPlugin( addHTML( keys ) )
        );
    }
}

//==============================
// -- Config object
//==============================
const config = {
    bs        : {
        host  : 'localhost.bs',
        port  : 3010,
        ui    : false,
        server: { baseDir: [ 'public' ] }
    },
    paths     : {
        dev : {
            main: path.join( __dirname, 'frontend' ),
            js  : path.join( __dirname, 'frontend', 'js', 'pages' ),
            scss: path.join( __dirname, 'frontend', 'stylesheets' ),
            img : path.join( __dirname, 'frontend', 'images' )
        },
        json: path.join( __dirname, 'fixtures' ),
        main: path.join( __dirname, 'public' ),
        css : path.join( __dirname, 'public', 'stylesheets' ),
        view: path.join( __dirname, 'view' )
    }
};

//==============================
// -- Plugins
//==============================
// -- webpuck plugins
const plugins = [
    new webpack.NoErrorsPlugin(),
    new webpack.DefinePlugin( {
        NODE_ENV: JSON.stringify( NODE_ENV ),
        LANG    : JSON.stringify( 'ru' ),
        getEntry: JSON.stringify( entryPoint() )
    } ),
    new BrowserSyncPlugin( config.bs, {
        reload: true
    } ),
    new CleanWebpackPlugin( config.paths.main, {
        root   : __dirname,
        verbose: true
    } ),
    new CopyWebpackPlugin( [
        {
            context: config.paths.dev.main,
            from   : 'images/**/*',
            to     : config.paths.main
        }, {
            context: config.paths.dev.main,
            from   : 'fonts/**/*',
            to     : config.paths.main
        }
    ] ),
    new webpack.ProvidePlugin( {
        $     : 'jquery',
        jQuery: 'jquery'
    } ),
    new webpack.ResolverPlugin(
        new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin( ".bower.json", [ "main" ] )
    ),
    new BowerWebpackPlugin( {
        modulesDirectories             : [ "bower_components" ],
        manifestFiles                  : "bower.json",
        includes                       : /.js$/,
        searchResolveModulesDirectories: true
    } ),
    new ExtractTextPlugin( path.join( 'stylesheets', 'style.css' ), { allChunks: true } ),
    new webpack.optimize.CommonsChunkPlugin( {
        name     : 'common',
        minChunks: 2
    } )
];

addHtmlPlugin( entryPoint() );

//==============================
// -- Webpack export module
//==============================
const webpackExports = {
    context      : config.paths.dev.js,
    entry        : entryPoint(),
    output       : {
        path      : config.paths.main + '/',
        publicPath: '/',
        filename  : "[name].js",
        library   : "[name]"
    },
    watch        : NODE_ENV == 'development',
    watchOptions : { aggregateTimeout: 100 },
    devtool      : NODE_ENV == 'development' ? 'cheap-inline-module-source-map' : null,
    resolve      : {
        modulesDirectories: [
            'node_modules',
            'bower_components',
            'view',
            config.paths.dev.scss,
            config.paths.json
        ],
        extensions        : [ '', '.js', '.twig', '.scss', '.json' ]
    },
    resolveLoader: {
        modulesDirectories: [ 'node_modules' ],
        moduleTemplates   : [ '*-loader', '*' ],
        extensions        : [ '', '.js' ]
    },
    plugins      : plugins,
    module       : {
        loaders: [ {
            test   : /\.js$/,
            include: config.paths.dev.main,
            loader : 'babel?presets[]=es2015'
        }, {
            test  : /\.scss$/,
            loader: ExtractTextPlugin.extract( [
                'css',
                'postcss',
                'sass'
            ] )
        }, {
            test   : /\.twig$/,
            include: config.paths.twig,
            loader : 'twig'
        }, {
            test   : /\.json$/,
            include: config.paths.json,
            loader : 'json'
        } ],
        node   : {
            fs: "empty"
        },
        noParse: [
            /angular\/angular.js/
        ]
    },
    postcss      : [
        require('autoprefixer')( {
            browsers: [ 'IE 10', 'IE 11', 'firefox 20', 'ios_saf 8.4', 'android 4.3' ]
        } ),
        require('postcss-short')()
    ],
    sassLoader: {
        outputStyle: NODE_ENV == 'development' ? 'nested' : 'compressed'
    }
};

// -- minify js code from production
if( NODE_ENV == 'production' ) {
    webpackExports.output.publicPath = '';
    plugins.push(
        new webpack.optimize.UglifyJsPlugin( {
            compress: {
                warnings    : false,
                drop_console: true,
                unsafe      : true
            }
        } )
    );
}

/**
 * @todo development 'npm start', production 'npm run prod'
 */

module.exports = webpackExports;