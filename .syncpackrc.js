// @ts-check

/** @type {import("syncpack").RcFile} */
export default {
    "lintFormatting": false,
    "dependencyTypes": ["prod", "dev"],
    "semverGroups": [
        {
            "dependencies": ["useless-lib"],
            "packages": ["**"],
            "isIgnored": true
        },
        {
            "range": "",
            "dependencyTypes": ["prod", "dev"],
            "dependencies": ["**"],
            "packages": ["**"],
            "label": "packages version should be pinned"
        },
    ],
    "versionGroups": [
        {
            "dependencies": ["useless-lib"],
            "packages": ["**"],
            "isIgnored": true
        },
        {
            "dependencyTypes": ["prod", "dev"],
            "preferVersion": "highestSemver",
            "dependencies": ["**"],
            "packages": ["**"],
            "label": "packages should have a single version across the repository"
        }
    ]
};
