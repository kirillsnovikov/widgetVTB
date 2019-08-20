module.exports = {
    productionSourceMap: false,
    configureWebpack: {
        optimization: {
            splitChunks: false
        },
        output: {
            // filename: 'js/[name].js',
            filename: 'js/auth.js',
        }
    }
}