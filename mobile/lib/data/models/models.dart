num _num(dynamic value) => value is num ? value : num.tryParse(value?.toString() ?? '') ?? 0;

class CategoryModel {
  final String id, name, slug;
  final String? icon;
  const CategoryModel({required this.id, required this.name, required this.slug, this.icon});
  factory CategoryModel.fromJson(Map<String, dynamic> json) => CategoryModel(
    id: json['id'] ?? '', name: json['name'] ?? '', slug: json['slug'] ?? '', icon: json['icon']);
}

class MovieModel {
  final String id, title, description, posterUrl, bannerUrl, language, country;
  final String? originalTitle, trailerUrl, subtitleUrl, videoUrl;
  final bool hasFullVideo, isLicensedVideo;
  final int releaseYear, durationMinutes, positionSeconds;
  final double rating, progress;
  final List<CategoryModel> categories, genres;
  final List<String> actors, directors;
  final List<MovieModel> similar;
  const MovieModel({required this.id, required this.title, required this.description,
    required this.posterUrl, required this.bannerUrl, required this.releaseYear,
    required this.durationMinutes, required this.rating, required this.language,
    required this.country, this.videoUrl, this.originalTitle, this.trailerUrl,
    this.subtitleUrl, this.hasFullVideo = false, this.isLicensedVideo = false, this.categories = const [], this.genres = const [], this.actors = const [],
    this.directors = const [], this.similar = const [], this.progress = 0, this.positionSeconds = 0});
  factory MovieModel.fromJson(Map<String, dynamic> json) {
    final movie = Map<String, dynamic>.from(json['movie'] is Map ? json['movie'] as Map : json);
    List<CategoryModel> categories(dynamic value) => ((value as List?) ?? [])
        .whereType<Map>().map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e))).toList();
    List<String> people(dynamic value) => ((value as List?) ?? [])
        .map((e) => e is Map ? e['name'].toString() : e.toString()).toList();
    return MovieModel(
      id: movie['id'] ?? '', title: movie['title'] ?? '', originalTitle: movie['originalTitle'],
      description: movie['description'] ?? '', posterUrl: movie['posterUrl'] ?? '',
      bannerUrl: movie['bannerUrl'] ?? movie['posterUrl'] ?? '',
      releaseYear: _num(movie['releaseYear']).toInt(), durationMinutes: _num(movie['durationMinutes']).toInt(),
      rating: _num(movie['rating']).toDouble(), language: movie['language'] ?? '', country: movie['country'] ?? '',
      videoUrl: movie['videoUrl'], trailerUrl: movie['trailerUrl'], subtitleUrl: movie['subtitleUrl'],
      hasFullVideo: movie['hasFullVideo'] ?? (movie['isLicensedVideo'] == true && movie['videoUrl'] != null),
      isLicensedVideo: movie['isLicensedVideo'] ?? false, categories: categories(movie['categories']), genres: categories(movie['genres']),
      actors: people(movie['actors']), directors: people(movie['directors']),
      similar: ((json['similar'] as List?) ?? []).whereType<Map>()
          .map((e) => MovieModel.fromJson(Map<String, dynamic>.from(e))).toList(),
      progress: _num(json['progress']).toDouble(), positionSeconds: _num(json['positionSeconds']).toInt());
  }
}

class ProgramModel {
  final String id, title, description;
  final DateTime startsAt, endsAt;
  const ProgramModel({required this.id, required this.title, required this.description, required this.startsAt, required this.endsAt});
  factory ProgramModel.fromJson(Map<String, dynamic> json) => ProgramModel(id: json['id'] ?? '',
    title: json['title'] ?? '', description: json['description'] ?? '',
    startsAt: DateTime.parse(json['startsAt']), endsAt: DateTime.parse(json['endsAt']));
}

class ChannelModel {
  final String id, name, logoUrl, bannerUrl, description, country, language, streamUrl, streamType;
  final List<CategoryModel> categories;
  final ProgramModel? currentProgram, nextProgram;
  const ChannelModel({required this.id, required this.name, required this.logoUrl, required this.bannerUrl,
    required this.description, required this.country, required this.language, required this.streamUrl,
    required this.streamType, this.categories = const [], this.currentProgram, this.nextProgram});
  factory ChannelModel.fromJson(Map<String, dynamic> json) => ChannelModel(
    id: json['id'] ?? '', name: json['name'] ?? '', logoUrl: json['logoUrl'] ?? '',
    bannerUrl: json['bannerUrl'] ?? json['logoUrl'] ?? '', description: json['description'] ?? '',
    country: json['country'] ?? '', language: json['language'] ?? '', streamUrl: json['streamUrl'] ?? '',
    streamType: json['streamType'] ?? 'HLS', categories: ((json['categories'] as List?) ?? [])
      .whereType<Map>().map((e) => CategoryModel.fromJson(Map<String, dynamic>.from(e))).toList(),
    currentProgram: json['currentProgram'] is Map ? ProgramModel.fromJson(Map<String, dynamic>.from(json['currentProgram'])) : null,
    nextProgram: json['nextProgram'] is Map ? ProgramModel.fromJson(Map<String, dynamic>.from(json['nextProgram'])) : null);
}

class UserModel {
  final String id, name;
  final String? email, phone, avatarUrl;
  final bool darkMode, autoplay, notifications;
  final String preferredQuality;
  const UserModel({required this.id, required this.name, this.email, this.phone, this.avatarUrl,
    this.darkMode = true, this.autoplay = true, this.notifications = true, this.preferredQuality = 'auto'});
  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(id: json['id'], name: json['name'],
    email: json['email'], phone: json['phone'], avatarUrl: json['avatarUrl'], darkMode: json['darkMode'] ?? true,
    autoplay: json['autoplay'] ?? true, notifications: json['notifications'] ?? true,
    preferredQuality: json['preferredQuality'] ?? 'auto');
}

class PageResult<T> {
  final List<T> data;
  final int page, totalPages;
  final bool hasNext;
  const PageResult({required this.data, required this.page, required this.totalPages, required this.hasNext});
}
