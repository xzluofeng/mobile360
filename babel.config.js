module.exports = {
  presets: [
    '@vue/app'
  ],
  plugins: [
    // ['import', {
    //   libraryName: 'vant',
    //   libraryDirectory: 'es',
    //   style: true
    // }, 'vant']
    // ['autoprefixer', {
    //   browsers: ['Android >= 4.0', 'iOS >= 7']
    // }],
    // ['postcss-pxtorem', {
    //   rootValue: 37.5,
    //   propList: ['*']
    // }]
    [
      'import',
      {
        libraryName: 'vant',
        libraryDirectory: 'es',
        // 指定样式路径
        style: name => `${name}/style/less`
      },
      'vant'
    ]
  ]
}
