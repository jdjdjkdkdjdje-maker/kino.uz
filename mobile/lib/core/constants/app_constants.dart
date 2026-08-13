class AppConstants {
  static const appName = 'KinoTV';

  static const _configuredApiBaseUrl = String.fromEnvironment('API_BASE_URL');
  static const _productionApiBaseUrl =
      'https://kinotv-api-jdjdjkdkdjdje-019ffa27.onrender.com/api/v1';

  // Eski CI namunaviy manzili bilan yig‘ilgan APK ham production APIga ulanadi.
  static const apiBaseUrl = _configuredApiBaseUrl == '' ||
          _configuredApiBaseUrl == 'https://api.example.uz/api/v1'
      ? _productionApiBaseUrl
      : _configuredApiBaseUrl;

  static const pageSize = 20;
}
