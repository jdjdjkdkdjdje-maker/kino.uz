import 'package:dio/dio.dart';
class AppException implements Exception { final String message; const AppException(this.message); @override String toString()=>message; }
String friendlyError(Object error) {
  if (error is AppException) return error.message;
  if (error is DioException) {
    if (error.type == DioExceptionType.connectionError) return 'Internet aloqasini tekshiring.';
    if (error.type == DioExceptionType.connectionTimeout || error.type == DioExceptionType.receiveTimeout || const {502,503,504}.contains(error.response?.statusCode)) {
      return 'Server ishga tushmoqda. Bir daqiqa kutib, “Qayta urinish”ni bosing.';
    }
    final data=error.response?.data;
    if(data is Map && data['message']!=null){final m=data['message'];return m is List?m.join(', '):m.toString();}
    if((error.response?.statusCode??0)>=500)return 'Server bilan bog‘lanib bo‘lmadi.';
  }
  return 'Kutilmagan xatolik yuz berdi.';
}
