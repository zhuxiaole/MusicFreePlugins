let navidrome = require("../plugins/navidrome/index");
let test = require("./test-user-vars.json");

navidrome.setUserVariables({
  url: test.navidrome.url,
  username: test.navidrome.username,
  password: test.navidrome.password,
});

navidrome.search("陈一发", 1, "music").then((res) => {
  console.log(res);
});
