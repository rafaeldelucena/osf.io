var GitLabNodeConfig = require('./gitlabNodeConfig.js');

var url = window.contextVars.node.urls.api + 'gitlab/settings/';
new GitLabNodeConfig('#gitlabScope', url);
