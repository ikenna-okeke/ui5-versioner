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
