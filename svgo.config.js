module.exports = {
  multipass: true,
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          convertPathData: {
            floatPrecision: 0,
            transformPrecision: 0,
          },
        },
      },
    },
  ],
};
