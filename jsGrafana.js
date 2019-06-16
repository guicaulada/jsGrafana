function isNode() {
  return typeof module !== 'undefined' && module.exports
}

class ExtendableProxy {
  constructor(getset={}) {
    return new Proxy(this, getset);
  }
}

class GrafanaAPI extends ExtendableProxy {
  constructor(url, userOrToken, password) {
    super({
      get: function (gfapi, func) {
        if (gfapi[func] != null) return gfapi[func]
        return function (...params) { return gfapi.perform(func, ...params) }
      }
    })
    this.url = url
    this.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
    if (userOrToken && password) {
      this.auth = Buffer.from(`${userOrToken}:${password}`).toString('base64')
      this.headers['Authorization'] = 'Basic ' + this.auth
    } else {
      this.auth = userOrToken
      this.headers['Authorization'] = 'Bearer ' + this.auth
    }
  }

  send(method, path, params) {
    var self = this
    return new Promise(function (resolve, reject) {
      var request = false
      if (isNode()) {
        request = require('xmlhttprequest').XMLHttpRequest
      } else {
        request = XMLHttpRequest
      }
      if (request) {
        var http_request = new request()
        http_request.open(method, self.url+path, true)
        for (var h in self.headers) {
          http_request.setRequestHeader(h, self.headers[h])
        }
        http_request.send(JSON.stringify(params))
        http_request.onreadystatechange = function () {
          if (http_request.readyState == 4) {
            try {
              resolve(JSON.parse(http_request.responseText))
            } catch {
              resolve(http_request.responseText)
            }
          }
        }
      } else {
        reject('There was a problem importing the XMLHttpRequest class.')
      }
    })
  }

