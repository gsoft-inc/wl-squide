/* eslint-disable max-len */

import { HttpResponse, http, type HttpHandler } from "msw";

export const episodeHandlers: HttpHandler[] = [
    http.get("/api/episode/1,2,3,4,5,6,7", async () => {
        return HttpResponse.json([{
            "id": 1,
            "name": "Pilot",
            "air_date": "December 2, 2013",
            "episode": "S01E01",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/35", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/62", "https://rickandmortyapi.com/api/character/92", "https://rickandmortyapi.com/api/character/127", "https://rickandmortyapi.com/api/character/144", "https://rickandmortyapi.com/api/character/158", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/179", "https://rickandmortyapi.com/api/character/181", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/249", "https://rickandmortyapi.com/api/character/271", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/394", "https://rickandmortyapi.com/api/character/395", "https://rickandmortyapi.com/api/character/435"],
            "url": "https://rickandmortyapi.com/api/episode/1",
            "created": "2017-11-10T12:56:33.798Z"
        }, {
            "id": 2,
            "name": "Lawnmower Dog",
            "air_date": "December 9, 2013",
            "episode": "S01E02",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/46", "https://rickandmortyapi.com/api/character/63", "https://rickandmortyapi.com/api/character/80", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/221", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/246", "https://rickandmortyapi.com/api/character/304", "https://rickandmortyapi.com/api/character/305", "https://rickandmortyapi.com/api/character/306", "https://rickandmortyapi.com/api/character/329", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/396", "https://rickandmortyapi.com/api/character/397", "https://rickandmortyapi.com/api/character/398", "https://rickandmortyapi.com/api/character/405"],
            "url": "https://rickandmortyapi.com/api/episode/2",
            "created": "2017-11-10T12:56:33.916Z"
        }, {
            "id": 3,
            "name": "Anatomy Park",
            "air_date": "December 16, 2013",
            "episode": "S01E03",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/12", "https://rickandmortyapi.com/api/character/17", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/45", "https://rickandmortyapi.com/api/character/96", "https://rickandmortyapi.com/api/character/97", "https://rickandmortyapi.com/api/character/98", "https://rickandmortyapi.com/api/character/99", "https://rickandmortyapi.com/api/character/100", "https://rickandmortyapi.com/api/character/101", "https://rickandmortyapi.com/api/character/108", "https://rickandmortyapi.com/api/character/112", "https://rickandmortyapi.com/api/character/114", "https://rickandmortyapi.com/api/character/169", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/186", "https://rickandmortyapi.com/api/character/201", "https://rickandmortyapi.com/api/character/268", "https://rickandmortyapi.com/api/character/300", "https://rickandmortyapi.com/api/character/302", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/356"],
            "url": "https://rickandmortyapi.com/api/episode/3",
            "created": "2017-11-10T12:56:34.022Z"
        }, {
            "id": 4,
            "name": "M. Night Shaym-Aliens!",
            "air_date": "January 13, 2014",
            "episode": "S01E04",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/87", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/179", "https://rickandmortyapi.com/api/character/181", "https://rickandmortyapi.com/api/character/191", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/241", "https://rickandmortyapi.com/api/character/270", "https://rickandmortyapi.com/api/character/337", "https://rickandmortyapi.com/api/character/338"],
            "url": "https://rickandmortyapi.com/api/episode/4",
            "created": "2017-11-10T12:56:34.129Z"
        }, {
            "id": 5,
            "name": "Meeseeks and Destroy",
            "air_date": "January 20, 2014",
            "episode": "S01E05",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/41", "https://rickandmortyapi.com/api/character/89", "https://rickandmortyapi.com/api/character/116", "https://rickandmortyapi.com/api/character/117", "https://rickandmortyapi.com/api/character/120", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/193", "https://rickandmortyapi.com/api/character/238", "https://rickandmortyapi.com/api/character/242", "https://rickandmortyapi.com/api/character/271", "https://rickandmortyapi.com/api/character/303", "https://rickandmortyapi.com/api/character/326", "https://rickandmortyapi.com/api/character/333", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/343", "https://rickandmortyapi.com/api/character/399", "https://rickandmortyapi.com/api/character/400"],
            "url": "https://rickandmortyapi.com/api/episode/5",
            "created": "2017-11-10T12:56:34.236Z"
        }, {
            "id": 6,
            "name": "Rick Potion #9",
            "air_date": "January 27, 2014",
            "episode": "S01E06",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/3", "https://rickandmortyapi.com/api/character/4", "https://rickandmortyapi.com/api/character/5", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/58", "https://rickandmortyapi.com/api/character/82", "https://rickandmortyapi.com/api/character/83", "https://rickandmortyapi.com/api/character/92", "https://rickandmortyapi.com/api/character/155", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/179", "https://rickandmortyapi.com/api/character/181", "https://rickandmortyapi.com/api/character/216", "https://rickandmortyapi.com/api/character/234", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/249", "https://rickandmortyapi.com/api/character/251", "https://rickandmortyapi.com/api/character/271", "https://rickandmortyapi.com/api/character/293", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/343", "https://rickandmortyapi.com/api/character/394"],
            "url": "https://rickandmortyapi.com/api/episode/6",
            "created": "2017-11-10T12:56:34.339Z"
        }, {
            "id": 7,
            "name": "Raising Gazorpazorp",
            "air_date": "March 10, 2014",
            "episode": "S01E07",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/3", "https://rickandmortyapi.com/api/character/4", "https://rickandmortyapi.com/api/character/5", "https://rickandmortyapi.com/api/character/59", "https://rickandmortyapi.com/api/character/151", "https://rickandmortyapi.com/api/character/168", "https://rickandmortyapi.com/api/character/211", "https://rickandmortyapi.com/api/character/230", "https://rickandmortyapi.com/api/character/258", "https://rickandmortyapi.com/api/character/329", "https://rickandmortyapi.com/api/character/376", "https://rickandmortyapi.com/api/character/401"],
            "url": "https://rickandmortyapi.com/api/episode/7",
            "created": "2017-11-10T12:56:34.441Z"
        }]);
    })
];
