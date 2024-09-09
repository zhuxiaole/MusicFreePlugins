const axios = require("axios");
const CryptoJs = require("crypto-js");
const CookieManager = !env?.debug
  ? require("@react-native-cookies/cookies")
  : null;

const PAGE_SIZE = 25;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";

const SUBSONIC_API_C = "MusicFree-PigNavidrome";
const SUBSONIC_API_V = "1.14.0";
const SUBSONIC_API_F = "json";

// 唯一token请求
let singletonTokenRequest = null;
// debug为true时，不使用cookie存储，而使用该变量存储认证信息
const debugAuthInfo: NdAuthInfo = genDefaultAuthInfo();

function genDefaultAuthInfo(): NdAuthInfo {
  return {
    ndBaseUrl: "",
    ndUsername: "",
    ndToken: "",
    subsonicSalt: "",
    subsonicToken: "",
  };
}

function genAuthInfoFromLoginResp(baseUrl, loginResp): NdAuthInfo {
  return {
    ndBaseUrl: baseUrl ?? "",
    ndUsername: loginResp?.username ?? "",
    ndToken: loginResp?.token ?? "",
    subsonicSalt: loginResp?.subsonicSalt ?? "",
    subsonicToken: loginResp?.subsonicToken ?? "",
  };
}

function storeAuthInfo(baseUrl, authInfo: NdAuthInfo): Promise<any> {
  if (!CookieManager) {
    return new Promise<any>((resolve, reject) => {
      try {
        debugAuthInfo.ndBaseUrl = authInfo?.ndBaseUrl ?? "";
        debugAuthInfo.ndUsername = authInfo?.ndUsername ?? "";
        debugAuthInfo.ndToken = authInfo?.ndToken ?? "";
        debugAuthInfo.subsonicSalt = authInfo?.subsonicSalt ?? "";
        debugAuthInfo.subsonicToken = authInfo?.subsonicToken ?? "";
        resolve("success");
      } catch (err) {
        reject(err);
      }
    });
  } else {
    const ndBaseUrlStore = CookieManager.set(baseUrl, {
      name: "ndBaseUrl",
      value: authInfo?.ndBaseUrl ?? "",
    });
    const ndUsernameStore = CookieManager.set(baseUrl, {
      name: "ndUsername",
      value: authInfo?.ndUsername ?? "",
    });
    const ndTokenStore = CookieManager.set(baseUrl, {
      name: "ndToken",
      value: authInfo?.ndToken ?? "",
    });
    const subsonicSaltStore = CookieManager.set(baseUrl, {
      name: "subsonicSalt",
      value: authInfo?.subsonicSalt ?? "",
    });
    const subsonicTokenStore = CookieManager.set(baseUrl, {
      name: "subsonicToken",
      value: authInfo?.subsonicToken ?? "",
    });
    return Promise.all([
      ndBaseUrlStore,
      ndUsernameStore,
      ndTokenStore,
      subsonicSaltStore,
      subsonicTokenStore,
    ]);
  }
}

function getStoredAuthInfo(baseUrl): Promise<NdAuthInfo> {
  if (!CookieManager) {
    return new Promise<any>((resolve) => {
      resolve(debugAuthInfo);
    });
  } else {
    return CookieManager.get(baseUrl).then((cookies) => {
      return Promise.resolve({
        ndBaseUrl: cookies.ndBaseUrl?.value,
        ndUsername: cookies.ndUsername?.value,
        ndToken: cookies.ndToken?.value,
        subsonicSalt: cookies.subsonicSalt?.value,
        subsonicToken: cookies.subsonicToken?.value,
      });
    });
  }
}

function resetStoredAuthInfo(baseUrl): Promise<any> {
  return storeAuthInfo(baseUrl, genDefaultAuthInfo());
}

function getUserVariables() {
  let userVariables = env?.getUserVariables() ?? {};
  if (
    !userVariables?.url?.startsWith("http://") &&
    !userVariables?.url?.startsWith("https://")
  ) {
    userVariables.url = `http://${userVariables.url}`;
  }
  return userVariables;
}

function getConfigNdBaseUrl() {
  return getUserVariables()?.url;
}

function getConfigNdUsername() {
  return getUserVariables()?.username;
}

function getConfigNdPassword() {
  return getUserVariables()?.password;
}

