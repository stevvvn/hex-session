# hex-session

## Usage

Make one or more of your middleware depend on `hex-session.session` in your `middleware.js`

In your `secrets.js`, set `session.secret` to a longish random string.

In `conf.js`, set `session.store` to your desired storage format. Your options are currently limited: `memory` for a crappy dev store, and `sqlite`. For `sqlite`, also depend on `hex-db-sqlite.handle` in `middleware.js`.

Optionall, you can configure when old sessions are evicted with the `session.reaper.intervalSeconds` and `session.reaper.lingerSeconds` configuration parameters. The default values are probably ok.
