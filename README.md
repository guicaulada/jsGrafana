# jsGrafana #

**jsGrafana** is a Javascript module for working with the [Grafana API](https://grafana.com/docs/http_api/).

## Requirements
* Tested against Grafana HTTP API
* For Node.js you will need the [xmlhttprequest](https://www.npmjs.com/package/xmlhttprequest) library.

## Documentation ##
### Getting Started

If you are using Node.js, install jsGrafana using npm:

```bash
$ npm install jsgrafana
```

You can now require and use jsgrafana like so:

```js
let GrafanaAPI = require('jsgrafana')

const GRAFANA_URL = process.env.GRAFANA_URL
const GRAFANA_LOGIN = process.env.GRAFANA_LOGIN
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD

let gfapi = new GrafanaAPI(GRAFANA_URL, GRAFANA_LOGIN, GRAFANA_PASSWORD)

gfapi.listIncidents({statuses: ['triggered'], include: ['users','services','priorities']}).then((data) => {
    console.log(data)
})

gfapi.getUser('PQ6ASX3', {include: ['contact_methods','teams','notification_rules']}).then((data) => {
    console.log(data)
})
```

Refer to the [Grafana API Documentation](https://grafana.com/docs/http_api/) and the [jsGrafana Example](https://github.com/Sighmir/jsGrafana/tree/master/example) for more information.  

### Browser

You can also load this script on your browser like so:

```html
<script src='https://cdn.jsdelivr.net/npm/jsgrafana/jsGrafana.js'></script>
```

You can now use the class GrafanaAPI normally on the page, like you would on Node.js.

## License ##
```
jsGrafana - Grafana API Javascript Library.
Copyright (C) 2019  Guilherme Caulada (Sighmir)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
```
