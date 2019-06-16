let GrafanaAPI = require('..') //jsgrafana

const GRAFANA_URL = process.env.GRAFANA_URL
const GRAFANA_LOGIN = process.env.GRAFANA_LOGIN
const GRAFANA_PASSWORD = process.env.GRAFANA_PASSWORD
const GRAFANA_TOKEN = process.env.GRAFANA_TOKEN

let gfapi1 = new GrafanaAPI(GRAFANA_URL, GRAFANA_LOGIN, GRAFANA_PASSWORD)
let gfapi2 = new GrafanaAPI(GRAFANA_URL, GRAFANA_TOKEN)

gfapi1.getOrganizations().then((data) => {
  console.log(data)
})

gfapi2.getCurrentOrganization().then((data) => {
  console.log(data)
})