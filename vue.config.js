module.exports = {
    productionSourceMap: true,
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