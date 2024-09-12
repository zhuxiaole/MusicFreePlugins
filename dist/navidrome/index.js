'use strict';

var author = "猪小乐";
var appName = "MusicFree";
var pageSize = 25;
var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";
var config = {
	author: author,
	appName: appName,
	pageSize: pageSize,
	userAgent: userAgent
};

var pluginName = "Navidrome";
var pluginVersion = "0.0.5";
var entry = "index.ts";
var appVersion = ">0.1.0-alpha.0";
var srcUrl = "https://registry.npmmirror.com/musicfree-plugins/latest/files/navidrome/index.js";
var cacheControl = "no-cache";
var subsonicApiC = "MusicFree-PigNavidrome";
var subsonicApiV = "1.14.0";
var subsonicApiF = "json";
var pluginInfo = {
	pluginName: pluginName,
	pluginVersion: pluginVersion,
	entry: entry,
	appVersion: appVersion,
	srcUrl: srcUrl,
	cacheControl: cacheControl,
	subsonicApiC: subsonicApiC,
	subsonicApiV: subsonicApiV,
	subsonicApiF: subsonicApiF
};

const embyCookieManager = !(env === null || env === void 0 ? void 0 : env.debug)
    ? require("@react-native-cookies/cookies")
    : null;
const memoryStorage = {};
const storeManager = {
    set: async function (namespace, key, value) {
        if (embyCookieManager) {
            await embyCookieManager.set(namespace, {
                name: key,
                value: value !== null && value !== void 0 ? value : "",
            });
        }
        else {
            memoryStorage[`${namespace !== null && namespace !== void 0 ? namespace : ""}_${key}`] = value;
        }
    },
    get: async function (namespace, key) {
        var _a, _b;
        if (embyCookieManager) {
            const value = (_b = (_a = (await embyCookieManager.get(namespace))) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.value;
            return value !== null && value !== void 0 ? value : "";
        }
        else {
            return memoryStorage[`${namespace !== null && namespace !== void 0 ? namespace : ""}_${key}`];
        }
    },
    remove: async function (namespace, key) {
        if (embyCookieManager) {
            await embyCookieManager.set(namespace, {
                name: key,
                value: "",
            });
        }
        else {
            delete memoryStorage[`${namespace !== null && namespace !== void 0 ? namespace : ""}_${key}`];
        }
    },
};

const ndAxios = require("axios");
const ndCryptoJs = require("crypto-js");
let ndSingletonTokenRequest = null;
function genNdAuthInfoFromLoginResp(baseUrl, loginResp) {
    var _a, _b, _c, _d;
    return {
        ndBaseUrl: baseUrl !== null && baseUrl !== void 0 ? baseUrl : "",
        ndUsername: (_a = loginResp === null || loginResp === void 0 ? void 0 : loginResp.username) !== null && _a !== void 0 ? _a : "",
        ndToken: (_b = loginResp === null || loginResp === void 0 ? void 0 : loginResp.token) !== null && _b !== void 0 ? _b : "",
        subsonicSalt: (_c = loginResp === null || loginResp === void 0 ? void 0 : loginResp.subsonicSalt) !== null && _c !== void 0 ? _c : "",
        subsonicToken: (_d = loginResp === null || loginResp === void 0 ? void 0 : loginResp.subsonicToken) !== null && _d !== void 0 ? _d : "",
    };
}
async function storeNdAuthInfo(baseUrl, authInfo) {
    var _a, _b, _c, _d, _e;
    const storeAuthInfo = {
        ndBaseUrl: (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl) !== null && _a !== void 0 ? _a : "",
        ndUsername: (_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername) !== null && _b !== void 0 ? _b : "",
        ndToken: (_c = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndToken) !== null && _c !== void 0 ? _c : "",
        subsonicSalt: (_d = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicSalt) !== null && _d !== void 0 ? _d : "",
        subsonicToken: (_e = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicToken) !== null && _e !== void 0 ? _e : "",
    };
    await storeManager.set(baseUrl, "ndAuthInfo", JSON.stringify(storeAuthInfo));
}
async function getStoredNdAuthInfo(baseUrl) {
    const authInfoStr = await storeManager.get(baseUrl, "ndAuthInfo");
    return (authInfoStr === null || authInfoStr === void 0 ? void 0 : authInfoStr.length) > 0 ? JSON.parse(authInfoStr) : null;
}
async function resetStoredNdAuthInfo(baseUrl) {
    await storeManager.remove(baseUrl, "ndAuthInfo");
}
function getNdUserVariables() {
    var _a, _b, _c;
    let userVariables = (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {};
    if (!((_b = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _b === void 0 ? void 0 : _b.startsWith("http://")) &&
        !((_c = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _c === void 0 ? void 0 : _c.startsWith("https://"))) {
        userVariables.url = `http://${userVariables.url}`;
    }
    return userVariables;
}
function getConfigNdBaseUrl() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getNdUserVariables()) === null || _a === void 0 ? void 0 : _a.url) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function getConfigNdUsername() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getNdUserVariables()) === null || _a === void 0 ? void 0 : _a.username) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function getConfigNdPassword() {
    var _a, _b, _c;
    return (_c = (_b = (_a = getNdUserVariables()) === null || _a === void 0 ? void 0 : _a.password) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
}
function isSubsonicAuthInfoValid(info) {
    return (info &&
        info.ndUsername &&
        info.ndUsername.length > 0 &&
        info.subsonicSalt &&
        info.subsonicSalt.length > 0 &&
        info.subsonicToken &&
        info.subsonicToken.length > 0);
}
function isNdAuthInfoValid(info) {
    return info && info.ndToken && info.ndToken.length > 0;
}
function isNdLoginUrl(baseUrl, url) {
    return (baseUrl &&
        baseUrl === getConfigNdBaseUrl() &&
        url &&
        url.startsWith("/auth/login"));
}
function isSubsonicUrl(baseUrl, url) {
    return (baseUrl &&
        baseUrl === getConfigNdBaseUrl() &&
        url &&
        url.startsWith("/rest"));
}
function isNdUrl(baseUrl, url) {
    return (isNdLoginUrl(baseUrl, url) ||
        (baseUrl &&
            baseUrl === getConfigNdBaseUrl() &&
            url &&
            url.startsWith("/api")));
}
const ndService = ndAxios.create({
    timeout: 30000,
    headers: { "User-Agent": config.userAgent },
});
ndService.interceptors.request.use(async function (config) {
    var _a, _b;
    config.baseURL = (_a = config.baseURL) !== null && _a !== void 0 ? _a : getConfigNdBaseUrl();
    if (config.method === "post") {
        config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    const ifLoginUrl = isNdLoginUrl(config.baseURL, config.url);
    const ifSubsonicUrl = isSubsonicUrl(config.baseURL, config.url);
    const ifNdUrl = isNdUrl(config.baseURL, config.url);
    if ((ifNdUrl || ifSubsonicUrl) && !ifLoginUrl) {
        let authInfo = await getStoredNdAuthInfo(config.baseURL);
        const baseURLHost = config.baseURL ? new URL(config.baseURL).host : null;
        const storedBaseURLHost = (authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl)
            ? new URL(authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl).host
            : null;
        if (((storedBaseURLHost === null || storedBaseURLHost === void 0 ? void 0 : storedBaseURLHost.length) > 0 && baseURLHost !== storedBaseURLHost) ||
            (((_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername) === null || _b === void 0 ? void 0 : _b.length) > 0 &&
                getConfigNdUsername() !== (authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername))) {
            await resetStoredNdAuthInfo(config.baseURL);
            authInfo = null;
        }
        if ((ifNdUrl && !isNdAuthInfoValid(authInfo)) ||
            (ifSubsonicUrl && !isSubsonicAuthInfoValid(authInfo))) {
            await requestNdToken();
            authInfo = await getStoredNdAuthInfo(config.baseURL);
        }
        if (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo)) {
            config.params = Object.assign({ u: authInfo.ndUsername, s: authInfo.subsonicSalt, t: authInfo.subsonicToken, c: pluginInfo.subsonicApiC, v: pluginInfo.subsonicApiV, f: pluginInfo.subsonicApiF }, config.params);
        }
        if (ifNdUrl && isNdAuthInfoValid(authInfo)) {
            config.headers["x-nd-authorization"] = `Bearer ${authInfo.ndToken}`;
        }
    }
    return Promise.resolve(config);
}, (error) => {
    return Promise.reject(error);
});
ndService.interceptors.response.use(async function (response) {
    return Promise.resolve(response);
}, async function (error) {
    var _a;
    if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        const ifNdUrl = isNdUrl(error.config.baseURL, error.config.url);
        const ifSubsonicUrl = isSubsonicUrl(error.config.baseURL, error.config.url);
        if (ifNdUrl || ifSubsonicUrl) {
            if (!isNdLoginUrl(error.config.baseURL, error.config.url)) {
                await requestNdToken();
                const authInfo = await getStoredNdAuthInfo(error.config.baseURL);
                if ((ifNdUrl && isNdAuthInfoValid(authInfo)) ||
                    (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo))) {
                    return await ndService.request(error.config);
                }
            }
            await resetStoredNdAuthInfo(error.config.baseURL);
        }
    }
    return Promise.reject(error);
});
function requestNdToken() {
    if (ndSingletonTokenRequest !== null) {
        return ndSingletonTokenRequest;
    }
    const username = getConfigNdUsername();
    const password = getConfigNdPassword();
    ndSingletonTokenRequest = new Promise(async function (resolve, reject) {
        const baseUrl = getConfigNdBaseUrl();
        await ndService
            .post("/auth/login", {
            username,
            password,
        })
            .then(async function ({ data }) {
            try {
                await storeNdAuthInfo(baseUrl, genNdAuthInfoFromLoginResp(baseUrl, data));
                resolve(data);
            }
            catch (err) {
                reject(err);
            }
        })
            .catch(async function (err) {
            try {
                await resetStoredNdAuthInfo(baseUrl);
            }
            finally {
                reject(err);
            }
        });
    });
    ndSingletonTokenRequest.finally(() => {
        ndSingletonTokenRequest = null;
    });
    return ndSingletonTokenRequest;
}
function genSalt() {
    return Math.random().toString(16).slice(2);
}
function getSubsonicURL(pathname) {
    let { url, username, password } = getNdUserVariables();
    if (!(url && username && password)) {
        return null;
    }
    const salt = genSalt();
    const urlObj = new URL(url);
    urlObj.pathname = pathname;
    urlObj.searchParams.append("u", username);
    urlObj.searchParams.append("s", salt);
    urlObj.searchParams.append("t", ndCryptoJs.MD5(`${password}${salt}`).toString(ndCryptoJs.enc.Hex));
    urlObj.searchParams.append("c", pluginInfo.subsonicApiC);
    urlObj.searchParams.append("v", pluginInfo.subsonicApiV);
    urlObj.searchParams.append("f", pluginInfo.subsonicApiF);
    return urlObj;
}
function getNdCoverArtUrl(itemId) {
    const urlObj = getSubsonicURL("/rest/getCoverArt");
    urlObj.searchParams.append("id", itemId);
    urlObj.searchParams.append("size", "300");
    return urlObj.toString();
}
async function getNdPlaylists(query, sort, page) {
    const startIndex = (page - 1) * config.pageSize;
    return (await ndService.get("/api/playlist", {
        params: {
            q: query,
            _start: startIndex,
            _end: startIndex + config.pageSize,
            _sort: sort,
        },
    })).data;
}
async function getNdAlbumList(type, page, size) {
    const startIndex = (page - 1) * size;
    const params = {
        _start: startIndex,
        _end: startIndex + size,
    };
    switch (type) {
        case "recent":
            params["recently_played"] = true;
            params["_sort"] = "play_date";
            params["_order"] = "DESC";
            break;
        case "starred":
            params["starred"] = true;
            params["_sort"] = "starred_at";
            params["_order"] = "DESC";
            break;
        case "highest":
            params["has_rating"] = true;
            params["_sort"] = "rating";
            params["_order"] = "DESC";
            break;
        case "frequent":
            params["recently_played"] = true;
            params["_sort"] = "play_count";
            params["_order"] = "DESC";
            break;
        case "newest":
            params["_sort"] = "recently_added";
            params["_order"] = "DESC";
            break;
        case "random":
            params["_sort"] = "random";
            params["_order"] = "ASC";
            break;
    }
    return (await ndService.get("/api/album", { params })).data;
}
async function getNdRelatedAlbumList(artist_id, genre_id, page, order, sort) {
    const startIndex = (page - 1) * config.pageSize;
    const params = {
        _start: startIndex,
        _end: startIndex + config.pageSize,
        _order: order,
        _sort: sort,
    };
    if (artist_id && artist_id.length > 0) {
        params["artist_id"] = artist_id;
    }
    if (genre_id && genre_id.length > 0) {
        params["genre_id"] = genre_id;
    }
    return (await ndService.get("/api/album", { params })).data;
}
async function getNdPlaylistTracks(playlistId, page, order = "", sort = "") {
    const startIndex = (page - 1) * config.pageSize;
    return (await ndService.get(`/api/playlist/${playlistId}/tracks`, {
        params: {
            playlist_id: playlistId,
            _start: startIndex,
            _end: startIndex + config.pageSize,
            _order: order,
            _sort: sort,
        },
    })).data;
}
async function getNdAlbumInfo(id) {
    return await ndService
        .get(`/api/album/${id}`)
        .then((resp) => {
        var _a;
        return Promise.resolve((_a = resp.data) !== null && _a !== void 0 ? _a : {});
    })
        .catch((err) => Promise.reject(err));
}
async function getNdAlbumSongList(albumId, page) {
    const startIndex = (page - 1) * config.pageSize;
    return await ndService
        .get("/api/song", {
        params: {
            album_id: albumId,
            _start: startIndex,
            _end: startIndex + config.pageSize,
            _order: "ASC",
            _sort: "album",
        },
    })
        .then((resp) => {
        var _a;
        return Promise.resolve((_a = resp.data) !== null && _a !== void 0 ? _a : []);
    })
        .catch((err) => Promise.reject(err));
}
function formatMusicItem(it) {
    return {
        id: it.id,
        title: it.title,
        artist: it.artist,
        artistId: it.artistId,
        album: it.album,
        albumid: it.albumId,
        artwork: getNdCoverArtUrl(it.id),
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
        artwork: getNdCoverArtUrl(it.mediaFileId),
        duration: it.duration,
    };
}
function formatAlbumItem(it) {
    var _a;
    return {
        id: it.id,
        title: it.name,
        artist: it.artist,
        artistId: it.artistId,
        artwork: getNdCoverArtUrl(it.id),
        worksNums: it.songCount,
        duration: it.duration,
        date: it.date,
        description: (_a = it.comment) !== null && _a !== void 0 ? _a : "",
    };
}
function formatArtistItem(it) {
    return {
        id: it.id,
        name: it.name,
        avatar: getNdCoverArtUrl(it.id),
        worksNum: it.songCount,
    };
}
function formatPlaylistItem(it) {
    var _a;
    return {
        id: it.id,
        artist: it.ownerName,
        title: it.name,
        artwork: getNdCoverArtUrl(it.id),
        playCount: (_a = it.playCount) !== null && _a !== void 0 ? _a : 0,
        worksNums: it.songCount,
        createTime: it.createdAt,
        description: it.comment,
    };
}
async function searchMusic(query, page) {
    var _a;
    const startIndex = (page - 1) * config.pageSize;
    const data = (await ndService.get("/api/song", {
        params: {
            title: query,
            _start: startIndex,
            _end: startIndex + config.pageSize,
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < config.pageSize,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatMusicItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function searchSheet(query, page) {
    var _a;
    const data = await getNdPlaylists(query, "", page);
    return {
        isEnd: data == null ? true : data.length < config.pageSize,
        data: (_a = data === null || data === void 0 ? void 0 : data.map((it) => {
            return Object.assign(Object.assign({}, formatPlaylistItem(it)), { sheetType: "playlist" });
        })) !== null && _a !== void 0 ? _a : [],
    };
}
async function searchAlbum(query, page) {
    var _a, _b, _c;
    const data = (await ndService.get("/rest/search3", {
        params: {
            query,
            albumCount: config.pageSize,
            albumOffset: (page - 1) * config.pageSize,
            songCount: 0,
            artistCount: 0,
        },
    })).data;
    const albums = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.album;
    return {
        isEnd: albums == null ? true : albums.length < config.pageSize,
        data: (_c = albums === null || albums === void 0 ? void 0 : albums.map(formatAlbumItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function searchArtist(query, page) {
    var _a;
    const startIndex = (page - 1) * config.pageSize;
    const data = (await ndService.get("/api/artist", {
        params: {
            name: query,
            _start: startIndex,
            _end: startIndex + config.pageSize,
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < config.pageSize,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatArtistItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function scrobble(id) {
    await ndService.get("/rest/scrobble", {
        params: {
            id: id,
        },
    });
}
function convertNdLyricToLRC(jsonLyrics) {
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
async function getArtistAlbums(artistItem, page) {
    var _a;
    const data = await getNdRelatedAlbumList(artistItem.id, "", page, "ASC", "max_year asc,date asc");
    return {
        isEnd: data == null ? true : data.length < config.pageSize,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatAlbumItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function getArtistMusics(artistItem, page) {
    var _a;
    const startIndex = (page - 1) * config.pageSize;
    const data = (await ndService.get("/api/song", {
        params: {
            artist_id: artistItem.id,
            _start: startIndex,
            _end: startIndex + config.pageSize,
            _order: "ASC",
            _sort: "title",
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < config.pageSize,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatMusicItem)) !== null && _a !== void 0 ? _a : [],
    };
}
function formatAlbumSheetItem(it) {
    return {
        id: it.id,
        description: it.artist,
        title: it.name,
        coverImg: getNdCoverArtUrl(it.id),
        playCount: it.playCount,
        sheetType: "album",
    };
}
async function getAlbumSheetList(type, page, size) {
    var _a;
    const album = await getNdAlbumList(type, page, size);
    return (_a = album === null || album === void 0 ? void 0 : album.map(formatAlbumSheetItem)) !== null && _a !== void 0 ? _a : [];
}
async function getNdAlbumSheetInfo(albumItem, page) {
    var _a, _b, _c;
    const albumRequest = getNdAlbumInfo(albumItem.id);
    const songsRequest = getNdAlbumSongList(albumItem.id, page);
    const datas = await Promise.all([albumRequest, songsRequest]);
    const album = datas[0];
    const song = datas[1];
    return {
        isEnd: song == null ? true : song.length < config.pageSize,
        musicList: (_a = song === null || song === void 0 ? void 0 : song.map(formatMusicItem)) !== null && _a !== void 0 ? _a : [],
        sheetItem: {
            worksNums: (_b = album === null || album === void 0 ? void 0 : album.songCount) !== null && _b !== void 0 ? _b : 0,
            playCount: (_c = album === null || album === void 0 ? void 0 : album.playCount) !== null && _c !== void 0 ? _c : 0,
        },
    };
}
module.exports = {
    platform: pluginInfo.pluginName,
    version: pluginInfo.pluginVersion,
    author: config.author,
    appVersion: pluginInfo.appVersion,
    srcUrl: pluginInfo.srcUrl,
    cacheControl: pluginInfo.cacheControl,
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
    async search(query, page, type) {
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
    },
    async getMediaSource(musicItem, quality) {
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
    },
    async getMusicInfo(musicItem) {
        const data = (await ndService.get(`/api/song/${musicItem.id}`)).data;
        await scrobble(musicItem.id);
        return formatMusicItem(data);
    },
    async getAlbumInfo(albumItem, page) {
        return await getNdAlbumSheetInfo(albumItem, page);
    },
    async getLyric(musicItem) {
        var _a, _b, _c, _d;
        const data = (await ndService.get("/rest/getLyricsBySongId", {
            params: {
                id: musicItem.id,
            },
        })).data;
        const lyricLines = (_d = (_c = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.lyricsList) === null || _b === void 0 ? void 0 : _b.structuredLyrics) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.line;
        return {
            rawLrc: convertNdLyricToLRC(lyricLines),
        };
    },
    async getRecommendSheetTags() {
        const resp = (await ndService.get("/api/genre")).data;
        const data = resp === null || resp === void 0 ? void 0 : resp.map((it) => ({
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
    },
    async getRecommendSheetsByTag(tagItem, page) {
        var _a, _b;
        let sheetList;
        if (!tagItem || !tagItem.id || tagItem.id.length <= 0) {
            const data = await getNdPlaylists("", "name", page);
            sheetList =
                (_a = data === null || data === void 0 ? void 0 : data.map((it) => {
                    return Object.assign(Object.assign({}, formatPlaylistItem(it)), { sheetType: "playlist" });
                })) !== null && _a !== void 0 ? _a : [];
        }
        else {
            const data = await getNdRelatedAlbumList("", tagItem.id, page, "ASC", "max_year asc,date asc");
            sheetList = (_b = data === null || data === void 0 ? void 0 : data.map(formatAlbumSheetItem)) !== null && _b !== void 0 ? _b : [];
        }
        return {
            isEnd: sheetList == null ? true : sheetList.length < config.pageSize,
            data: sheetList,
        };
    },
    async getMusicSheetInfo(sheetItem, page) {
        var _a, _b;
        let musicList = null;
        if (sheetItem.sheetType === "playlist") {
            const data = await getNdPlaylistTracks(sheetItem.id, "ASC", "id");
            musicList = (_a = data === null || data === void 0 ? void 0 : data.map(formatPlaylistMusicItem)) !== null && _a !== void 0 ? _a : [];
        }
        else if (sheetItem.sheetType === "album") {
            const data = await getNdAlbumSheetInfo(sheetItem, page);
            musicList = (_b = data === null || data === void 0 ? void 0 : data.musicList) !== null && _b !== void 0 ? _b : [];
        }
        return {
            isEnd: musicList == null ? true : musicList.length < config.pageSize,
            musicList: musicList,
        };
    },
    async getArtistWorks(artistItem, page, type) {
        if (type === "album") {
            return await getArtistAlbums(artistItem, page);
        }
        if (type === "music") {
            return await getArtistMusics(artistItem, page);
        }
    },
    async getTopLists() {
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
        if (((_a = datas === null || datas === void 0 ? void 0 : datas[0]) === null || _a === void 0 ? void 0 : _a.length) > 0) {
            result.push({
                title: "最近播放的专辑",
                data: datas[0],
            });
        }
        if (((_b = datas === null || datas === void 0 ? void 0 : datas[1]) === null || _b === void 0 ? void 0 : _b.length) > 0) {
            result.push({
                title: "收藏专辑",
                data: datas[1],
            });
        }
        if (((_c = datas === null || datas === void 0 ? void 0 : datas[2]) === null || _c === void 0 ? void 0 : _c.length) > 0) {
            result.push({
                title: "评分最高的专辑",
                data: datas[2],
            });
        }
        if (((_d = datas === null || datas === void 0 ? void 0 : datas[3]) === null || _d === void 0 ? void 0 : _d.length) > 0) {
            result.push({
                title: "播放最多的专辑",
                data: datas[3],
            });
        }
        if (((_e = datas === null || datas === void 0 ? void 0 : datas[4]) === null || _e === void 0 ? void 0 : _e.length) > 0) {
            result.push({
                title: "最近添加的专辑",
                data: datas[4],
            });
        }
        if (((_f = datas === null || datas === void 0 ? void 0 : datas[5]) === null || _f === void 0 ? void 0 : _f.length) > 0) {
            result.push({
                title: "随机专辑",
                data: datas[5],
            });
        }
        return result;
    },
    async getTopListDetail(topListItem, page) {
        if (topListItem.sheetType === "album") {
            return await getNdAlbumSheetInfo(topListItem, page);
        }
    },
};