function isSubsonicAuthInfoValid(info) {
  return (
    info &&
    info.ndUsername &&
    info.ndUsername.length > 0 &&
    info.subsonicSalt &&
    info.subsonicSalt.length > 0 &&
    info.subsonicToken &&
    info.subsonicToken.length > 0
  );
}

function isNdAuthInfoValid(info) {
  return info && info.ndToken && info.ndToken.length > 0;
}

function isLoginUrl(baseUrl, url) {
  return (
    baseUrl &&
    baseUrl === getConfigNdBaseUrl() &&
    url &&
    url.startsWith("/auth/login")
  );
}

function isSubsonicUrl(baseUrl, url) {
  return (
    baseUrl &&
    baseUrl === getConfigNdBaseUrl() &&
    url &&
    url.startsWith("/rest")
  );
}

function isNdUrl(baseUrl, url) {
  return (
    isLoginUrl(baseUrl, url) ||
    (baseUrl &&
      baseUrl === getConfigNdBaseUrl() &&
      url &&
      url.startsWith("/api"))
  );
}

// axios实例
const service = axios.create({
  timeout: 30000,
  headers: { "User-Agent": UA },
});

// 请求拦截器
service.interceptors.request.use(
  async function (config) {
    config.baseURL = config.baseURL ?? getConfigNdBaseUrl();

    if (config.method === "post") {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }

    const ifLoginUrl = isLoginUrl(config.baseURL, config.url);
    const ifSubsonicUrl = isSubsonicUrl(config.baseURL, config.url);
    const ifNdUrl = isNdUrl(config.baseURL, config.url);

    if ((ifNdUrl || ifSubsonicUrl) && !ifLoginUrl) {
      let authInfo = await getStoredAuthInfo(config.baseURL);

      // 如果用户配置的url或者用户名与cookie存储的不同，则清除cookie存储的认证信息
      const baseURLHost = config.baseURL ? new URL(config.baseURL).host : null;
      const storedBaseURLHost = authInfo?.ndBaseUrl
        ? new URL(authInfo?.ndBaseUrl).host
        : null;

      if (
        baseURLHost !== storedBaseURLHost ||
        getConfigNdUsername() !== authInfo?.ndUsername
      ) {
        await resetStoredAuthInfo(config.baseURL);
        authInfo = null;
      }

      if (
        (ifNdUrl && !isNdAuthInfoValid(authInfo)) ||
        (ifSubsonicUrl && !isSubsonicAuthInfoValid(authInfo))
      ) {
        // 请求token
        await requestToken();
        authInfo = await getStoredAuthInfo(config.baseURL);
      }

      if (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo)) {
        config.params = {
          u: authInfo.ndUsername,
          s: authInfo.subsonicSalt,
          t: authInfo.subsonicToken,
          c: SUBSONIC_API_C,
          v: SUBSONIC_API_V,
          f: SUBSONIC_API_F,
          ...config.params,
        };
      }

      if (ifNdUrl && isNdAuthInfoValid(authInfo)) {
        // 设置头部 token
        config.headers["x-nd-authorization"] = `Bearer ${authInfo.ndToken}`;
      }
    }
    return Promise.resolve(config);
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  async function (response) {
    return Promise.resolve(response);
  },
  async function (error: any) {
    if (error?.response?.status === 401) {
      const ifNdUrl = isNdUrl(error.config.baseURL, error.config.url);
      const ifSubsonicUrl = isSubsonicUrl(
        error.config.baseURL,
        error.config.url
      );

      // token 失效处理
      if (ifNdUrl || ifSubsonicUrl) {
        if (!isLoginUrl(error.config.baseURL, error.config.url)) {
          // 1. 刷新 token
          await requestToken();
          const authInfo = await getStoredAuthInfo(error.config.baseURL);
          if (
            (ifNdUrl && isNdAuthInfoValid(authInfo)) ||
            (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo))
          ) {
            // token 有效，重新请求
            return await service.request(error.config);
          }
        }
        await resetStoredAuthInfo(error.config.baseURL);
      }
    }
    return Promise.reject(error);
  }
);

