# OSF GitLab Add-on

Enabling the addon for development

 - Install gpg.
 ```sh
 $ brew install gpg
 ```
 - Import a private key into your GnuPG keyring.
```sh
$ invoke encryption
```
 - In `website/settings/local.py` add, `"gitlab"` to `ADDONS_REQUESTED`.

Creating a GitLab dataset on the test server

1. Go to https://demo.gitlab.org/ and create an account
2. On the homepage, click the "Create GitLab" button to create a GitLab
3. Click the options icon on the GitLab page
4. On the Settings tab, set "GitLab Publish Settings" to "Published" and save changes.
5. On the Datasets tab, click "Create Dataset + Upload Data" and create a dataset (only title is required)

To link a GitLab dataset to a node (project or component):

1. Go to user settings. Under "Add-ons", select "GitLab" and click submit.
2. Under "Configure Add-ons", enter your GitLab credentials and click submit.
3. Go to the the node settings page. Under "Select Add-ons", select "GitLab" and click submit.
4. Under "Configure Add-ons", select a GitLab and dataset and click submit.

Notes on privacy settings:
 - Only the user that linked his or her GitLab account can change the GitLab or dataset linked from that account. Other contributors can still deauthorize the node.
 - For contributors with write permission to the node:
    - The user can access the dataset title, doi, host GitLab, and citation.
    - The draft version and most-recently published version of a dataset are accessible as separate lists.
    - Files from either the draft or published version can be viewed or downloaded.
    - Files from the draft version can be uploaded, updated, or deleted.
    - Draft versions can be published.
 - For non-contributors, when a node is public:
    - The user can access the dataset title, doi, host GitLab, and citation.
    - Only the most-recently published version of the dataset is accessible.
        - If there are no published files, the dataset is not displayed.
    - Files from the published version can be viewed or downloaded.
 - For non-contributors, when a node is private, there is no access to the GitLab add-on.
