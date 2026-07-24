# IDEA1
- Add the Build work zone ui5 version increase 

# IDEA2
- also make it to be able to locate the index.html in the source file and in addition to being able to change or force the ui5 version upgrade in the manifest.json using the sap.platform.cf.ui5VersionNumber, it also changes the number in the index.html for instance 
    - if the manifest.json has this  "sap.platform.cf": {
    "ui5VersionNumber": "1.150.0"
  }, 
    -  Then the index.html should also change to accomodate the 1.150.0 inside the script bootstrap. like this         src="https://sapui5.hana.ondemand.com/1.150.0/resources/sap-ui-core.js"
    
    
# IDEA 3
- There should be somehow or somewhere where we can store the old used version incase their is a problem with the version that we upgraded to so they can revert back to the old version by running maybe : ui5-versioner revert


# COMMANDS AFTER DEVELOPMENT
- ui5-version latest-ui5
- ui5-version lts-ui5
- ui5-version upgrade-ui5-latest
- ui5-version upgrade-ui5-lts
- ui5-version doctor
- ui5-version release
- ui5-version upgrade-bootstrap

# COMMANDS LOCALLY 
- node ui5-version-test/bin/ui5-version.js latest-ui5 //Gets you the latest ui5 version
- node ui5-version-test/bin/ui5-version.js lts-ui5 //Gets you the latest long term ui5 maintainance version
- node ui5-version-test/bin/ui5-version.js release //with this you can change your release version from 1.0.0 to 1.0.1
- node ui5-version-test/bin/ui5-version.js release --dry-run //just a test run of the above 
- node ui5-version-test/bin/ui5-version.js release patch //changes the patch version of your ui5 release
- node ui5-version-test/bin/ui5-version.js upgrade-ui5-latest --all //changes the bootstrap in the html file to latest version and also the ui5 version in the build work zone AKA Fiori launchpad to the latest ui5 version
- node ui5-version-test/bin/ui5-version.js upgrade-ui5-latest --all --dry-run //just a dry run 
- node ui5-version-test/bin/ui5-version.js upgrade-ui5-lts --all //changes the bootstrap in the html file and also the ui5 version in the build work zone AKA Fiori launchpad to Long term maintainance  ui5 version

# LOCAL INSTALLATION
- first after writing the code use npm link
- go to the root folder of the project and run npm link NAME_OF_PROJECT_IN_PACKAGE.JSON eg npm link ui5-version. This creates your project into the node modules, so you can search in the node modules and see something like ui5-version folder 
- 