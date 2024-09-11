const embyTest = require("./test-user-vars.json");

/// <reference types="../types/global" />
global.env = {
  getUserVariables: () => {
    return {
      url: embyTest.emby.url,
      username: embyTest.emby.username,
      password: embyTest.emby.password,
    };
  },
  debug: true,
};

const emby = require("../plugins/emby/index");

// emby.getRecommendSheetTags().then((tags) => {
//   console.log(tags);
// });

// emby.getRecommendSheetsByTag(null, 1).then((data) => {
//   console.log(data);
// });

// emby.getRecommendSheetsByTag({ id: 111638, type: "genre" }, 1).then((data) => {
//   console.log(data);
// });

emby.getRecommendSheetsByTag({ id: 111588 }, 1).then((data) => {
  console.log(data);
});
