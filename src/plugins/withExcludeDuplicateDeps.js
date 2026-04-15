const {
  withAppBuildGradle,
  withProjectBuildGradle,
} = require("expo/config-plugins");

/**
 * Expo config plugin that fixes duplicate class errors during Android builds:
 * 1. androidsvg JAR vs androidsvg-aar from react-native-svg
 * 2. GeneratedAppGlideModuleImpl from @d11/react-native-fast-image's annotation processor
 */
module.exports = function withExcludeDuplicateDeps(config) {
  // Fix 1: Exclude androidsvg JAR at app level (react-native-svg uses androidsvg-aar)
  config = withAppBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    const snippet = `
// Exclude duplicate androidsvg JAR — react-native-svg uses the AAR variant (added by config plugin)
configurations.all {
    exclude group: 'com.caverock', module: 'androidsvg'
}`;

    if (!buildGradle.includes("exclude group: 'com.caverock'")) {
      config.modResults.contents = buildGradle.replace(
        /^}(\s*\n\/\/ Apply static values)/m,
        `}\n${snippet}\n$1`,
      );
    }

    return config;
  });

  // Fix 2: Tell @d11/react-native-fast-image to exclude its AppGlideModule
  // so it doesn't generate a duplicate GeneratedAppGlideModuleImpl
  config = withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;

    const snippet = `
// Prevent @d11/react-native-fast-image duplicate GlideModule (added by config plugin)
project.ext {
    excludeAppGlideModule = true
}`;

    if (!buildGradle.includes("excludeAppGlideModule")) {
      config.modResults.contents = buildGradle + "\n" + snippet + "\n";
    }

    return config;
  });

  return config;
};