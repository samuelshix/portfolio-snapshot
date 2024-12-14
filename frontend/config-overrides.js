const webpack = require('webpack');

module.exports = function override(config) {
    config.resolve.fallback = {
        "crypto": require.resolve("crypto-browserify"),
        "stream": require.resolve("stream-browserify"),
        "http": require.resolve("stream-http"),
        "https": require.resolve("https-browserify"),
        "zlib": require.resolve("browserify-zlib"),
        "url": require.resolve("url/"),
        "process": require.resolve("process/browser"), // Add this line
        "buffer": require.resolve("buffer/")  // Add this line
    };

    config.plugins = [
        ...config.plugins,
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer']
        }),
    ];

    // Add this to handle the process/browser resolution
    config.resolve.alias = {
        ...config.resolve.alias,
        'process/browser': require.resolve('process/browser')
    };

    return config;
};