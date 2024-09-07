const axios = require("axios");
const CryptoJs = require("crypto-js");
const pageSize = 25;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";
let userVars = null;
let singletonTokenRequest = null;
let authInfo = null;
function getUserVariables() {
    var _a, _b, _c;
    let result = userVars == null ? (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {} : userVars;
    if (!((_b = result === null || result === void 0 ? void 0 : result.url) === null || _b === void 0 ? void 0 : _b.startsWith("http://")) &&
        !((_c = result === null || result === void 0 ? void 0 : result.url) === null || _c === void 0 ? void 0 : _c.startsWith("https://"))) {
        result.url = `http://${result.url}`;
    }
    return result;
}
function setUserVariables(userVariables) {
    userVars = userVariables;
}
function getBaseUrl() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.url;
}
function getNdUsername() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.username;
}
function getNdPassword() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.password;
}
function isSubsonicAuthInfoValid(info) {
    return (info &&
        info.username &&
        info.username.length > 0 &&
        info.subsonicSalt &&
        info.subsonicSalt.length > 0 &&
        info.subsonicToken &&
        info.subsonicToken.length > 0);
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
const service = axios.create({
    timeout: 30000,
    headers: { "User-Agent": UA },
});
service.interceptors.request.use(async (config) => {
    config.baseURL = getBaseUrl();
    if (config.method === "post") {
        config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    if (!isLoginUrl(config === null || config === void 0 ? void 0 : config.url)) {
        if ((isNdUrl(config === null || config === void 0 ? void 0 : config.url) && !isNdAuthInfoValid(authInfo)) ||
            (isSubsonicUrl(config === null || config === void 0 ? void 0 : config.url) && !isSubsonicAuthInfoValid(authInfo))) {
            await requestToken();
        }
        if (isSubsonicUrl(config === null || config === void 0 ? void 0 : config.url) && isSubsonicAuthInfoValid(authInfo)) {
            config.params = Object.assign({ u: authInfo === null || authInfo === void 0 ? void 0 : authInfo.username, s: authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicSalt, t: authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicToken, c: "MusicFree-PigNavidrome", v: "1.14.0", f: "json" }, config.params);
        }
        if (isNdUrl(config === null || config === void 0 ? void 0 : config.url) && isNdAuthInfoValid(authInfo)) {
            config.headers["x-nd-authorization"] = `Bearer ${authInfo.ndToken}`;
        }
    }
    return Promise.resolve(config);
}, (error) => {
    return Promise.reject(error);
});
service.interceptors.response.use(async (response) => {
    return Promise.resolve(response);
}, async (error) => {
    var _a;
    if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        if (!isLoginUrl(error.config.url)) {
            const tokenInfo = await requestToken();
            if (isNdUrl(error.config.url) && isNdAuthInfoValid(tokenInfo)) {
                error.config.headers["x-nd-authorization"] = `Bearer ${authInfo.ndToken}`;
                return await service.request(error.config);
            }
            else if (isSubsonicUrl(error.config.url) &&
                isSubsonicAuthInfoValid(tokenInfo)) {
                error.config.params = Object.assign({ u: authInfo === null || authInfo === void 0 ? void 0 : authInfo.username, s: authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicSalt, t: authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicToken, c: "MusicFree-PigNavidrome", v: "1.14.0", f: "json" }, error.config.params);
                return await service.request(error.config);
            }
        }
        authInfo = null;
    }
    return Promise.reject(error);
});
function requestToken() {
    if (singletonTokenRequest !== null) {
        return singletonTokenRequest;
    }
    let { _, username, password } = getUserVariables();
    singletonTokenRequest = new Promise(async (resolve) => {
        await service
            .post("/auth/login", {
            username,
            password,
        })
            .then(({ data }) => {
            authInfo = {
                username: data === null || data === void 0 ? void 0 : data.username,
                ndToken: data === null || data === void 0 ? void 0 : data.token,
                subsonicSalt: data === null || data === void 0 ? void 0 : data.subsonicSalt,
                subsonicToken: data === null || data === void 0 ? void 0 : data.subsonicToken,
            };
            resolve(data);
        })
            .catch(() => {
            authInfo = null;
        });
    });
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
    urlObj.searchParams.append("t", CryptoJs.MD5(`${password}${salt}`).toString(CryptoJs.enc.Hex));
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
    var _a, _b, _c;
    const data = (await service.get("/rest/search3", {
        params: {
            query,
            songCount: pageSize,
            songOffset: (page - 1) * pageSize,
            artistCount: 0,
            albumCount: 0,
        },
    })).data;
    const songs = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.song;
    return {
        isEnd: songs == null ? true : songs.length < pageSize,
        data: (_c = songs === null || songs === void 0 ? void 0 : songs.map(formatMusicItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function searchAlbum(query, page) {
    var _a, _b, _c;
    const data = (await service.get("/rest/search3", {
        params: {
            query,
            albumCount: pageSize,
            albumOffset: (page - 1) * pageSize,
            songCount: 0,
            artistCount: 0,
        },
    })).data;
    const albums = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.album;
    return {
        isEnd: albums == null ? true : albums.length < pageSize,
        data: (_c = albums === null || albums === void 0 ? void 0 : albums.map(formatAlbumItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function searchArtist(query, page) {
    var _a, _b, _c;
    const data = (await service.get("/rest/search3", {
        params: {
            query,
            artistCount: pageSize,
            artistOffset: (page - 1) * pageSize,
            songCount: 0,
            albumCount: 0,
        },
    })).data;
    const artist = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.artist;
    return {
        isEnd: artist == null ? true : artist.length < pageSize,
        data: (_c = artist === null || artist === void 0 ? void 0 : artist.map(formatArtistItem)) !== null && _c !== void 0 ? _c : [],
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
    var _a;
    const data = (await service.get("/rest/getSong", {
        params: {
            id: musicItem.id,
        },
    })).data;
    const song = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.song;
    return formatMusicItem(song);
}
async function getAlbumInfo(albumItem, _) {
    var _a, _b, _c, _d;
    const data = (await service.get("/rest/getAlbum", {
        params: {
            id: albumItem.id,
        },
    })).data;
    const album = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.album;
    const song = album === null || album === void 0 ? void 0 : album.song;
    return {
        isEnd: true,
        musicList: (_b = song === null || song === void 0 ? void 0 : song.map(formatMusicItem)) !== null && _b !== void 0 ? _b : [],
        sheetItem: {
            worksNums: (_c = album === null || album === void 0 ? void 0 : album.songCount) !== null && _c !== void 0 ? _c : 0,
            playCount: (_d = album === null || album === void 0 ? void 0 : album.playCount) !== null && _d !== void 0 ? _d : 0,
        },
    };
}
function convertToLRC(jsonLyrics) {
    let lrcLyrics = "";
    jsonLyrics === null || jsonLyrics === void 0 ? void 0 : jsonLyrics.forEach((lyric) => {
        const minutes = Math.floor(lyric.start / 60000);
        const seconds = Math.floor((lyric.start % 60000) / 1000);
        const milliseconds = lyric.start % 1000;
        const formattedTime = `[${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(milliseconds).padStart(2, "0").slice(0, 2)}]`;
        lrcLyrics += `${formattedTime} ${lyric.value}\n`;
    });
    return lrcLyrics;
}
async function getLyric(musicItem) {
    var _a, _b, _c;
    const data = (await service.get("/rest/getLyricsBySongId", {
        params: {
            id: musicItem.id,
        },
    })).data;
    const lyricLines = (_c = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.lyricsList) === null || _b === void 0 ? void 0 : _b.structuredLyrics[0]) === null || _c === void 0 ? void 0 : _c.line;
    return {
        rawLrc: convertToLRC(lyricLines),
    };
}
async function getRecommendSheetsByTag(_) {
    var _a, _b, _c;
    const data = (await service.get("/rest/getPlaylists")).data;
    const playlist = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.playlists) === null || _b === void 0 ? void 0 : _b.playlist;
    return {
        isEnd: true,
        data: (_c = playlist === null || playlist === void 0 ? void 0 : playlist.map(formatPlaylistItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function getMusicSheetInfo(sheetItem, _) {
    var _a, _b, _c;
    const data = (await service.get("/rest/getPlaylist", {
        params: {
            id: sheetItem.id,
        },
    })).data;
    const playlist = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.playlist;
    const entry = playlist === null || playlist === void 0 ? void 0 : playlist.entry;
    return {
        isEnd: true,
        musicList: (_b = entry === null || entry === void 0 ? void 0 : entry.map(formatMusicItem)) !== null && _b !== void 0 ? _b : [],
        sheetItem: {
            worksNums: (_c = playlist === null || playlist === void 0 ? void 0 : playlist.songCount) !== null && _c !== void 0 ? _c : 0,
        },
    };
}
async function getArtistAlbums(artistItem) {
    var _a, _b, _c;
    const data = (await service.get("/rest/getArtist", {
        params: {
            id: artistItem.id,
        },
    })).data;
    const album = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.artist) === null || _b === void 0 ? void 0 : _b.album;
    return {
        isEnd: true,
        data: (_c = album === null || album === void 0 ? void 0 : album.map(formatAlbumItem)) !== null && _c !== void 0 ? _c : [],
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
async function getAlbumSheetList(type, page, size) {
    var _a, _b, _c;
    const data = (await service.get("/rest/getAlbumList2", {
        params: {
            type: type,
            size: size,
            offset: (page - 1) * size,
        },
    })).data;
    const album = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.albumList2) === null || _b === void 0 ? void 0 : _b.album;
    return (_c = album === null || album === void 0 ? void 0 : album.map(formatAlbumSheetItem)) !== null && _c !== void 0 ? _c : [];
}
async function getTopLists() {
    var _a, _b, _c, _d, _e, _f;
    const result = [];
    const recentList = getAlbumSheetList("recent", 1, 10);
    const starredList = getAlbumSheetList("starred", 1, 10);
    const ratedList = getAlbumSheetList("highest", 1, 10);
    const frequentList = getAlbumSheetList("frequent", 1, 10);
    const newestList = getAlbumSheetList("newest", 1, 10);
    const randomList = getAlbumSheetList("random", 1, 10);
    const datas = await Promise.all([
        recentList,
        starredList,
        ratedList,
        frequentList,
        newestList,
        randomList,
    ]);
    if (((_a = datas[0]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
        result.push({
            title: "最近播放的专辑",
            data: datas[0],
        });
    }
    if (((_b = datas[1]) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        result.push({
            title: "收藏专辑",
            data: datas[1],
        });
    }
    if (((_c = datas[2]) === null || _c === void 0 ? void 0 : _c.length) > 0) {
        result.push({
            title: "专辑评分排行",
            data: datas[2],
        });
    }
    if (((_d = datas[3]) === null || _d === void 0 ? void 0 : _d.length) > 0) {
        result.push({
            title: "播放最多的专辑",
            data: datas[3],
        });
    }
    if (((_e = datas[4]) === null || _e === void 0 ? void 0 : _e.length) > 0) {
        result.push({
            title: "最近添加的专辑",
            data: datas[4],
        });
    }
    if (((_f = datas[5]) === null || _f === void 0 ? void 0 : _f.length) > 0) {
        result.push({
            title: "随机专辑",
            data: datas[5],
        });
    }
    return result;
}
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
    srcUrl: "https://gh.zhuxiaole.link/https://raw.githubusercontent.com/zhuxiaole/MusicFreePlugins/main/dist/navidrome/index.js",
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
