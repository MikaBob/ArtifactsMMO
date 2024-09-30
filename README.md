# Artifacts MMO

Playing with [Artifacts MMO](https://docs.artifactsmmo.com/). Let's have fun with this new API-based game.

Using [OpenAPI generator](https://openapi-generator.tech/) I generated the SDK based on the exposed API specs.

# Installation

Copy `.env.js.sample` to a `.env.js` file at the root directory. Fill up the values:

-   Access token is your account's API token.
-   Mongo vars are to connect to the DB.

Start your DB using `start_mongo.bat`.

Running `yarn make` should build the whole project. `yarn local PLAYER_NAME` will execute the automated script locally.

If you want to play manually, you'll need to copy the content of the `public` folder in a web server.

# GUI

So far there are only 4 buttons for each cardinal directions. Guess what, "Move up" move the main character up by one cell...

_EDIT: I realized afterwards that this is useless since the official client already do it very well._

# Script

Under src/Characters.ts there is a table that contains which loop each character will execute. When an action is done, it will go to the next one / restart the loop.

Action are define by an action type (gather, craft, fight), then the name of the action we want to execute (a skill or monster name), and a level.
Level is just for gathering and crafting, to indicate which resource/item to focus on. Without specifying a level, it will fallback to the player's current level of the skill.
