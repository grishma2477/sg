module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./'],
        alias: {
          '@': './',
          '@components': './components',
          '@hooks': './hooks',
          '@store': './store',
          '@api': './api',
          '@constants': './constants',
          '@tasks': './tasks',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
