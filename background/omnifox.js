//@ts-check

// @ts-ignore
browser.omnibox.onInputChanged.addListener((_text, suggest) => {
  let results = [];
  results.push({
    content: "content",
    description: "description",
  });
  suggest(results);
});

//@ts-ignore
browser.omnibox.setDefaultSuggestion({
  description:
    "Type an ORS chapter ('197A'), ORS Section ('90.225') or Or.Laws Chapter ('2019 c. 500",
});

//@ts-ignore
browser.omnibox.onInputEntered.addListener((text) => {
  //updateDefaultSuggestion('')
});

//@ts-ignore
browser.omnibox.onInputCancelled.addListener(function () {
    //resetDefaultSuggestion();
});
