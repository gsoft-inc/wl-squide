/* eslint-disable max-len */

import { HttpResponse, http, type HttpHandler } from "msw";
import { sessionAccessor } from "./session.ts";

// Must specify the return type, otherwise we get a TS2742: The inferred type cannot be named without a reference to X. This is likely not portable.
// A type annotation is necessary.
export const episodeHandlers: HttpHandler[] = [
    http.get("/api/episode/1,2", async () => {
        const session = sessionAccessor.getSession();

        if (!session) {
            return new HttpResponse(null, {
                status: 401
            });
        }

        const isEn = session.preferredLanguage === "en-US";

        return HttpResponse.json([{
            "id": 1,
            "name": isEn ? "Pilot" : "Pilote",
            "air_date": isEn ? "December 2, 2013" : "2 décembre 2013",
            "episode": "S01E01",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/35", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/62", "https://rickandmortyapi.com/api/character/92", "https://rickandmortyapi.com/api/character/127", "https://rickandmortyapi.com/api/character/144", "https://rickandmortyapi.com/api/character/158", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/179", "https://rickandmortyapi.com/api/character/181", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/249", "https://rickandmortyapi.com/api/character/271", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/394", "https://rickandmortyapi.com/api/character/395", "https://rickandmortyapi.com/api/character/435"],
            "url": "https://rickandmortyapi.com/api/episode/1",
            "created": "2017-11-10T12:56:33.798Z"
        }, {
            "id": 2,
            "name": isEn ? "Lawnmower Dog" : "Chien tondeuse à gazon",
            "air_date": isEn ? "December 9, 2013" : "9 décembre 2013",
            "episode": "S01E02",
            "characters": ["https://rickandmortyapi.com/api/character/1", "https://rickandmortyapi.com/api/character/2", "https://rickandmortyapi.com/api/character/38", "https://rickandmortyapi.com/api/character/46", "https://rickandmortyapi.com/api/character/63", "https://rickandmortyapi.com/api/character/80", "https://rickandmortyapi.com/api/character/175", "https://rickandmortyapi.com/api/character/221", "https://rickandmortyapi.com/api/character/239", "https://rickandmortyapi.com/api/character/246", "https://rickandmortyapi.com/api/character/304", "https://rickandmortyapi.com/api/character/305", "https://rickandmortyapi.com/api/character/306", "https://rickandmortyapi.com/api/character/329", "https://rickandmortyapi.com/api/character/338", "https://rickandmortyapi.com/api/character/396", "https://rickandmortyapi.com/api/character/397", "https://rickandmortyapi.com/api/character/398", "https://rickandmortyapi.com/api/character/405"],
            "url": "https://rickandmortyapi.com/api/episode/2",
            "created": "2017-11-10T12:56:33.916Z"
        }]);
    })
];
