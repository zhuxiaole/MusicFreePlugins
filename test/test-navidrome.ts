let navidrome = require("../plugins/navidrome/index");
let test = require("./test-user-vars.json");

navidrome.setUserVariables({
  url: test.navidrome.url,
  username: test.navidrome.username,
  password: test.navidrome.password,
});

// navidrome.search("陈一发", 1, "music").then((res) => {
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
//   .getRecommendSheetsByTag({
//     tag: "",
//   })
//   .then((res) => {
//     console.log(res);
//   });

navidrome
  .getMusicSheetInfo({
    id: "17efeea7-bf36-456f-92bf-8a9d80658fd9",
  })
  .then((res) => {
    console.log(res);
  });
