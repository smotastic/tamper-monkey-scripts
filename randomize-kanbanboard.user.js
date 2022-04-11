// ==UserScript==
// @name         RandomizeKanbanboard
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       Nils
// @match        xxx
// @match        xxx
// @grant        none
// @require      https://raw.githubusercontent.com/smotastic/wait-for-elements/master/wait-for-key.js
// @downloadURL  xxx
// @updateURL    xxx
// ==/UserScript==

(function () {
  "use strict";

  function appendRandomizeButton() {
    waitForKeyElements("#ghx-modes-tools", (node) => {
      // append button
      let nav = node[0];

      let button = document.createElement("button");
      button.appendChild(document.createTextNode("Shuffle!"));
      button.type = "button";
      button.classList.add("aui-button", "aui-button-primary", "aui-style");
      button.addEventListener("click", () => randomize(), false);

      let container = document.createElement("div");
      container.style.display = "inline-block";
      container.style.marginLeft = "20px";
      container.appendChild(button);

      nav.appendChild(container);

      // showRankings();
    });
  }
  appendRandomizeButton();
 

  function randomize() {
    let parent = document.querySelector("#ghx-pool");
    let children = document.querySelectorAll(
      ".ghx-swimlane:not(:last-of-type)"
    );
    children.forEach((child) => parent.removeChild(child));
    let shuffledChildren = shuffle(children);
    shuffledChildren.forEach((child) => {
      parent.prepend(child);
      child.classList.add("ghx-closed");
    });
    saveRankings();
    showRankings();
  }

  function saveRankings() {
    const pointsForPlaces = [3,2,1];
    let topPlaces = document.querySelectorAll(
      ".ghx-swimlane:not(:last-of-type):nth-child(-n+3) span[role='button']"
    );

    topPlaces.forEach((personNode, index) => {
      const person = personNode.textContent;
      saveRanking(person, pointsForPlaces[index]);
    });
  }

  function saveRanking(person, place) {
    let rankings = localStorage.getItem("BYRANKINGS");
    if (!rankings) {
      localStorage.setItem("BYRANKINGS", " {}");
      rankings = localStorage.getItem("BYRANKINGS");
    }
    let jsonRankings = JSON.parse(rankings);
    let curRank = jsonRankings[person];
    if (!curRank) {
      jsonRankings[person] = 0;
      curRank = jsonRankings[person];
    }
    curRank = parseInt(curRank);
    curRank += place;
    jsonRankings[person] = curRank;
    localStorage.setItem("BYRANKINGS", JSON.stringify(jsonRankings));
  }

  function showRankings() {
    const rankingColors = ["#FFD700AA", "#C0C0C0AA", "#cd7f32AA"];
    let byrankings = localStorage.getItem("BYRANKINGS");
    if(!byrankings) {
      byrankings = {};
    }
    const rankings = JSON.parse(byrankings);
    let rankingList = Object.entries(rankings);
    const topThree = rankingList.sort(([_, value], [__, value2]) => {
      return value < value2;
    }).slice(0, Math.min(3, rankingList.length));
    topThree.forEach(([person, points], index) => {
      let swimlane = document.querySelector(`*[aria-label='Swimlane for assignee: ${person}`);
      if(swimlane) {
        swimlane.style.backgroundColor = rankingColors[index];
        console.log(swimlane);
      }
    });;
  }

  function shuffle(array) {
    let shuffly = [...array];
    var currentIndex = shuffly.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = shuffly[currentIndex];
      shuffly[currentIndex] = shuffly[randomIndex];
      shuffly[randomIndex] = temporaryValue;
    }

    return shuffly;
  }
})();
