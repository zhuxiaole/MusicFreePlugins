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
    urlObj.searchParams.append("v", "1.8.0");
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
async function searchMusic(query, page) {
    const data = await httpGet("search2", {
        query,
        songCount: pageSize,
        songOffset: (page - 1) * pageSize,
    });
    const songs = data["subsonic-response"].searchResult2.song;
    return {
        isEnd: songs.length < pageSize,
        data: songs.map(formatMusicItem),
    };
}
async function searchAlbum(query, page) {
    const data = await httpGet("search2", {
        query,
        albumCount: pageSize,
        albumOffset: (page - 1) * pageSize,
    });
    const songs = data["subsonic-response"].searchResult2.album;
    return {
        isEnd: songs.length < pageSize,
        data: songs.map(formatAlbumItem),
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
    const data = await httpGet("getSong", {
        id: musicItem.id,
    });
    const song = data["subsonic-response"].song;
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
};
