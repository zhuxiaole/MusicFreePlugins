"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const CryptoJs = require("crypto-js");
const pageSize = 25;
function genSalt() {
    return Math.random().toString(16).slice(2);
}
function getRequestURL(urlPath) {
    var _a;
    const userVariables = (_a = env === null || env === void 0 ? void 0 : env.getUserVariables()) !== null && _a !== void 0 ? _a : {};
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
    urlObj.searchParams.append("v", "0.0.1");
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
    search,
    getMediaSource,
};
