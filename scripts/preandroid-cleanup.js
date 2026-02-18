const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const root = process.cwd();
const gradleHome = path.join(os.homedir(), '.gradle');
const targets = [
  path.join(root, 'node_modules', '@react-native', 'gradle-plugin', 'shared', 'build'),
  path.join(root, 'node_modules', '@react-native', 'gradle-plugin', 'settings-plugin', 'build'),
  path.join(root, 'node_modules', '@react-native', 'gradle-plugin', 'react-native-gradle-plugin', 'build'),
  path.join(root, 'android', 'build'),
  path.join(root, 'android', 'app', 'build'),
  path.join(root, 'android', '.gradle'),
  path.join(root, 'android', '.cxx'),
  path.join(root, 'android', 'app', '.cxx'),
];

if (process.platform === 'win32') {
  try {
    execSync('cmd /c "cd android && gradlew.bat --stop"', {
      stdio: 'ignore',
      cwd: root,
    });
  } catch (_) {}
}

if (process.platform === 'win32') {
  try {
    execSync('cmd /c "attrib -R /S /D node_modules\\@react-native\\gradle-plugin\\*.*"', {
      stdio: 'ignore',
      cwd: root,
    });
  } catch (_) {}
}

const gradleCachesDir = path.join(gradleHome, 'caches');
if (fs.existsSync(gradleCachesDir)) {
  try {
    const versionCacheDirs = fs
      .readdirSync(gradleCachesDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => path.join(gradleCachesDir, entry.name));

    for (const versionDir of versionCacheDirs) {
      const transformDirs = fs
        .readdirSync(versionDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && entry.name.startsWith('transforms'))
        .map((entry) => path.join(versionDir, entry.name));

      for (const dir of transformDirs) {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  } catch (_) {}
}

for (const dir of targets) {
  try {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (_) {}
}

console.log('Pre-android cleanup complete.');
