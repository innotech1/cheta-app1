module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // No manual reanimated/worklets plugin here on purpose: babel-preset-expo
    // auto-detects react-native-worklets in node_modules and configures its
    // Babel plugin itself. Adding it manually as well causes a duplicate-plugin
    // conflict. See: https://docs.expo.dev/versions/latest/sdk/reanimated/
  };
};
