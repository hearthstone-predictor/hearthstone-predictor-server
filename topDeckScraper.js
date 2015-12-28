'use strict';

var cheerio = require('cheerio');
var request = require('request');
var syncRequest = require('sync-request');
var _ = require('underscore');
var rsvp = require('rsvp');
var fs = require('fs');
var deckClasses = [
  'druid',
  'hunter',
  'paladin',
  'warlock',
  'mage',
  'shaman',
  'priest',
  'rogue'
];

var allCards = require('./all-cards.json').cards;

allCards = _.each(allCards, function(card) {
  card.normalizedName = card.name.toLowerCase();
});

var buildUrl = function(deckClass) {
  return 'http://www.hearthstonetopdeck.com/metagame/' + deckClass + '/0/current';
};

var getClassDeckLinks = function() {
  var requests = _.map(deckClasses, function(deckClass) {
    return new rsvp.Promise(function(resolve) {
      request(buildUrl(deckClass), function(err, res, body) {
        var $ = cheerio.load(body);
        var links = _.map($('img[alt=\'dust\']'), function(el){
          var td = $(el.parentNode.parentNode).find('td')[2];
          var deckName = td.children[1].children[0].data.trim();
          return {
            href: td.children[1].attribs.href,
            name: deckName
          };
        });
        resolve({class: deckClass, links: links});
      });
    });
  });

  return rsvp.all(requests);
};

var getDeckForLink = function(link) {
  var req = syncRequest('GET', link.href);
  var $ = cheerio.load(req.getBody());
  var cards = [];
  _.each($('.cardname span'), function(span) {
    var text = span.children[0].data;
    var num = Number.parseInt(text.slice(0,1));
    var cardName = text.slice(2);
    var card = _.findWhere(allCards, {normalizedName: cardName.toLowerCase()});

    var id;
    if(card) {
      id = card.id;
    } else {
      console.log(cardName);
    }
    cards.push(id);
    if(num === 2) {
      cards.push(id);
    }
  });
  if (!cards.length) {
    console.log(link);
    console.log(body);
    console.log('\n');
  }
  return {
    name: link.name,
    cards: cards
  };
};

getClassDeckLinks()
  .then(function(links) {
    var decks = {};
    _.each(links, function(classLinks) {

      decks[classLinks.class] = [];
      _.each(classLinks.links, function(link) {
        decks[classLinks.class].push(getDeckForLink(link));
      });
    });

    console.log(decks);
    fs.writeFile("./decks.json", JSON.stringify(decks, null, 4), function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("JSON saved to ./decks.json");
        }
    });
  });
