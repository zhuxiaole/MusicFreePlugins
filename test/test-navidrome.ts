const test = require("./test-user-vars.json");

/// <reference types="../types/global" />
global.env = {
  getUserVariables: () => {
    return {
      url: test.navidrome.url,
      username: test.navidrome.username,
      password: test.navidrome.password,
    };
  },
  debug: true,
};

const navidrome = require("../plugins/navidrome/index");

// navidrome.search("发", 1, "sheet").then((res) => {
//   console.log(res);
// });

// navidrome
//   .getLyric({
//     id: "6a42f42df9e86fb27ab963e70fd96c21",
//   })
//   .then((res) => {
//     console.log(res);
//   });

// navidrome
//   .getRecommendSheetsByTag(
//     {
//       tag: "",
//     },
//     1
//   )
//   .then((res) => {
//     console.log(res);
//   });

// navidrome
//   .getMusicSheetInfo({
//     id: "17efeea7-bf36-456f-92bf-8a9d80658fd9",
//   })
//   .then((res) => {
//     console.log(res);
//   });

// navidrome
//   .getAlbumInfo({
//     id: "0f221edbbab7def63f003acf76f8ce32",
//   })
//   .then((res) => {
//     console.log(res);
//   });

// navidrome
//   .getArtistWorks(
//     {
//       id: "b68aba47f332d118ad655dcfa1029afc",
//     },
//     1,
//     "music"
//   )
//   .then((res) => {
//     console.log(res);
//   });

// navidrome.getTopLists().then((res) => {
//   console.log(res);
// });

navidrome
  .getMediaSource(
    {
      id: "4e65f766209106ba19283c99fb631813",
    },
    "standard"
  )
  .then((res) => {
    console.log(res);
  });

// navidrome
//   .getMusicInfo({
//     id: "4e65f766209106ba19283c99fb631813",
//   })
//   .then((res) => {
//     console.log(res);
//   });