function requestToken(): Promise<any> {
  // 如果 singletonTokenRequest 不为 null 说明已经在刷新中，直接返回
  if (singletonTokenRequest !== null) {
    return singletonTokenRequest;
  }

  let { _, username, password } = getUserVariables();

  // 设置 singletonTokenRequest 为一个 Promise 对象 , 处理刷新 token 请求
  singletonTokenRequest = new Promise<any>(async function (resolve, reject) {
    const baseUrl = getConfigNdBaseUrl();
    await service
      .post("/auth/login", {
        username,
        password,
      })
      .then(({ data }) => {
        // 存储Token
        storeAuthInfo(baseUrl, genAuthInfoFromLoginResp(baseUrl, data))
          .then(() => {
            resolve(data);
          })
          .catch((cErr) => {
            reject(cErr);
          });
      })
      .catch((err) => {
        resetStoredAuthInfo(baseUrl).finally(() => {
          reject(err);
        });
      });
  });

  // 最终将 singletonTokenRequest 设置为 null, 防止 singletonTokenRequest 一直占用
  singletonTokenRequest.finally(() => {
    singletonTokenRequest = null;
  });
  return singletonTokenRequest;
}

function genSalt() {
  return Math.random().toString(16).slice(2);
}

function getSubsonicURL(pathname) {
  let { url, username, password } = getUserVariables();
  if (!(url && username && password)) {
    return null;
  }

  const salt = genSalt();

  const urlObj = new URL(url);
  urlObj.pathname = pathname;

  urlObj.searchParams.append("u", username);
  urlObj.searchParams.append("s", salt);
  urlObj.searchParams.append(
    "t",
    CryptoJs.MD5(`${password}${salt}`).toString(CryptoJs.enc.Hex)
  );
  urlObj.searchParams.append("c", SUBSONIC_API_C);
  urlObj.searchParams.append("v", SUBSONIC_API_V);
  urlObj.searchParams.append("f", SUBSONIC_API_F);
  return urlObj;
}

function getCoverArtUrl(coverArt) {
  const urlObj = getSubsonicURL("/rest/getCoverArt");
  urlObj.searchParams.append("id", coverArt);
  urlObj.searchParams.append("size", "300");
  return urlObj.toString();
}

// 获取navidrome歌单列表
async function getNdPlaylists(query, sort, page) {
  const startIndex = (page - 1) * PAGE_SIZE;

  return (
    await service.get("/api/playlist", {
      params: {
        q: query,
        _start: startIndex,
        _end: startIndex + PAGE_SIZE,
        _sort: sort,
      },
    })
  ).data;
}

// 获取navidrome专辑列表
async function getNdAlbumList(type, page, size) {
  const startIndex = (page - 1) * size;
  const params = {
    _start: startIndex,
    _end: startIndex + size,
  };

  switch (type) {
    case "recent": // 最近播放
      params["recently_played"] = true;
      params["_sort"] = "play_date";
      params["_order"] = "DESC";
      break;
    case "starred": // 收藏
      params["starred"] = true;
      params["_sort"] = "starred_at";
      params["_order"] = "DESC";
      break;
    case "highest": // 评分最高
      params["has_rating"] = true;
      params["_sort"] = "rating";
      params["_order"] = "DESC";
      break;
    case "frequent": // 最多播放
      params["recently_played"] = true;
      params["_sort"] = "play_count";
      params["_order"] = "DESC";
      break;
    case "newest": // 最近添加
      params["_sort"] = "recently_added";
      params["_order"] = "DESC";
      break;
    case "random": // 随机
      params["_sort"] = "random";
      params["_order"] = "ASC";
      break;
    default:
      break;
  }

  return (await service.get("/api/album", { params })).data;
}

// 获取navidrome相关（作者、风格）专辑列表
async function getNdRelatedAlbumList(artist_id, genre_id, page, order, sort) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const params = {
    _start: startIndex,
    _end: startIndex + PAGE_SIZE,
    _order: order,
    _sort: sort,
  };

  if (artist_id && artist_id.length > 0) {
    params["artist_id"] = artist_id;
  }

  if (genre_id && genre_id.length > 0) {
    params["genre_id"] = genre_id;
  }

  return (await service.get("/api/album", { params })).data;
}

// 获取navidrome歌单中的歌曲列表
async function getNdPlaylistTracks(playlistId, page, order = "", sort = "") {
  const startIndex = (page - 1) * PAGE_SIZE;
  return (
    await service.get(`/api/playlist/${playlistId}/tracks`, {
      params: {
        playlist_id: playlistId,
        _start: startIndex,
        _end: startIndex + PAGE_SIZE,
        _order: order,
        _sort: sort,
      },
    })
  ).data;
}