  perform(action, ...params) {
    const method = {
      // Admin
      getSettings: [`GET`, `/api/admin/settings`],
      getStats: [`GET`, `/api/admin/stats`],
      createUser: [`POST`, `/api/admin/users`, params[0]],
      setUserPassword: [`PUT`, `/api/admin/users/${params[0]}/password`, params[1]],
      setUserPermissions: [`PUT`, `/api/admin/users/${params[0]}/permissions`, params[1]],
      deleteUser: [`DELETE`, `/api/admin/users/${params[0]}`],
      pauseAllAlerts: [`POST`, `/api/admin/pause-all-alerts`, params[0]],
      getUserTokens: [`GET`, `/api/admin/users/${params[0]}/auth-tokens`],
      revokeUserToken: [`POST`, `/api/admin/users/${params[0]}/revoke-auth-token`, params[1]],
      logoutUser: [`POST`, `/api/admin/users/${params[0]}/logout`],
      reloadDashboardsConfiguration: [`POST`, `/api/admin/provisioning/dashboards/reload`],
      reloadDatasourcesConfiguration: [`POST`, `/api/admin/provisioning/datasources/reload`],
      reloadNotificationsConfiguration: [`POST`, `/api/admin/provisioning/notifications/reload`],
      // Alerts
      getAlerts: [`GET`, `/api/alerts?${this.serialize(params[0])}`],
      getAlert: [`GET`, `/api/alerts/${params[0]}`],
      pauseAlert: [`POST`, `/api/alerts/${params[0]}/pause`, params[1]],
      // Notification
      getNotificationChannels: [`GET`, `/api/alert-notifications`],
      getNotificationChannelByUid: [`GET`, `/api/alert-notifications/uid/${params[0]}`],
      getNotificationChannel: [`GET`, `/api/alert-notifications/${params[0]}`],
      createNotificationChannel: [`POST`, `/api/alert-notifications`, params[0]],
      updateNotificationChannelByUid: [`PUT`, `/api/alert-notifications/uid/${params[0]}`, params[1]],
      updateNotificationChannel: [`PUT`, `/api/alert-notifications/${params[0]}`, params[1]],
      deleteNotificationChannelByUid: [`DELETE`, `/api/alert-notifications/uid/${params[0]}`],
      deleteNotificationChannel: [`DELETE`, `/api/alert-notifications/${params[0]}`],
      testNotificationChannel: [`POST`, `/api/alert-notifications/test`, params[0]],
      // Annotations
      findAnnotations: [`GET`, `/api/annotations?${this.serialize(params[0])}`],
      createAnnotation: [`POST`, `/api/annotations`, params[0]],
      createGraphiteAnnotation: [`POST`, `/api/annotations/graphite`, params[0]],
      updateAnnotation: [`PUT`, `/api/annotations/${params[0]}`, params[1]],
      patchAnnotation: [`PATCH`, `/api/annotations/${params[0]}`, params[1]],
      deleteAnnotation: [`DELETE`, `/api/annotations/${params[0]}`],
      deleteAnnotationRegion: [`DELETE`, `/api/annotations/region/${params[0]}`],
      // Authentication
      getAuthKeys: [`GET`, `/api/auth/keys`],
      createAuthKey: [`POST`, `/api/auth/keys`, params[0]],
      deleteAuthKey: [`DELETE`, `/api/auth/keys/${params[0]}`],
      // Dashboard
      setDashboard: [`POST`, `/api/dashboards/db`, params[0]],
      getDashboard: [`GET`, `/api/dashboards/uid/${params[0]}`],
      deleteDashboard: [`DELETE`, `/api/dashboards/uid/${params[0]}`],
      getHomeDashboard: [`GET`, `/api/dashboards/home`],
      getDashboardTags: [`GET`, `/api/dashboards/tags`],
      getDashboardBySlug: [`GET`, `/api/dashboards/db/${params[0]}`],
      deleteDashboardBySlug: [`DELETE`, `/api/dashboards/db/${params[0]}`],
      // Dashboard Permissions
      getDashboardPermissions: [`GET`, `/api/dashboards/id/${params[0]}/permissions`],
      updateDashboardPermissions: [`POST`, `/api/dashboards/id/${params[0]}/permissions`, params[1]],
      // Dashboard Versions
      getDashboardVersions: [`GET`, `/api/dashboards/id/${params[0]}/versions`],
      updateDashboardVersion: [`GET`, `/api/dashboards/id/${params[0]}/versions/${params[1]}`],
      restoreDashboardVersion: [`POST`, `/api/dashboards/id/${params[0]}/restore`, params[1]],
      compareDashboardVersions: [`POST`, `/api/dashboards/calculate-diff`, params[0]],
      // Datasource
      getDatasources: [`GET`, `/api/datasources`],
      getDatasource: [`GET`, `/api/datasources/${params[0]}`],
      getDatasourceByName: [`GET`, `/api/datasources/name/${params[0]}`],
      getDatasourceIdByName: [`GET`, `/api/datasources/id/${params[0]}`],
      createDatasource: [`POST`, `/api/datasources`, params[0]],
      updateDatasource: [`PUT`, `/api/datasources/${params[0]}`, params[1]],
      deleteDatasource: [`DELETE`, `/api/datasources/${params[0]}`],
      deleteDatasourceByName: [`DELETE`, `/api/datasources/name/${params[0]}`],
      getDatasourceProxyCalls: [`GET`, `/api/datasources/proxy/${params[0]}/*`],
      // Datasource Permissions
      enableDatasourcePermissions: [`POST`, `/api/datasources/${params[0]}/enable-permissions`],
      disableDatasourcePermissions: [`POST`, `/api/datasources/${params[0]}/disable-permissions`],
      getDatasourcePermissions: [`GET`, `/api/datasources/${params[0]}/permissions`],
      addDatasourcePermission: [`POST`, `/api/datasources/${params[0]}/permissions`, params[1]],
      removeDatasourcePermission: [`DELETE`, `/api/datasources/${params[0]}/permissions/${params[1]}`],
      // External Group Sync (Enterprise)
      getExternalGroups: [`GET `, `/api/teams/${params[0]}/groups`],
      addExternalGroup: [`POST `, `/api/teams/${params[0]}/groups`, params[1]],
      removeExternalGroup: [`DELETE `, `/api/teams/${params[0]}/groups/${params[1]}`],
      // Folder
      getFolders: [`GET`, `/api/folders?${this.serialize(params[0])}`],
      getFolder: [`GET`, `/api/folders/${params[0]}`],
      createFolder: [`POST`, `/api/folders`, params[0]],
      updateFolder: [`PUT`, `/api/folders/${params[0]}`, params[1]],
      deleteFolder: [`DELETE`, `/api/folders/${params[0]}`],
      getFolderById: [`GET`, `/api/folders/id/${params[0]}`],
      // Folder Permissions
      getFolderPermissions: [`GET`, `/api/folders/${params[0]}/permissions`],
      updateFolderPermissions: [`POST`, `/api/folders/${params[0]}/permissions`, params[1]],
      // Folder/Dashboard Search
      search: [`GET`, `/api/search?${this.serialize(params[0])}`],
      // Organization
      getCurrentOrganization: [`GET`, `/api/org`],
      getCurrentOrganizationUsers: [`GET`, `/api/org/users`],
      updateCurrentOrganizationUser: [`PATCH`, `/api/org/users/${params[0]}`, params[1]],
      deleteCurrentOrganizationUser: [`DELETE`, `/api/org/users/${params[0]}`],
      updateCurrentOrganization: [`PUT`, `/api/org`, params[0]],
      addCurrentOrganizationUser: [`POST`, `/api/org/users`, params[0]],
      getOrganization: [`GET`, `/api/orgs/${params[0]}`],
      getOrganizationByName: [`GET`, `/api/orgs/name/${params[0]}`],
      createOrganization: [`POST`, `/api/orgs`, params[0]],
      getOrganizations: [`GET`, `/api/orgs`],
      updateOrganization: [`PUT`, `/api/orgs/${params[0]}`, params[1]],
      deleteOrganization: [`DELETE`, `/api/orgs/${params[0]}`],
      getOrganizationUsers: [`GET`, `/api/orgs/${params[0]}/users`],
      addOrganizationUser: [`POST`, `/api/orgs/${params[0]}/users`, params[1]],
      updateOrganizationUser: [`PATCH`, `/api/orgs/${params[0]}/users/${params[1]}`, params[2]],
      deleteOrganizationUser: [`DELETE`, `/api/orgs/${params[0]}/users/${params[1]}`],
      // Other
      getFrontendSettings: [`GET`, `/api/frontend/settings`],
      renewSession: [`GET`, `/api/login/ping`],
      getHealth: [`GET`, `/api/health`],
      // Playlist
      getPlaylists: [`GET`, `/api/playlists?${this.serialize(params[0])}`],
      getPlaylist: [`GET`, `/api/playlists/${params[0]}`],
      getPlaylistItems: [`GET`, `/api/playlists/${params[0]}/items`],
      getPlaylistDashboards: [`GET`, `/api/playlists/${params[0]}/dashboards`],
      createPlaylist: [`POST`, `/api/playlists`, params[0]],
      updatePlaylist: [`PUT`, `/api/playlists/${params[0]}`, params[1]],
      deletePlaylist: [`DELETE`, `/api/playlists/${params[0]}`],
      // Preferences
      getCurrentUserPreferences: [`GET`, `/api/user/preferences`],
      updateCurrentUserPreferences: [`PUT`, `/api/user/preferences`, params[0]],
      getCurrentOrganizationPreferences: [`GET`, `/api/user/preferences`],
      updateCurrentOrganizationPreferences: [`PUT`, `/api/user/preferences`, params[0]],
      // Snapshot
      createSnapshot: [`POST`, `/api/snapshots`, params[0]],
      getSnapshots: [`GET`, `/api/dashboard/snapshots?${this.serialize(params[0])}`],
      getSnapshot: [`GET`, `/api/snapshots/${params[0]}`],
      deleteSnapshot: [`DELETE`, `/api/snapshots/${params[0]}`],
      deleteSnapshotByDeleteKey: [`DELETE`, `/api/snapshots-delete/${params[0]}`],
      // Teams
      searchTeams: [`GET`, `/api/teams/search?${this.serialize(params[0])}`],
      getTeam: [`GET`, `/api/teams/${params[0]}`],
      addTeam: [`POST`, `/api/teams`, params[0]],
      updateTeam: [`PUT`, `/api/teams/${params[0]}`, params[0]],
      deleteTeam: [`DELETE`, `/api/teams/${params[0]}`],
      getTeamMembers: [`GET`, `/api/teams/${params[0]}/members`],
      addTeamMembers: [`POST`, `/api/teams/${params[0]}/members`, params[1]],
      deleteTeamMember: [`DELETE`, `/api/teams/${params[0]}/members/${params[1]}`],
      getTeamPreferences: [`GET`, `/api/teams/${params[0]}/preferences`],
      updateTeamPreferences: [`PUT`, `/api/teams/${params[0]}/preferences`, params[1]],
      // Users
      searchUsers: [`GET`, `/api/users?${this.serialize(params[0])}`],
      getUser: [`GET`, `/api/users/${params[0]}`],
      getUserByLogin: [`GET`, `/api/users/lookup?loginOrEmail=${params[0]}`],
      getUserByEmail: [`GET`, `/api/users/lookup?loginOrEmail=${params[0]}`],
      updateUser: [`PUT`, `/api/users/${params[0]}`, params[1]],
      getUserOrganizations: [`GET`, `/api/users/${params[0]}/orgs`],
      getUserTeams: [`GET`, `/api/users/${params[0]}/teams`],
      getCurrentUser: [`GET`, `/api/user`],
      changeCurrentUserPassword: [`PUT`, `/api/user/password`, params[0]],
      switchUserContext: [`POST`, `/api/users/${params[0]}/using/${params[1]}`],
      switchCurrentUserContext: [`POST`, `/api/user/using/${params[0]}`],
      getCurrentUserOrganizations: [`GET`, `/api/user/orgs`],
      getCurrentUserTeams: [`GET`, `/api/user/teams`],
      starDashboard: [`POST`, `/api/user/stars/dashboard/${params[0]}`],
      unstarDashboard: [`DELETE`, `/api/user/stars/dashboard/${params[0]}`],
      getCurrentUserTokens: [`GET`, `/api/user/auth-tokens`],
      revokeCurrentUserToken: [`POST`, `/api/user/revoke-auth-token`, params[0]],
      //Plugins
      updatePluginSettings: [`POST`, `/api/plugins/${params[0]}/settings?${this.serialize(params[1])}`, params[2]]
    }

    if (method[action] == undefined) {
      console.log('Unknown method.')
      return
    }

    return this.send(...method[action])
  }

  setRequestHeader(header, value) {
    self.headers[header] = value
  }

  serialize(obj) {
    var str = []
    for (var p in obj) {
      if (obj.hasOwnProperty(p)) {
        if (obj[p].constructor.name == 'Array') {
          str.push(encodeURIComponent(p+'[]') + '=' + encodeURIComponent(obj[p]))
        } else {
          str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
        }
      }
    }
    return str.join("&")
  }
}

if (isNode()) {
  module.exports = GrafanaAPI
}