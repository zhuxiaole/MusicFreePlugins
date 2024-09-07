const axios = require("axios");
const CryptoJs = require("crypto-js");

const pageSize = 25;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";
// 用户设置环境变量
let userVars: Record<string, string> = null;

// 唯一token请求
let singletonTokenRequest = null;
// 用户认证信息
let authInfo = null;

function getUserVariables() {
  let result = userVars == null ? env?.getUserVariables() ?? {} : userVars;
  if (
    !result?.url?.startsWith("http://") &&
    !result?.url?.startsWith("https://")
  ) {
    result.url = `http://${result.url}`;
  }
  return result;
}

function setUserVariables(userVariables: Record<string, string>) {
  userVars = userVariables;
}

function getBaseUrl() {
  return getUserVariables()?.url;
}

function getNdUsername() {
  return getUserVariables()?.username;
}

function getNdPassword() {
  return getUserVariables()?.password;
}

function isSubsonicAuthInfoValid(info) {
  return (
    info &&
    info.username &&
    info.username.length > 0 &&
    info.subsonicSalt &&
    info.subsonicSalt.length > 0 &&
    info.subsonicToken &&
    info.subsonicToken.length > 0
  );
}

function isNdAuthInfoValid(info) {
  return info && info.ndToken && info.ndToken.length > 0;
}

function isLoginUrl(url) {
  return url && url.startsWith("/auth/login");
}

function isSubsonicUrl(url) {
  return url && url.startsWith("/rest");
}

function isNdUrl(url) {
  return url && url.startsWith("/api");
}

// axios实例
const service = axios.create({
  timeout: 30000,
  headers: { "User-Agent": UA },
});

