"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const CryptoJs = require("crypto-js");
const pageSize = 25;
let userVars = null;
function setUserVariables(userVariables) {
    userVars = userVariables;
}
function genSalt() {
    return Math.random().toString(16).slice(2);
}
function getRequestURL(urlPath) {
    var _a;
    const userVariables = userVars == null ? (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {} : userVars;
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
async function httpGet(urlPath, params) {
    return (await axios_1.default.get(getRequestURL(urlPath).toString(), {
        params: Object.assign({}, params),
    })).data;
}
function formatMusicItem(it) {
    return Object.assign(Object.assign({}, it), { artwork: getCoverArtUrl(it.coverArt) });
}
function formatAlbumItem(it) {
    return Object.assign(Object.assign({}, it), { artwork: getCoverArtUrl(it.coverArt) });
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
    const data = await httpGet("search3", {
        query,
        songCount: pageSize,
        songOffset: (page - 1) * pageSize,
    });
    const songs = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.song;
    return {
        isEnd: songs == null ? true : songs.length < pageSize,
        data: (_c = songs === null || songs === void 0 ? void 0 : songs.map(formatMusicItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function searchAlbum(query, page) {
    var _a, _b, _c;
    const data = await httpGet("search3", {
        query,
        albumCount: pageSize,
        albumOffset: (page - 1) * pageSize,
    });
    const songs = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.searchResult3) === null || _b === void 0 ? void 0 : _b.album;
    return {
        isEnd: songs == null ? true : songs.length < pageSize,
        data: (_c = songs === null || songs === void 0 ? void 0 : songs.map(formatAlbumItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function search(query, page, type) {
    if (type === "music") {
        return await searchMusic(query, page);
    }
    if (type === "album") {
        return await searchAlbum(query, page);
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
    const data = await httpGet("getSong", {
        id: musicItem.id,
    });
    const song = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.song;
    return formatMusicItem(song);
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
    const data = await httpGet("getLyricsBySongId", {
        id: musicItem.id,
    });
    const lyricLines = (_c = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.lyricsList) === null || _b === void 0 ? void 0 : _b.structuredLyrics[0]) === null || _c === void 0 ? void 0 : _c.line;
    return {
        rawLrc: convertToLRC(lyricLines),
    };
}
async function getRecommendSheetsByTag(tagItem) {
    var _a, _b, _c;
    const data = await httpGet("getPlaylists");
    const playlist = (_b = (_a = data["subsonic-response"]) === null || _a === void 0 ? void 0 : _a.playlists) === null || _b === void 0 ? void 0 : _b.playlist;
    return {
        isEnd: true,
        data: (_c = playlist === null || playlist === void 0 ? void 0 : playlist.map(formatPlaylistItem)) !== null && _c !== void 0 ? _c : [],
    };
}
async function getMusicSheetInfo(sheetItem, _) {
    var _a, _b, _c;
    const data = await httpGet("getPlaylist", {
        id: sheetItem.id,
    });
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
module.exports = {
    platform: "Navidrome",
    version: "0.0.1",
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
    supportedSearchType: ["music", "album"],
    setUserVariables,
    search,
    getMediaSource,
    getMusicInfo,
    getLyric,
    getRecommendSheetsByTag,
    getMusicSheetInfo,
};
