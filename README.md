# Artifacts MMO

Playing with [Artifacts MMO](https://docs.artifactsmmo.com/). Let's have fun with this new API-based game.

Using [OpenAPI generator](https://openapi-generator.tech/) I generated the SDK based on the exposed API specs.

# Installation

Copy `.env.js.sample` to a `.env.js` file at the root directory. Fill up the values:

-   Access token is your account's API token
-   Mongo vars are to connect to the DB

Start your DB using `start_mongo.bat`.

Running `yarn make` should build the whole project. `yarn local` will execute the automated script locally.

If you want to play manually, you'll need to copy the content of the `public` folder in a web server.

# GUI

So far there are only 4 buttons for each cardinal directions. Guess what, "Move up" move the main character up by one cell...

# Todo

-   [x] GUI (ended up to be useless)

    -   [x] Controls to move around
    -   [x] Do basic actions
        -   [x] Fight
        -   [x] Gather
        -   [x] Craft
        -   ~~[ ] Deposit / Withdraw~~

-   [ ] Init
    -   [x] Scan the map & save in DB
    -   [x] Retrieve bank details
-   [x] Create a loop to gather a resource (name & qty)
    -   [x] Using map in DB, look for the closest spot
    -   [x] Put resource to the bank
-   [x] Create a loop to complete a task
