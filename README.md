# wl-squide

## Rules of engagements

-> 2 biggest problems with frontend federated apps are:
    - How to offer a cohesive experience which doesn't feels "modular"
    - How to not load the same large dependencies twice when switching between "modules"

-> Webpack Module Federation helps with that but there's a cost
    - Dependencies update is trickier
    - Requires to configure shared dependencies
    - Library must be backward compatible until every "modules" updated to the new version
