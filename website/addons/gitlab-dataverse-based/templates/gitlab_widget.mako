% if complete:
<%inherit file="project/addon/widget.mako"/>

    <div id="gitlabScope" class="scripted">


        <span data-bind="if: loaded">

            <span data-bind="if: connected">
                <dl class="dl-horizontal dl-gitlab" style="white-space: normal">

                    <dt>Dataset</dt>
                    <dd data-bind="text: dataset"></dd>

                    <dt>Global ID</dt>
                    <dd><a data-bind="attr: {href: datasetUrl}, text: doi"></a></dd>

                    <dt>GitLab</dt>
                    <dd><a data-bind="attr: {href: gitlabUrl}"><span data-bind="text: gitlab"></span> GitLab</a></dd>

                    <dt>Citation</dt>
                    <dd data-bind="text: citation"></dd>

                </dl>
            </span>

        </span>

        <div class="help-block">
            <p data-bind="html: message, attr: {class: messageClass}"></p>
        </div>

    </div>
% endif
