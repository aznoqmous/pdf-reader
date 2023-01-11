const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: "./src/index.js",
    },
    mode: "production",
    output: {
        filename: "[name].min.js",
        path: __dirname + "/dist"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                    },
                    {loader: "css-loader"},
                    {loader: "postcss-loader"},
                    {loader: "sass-loader"},
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].min.css",
            chunkFilename: "[id].min.css"
        })
    ],
};