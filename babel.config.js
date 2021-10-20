module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          esmodules: true,
        },
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/proposal-object-rest-spread', { loose: true }],
    // '@babel/plugin-transform-runtime',
  ],
}