// 请求拦截器
service.interceptors.request.use(
  async (config) => {
    config.baseURL = getBaseUrl();

    if (config.method === "post") {
      config.headers["Content-Type"] = "application/json;charset=utf-8";
    }

    if (!isLoginUrl(config?.url)) {
      if (
        (isNdUrl(config?.url) && !isNdAuthInfoValid(authInfo)) ||
        (isSubsonicUrl(config?.url) && !isSubsonicAuthInfoValid(authInfo))
      ) {
        // 请求token
        await requestToken();
      }

      if (isSubsonicUrl(config?.url) && isSubsonicAuthInfoValid(authInfo)) {
        config.params = {
          u: authInfo?.username,
          s: authInfo?.subsonicSalt,
          t: authInfo?.subsonicToken,
          c: "MusicFree-PigNavidrome",
          v: "1.14.0",
          f: "json",
          ...config.params,
        };
      }

      if (isNdUrl(config?.url) && isNdAuthInfoValid(authInfo)) {
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
  async (response) => {
    return Promise.resolve(response);
  },
  async (error: any) => {
    if (error?.response?.status === 401) {
      // token 失效处理
      if (!isLoginUrl(error.config.url)) {
        // 1. 刷新 token
        const tokenInfo = await requestToken();
        if (isNdUrl(error.config.url) && isNdAuthInfoValid(tokenInfo)) {
          // token 有效
          // 2.1 重构请求头
          error.config.headers[
            "x-nd-authorization"
          ] = `Bearer ${authInfo.ndToken}`;
          // 2.2 请求
          return await service.request(error.config);
        } else if (
          isSubsonicUrl(error.config.url) &&
          isSubsonicAuthInfoValid(tokenInfo)
        ) {
          // token 有效
          // 2.1 重构请求参数
          error.config.params = {
            u: authInfo?.username,
            s: authInfo?.subsonicSalt,
            t: authInfo?.subsonicToken,
            c: "MusicFree-PigNavidrome",
            v: "1.14.0",
            f: "json",
            ...error.config.params,
          };

          // 2.2 请求
          return await service.request(error.config);
        }
      }
      authInfo = null;
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
  singletonTokenRequest = new Promise<any>(async (resolve) => {
    await service
      .post("/auth/login", {
        username,
        password,
      })
      .then(({ data }) => {
        // 设置刷新后的Token
        authInfo = {
          username: data?.username,
          ndToken: data?.token,
          subsonicSalt: data?.subsonicSalt,
          subsonicToken: data?.subsonicToken,
        };
        // 刷新路由
        resolve(data);
      })
      .catch(() => {
        authInfo = null;
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

function getRequestURL(urlPath) {
  let { url, username, password } = getUserVariables();
  if (!(url && username && password)) {
    return null;
  }

  const salt = genSalt();

  const urlObj = new URL(`${url}/rest/${urlPath}`);
  urlObj.searchParams.append("u", username);
  urlObj.searchParams.append("s", salt);
  urlObj.searchParams.append(
    "t",
    CryptoJs.MD5(`${password}${salt}`).toString(CryptoJs.enc.Hex)
  );
  urlObj.searchParams.append("c", "MusicFree-PigNavidrome");
  urlObj.searchParams.append("v", "1.14.0");
  urlObj.searchParams.append("f", "json");
  return urlObj;
}

function getCoverArtUrl(coverArt) {
  const urlObj = getRequestURL("getCoverArt");
  urlObj.searchParams.append("id", coverArt);
  urlObj.searchParams.append("size", "300");
  return urlObj.toString();
}

function formatMusicItem(it) {
  return {
    id: it.id,
    title: it.title,
    artist: it.artist,
    artistId: it.artistId,
    album: it.album,
    albumid: it.albumId,
    artwork: getCoverArtUrl(it.id),
    duration: it.duration,
  };
}

function formatPlaylistMusicItem(it) {
  return {
    id: it.mediaFileId,
    title: it.title,
    artist: it.artist,
    artistId: it.artistId,
    album: it.album,
    albumid: it.albumId,
    artwork: getCoverArtUrl(it.mediaFileId),
    duration: it.duration,
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
    description: it.comment ? it.comment : "",
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
    playCount: it.playCount ? it.playCount : 0,
    worksNums: it.songCount,
    createTime: it.createdAt,
    description: it.comment,
  };
}

async function searchMusic(query, page) {
  const data = (
    await service.get("/rest/search3", {
      params: {
        query,
        songCount: pageSize,
        songOffset: (page - 1) * pageSize,
        artistCount: 0,
        albumCount: 0,
      },
    })
  ).data;

  const songs = data["subsonic-response"]?.searchResult3?.song;

  return {
    isEnd: songs == null ? true : songs.length < pageSize,
    data: songs?.map(formatMusicItem) ?? [],
  };
}

async function searchAlbum(query, page) {
  const data = (
    await service.get("/rest/search3", {
      params: {
        query,
        albumCount: pageSize,
        albumOffset: (page - 1) * pageSize,
        songCount: 0,
        artistCount: 0,
      },
    })
  ).data;

  const albums = data["subsonic-response"]?.searchResult3?.album;

  return {
    isEnd: albums == null ? true : albums.length < pageSize,
    data: albums?.map(formatAlbumItem) ?? [],
  };
}

async function searchArtist(query, page) {
  const startIndex = (page - 1) * pageSize;
  const data = (
    await service.get("/api/artist", {
      params: {
        name: query,
        _start: startIndex,
        _end: startIndex + pageSize,
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < pageSize,
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
}

async function getMediaSource(musicItem) {
  const urlObj = getRequestURL("stream");
  urlObj.searchParams.append("id", musicItem.id);

  return {
    url: urlObj.toString(),
  };
}

async function getMusicInfo(musicItem) {
  const data = (
    await service.get("/rest/getSong", {
      params: {
        id: musicItem.id,
      },
    })
  ).data;

  const song = data["subsonic-response"]?.song;

  return formatMusicItem(song);
}

async function getAlbumInfo(albumItem, page) {
  const startIndex = (page - 1) * pageSize;

  const albumRequest = service.get(`/api/album/${albumItem.id}`);
  const songsRequest = service.get("/api/song", {
    params: {
      album_id: albumItem.id,
      _start: startIndex,
      _end: startIndex + pageSize,
      _order: "ASC",
      _sort: "album",
    },
  });

  const datas = await Promise.all([albumRequest, songsRequest]);

  const album = datas[0]?.data;
  const song = datas[1]?.data;

  return {
    isEnd: song == null ? true : song.length < pageSize,
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

async function getRecommendSheetsByTag(_, page) {
  const startIndex = (page - 1) * pageSize;
  // 获取某个 tag 下的所有歌单
  const data = (
    await service.get("/api/playlist", {
      params: {
        _start: startIndex,
        _end: startIndex + pageSize,
        _sort: "name",
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < pageSize,
    data: data?.map(formatPlaylistItem) ?? [],
  };
}

async function getMusicSheetInfo(sheetItem, page) {
  const startIndex = (page - 1) * pageSize;
  const data = (
    await service.get(`/api/playlist/${sheetItem.id}/tracks`, {
      params: {
        playlist_id: sheetItem.id,
        _start: startIndex,
        _end: startIndex + pageSize,
        _order: "ASC",
        _sort: "id",
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < pageSize,
    musicList: data?.map(formatPlaylistMusicItem) ?? [],
  };
}

async function getArtistAlbums(artistItem, page) {
  const startIndex = (page - 1) * pageSize;
  const data = (
    await service.get("/api/album", {
      params: {
        artist_id: artistItem.id,
        _start: startIndex,
        _end: startIndex + pageSize,
        _order: "ASC",
        _sort: "max_year asc,date asc",
      },
    })
  ).data;

  return {
    isEnd: data == null ? true : data.length < pageSize,
    data: data?.map(formatAlbumItem) ?? [],
  };
}

async function getArtistWorks(artistItem, page, type) {
  if (type === "album") {
    return await getArtistAlbums(artistItem, page);
  }
}

function formatAlbumSheetItem(it) {
  return {
    id: it.id,
    description: it.artist,
    title: it.title,
    coverImg: getCoverArtUrl(it.coverArt),
    type: "album",
  };
}

// 获取专辑榜单
async function getAlbumSheetList(type, page, size) {
  const data = (
    await service.get("/rest/getAlbumList2", {
      params: {
        type: type,
        size: size,
        offset: (page - 1) * size,
      },
    })
  ).data;

  const album = data["subsonic-response"]?.albumList2?.album;

  return album?.map(formatAlbumSheetItem) ?? [];
}

/// 榜单列表
async function getTopLists() {
  const result = [];

  // 最近播放的专辑
  const recentList = getAlbumSheetList("recent", 1, 10);
  // 收藏专辑
  const starredList = getAlbumSheetList("starred", 1, 10);
  // 专辑评分排行
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
      title: "专辑评分排行",
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
  if (topListItem.type === "album") {
    return await getAlbumInfo(topListItem, page);
  }
}

module.exports = {
  platform: "Navidrome",
  version: "0.0.2",
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
  supportedSearchType: ["music", "album", "artist"],
  setUserVariables,
  search,
  getMediaSource,
  getMusicInfo,
  getAlbumInfo,
  getLyric,
  getRecommendSheetsByTag,
  getMusicSheetInfo,
  getArtistWorks,
  getTopLists,
  getTopListDetail,
};