function formatMusicItem(it) {
  const lyricsArr = it.lyrics ? JSON.parse(it.lyrics) : null;
  let rawLrc = "";
  if (lyricsArr && lyricsArr.length > 0) {
    rawLrc = convertToLRC(lyricsArr[0]?.line);
  }
  return {
    id: it.id,
    title: it.title,
    artist: it.artist,
    artistId: it.artistId,
    album: it.album,
    albumid: it.albumId,
    artwork: getCoverArtUrl(it.id),
    duration: it.duration,
    rawLrc: rawLrc,
  };
}

function formatPlaylistMusicItem(it) {
  const lyricsArr = it.lyrics ? JSON.parse(it.lyrics) : null;
  let rawLrc = "";
  if (lyricsArr && lyricsArr.length > 0) {
    rawLrc = convertToLRC(lyricsArr[0]?.line);
  }
  return {
    id: it.mediaFileId,
    title: it.title,
    artist: it.artist,
    artistId: it.artistId,
    album: it.album,
    albumid: it.albumId,
    artwork: getCoverArtUrl(it.mediaFileId),
    duration: it.duration,
    rawLrc: rawLrc,
  };
}

function formatAlbumItem(it) {
  return {
    id: it.id,
    title: it.name,
    artist: it.artist,
    artistId: it.artistId,
    artwork: getCoverArtUrl(it.id),
    worksNums: it.songCount,
    duration: it.duration,
    date: it.date,
    description: it.comment ?? "",
  };
}

function formatArtistItem(it) {
  return {
    id: it.id,
    name: it.name,
    avatar: getCoverArtUrl(it.id),
    worksNum: it.songCount,
  };
}

function formatPlaylistItem(it) {
  return {
    id: it.id,
    artist: it.ownerName,
    title: it.name,
    artwork: getCoverArtUrl(it.id),
    playCount: it.playCount ?? 0,
    worksNums: it.songCount,
    createTime: it.createdAt,
    description: it.comment,
  };
}

