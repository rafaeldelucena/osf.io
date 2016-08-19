var GitLabWidget = require('./gitlabWidget.js');

var url = window.contextVars.node.urls.api + 'gitlab/widget/contents/';
// #gitlabScope will only be in the DOM if the addon is properly configured
if ($('#gitlabScope')[0]) {
    new GitLabWidget('#gitlabScope', url);
}
