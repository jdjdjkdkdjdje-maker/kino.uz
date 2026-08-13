import 'dart:async';
import 'package:dio/dio.dart';
import '../constants/app_constants.dart';
import 'token_storage.dart';

class ApiClient {
  final TokenStorage tokens;
  late final Dio dio;
  Completer<bool>? _refreshing;

  ApiClient(this.tokens) {
    dio = Dio(BaseOptions(
      baseUrl: AppConstants.apiBaseUrl,
      connectTimeout: const Duration(seconds: 60),
      receiveTimeout: const Duration(seconds: 120),
      sendTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json'},
    ));
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await tokens.access;
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        handler.next(options);
      },
      onResponse: (response, handler) {
        // Bepul Render uyg‘onayotganda vaqtincha HTML loading sahifasini 200 bilan
        // qaytarishi mumkin. Uni JSON deb parse qilish o‘rniga retry qilinadigan 503 ga aylantiramiz.
        if (response.data is String && (response.data as String).trimLeft().startsWith('<')) {
          handler.reject(DioException(
            requestOptions: response.requestOptions,
            response: Response(
              requestOptions: response.requestOptions,
              statusCode: 503,
              data: {'message': 'Server ishga tushmoqda.'},
            ),
            type: DioExceptionType.badResponse,
          ));
          return;
        }
        handler.next(response);
      },
      onError: (error, handler) async {
        if (error.response?.statusCode == 401 && error.requestOptions.extra['authRetried'] != true && await _refresh()) {
          try {
            final options = error.requestOptions;
            options.extra['authRetried'] = true;
            options.headers['Authorization'] = 'Bearer ${await tokens.access}';
            handler.resolve(await dio.fetch(options));
            return;
          } catch (_) {}
        }
        if (_canRetry(error)) {
          final options = error.requestOptions;
          final attempt = (options.extra['networkRetry'] as int?) ?? 0;
          if (attempt < 2) {
            options.extra['networkRetry'] = attempt + 1;
            await Future<void>.delayed(Duration(seconds: 5 * (attempt + 1)));
            try {
              handler.resolve(await dio.fetch(options));
              return;
            } catch (_) {}
          }
        }
        handler.next(error);
      },
    ));
  }

  bool _canRetry(DioException error) {
    if (!['GET', 'HEAD'].contains(error.requestOptions.method.toUpperCase())) return false;
    if (error.type == DioExceptionType.connectionError ||
        error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) return true;
    return const {408, 429, 500, 502, 503, 504}.contains(error.response?.statusCode);
  }

  Future<bool> _refresh() async {
    if (_refreshing != null) return _refreshing!.future;
    _refreshing = Completer<bool>();
    try {
      final token = await tokens.refresh;
      if (token == null) {
        _refreshing!.complete(false);
        return false;
      }
      final plain = Dio(BaseOptions(
        baseUrl: AppConstants.apiBaseUrl,
        connectTimeout: const Duration(seconds: 60),
        receiveTimeout: const Duration(seconds: 120),
      ));
      final response = await plain.post('/auth/refresh', data: {'refreshToken': token});
      await tokens.save(response.data['accessToken'], response.data['refreshToken']);
      _refreshing!.complete(true);
      return true;
    } catch (_) {
      await tokens.clear();
      _refreshing!.complete(false);
      return false;
    } finally {
      _refreshing = null;
    }
  }
}
