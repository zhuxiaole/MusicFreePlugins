const axios = require("axios");
const CryptoJs = require("crypto-js");
const CookieManager = !(env === null || env === void 0 ? void 0 : env.debug)
    ? require("@react-native-cookies/cookies")
    : null;
const PAGE_SIZE = 25;
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0";
const SUBSONIC_API_C = "MusicFree-PigNavidrome";
const SUBSONIC_API_V = "1.14.0";
const SUBSONIC_API_F = "json";
let singletonTokenRequest = null;
const debugAuthInfo = genDefaultAuthInfo();
function genDefaultAuthInfo() {
    return {
        ndBaseUrl: "",
        ndUsername: "",
        ndToken: "",
        subsonicSalt: "",
        subsonicToken: "",
    };
}
function genAuthInfoFromLoginResp(baseUrl, loginResp) {
    var _a, _b, _c, _d;
    return {
        ndBaseUrl: baseUrl !== null && baseUrl !== void 0 ? baseUrl : "",
        ndUsername: (_a = loginResp === null || loginResp === void 0 ? void 0 : loginResp.username) !== null && _a !== void 0 ? _a : "",
        ndToken: (_b = loginResp === null || loginResp === void 0 ? void 0 : loginResp.token) !== null && _b !== void 0 ? _b : "",
        subsonicSalt: (_c = loginResp === null || loginResp === void 0 ? void 0 : loginResp.subsonicSalt) !== null && _c !== void 0 ? _c : "",
        subsonicToken: (_d = loginResp === null || loginResp === void 0 ? void 0 : loginResp.subsonicToken) !== null && _d !== void 0 ? _d : "",
    };
}
function storeAuthInfo(baseUrl, authInfo) {
    var _a, _b, _c, _d, _e;
    if (!CookieManager) {
        return new Promise((resolve, reject) => {
            var _a, _b, _c, _d, _e;
            try {
                debugAuthInfo.ndBaseUrl = (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl) !== null && _a !== void 0 ? _a : "";
                debugAuthInfo.ndUsername = (_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername) !== null && _b !== void 0 ? _b : "";
                debugAuthInfo.ndToken = (_c = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndToken) !== null && _c !== void 0 ? _c : "";
                debugAuthInfo.subsonicSalt = (_d = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicSalt) !== null && _d !== void 0 ? _d : "";
                debugAuthInfo.subsonicToken = (_e = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicToken) !== null && _e !== void 0 ? _e : "";
                resolve("success");
            }
            catch (err) {
                reject(err);
            }
        });
    }
    else {
        const ndBaseUrlStore = CookieManager.set(baseUrl, {
            name: "ndBaseUrl",
            value: (_a = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl) !== null && _a !== void 0 ? _a : "",
        });
        const ndUsernameStore = CookieManager.set(baseUrl, {
            name: "ndUsername",
            value: (_b = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername) !== null && _b !== void 0 ? _b : "",
        });
        const ndTokenStore = CookieManager.set(baseUrl, {
            name: "ndToken",
            value: (_c = authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndToken) !== null && _c !== void 0 ? _c : "",
        });
        const subsonicSaltStore = CookieManager.set(baseUrl, {
            name: "subsonicSalt",
            value: (_d = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicSalt) !== null && _d !== void 0 ? _d : "",
        });
        const subsonicTokenStore = CookieManager.set(baseUrl, {
            name: "subsonicToken",
            value: (_e = authInfo === null || authInfo === void 0 ? void 0 : authInfo.subsonicToken) !== null && _e !== void 0 ? _e : "",
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
function getStoredAuthInfo(baseUrl) {
    if (!CookieManager) {
        return new Promise((resolve) => {
            resolve(debugAuthInfo);
        });
    }
    else {
        return CookieManager.get(baseUrl).then((cookies) => {
            var _a, _b, _c, _d, _e;
            return Promise.resolve({
                ndBaseUrl: (_a = cookies.ndBaseUrl) === null || _a === void 0 ? void 0 : _a.value,
                ndUsername: (_b = cookies.ndUsername) === null || _b === void 0 ? void 0 : _b.value,
                ndToken: (_c = cookies.ndToken) === null || _c === void 0 ? void 0 : _c.value,
                subsonicSalt: (_d = cookies.subsonicSalt) === null || _d === void 0 ? void 0 : _d.value,
                subsonicToken: (_e = cookies.subsonicToken) === null || _e === void 0 ? void 0 : _e.value,
            });
        });
    }
}
function resetStoredAuthInfo(baseUrl) {
    return storeAuthInfo(baseUrl, genDefaultAuthInfo());
}
function getUserVariables() {
    var _a, _b, _c;
    let userVariables = (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {};
    if (!((_b = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _b === void 0 ? void 0 : _b.startsWith("http://")) &&
        !((_c = userVariables === null || userVariables === void 0 ? void 0 : userVariables.url) === null || _c === void 0 ? void 0 : _c.startsWith("https://"))) {
        userVariables.url = `http://${userVariables.url}`;
    }
    return userVariables;
}
function getConfigNdBaseUrl() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.url;
}
function getConfigNdUsername() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.username;
}
function getConfigNdPassword() {
    var _a;
    return (_a = getUserVariables()) === null || _a === void 0 ? void 0 : _a.password;
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
function isLoginUrl(baseUrl, url) {
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
    return (isLoginUrl(baseUrl, url) ||
        (baseUrl &&
            baseUrl === getConfigNdBaseUrl() &&
            url &&
            url.startsWith("/api")));
}
const service = axios.create({
    timeout: 30000,
    headers: { "User-Agent": UA },
});
service.interceptors.request.use(async function (config) {
    var _a;
    config.baseURL = (_a = config.baseURL) !== null && _a !== void 0 ? _a : getConfigNdBaseUrl();
    if (config.method === "post") {
        config.headers["Content-Type"] = "application/json;charset=utf-8";
    }
    const ifLoginUrl = isLoginUrl(config.baseURL, config.url);
    const ifSubsonicUrl = isSubsonicUrl(config.baseURL, config.url);
    const ifNdUrl = isNdUrl(config.baseURL, config.url);
    if ((ifNdUrl || ifSubsonicUrl) && !ifLoginUrl) {
        let authInfo = await getStoredAuthInfo(config.baseURL);
        const baseURLHost = config.baseURL ? new URL(config.baseURL).host : null;
        const storedBaseURLHost = (authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl)
            ? new URL(authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndBaseUrl).host
            : null;
        if (baseURLHost !== storedBaseURLHost ||
            getConfigNdUsername() !== (authInfo === null || authInfo === void 0 ? void 0 : authInfo.ndUsername)) {
            await resetStoredAuthInfo(config.baseURL);
            authInfo = null;
        }
        if ((ifNdUrl && !isNdAuthInfoValid(authInfo)) ||
            (ifSubsonicUrl && !isSubsonicAuthInfoValid(authInfo))) {
            await requestToken();
            authInfo = await getStoredAuthInfo(config.baseURL);
        }
        if (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo)) {
            config.params = Object.assign({ u: authInfo.ndUsername, s: authInfo.subsonicSalt, t: authInfo.subsonicToken, c: SUBSONIC_API_C, v: SUBSONIC_API_V, f: SUBSONIC_API_F }, config.params);
        }
        if (ifNdUrl && isNdAuthInfoValid(authInfo)) {
            config.headers["x-nd-authorization"] = `Bearer ${authInfo.ndToken}`;
        }
    }
    return Promise.resolve(config);
}, (error) => {
    return Promise.reject(error);
});
service.interceptors.response.use(async function (response) {
    return Promise.resolve(response);
}, async function (error) {
    var _a;
    if (((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
        const ifNdUrl = isNdUrl(error.config.baseURL, error.config.url);
        const ifSubsonicUrl = isSubsonicUrl(error.config.baseURL, error.config.url);
        if (ifNdUrl || ifSubsonicUrl) {
            if (!isLoginUrl(error.config.baseURL, error.config.url)) {
                await requestToken();
                const authInfo = await getStoredAuthInfo(error.config.baseURL);
                if ((ifNdUrl && isNdAuthInfoValid(authInfo)) ||
                    (ifSubsonicUrl && isSubsonicAuthInfoValid(authInfo))) {
                    return await service.request(error.config);
                }
            }
            await resetStoredAuthInfo(error.config.baseURL);
        }
    }
    return Promise.reject(error);
});
function requestToken() {
    if (singletonTokenRequest !== null) {
        return singletonTokenRequest;
    }
    let { _, username, password } = getUserVariables();
    singletonTokenRequest = new Promise(async function (resolve, reject) {
        const baseUrl = getConfigNdBaseUrl();
        await service
            .post("/auth/login", {
            username,
            password,
        })
            .then(({ data }) => {
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
    urlObj.searchParams.append("t", CryptoJs.MD5(`${password}${salt}`).toString(CryptoJs.enc.Hex));
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
function formatMusicItem(it) {
    var _a;
    const lyricsArr = it.lyrics ? JSON.parse(it.lyrics) : null;
    let rawLrc = "";
    if (lyricsArr && lyricsArr.length > 0) {
        rawLrc = convertToLRC((_a = lyricsArr[0]) === null || _a === void 0 ? void 0 : _a.line);
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
    var _a;
    const lyricsArr = it.lyrics ? JSON.parse(it.lyrics) : null;
    let rawLrc = "";
    if (lyricsArr && lyricsArr.length > 0) {
        rawLrc = convertToLRC((_a = lyricsArr[0]) === null || _a === void 0 ? void 0 : _a.line);
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
    var _a;
    return {
        id: it.id,
        title: it.name,
        artist: it.artist,
        artistId: it.artistId,
        artwork: getCoverArtUrl(it.id),
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
        avatar: getCoverArtUrl(it.id),
        worksNum: it.songCount,
    };
}
function formatPlaylistItem(it) {
    var _a;
    return {
        id: it.id,
        artist: it.ownerName,
        title: it.name,
        artwork: getCoverArtUrl(it.id),
        playCount: (_a = it.playCount) !== null && _a !== void 0 ? _a : 0,
        worksNums: it.songCount,
        createTime: it.createdAt,
        description: it.comment,
    };
}
async function searchMusic(query, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/song", {
        params: {
            title: query,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatMusicItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function searchSheet(query, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/playlist", {
        params: {
            q: query,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatPlaylistItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function searchAlbum(query, page) {
    var _a, _b, _c;
    const data = (await service.get("/rest/search3", {
        params: {
            query,
            albumCount: PAGE_SIZE,
            albumOffset: (page - 1) * PAGE_SIZE,
            songCount: 0,
            artistCount: 0,
        },
    })).data;
    const albums = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.album;
    return {
        isEnd: albums == null ? true : albums.length < PAGE_SIZE,
        data: (_c = albums === null || albums === void 0 ? void 0 : albums.map(formatAlbumItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function searchArtist(query, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/artist", {
        params: {
            name: query,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatArtistItem)) !== null && _a !== void 0 ? _a : [],
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
    scrobble(musicItem.id);
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
    var _a, _b, _c, _d, _e;
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
    const album = (_a = datas[0]) === null || _a === void 0 ? void 0 : _a.data;
    const song = (_b = datas[1]) === null || _b === void 0 ? void 0 : _b.data;
    return {
        isEnd: song == null ? true : song.length < PAGE_SIZE,
        musicList: (_c = song === null || song === void 0 ? void 0 : song.map(formatMusicItem)) !== null && _c !== void 0 ? _c : [],
        sheetItem: {
            worksNums: (_d = album === null || album === void 0 ? void 0 : album.songCount) !== null && _d !== void 0 ? _d : 0,
            playCount: (_e = album === null || album === void 0 ? void 0 : album.playCount) !== null && _e !== void 0 ? _e : 0,
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
async function getRecommendSheetsByTag(_, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/playlist", {
        params: {
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
            _sort: "name",
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatPlaylistItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function getMusicSheetInfo(sheetItem, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get(`/api/playlist/${sheetItem.id}/tracks`, {
        params: {
            playlist_id: sheetItem.id,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
            _order: "ASC",
            _sort: "id",
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        musicList: (_a = data === null || data === void 0 ? void 0 : data.map(formatPlaylistMusicItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function getArtistAlbums(artistItem, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/album", {
        params: {
            artist_id: artistItem.id,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
            _order: "ASC",
            _sort: "max_year asc,date asc",
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatAlbumItem)) !== null && _a !== void 0 ? _a : [],
    };
}
async function getArtistMusics(artistItem, page) {
    var _a;
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = (await service.get("/api/song", {
        params: {
            artist_id: artistItem.id,
            _start: startIndex,
            _end: startIndex + PAGE_SIZE,
            _order: "ASC",
            _sort: "title",
        },
    })).data;
    return {
        isEnd: data == null ? true : data.length < PAGE_SIZE,
        data: (_a = data === null || data === void 0 ? void 0 : data.map(formatMusicItem)) !== null && _a !== void 0 ? _a : [],
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
    version: "0.0.5",
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
    supportedSearchType: ["music", "album", "artist", "sheet"],
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