async function searchMusic(query, page) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const data = (
    await service.get("/api/song", {
      params: {
        title: query,
        _start: startIndex,
        _end: startIndex + PAGE_SIZE,
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < PAGE_SIZE,
    data: data?.map(formatMusicItem) ?? [],
  };
}

async function searchSheet(query, page) {
  const data = await getNdPlaylists(query, "", page);

  return {
    isEnd: data == null ? true : data.length < PAGE_SIZE,
    data:
      data?.map((it) => {
        return {
          ...formatPlaylistItem(it),
          sheetType: "playlist",
        };
      }) ?? [],
  };
}

async function searchAlbum(query, page) {
  const data = (
    await service.get("/rest/search3", {
      params: {
        query,
        albumCount: PAGE_SIZE,
        albumOffset: (page - 1) * PAGE_SIZE,
        songCount: 0,
        artistCount: 0,
      },
    })
  ).data;

  const albums = data["subsonic-response"]?.searchResult3?.album;

  return {
    isEnd: albums == null ? true : albums.length < PAGE_SIZE,
    data: albums?.map(formatAlbumItem) ?? [],
  };
}

async function searchArtist(query, page) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const data = (
    await service.get("/api/artist", {
      params: {
        name: query,
        _start: startIndex,
        _end: startIndex + PAGE_SIZE,
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < PAGE_SIZE,
    data: data?.map(formatArtistItem) ?? [],
  };
}

async function search(query, page, type) {
  if (type === "music") {
    return await searchMusic(query, page);
  }
  if (type === "album") {
    return await searchAlbum(query, page);
  }
  if (type === "artist") {
    return await searchArtist(query, page);
  }
  if (type === "sheet") {
    return await searchSheet(query, page);
  }
}

async function scrobble(id) {
  await service.get("/rest/scrobble", {
    params: {
      id: id,
    },
  });
}

async function getMediaSource(musicItem, quality) {
  // 播放记录
  scrobble(musicItem.id);

  // 强制不转码，转码后播放器不显示时长
  quality = "super";

  let maxBitRate, format;

  switch (quality) {
    case "low":
      maxBitRate = "128";
      format = "mp3";
      break;
    case "standard":
      maxBitRate = "256";
      format = "mp3";
      break;
    case "high":
      maxBitRate = "320";
      format = "aac";
      break;
    default:
      maxBitRate = "0";
      format = "raw";
      break;
  }

  const urlObj = getSubsonicURL("/rest/stream");
  urlObj.searchParams.append("id", musicItem.id);
  urlObj.searchParams.append("maxBitRate", maxBitRate);
  urlObj.searchParams.append("format", format);

  return {
    url: urlObj.toString(),
  };
}

async function getMusicInfo(musicItem) {
  const data = (await service.get(`/api/song/${musicItem.id}`)).data;

  return formatMusicItem(data);
}

async function getAlbumInfo(albumItem, page) {
  const startIndex = (page - 1) * PAGE_SIZE;

  const albumRequest = service.get(`/api/album/${albumItem.id}`);
  const songsRequest = service.get("/api/song", {
    params: {
      album_id: albumItem.id,
      _start: startIndex,
      _end: startIndex + PAGE_SIZE,
      _order: "ASC",
      _sort: "album",
    },
  });

  const datas = await Promise.all([albumRequest, songsRequest]);

  const album = datas[0]?.data;
  const song = datas[1]?.data;

  return {
    isEnd: song == null ? true : song.length < PAGE_SIZE,
    musicList: song?.map(formatMusicItem) ?? [],
    sheetItem: {
      worksNums: album?.songCount ?? 0,
      playCount: album?.playCount ?? 0,
    },
  };
}

function convertToLRC(jsonLyrics) {
  let lrcLyrics = "";

  jsonLyrics?.forEach((lyric) => {
    const minutes = Math.floor(lyric.start / 60000);
    const seconds = Math.floor((lyric.start % 60000) / 1000);
    const milliseconds = lyric.start % 1000;

    // 格式化时间戳
    const formattedTime = `[${String(minutes).padStart(2, "0")}:${String(
      seconds
    ).padStart(2, "0")}.${String(milliseconds).padStart(2, "0").slice(0, 2)}]`;

    // 添加歌词行
    lrcLyrics += `${formattedTime} ${lyric.value}\n`;
  });

  return lrcLyrics;
}

async function getLyric(musicItem) {
  const data = (
    await service.get("/rest/getLyricsBySongId", {
      params: {
        id: musicItem.id,
      },
    })
  ).data;

  const lyricLines =
    data["subsonic-response"]?.lyricsList?.structuredLyrics[0]?.line;

  return {
    rawLrc: convertToLRC(lyricLines),
  };
}

async function getRecommendSheetTags() {
  const resp = (await service.get("/api/genre")).data;

  const data = resp?.map((it) => ({
    id: it.id,
    title: it.name,
  }));

  return {
    pinned: data,
    data: [
      {
        title: "风格",
        data: data,
      },
    ],
  };
}

async function getRecommendSheetsByTag(tagItem, page) {
  let sheetList;
  if (!tagItem || !tagItem.id || tagItem.id.length <= 0) {
    // 获取navidrome歌单列表
    const data = await getNdPlaylists("", "name", page);
    sheetList =
      data?.map((it) => {
        return {
          ...formatPlaylistItem(it),
          sheetType: "playlist",
        };
      }) ?? [];
  } else {
    // 获取对应风格的专辑列表
    const data = await getNdRelatedAlbumList(
      "",
      tagItem.id,
      page,
      "ASC",
      "max_year asc,date asc"
    );
    sheetList = data?.map(formatAlbumSheetItem) ?? [];
  }

  return {
    isEnd: sheetList == null ? true : sheetList.length < PAGE_SIZE,
    data: sheetList,
  };
}

async function getMusicSheetInfo(sheetItem, page) {
  let musicList = null;

  if (sheetItem.sheetType === "playlist") {
    const data = await getNdPlaylistTracks(sheetItem.id, "ASC", "id");
    musicList = data?.map(formatPlaylistMusicItem) ?? [];
  } else if (sheetItem.sheetType === "album") {
    const data = await getAlbumInfo(sheetItem, page);
    musicList = data?.musicList ?? [];
  }

  return {
    isEnd: musicList == null ? true : musicList.length < PAGE_SIZE,
    musicList: musicList,
  };
}

async function getArtistAlbums(artistItem, page) {
  const data = await getNdRelatedAlbumList(
    artistItem.id,
    "",
    page,
    "ASC",
    "max_year asc,date asc"
  );

  return {
    isEnd: data == null ? true : data.length < PAGE_SIZE,
    data: data?.map(formatAlbumItem) ?? [],
  };
}

async function getArtistMusics(artistItem, page) {
  const startIndex = (page - 1) * PAGE_SIZE;
  const data = (
    await service.get("/api/song", {
      params: {
        artist_id: artistItem.id,
        _start: startIndex,
        _end: startIndex + PAGE_SIZE,
        _order: "ASC",
        _sort: "title",
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < PAGE_SIZE,
    data: data?.map(formatMusicItem) ?? [],
  };
}

async function getArtistWorks(artistItem, page, type) {
  if (type === "album") {
    return await getArtistAlbums(artistItem, page);
  }
  if (type === "music") {
    return await getArtistMusics(artistItem, page);
  }
}

function formatAlbumSheetItem(it) {
  return {
    id: it.id,
    description: it.artist,
    title: it.name,
    coverImg: getCoverArtUrl(it.id),
    playCount: it.playCount,
    sheetType: "album",
  };
}

// 获取专辑榜单
async function getAlbumSheetList(type, page, size) {
  const album = await getNdAlbumList(type, page, size);
  return album?.map(formatAlbumSheetItem) ?? [];
}

/// 榜单列表
async function getTopLists() {
  const result = [];

  // 最近播放的专辑
  const recentList = getAlbumSheetList("recent", 1, 10);
  // 收藏专辑
  const starredList = getAlbumSheetList("starred", 1, 10);
  // 评分最高的专辑
  const ratedList = getAlbumSheetList("highest", 1, 10);
  // 专辑最多播放
  const frequentList = getAlbumSheetList("frequent", 1, 10);
  // 最近添加的专辑
  const newestList = getAlbumSheetList("newest", 1, 10);
  // 随机专辑
  const randomList = getAlbumSheetList("random", 1, 10);

  const datas = await Promise.all([
    recentList,
    starredList,
    ratedList,
    frequentList,
    newestList,
    randomList,
  ]);

  if (datas[0]?.length > 0) {
    result.push({
      title: "最近播放的专辑",
      data: datas[0],
    });
  }

  if (datas[1]?.length > 0) {
    result.push({
      title: "收藏专辑",
      data: datas[1],
    });
  }

  if (datas[2]?.length > 0) {
    result.push({
      title: "评分最高的专辑",
      data: datas[2],
    });
  }

  if (datas[3]?.length > 0) {
    result.push({
      title: "播放最多的专辑",
      data: datas[3],
    });
  }

  if (datas[4]?.length > 0) {
    result.push({
      title: "最近添加的专辑",
      data: datas[4],
    });
  }

  if (datas[5]?.length > 0) {
    result.push({
      title: "随机专辑",
      data: datas[5],
    });
  }

  return result;
}

// 获取榜单详情
async function getTopListDetail(topListItem, page) {
  if (topListItem.sheetType === "album") {
    return await getAlbumInfo(topListItem, page);
  }
}

type NdAuthInfo = {
  ndBaseUrl: string;
  ndUsername: string;
  ndToken: string;
  subsonicSalt: string;
  subsonicToken: string;
};

module.exports = {
  platform: "Navidrome",
  version: "0.0.5",
  author: "猪小乐",
  appVersion: ">0.1.0-alpha.0",
  srcUrl:
    "https://gh.zhuxiaole.link/https://raw.githubusercontent.com/zhuxiaole/MusicFreePlugins/main/dist/navidrome/index.js",
  cacheControl: "no-cache",
  userVariables: [
    {
      key: "url",
      name: "服务器地址",
    },
    {
      key: "username",
      name: "用户名",
    },
    {
      key: "password",
      name: "密码",
    },
  ],
  supportedSearchType: ["music", "album", "artist", "sheet"],
  search,
  getMediaSource,
  getMusicInfo,
  getAlbumInfo,
  getLyric,
  getRecommendSheetTags,
  getRecommendSheetsByTag,
  getMusicSheetInfo,
  getArtistWorks,
  getTopLists,
  getTopListDetail,
};
