import axios from "axios";
import CryptoJs = require("crypto-js");

const pageSize = 25;
let userVars: Record<string, string> = null;

function setUserVariables(userVariables: Record<string, string>) {
  userVars = userVariables;
}

function genSalt() {
  return Math.random().toString(16).slice(2);
}

function getRequestURL(urlPath) {
  const userVariables =
    userVars == null ? env?.getUserVariables() ?? {} : userVars;
  let { url, username, password } = userVariables;
  if (!(url && username && password)) {
    return null;
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `http://${url}`;
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

async function httpGet(
  urlPath: string,
  params?: Record<string, string | number | boolean>
) {
  return (
    await axios.get(getRequestURL(urlPath).toString(), {
      params: {
        ...params,
      },
    })
  ).data;
}

function formatMusicItem(it) {
  return {
    id: it.id,
    title: it.title,
    artist: it.artist,
    album: it.album,
    albumid: it.albumId,
    artwork: getCoverArtUrl(it.coverArt),
    duration: it.duration,
  };
}

function formatAlbumItem(it) {
  return {
    id: it.id,
    title: it.name,
    artist: it.artist,
    artwork: getCoverArtUrl(it.coverArt),
    worksNums: it.songCount,
    description: it.comment,
  };
}

function formatArtistItem(it) {
  return {
    id: it.id,
    name: it.name,
    avatar: it.artistImageUrl,
  };
}

function formatPlaylistItem(it) {
  return {
    id: it.id,
    artist: it.owner,
    title: it.name,
    artwork: getCoverArtUrl(it.coverArt),
    playCount: 0,
    createTime: it.created,
    description: it.comment,
  };
}

async function searchMusic(query, page) {
  const data = await httpGet("search3", {
    query,
    songCount: pageSize,
    songOffset: (page - 1) * pageSize,
    artistCount: 0,
    albumCount: 0,
  });

  const songs = data["subsonic-response"]?.searchResult3?.song;

  return {
    isEnd: songs == null ? true : songs.length < pageSize,
    data: songs?.map(formatMusicItem) ?? [],
  };
}

async function searchAlbum(query, page) {
  const data = await httpGet("search3", {
    query,
    albumCount: pageSize,
    albumOffset: (page - 1) * pageSize,
    songCount: 0,
    artistCount: 0,
  });

  const albums = data["subsonic-response"]?.searchResult3?.album;

  return {
    isEnd: albums == null ? true : albums.length < pageSize,
    data: albums?.map(formatAlbumItem) ?? [],
  };
}

async function searchArtist(query, page) {
  const data = await httpGet("search3", {
    query,
    artistCount: pageSize,
    artistOffset: (page - 1) * pageSize,
    songCount: 0,
    albumCount: 0,
  });

  const artist = data["subsonic-response"]?.searchResult3?.artist;

  return {
    isEnd: artist == null ? true : artist.length < pageSize,
    data: artist?.map(formatArtistItem) ?? [],
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
  const data = await httpGet("getSong", {
    id: musicItem.id,
  });

  const song = data["subsonic-response"]?.song;

  return formatMusicItem(song);
}

async function getAlbumInfo(albumItem, _) {
  const data = await httpGet("getAlbum", {
    id: albumItem.id,
  });

  const album = data["subsonic-response"]?.album;
  const song = album?.song;

  return {
    isEnd: true,
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
  const data = await httpGet("getLyricsBySongId", {
    id: musicItem.id,
  });

  const lyricLines =
    data["subsonic-response"]?.lyricsList?.structuredLyrics[0]?.line;

  return {
    rawLrc: convertToLRC(lyricLines),
  };
}

async function getRecommendSheetsByTag(tagItem) {
  // 获取某个 tag 下的所有歌单
  const data = await httpGet("getPlaylists");

  const playlist = data["subsonic-response"]?.playlists?.playlist;

  return {
    isEnd: true,
    data: playlist?.map(formatPlaylistItem) ?? [],
  };
}

async function getMusicSheetInfo(sheetItem, _) {
  const data = await httpGet("getPlaylist", {
    id: sheetItem.id,
  });

  const playlist = data["subsonic-response"]?.playlist;
  const entry = playlist?.entry;

  return {
    isEnd: true,
    musicList: entry?.map(formatMusicItem) ?? [],
    sheetItem: {
      worksNums: playlist?.songCount ?? 0,
    },
  };
}

async function getArtistAlbums(artistItem) {
  const data = await httpGet("getArtist", {
    id: artistItem.id,
  });

  const album = data["subsonic-response"]?.artist?.album;

  return {
    isEnd: true,
    data: album?.map(formatAlbumItem) ?? [],
  };
}

async function getArtistWorks(artistItem, _, type) {
  if (type === "album") {
    return await getArtistAlbums(artistItem);
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
  const data = await httpGet("getAlbumList2", {
    type: type,
    size: size,
    offset: (page - 1) * size,
  });

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
