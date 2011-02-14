var foxtesterInterface = {

    cleanUpTempFiles: function () {//delete temporary files

	var script = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	script.append("extensions");
	script.append("foxtester@lovinglinux.megabyet.net");
	script.append("chrome");
	script.append("content");
	script.append("tmp");
	script.append("foxtester.sh");
	if (script.exists()) {
	    script.remove(false);
	}
    },

    showHideMenus: function () {//show and hide context menus

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxtester.");

	//get current watchedfolder url
	var watchedfolder = this.prefs.getCharPref("watchedfolder");
	if(watchedfolder == ""){
	    window.openDialog('chrome://foxtester/content/options.xul', 'foxtester-prefs', 'chrome,centerscreen,alwaysRaised');
	}
	//get current Firefox installation
	var systemversion = this.prefs.getCharPref("systemversion");
	//declare all variables as hidden
	var showinstallable = false;
	var showuninstallable = false;
	var showcheckable = false;
	var showremovable = false;
	var showlaunchable = false;
	var showmakedefault = false;
	var showrevertdefault = false;

	if (systemversion !== "default"){
	    var showrevertdefault = true;
	}

	//hide check menu if text is not selected
	var showCheckable = document.getElementById("foxtester-check");
	showCheckable.hidden = !(gContextMenu.isTextSelected);

	//hide manual check menu if text is selected
	var showCheckableManual = document.getElementById("foxtester-check-manual");
	showCheckableManual.hidden = (gContextMenu.isTextSelected);

	//hide install menu if mouse is on textarea
	var showInstallable = document.getElementById("foxtester-install");
	showInstallable.hidden = (gContextMenu.onTextInput);

	//hide launch menu if mouse is on textarea
	var showLaunchable = document.getElementById("foxtester-launch");
	showLaunchable.hidden = (gContextMenu.onTextInput);

	//hide uninstall menu if mouse is on textarea
	var showUninstalable = document.getElementById("foxtester-uninstall");
	showUninstalable.hidden = (gContextMenu.onTextInput);

	//hide makedefault menu if mouse is on textarea
	var showMakeDefault = document.getElementById("foxtester-make-default");
	showMakeDefault.hidden = (gContextMenu.onTextInput);

	//hide makedefault menu if mouse is on textarea
	var showRestoreDefault = document.getElementById("foxtester-revert-default");
	showRestoreDefault.hidden = (gContextMenu.onTextInput);

	//hide remove menu if mouse is on textarea
	var showRemovable = document.getElementById("foxtester-remove");
	showRemovable.hidden = (gContextMenu.onTextInput);

	//hide separator if mouse is on textarea
	var showDefaultSeparator = document.getElementById("foxtester-default-separator");
	showDefaultSeparator.hidden = (gContextMenu.onTextInput);

	//hide separator if mouse is on textarea
	var showUninstallSeparator = document.getElementById("foxtester-uninstall-separator");
	showUninstallSeparator.hidden = (gContextMenu.onTextInput);

	//hide separator if mouse is on textarea
	var showPrefsSeparator = document.getElementById("foxtester-prefs-separator");
	showPrefsSeparator.hidden = (gContextMenu.onTextInput);

	//access database interface
	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxtester.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	
	if (watchedfolder !== ""){//execute function if watchedfolder is not default

	    //intiate watchedfolder with path
	    var folder = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    folder.initWithPath(watchedfolder);

	    if (folder.exists() && folder.isDirectory() && folder !== ""){//match if watchedfolder is not default and if exists, then list files and add installables to database

		//list watchedfolder contents
		var entries = folder.directoryEntries;
		var array = [];
		while(entries.hasMoreElements())
		{
		    var entry = entries.getNext();
		    entry.QueryInterface(Components.interfaces.nsIFile);
		    array.push(entry.path);
		    //declare file path
		    var mediapath = entry.path;
		    //declare file name
		    var media = mediapath.replace(/.*\//,"");

		    if ((media.match("firefox") || media.match("mozilladeveloperpreview")) && media.match(".tar.bz2") && !media.match("source") && !media.match(".part")){//match installable firefox archives
			//add file to downloads table if not exists
			var statement = mDBConn.createStatement("INSERT INTO downloads (package,filepath,checksum,installed) VALUES (:media_value,:mediapath_value,'no','no')");
			statement.params.media_value = media;
			statement.params.mediapath_value = mediapath;
			statement.executeStep();
			statement.reset();
		    }
		}
		//list watchedfolder contents
		var entries = folder.directoryEntries;
		var array = [];
		while(entries.hasMoreElements())
		{
		    var entry = entries.getNext();
		    entry.QueryInterface(Components.interfaces.nsIFile);
		    array.push(entry.path);
		    //declare file path
		    var mediapath = entry.path;
		    //declare file name
		    var media = mediapath.replace(/.*\//,"");

		    if ((media.match("firefox") || media.match("mozilladeveloperpreview")) && media.match(".tar.bz2") && !media.match("source") && media.match(".part")){//match partial download
			//delete file from downloads
			var media = media.replace(/\.part/,"");
			var statement = mDBConn.createStatement("DELETE FROM downloads WHERE package= :media_value");
			statement.params.media_value = media;
			statement.executeStep();
			statement.reset();
		    }
		}
	    }

	    //fetch data from downloads table
	    var statement = mDBConn.createStatement("SELECT * FROM downloads");
	    mDBConn.beginTransaction();
	    while (statement.executeStep()) {
		//fetch row values
		let package = statement.row.package;
		let checksum = statement.row.checksum;
		let installed = statement.row.installed;

		if (package.length > 0){//check if package is valid

		    if (checksum == "no"){//match if file has not been tested and set check menu to be displayed

			//set check menu to be displayed
			var showcheckable = true;
			//rebuild check menus
			document.getElementById('foxtester-check-selected').builder.rebuild();
			document.getElementById('foxtester-check-manual-selected').builder.rebuild();
		    }
		    if (installed == "no"){//match if file has not been installed and set install/remove menus to be displayed

			//set install menu to be displayed
			var showinstallable = true;
			//set remove menu to be displayed
			var showremovable = true;
			//rebuild install and remove menus
			document.getElementById('foxtester-remove-selected').builder.rebuild();
			document.getElementById('foxtester-install-selected').builder.rebuild();
		    }
		    if (installed == "yes"){//match if file has been installed and set uninstall/launch menus to be displayed

			//set uninstall menu to be displayed
			var showuninstallable = true;
			//set launch menu to be displayed
			var showlaunchable = true;
			//set make-default menu to be displayed
			var showmakedefault = true;
			//rebuild uninstall and launch menus
			document.getElementById('foxtester-uninstall-selected').builder.rebuild();
			document.getElementById('foxtester-launch-selected').builder.rebuild();
			document.getElementById('foxtester-make-default-selected').builder.rebuild();
		    }
		}
	    }
	    mDBConn.commitTransaction();
	    statement.reset();
	}

	if (showcheckable == false){//match if check menus should not be displayed
	    //hide check menus
	    document.getElementById("foxtester-check").hidden = true;
	    document.getElementById("foxtester-check-manual").hidden = true;
	}

	if (showinstallable == false){//match if install menu should not be displayed
	    //hide install menu
	    document.getElementById("foxtester-install").hidden = true;
	}

	if (showlaunchable == false){//match if launch menu should not be displayed
	    //hide launch menu
	    document.getElementById("foxtester-launch").hidden = true;
	}

	if (showuninstallable == false){//match if uninstall menu should not be displayed
	    //hide uninstall menu
	    document.getElementById("foxtester-uninstall").hidden = true;
	}

	if (showremovable == false){//match if remove menu should not be displayed
	    //hide remove menu
	    document.getElementById("foxtester-remove").hidden = true;
	}

	var permanentfolderpath = "/opt/firefox";
	var permanentfolder = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	permanentfolder.initWithPath(permanentfolderpath);

	var diversionfilepath = "/usr/bin/firefox.ubuntu";
	var diversionfile = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	diversionfile.initWithPath(diversionfilepath);

	if (permanentfolder.exists() && permanentfolder.isDirectory() && diversionfile.exists() && !diversionfile.isDirectory()){
	    var showmakedefault = false;
	}
	else {
	    var showrevertdefault = false;
	}

	if (showmakedefault == false){//match if make-default menu should not be displayed
	    //hide make-default menu
	    document.getElementById("foxtester-make-default").hidden = true;
	}

	if (showrevertdefault == false){//match if revert-default menu should not be displayed
	    //hide revert-default menu
	    document.getElementById("foxtester-revert-default").hidden = true;
	}

	if (showrevertdefault == false && showmakedefault == false){//match if default separator should not be displayed
	    //hide default separator
	    document.getElementById("foxtester-default-separator").hidden = true;
	}

	if (showcheckable == false && showinstallable == false && showlaunchable == false){
	    //hide uninstall separator
	    document.getElementById("foxtester-uninstall-separator").hidden = true;
	}
    },

    browseMozilla: function () {//launch mozilla ftp site

	//declare mozilla ftp site url
	var mozillaftp = "ftp://ftp.mozilla.org/pub/mozilla.org/firefox/";

	//open FTP site on a new tab
	var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIWebNavigation)
		.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
		.rootTreeItem
		.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
		.getInterface(Components.interfaces.nsIDOMWindow);
	mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab(mozillaftp);
    },

    checkSelected: function (aFile) {//check selected file if checksum is selected from site

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxtester.");

	//fetch default algorithm from preferences
	var algorithm = this.prefs.getCharPref("algorithm");
	//fetch watchedfolder path from preferences
	var watchedfolder = this.prefs.getCharPref("watchedfolder");
	//fetch published checksum from selected text
	var originalhash = content.getSelection();

	//get strbundle
	var strbundle = document.getElementById("foxtesterstrings");
	//prompt user with current values
	var params = {inn:{newhash:originalhash,newalgorithm:algorithm}, out:null};
	window.openDialog("chrome://foxtester/content/checksum.xul", "",
	    "chrome, dialog, modal, resizable=yes", params).focus();

	if (params.out) {//execute function if user don't cancel

	    //declare new values from params.out
	    var newhash = params.out.newhash;
	    var newalgorithm = params.out.newalgorithm;

	    //access database interface
	    var database = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    database.append("foxtester.sqlite");

	    var storageService = Components.classes["@mozilla.org/storage/service;1"]
		    .getService(Components.interfaces.mozIStorageService);
	    var mDBConn = storageService.openDatabase(database);

	    //initiate selected file with path
	    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    sourcefile.initWithPath(watchedfolder);
	    sourcefile.append(aFile);

	    if (sourcefile.exists) {//if file exists then excecute function

		//read selected file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]           
			.createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(sourcefile, 0x01, 0444, 0);
		var ch = Components.classes["@mozilla.org/security/hash;1"]
			.createInstance(Components.interfaces.nsICryptoHash);

		//switch algorithm according to selected option
		switch(newalgorithm) {
		    case "md5": ch.init(ch.MD5); break;
		    case "sha1": ch.init(ch.SHA1); break;
		    default: ch.init(ch.MD5); break;
		}

		//generate file checksum and declare it
		const PR_UINT32_MAX = 0xffffffff;
		ch.updateFromStream(istream, PR_UINT32_MAX);
		var hash = ch.finish(false);
		function toHexString(charCode)
		{
		  return ("0" + charCode.toString(16)).slice(-2);
		}
		var filechecksum = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");
      
		if (newalgorithm == "md5" && filechecksum.length > 32) {//check if file checksum has more than 32 chars
		    filechecksum = filechecksum.substr(0,32);//remove extra chars
		}

		if (newalgorithm == "sha1" && filechecksum.length > 40) {//check if file checksum has more than 40 chars
		    filechecksum = filechecksum.substr(0,40);//remove extra chars
		}

		var filechecksum = filechecksum.replace(/\s/g,"");
		var newhash = newhash.toString().replace(/\s/g,"");

		if (filechecksum == newhash){//action if checksums match

		    //update file checksum in the downloads table to "yes"
		    var statement = mDBConn.createStatement("UPDATE downloads SET checksum='yes' WHERE package= :media_value");
		    statement.params.media_value = aFile;
		    statement.executeStep();
		    statement.reset();

		    //rebuild menus that are affected by the new value
		    document.getElementById('foxtester-check-selected').builder.rebuild();
		    document.getElementById('foxtester-check-manual-selected').builder.rebuild();
		    document.getElementById('foxtester-install-selected').builder.rebuild();

		    //fetch message from strbundle
		    var strbundle = document.getElementById("foxtesterstrings");
		    var message = strbundle.getString("isamatch");
		    var messagetitle = strbundle.getString("foxtestermessage");
		    //alert user that checksum match
		    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			    .getService(Components.interfaces.nsIAlertsService);
		    alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
		    messagetitle, message,
		    false, "", null);
		}
		else{

		    //capitalize strings
		    filechecksum = filechecksum.toUpperCase();
		    newhash = newhash.toUpperCase();

		    if (filechecksum == newhash){

			//update file checksum in the downloads table to "yes"
			var statement = mDBConn.createStatement("UPDATE downloads SET checksum='yes' WHERE package= :media_value");
			statement.params.media_value = aFile;
			statement.executeStep();
			statement.reset();

			//rebuild menus that are affected by the new value
			document.getElementById('foxtester-check-selected').builder.rebuild();
			document.getElementById('foxtester-check-manual-selected').builder.rebuild();
			document.getElementById('foxtester-install-selected').builder.rebuild();

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var message = strbundle.getString("isamatch");
			var messagetitle = strbundle.getString("foxtestermessage");
			//alert user that checksum match
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
			alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
			messagetitle, message,
			false, "", null);
		    }
		    else{
			//update file checksum in the downloads table to "no"
			var statement = mDBConn.createStatement("UPDATE downloads SET checksum='no' WHERE package= :media_value");
			statement.params.media_value = aFile;
			statement.executeStep();
			statement.reset();

			//rebuild menus that are affected by the new value
			document.getElementById('foxtester-check-selected').builder.rebuild();
			document.getElementById('foxtester-check-manual-selected').builder.rebuild();
			document.getElementById('foxtester-install-selected').builder.rebuild();

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var message = strbundle.getFormattedString("notamatch", [ filechecksum, newhash ]);
			var messagetitle = strbundle.getString("foxtesteralert");
			//alert user that checksums do not match
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			prompts.alert(window, messagetitle, message);
		    }
		}
	    }
	}
    },

    checkManualSelected: function (aFile) {//check selected file if checksum is not selected from site

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxtester.");

	//fetch default algorithm from preferences
	var algorithm = this.prefs.getCharPref("algorithm");
	//fetch watchedfolder path from preferences
	var watchedfolder = this.prefs.getCharPref("watchedfolder");

	//get strbundle
	var strbundle = document.getElementById("foxtesterstrings");
	//prompt user with current values
	var params = {inn:{newhash:"",newalgorithm:algorithm}, out:null};
	window.openDialog("chrome://foxtester/content/checksum.xul", "",
	    "chrome, dialog, modal, resizable=yes", params).focus();

	if (params.out) {//execute function if user don't cancel

	    //declare new values from params.out
	    var newhash = params.out.newhash;
	    var newalgorithm = params.out.newalgorithm;

	    //access database interface
	    var database = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    database.append("foxtester.sqlite");

	    var storageService = Components.classes["@mozilla.org/storage/service;1"]
		    .getService(Components.interfaces.mozIStorageService);
	    var mDBConn = storageService.openDatabase(database);

	    //initiate selected file with path
	    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    sourcefile.initWithPath(watchedfolder);
	    sourcefile.append(aFile);

	    if (sourcefile.exists) {//if file exists then excecute function

		//read selected file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]           
			.createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(sourcefile, 0x01, 0444, 0);
		var ch = Components.classes["@mozilla.org/security/hash;1"]
			.createInstance(Components.interfaces.nsICryptoHash);

		//switch algorithm according to selected option
		switch(newalgorithm) {
		    case "md5": ch.init(ch.MD5); break;
		    case "sha1": ch.init(ch.SHA1); break;
		    default: ch.init(ch.MD5); break;
		}
		//generate file checksum and declare it
		const PR_UINT32_MAX = 0xffffffff;
		ch.updateFromStream(istream, PR_UINT32_MAX);
		var hash = ch.finish(false);
		function toHexString(charCode)
		{
		  return ("0" + charCode.toString(16)).slice(-2);
		}
		var filechecksum = [toHexString(hash.charCodeAt(i)) for (i in hash)].join("");

		if (newalgorithm == "md5" && filechecksum.length > 32) {//check if file checksum has more than 32 chars
		    filechecksum = filechecksum.substr(0,32);//remove extra chars
		}

		if (newalgorithm == "sha1" && filechecksum.length > 40) {//check if file checksum has more than 40 chars
		    filechecksum = filechecksum.substr(0,40);//remove extra chars
		}

		var filechecksum = filechecksum.replace(/\s/g,"");
		var newhash = newhash.toString().replace(/\s/g,"");

		if (filechecksum == newhash){//action if checksums match

		    //update file checksum in the downloads table to "yes"
		    var statement = mDBConn.createStatement("UPDATE downloads SET checksum='yes' WHERE package= :media_value");
		    statement.params.media_value = aFile;
		    statement.executeStep();
		    statement.reset();

		    //rebuild menus that are affected by the new value
		    document.getElementById('foxtester-check-selected').builder.rebuild();
		    document.getElementById('foxtester-check-manual-selected').builder.rebuild();
		    document.getElementById('foxtester-install-selected').builder.rebuild();

		    //fetch message from strbundle
		    var strbundle = document.getElementById("foxtesterstrings");
		    var message = strbundle.getString("isamatch");
		    var messagetitle = strbundle.getString("foxtestermessage");
		    //alert user
		    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			    .getService(Components.interfaces.nsIAlertsService);
		    alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
		    messagetitle, message,
		    false, "", null);
		}
		else{//action if checksums do not match

		    //capitalize strings
		    filechecksum = filechecksum.toUpperCase();
		    newhash = newhash.toUpperCase();

		    if (filechecksum == newhash){

			//update file checksum in the downloads table to "yes"
			var statement = mDBConn.createStatement("UPDATE downloads SET checksum='yes' WHERE package= :media_value");
			statement.params.media_value = aFile;
			statement.executeStep();
			statement.reset();

			//rebuild menus that are affected by the new value
			document.getElementById('foxtester-check-selected').builder.rebuild();
			document.getElementById('foxtester-check-manual-selected').builder.rebuild();
			document.getElementById('foxtester-install-selected').builder.rebuild();

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var message = strbundle.getString("isamatch");
			var messagetitle = strbundle.getString("foxtestermessage");
			//alert user that checksum match
			var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
			alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
			messagetitle, message,
			false, "", null);
		    }
		    else{
			//update file checksum in the downloads table to "no"
			var statement = mDBConn.createStatement("UPDATE downloads SET checksum='no' WHERE package= :media_value");
			statement.params.media_value = aFile;
			statement.executeStep();
			statement.reset();

			//rebuild menus that are affected by the new value
			document.getElementById('foxtester-check-selected').builder.rebuild();
			document.getElementById('foxtester-check-manual-selected').builder.rebuild();
			document.getElementById('foxtester-install-selected').builder.rebuild();

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var message = strbundle.getFormattedString("notamatch", [ filechecksum, newhash ]);
			var messagetitle = strbundle.getString("foxtesteralert");
			//alert user that checksums do not match
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
			prompts.alert(window, messagetitle, message);
		    }
		}
	    }
	}
    },

    installSelected: function (aFile) {//install selected file

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxtester.");

	//fetch watchedfolder path from preferences
	var watchedfolder = this.prefs.getCharPref("watchedfolder");
	//fetch pluginfolder path from preferences
	var pluginfolderpath = this.prefs.getCharPref("pluginfolder");
	//declare profile name based on file name
	var profilename = aFile.replace(/\.tar\.bz2/g,"-foxtester");
	var profilename = profilename.replace(/\./g,"-");
	//declare installation folder name based on file name
	var installfoldername = aFile.replace(/\.tar\.bz2/g,"");
	var installfoldername = installfoldername.replace(/\./g,"-");
	//declare basic shell command lines
	var bashline = "#!/bin/bash";
	var newline = "\n";

	//create installation folder if not exists
	var installfolder = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	installfolder.append("foxtester");
	installfolder.append("install");
	installfolder.append(installfoldername);
	if(!installfolder.exists() || !installfolder.isDirectory()) {
	    installfolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}
	//create profile folder if not exists
	var profile = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	profile.append("foxtester");
	profile.append("profiles");
	profile.append(profilename);
	if(!profile.exists() || !profile.isDirectory()) {
	    profile.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
	}

	//remove and recreate temporary script
	var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	tempscript.append("extensions");
	tempscript.append("foxtester@lovinglinux.megabyet.net");
	tempscript.append("chrome");
	tempscript.append("content");
	tempscript.append("tmp");
	tempscript.append("foxtester.sh");
	if (tempscript.exists()) {
	    tempscript.remove(false);
	}
	tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	//initiate source file with path
	var sourcefile = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	sourcefile.initWithPath(watchedfolder);
	sourcefile.append(aFile);

	//initiate plugin folder with path
	var pluginfolder = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	pluginfolder.initWithPath(pluginfolderpath);

	if(tempscript.exists() && !tempscript.isDirectory() && profile.exists() && profile.isDirectory() && installfolder.exists() && installfolder.isDirectory() && pluginfolder.exists() && pluginfolder.isDirectory() && sourcefile.exists() && !sourcefile.isDirectory()){//check everything exists

	    //declare command line to create new profile
	    var thirdline = "firefox -no-remote -CreateProfile \""+profilename+" "+profile.path+"\"";
	    //declare command line to change dir to installation folder
	    var fourthline = "cd \'"+installfolder.path+"\'";
	    //declare command to extract source file
	    var fifthline = "tar -xvjf \'"+sourcefile.path+"\'";
	    //declare commadn line to change dir to home
	    var sixthline = "cd";
	    //declare command line to copy plugins to new installation folder
	    var seventhline = "rm -fr \'"+installfolder.path+"/firefox/plugins/\' && ln -s \'"+pluginfolder.path+"\' \'"+installfolder.path+"/firefox/plugins\'";

	    //write command lines to temporary script
	    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		    .createInstance(Components.interfaces.nsIFileOutputStream);
	    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
	    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		    .createInstance(Components.interfaces.nsIConverterOutputStream);
	    converter.init(foStream, "UTF-8", 0, 0);
	    converter.writeString(bashline);
	    converter.writeString(newline);
	    converter.writeString(newline);
	    converter.writeString(thirdline);
	    converter.writeString(newline);
	    converter.writeString(fourthline);
	    converter.writeString(newline);
	    converter.writeString(fifthline);
	    converter.writeString(newline);
	    converter.writeString(sixthline);
	    converter.writeString(newline);
	    converter.writeString(seventhline);
	    converter.close();

	    //execute script
	    var process = Components.classes['@mozilla.org/process/util;1']
		    .createInstance(Components.interfaces.nsIProcess);
	    process.init(tempscript);
	    var arguments = [];
	    process.run(false, arguments, arguments.length);

	    //access database interface
	    var database = Components.classes['@mozilla.org/file/directory_service;1']
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsILocalFile);
	    database.append("foxtester.sqlite");

	    var storageService = Components.classes["@mozilla.org/storage/service;1"]
		    .getService(Components.interfaces.mozIStorageService);
	    var mDBConn = storageService.openDatabase(database);

	    //update installed status in downloads table
	    var statement = mDBConn.createStatement("UPDATE downloads SET installed='yes' WHERE package= :media_value");
	    statement.params.media_value = aFile;
	    statement.executeStep();
	    statement.reset();

	    //rebuild affected menus
	    document.getElementById('foxtester-install-selected').builder.rebuild();
	    document.getElementById('foxtester-remove-selected').builder.rebuild();

	    //fetch message from strbundle
	    var strbundle = document.getElementById("foxtesterstrings");
	    var message = strbundle.getFormattedString("versioninstalled", [ installfoldername ]);
	    var messagetitle = strbundle.getString("foxtesteralert");
	    //alert user
	    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		    .getService(Components.interfaces.nsIAlertsService);
	    alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
	    messagetitle, message,
	    false, "", null);
	}
    },

    launchSelected: function (aFile) {//launch selected file

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.foxtester.");

	//declare profile name based on file name
	var profilename = aFile.replace(/\.tar\.bz2/g,"-foxtester");
	var profilename = profilename.replace(/\./g,"-");
	//declare installation folder name based on file name
	var installfoldername = aFile.replace(/\.tar\.bz2/g,"");
	var installfoldername = installfoldername.replace(/\./g,"-");
	//declare basic shell command lines
	var bashline = "#!/bin/bash";
	var newline = "\n";

	//initiate install folder
	var installfolder = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	installfolder.append("foxtester");
	installfolder.append("install");
	installfolder.append(installfoldername);

	//remove and recreate temporary script
	var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	tempscript.append("extensions");
	tempscript.append("foxtester@lovinglinux.megabyet.net");
	tempscript.append("chrome");
	tempscript.append("content");
	tempscript.append("tmp");
	tempscript.append("foxtester.sh");
	if (tempscript.exists()) {
	    tempscript.remove(false);
	}
	tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	if(tempscript.exists() && !tempscript.isDirectory() && installfolder.exists() && installfolder.isDirectory()){//check if script and install folde exists

	    //declare command line
	    var commandline = "\'"+installfolder.path+"/firefox/firefox\' -P -no-remote \""+profilename+"\"";

	    //write commands to script
	    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		    .createInstance(Components.interfaces.nsIFileOutputStream);
	    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
	    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		    .createInstance(Components.interfaces.nsIConverterOutputStream);
	    converter.init(foStream, "UTF-8", 0, 0);
	    converter.writeString(bashline);
	    converter.writeString(newline);
	    converter.writeString(newline);
	    converter.writeString(commandline);
	    converter.close();

	    //execute script
	    var process = Components.classes['@mozilla.org/process/util;1']
		    .createInstance(Components.interfaces.nsIProcess);
	    process.init(tempscript);
	    var arguments = [];
	    process.run(false, arguments, arguments.length);
	}
    },

    uninstallSelected: function (aFile) {//uninstall selected file

	//declare foldername based on file name
	var installfoldername = aFile.replace(/\.tar\.bz2/,"");
	var installfoldername = installfoldername.replace(/\./g,"-");
	//declare basic shell command lines
	var bashline = "#!/bin/bash";
	var newline = "\n";

	//initiate install folder
	var installfolder = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	installfolder.append("foxtester");
	installfolder.append("install");
	installfolder.append(installfoldername);

	//remove and recreate temporary script
	var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	tempscript.append("extensions");
	tempscript.append("foxtester@lovinglinux.megabyet.net");
	tempscript.append("chrome");
	tempscript.append("content");
	tempscript.append("tmp");
	tempscript.append("foxtester.sh");
	if (tempscript.exists()) {
	    tempscript.remove(false);
	}
	tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	if(tempscript.exists() && !tempscript.isDirectory() && installfolder.exists() && installfolder.isDirectory()){//check if script and install folder exists

	    //declare command line
	    var firstline = "unlink \'"+installfolder.path+"/firefox/plugins\'";
	    var secondline = "rm -fr \'"+installfolder.path+"\'";

	    //write commands to script
	    var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		    .createInstance(Components.interfaces.nsIFileOutputStream);
	    foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
	    var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		    .createInstance(Components.interfaces.nsIConverterOutputStream);
	    converter.init(foStream, "UTF-8", 0, 0);
	    converter.writeString(bashline);
	    converter.writeString(newline);
	    converter.writeString(newline);
	    converter.writeString(firstline);
	    converter.writeString(newline);
	    converter.writeString(secondline);
	    converter.close();

	    //execute script
	    var process = Components.classes['@mozilla.org/process/util;1']
		    .createInstance(Components.interfaces.nsIProcess);
	    process.init(tempscript);
	    var arguments = [];
	    process.run(false, arguments, arguments.length);
	}

	//declare profile name based on file name
	var profilename = aFile.replace(/\.tar\.bz2/g,"-foxtester");
	var profilename = profilename.replace(/\./g,"-");
	//initiate profile folder
	var profile = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	profile.append("foxtester");
	profile.append("profiles");
	profile.append(profilename);
	if(profile.exists() && profile.isDirectory()) {//remove if exists
	    profile.remove(true);
	}

	//initiate profile.ini file
	var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("Home", Components.interfaces.nsILocalFile);
	profilesini.append(".mozilla");
	profilesini.append("firefox");
	profilesini.append("profiles.ini");

	var data = "";
	//read profile.ini
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
		.createInstance(Components.interfaces.nsIFileInputStream);
	var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
		.createInstance(Components.interfaces.nsIConverterInputStream);
	fstream.init(profilesini, -1, 0, 0);
	cstream.init(fstream, "UTF-8", 0, 0);
	let (str = {}) {
	  cstream.readString(-1, str);
	  data = str.value;
	  //match patterns
	  var profilenameline = "Name="+profilename;
	  //replace matched lines
	  var newdata = data.replace(profilenameline,"");
	}
	cstream.close();

	//write new data into profile.ini
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
	foStream.init(profilesini, 0x02 | 0x08 | 0x20, 0666, 0);
	var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
		.createInstance(Components.interfaces.nsIConverterOutputStream);
	converter.init(foStream, "UTF-8", 0, 0);
	converter.writeString(newdata);
	converter.close();

	//access database interface
	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxtester.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	//update installed status in downloads table
	var statement = mDBConn.createStatement("UPDATE downloads SET installed='no' WHERE package= :media_value");
	statement.params.media_value = aFile;
	statement.executeStep();

	//rebuild affected menus
	document.getElementById('foxtester-install-selected').builder.rebuild();
	document.getElementById('foxtester-uninstall-selected').builder.rebuild();
	document.getElementById('foxtester-remove-selected').builder.rebuild();

	//fetch message from strbundle
	var strbundle = document.getElementById("foxtesterstrings");
	var message = strbundle.getFormattedString("versionuninstalled", [ installfoldername ]);
	var messagetitle = strbundle.getString("foxtesteralert");
	//alert user
	var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService);
	alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
	messagetitle, message,
	false, "", null);
    },

    removeSelected: function (aFile) {//remove selected file

	//fetch watchedfolder path from preferences
	var watchedfolder = this.prefs.getCharPref("watchedfolder");

	//remove source file
	var sourcefile = Components.classes["@mozilla.org/file/local;1"]
		.createInstance(Components.interfaces.nsILocalFile);
	sourcefile.initWithPath(watchedfolder);
	sourcefile.append(aFile);
	if(sourcefile.exists()) {
	    sourcefile.remove(false);
	}

	//access database interface
	var database = Components.classes['@mozilla.org/file/directory_service;1']
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsILocalFile);
	database.append("foxtester.sqlite");

	var storageService = Components.classes["@mozilla.org/storage/service;1"]
		.getService(Components.interfaces.mozIStorageService);
	var mDBConn = storageService.openDatabase(database);

	//delete entry from downloads database
	var statement = mDBConn.createStatement("DELETE FROM downloads WHERE package= :media_value");
	statement.params.media_value = aFile;
	statement.executeStep();

	//rebuild affected menus
	document.getElementById('foxtester-check-selected').builder.rebuild();
	document.getElementById('foxtester-check-manual-selected').builder.rebuild();
	document.getElementById('foxtester-install-selected').builder.rebuild();
	document.getElementById('foxtester-uninstall-selected').builder.rebuild();
	document.getElementById('foxtester-remove-selected').builder.rebuild();

	//fetch message from strbundle
	var strbundle = document.getElementById("foxtesterstrings");
	var message = strbundle.getFormattedString("versionremoved", [ aFile ]);
	var messagetitle = strbundle.getString("foxtesteralert");
	//alert user
	var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
		.getService(Components.interfaces.nsIAlertsService);
	alertsService.showAlertNotification("chrome://foxtester/skin/icon32.png",
	messagetitle, message,
	false, "", null);
    },

    makeDefault: function (aFile) {//make selected your default browser

	var strbundle = document.getElementById("foxtesterstrings");
	var message = strbundle.getFormattedString("makedefault", [ aFile ]);
	var messagetitle = strbundle.getString("foxtesteralert");
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	var result = prompts.confirm(window, messagetitle, message);

	if(result == true){//execute action if user confirms

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.foxtester.");

	    //fetch watchedfolder path from preferences
	    var watchedfolder = this.prefs.getCharPref("watchedfolder");
	    //fetch pluginfolder path from preferences
	    var pluginfolderpath = this.prefs.getCharPref("pluginfolder");

	    //fetch terminal path from prefs
	    var terminalpath = this.prefs.getCharPref("terminal");
	    //initialize terminal with path
	    var terminal = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    terminal.initWithPath(terminalpath);

	    //declare basic shell command lines
	    var bashline = "#!/bin/bash";
	    var newline = "\n";

	    //declare basic terminal command lines
	    var strbundle = document.getElementById("foxtesterstrings");
	    var pleasewaitmessage = strbundle.getString("pleasewait");
	    var pleasewait = "echo \""+pleasewaitmessage+"\"";
	    var endlinemessage = strbundle.getString("done");
	    var endline = "echo \""+endlinemessage+"\"";

	    //initiate /opt folder
	    var permanentfolderpath = "/opt";
	    var permanentfolder = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    permanentfolder.initWithPath(permanentfolderpath);

	    //initiate /usr/bin folder
	    var localbinfilepath = "/usr/bin";
	    var localbinfile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    localbinfile.initWithPath(localbinfilepath);

	    //remove and recreate temporary script
	    var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsIFile);
	    tempscript.append("extensions");
	    tempscript.append("foxtester@lovinglinux.megabyet.net");
	    tempscript.append("chrome");
	    tempscript.append("content");
	    tempscript.append("tmp");
	    tempscript.append("foxtester.sh");
	    if (tempscript.exists()) {
		tempscript.remove(false);
	    }
	    tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	    //initiate source file with path
	    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    sourcefile.initWithPath(watchedfolder);
	    sourcefile.append(aFile);

	    //initiate plugin folder with path
	    var pluginfolder = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    pluginfolder.initWithPath(pluginfolderpath);

	    if(tempscript.exists() && !tempscript.isDirectory() && pluginfolder.exists() && pluginfolder.isDirectory() && sourcefile.exists() && !sourcefile.isDirectory()){//check everything exists

		//declare command line to change dir to installation folder
		var firstline = "cd \'"+permanentfolder.path+"\' && sudo rm -fr \'"+permanentfolder.path+"/firefox\'";
		//declare command to extract source file
		var secondline = "sudo tar -xvjf \'"+sourcefile.path+"\'";
		//declare command line to copy plugins to new installation folder
		var thirdline = "sudo rm -fr \'"+permanentfolder.path+"/firefox/plugins\' && sudo ln -s \'"+pluginfolder.path+"\' \'"+permanentfolder.path+"/firefox/plugins\'";
		//declare command line to copy new firefox executable
		var fourthline = "sudo dpkg-divert --divert \'"+localbinfile.path+"/firefox.ubuntu\' --rename \'"+localbinfile.path+"/firefox\' && sudo ln -s \'"+permanentfolder.path+"/firefox/firefox\' \'"+localbinfile.path+"/firefox\'";

		//write command lines to temporary script
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(bashline);
		converter.writeString(newline);
		converter.writeString(newline);
		converter.writeString(pleasewait);
		converter.writeString(newline);
		converter.writeString(firstline);
		converter.writeString(newline);
		converter.writeString(secondline);
		converter.writeString(newline);
		converter.writeString(thirdline);
		converter.writeString(newline);
		converter.writeString(fourthline);
		converter.writeString(newline);
		converter.writeString(endline);
		converter.close();

		if (terminal.exists()) {//check if terminal emulator exists and execute script
		    var process = Components.classes['@mozilla.org/process/util;1']
			    .createInstance(Components.interfaces.nsIProcess);
		    process.init(terminal);
		    var arguments = ["-e","'"+tempscript.path+"'"];
		    process.run(false, arguments, arguments.length);

		    //change system version preference
		    this.prefs.setCharPref("systemversion", "custom");
		}
	    }
	}
    },

    revertDefault: function () {//revert to default browser

	var strbundle = document.getElementById("foxtesterstrings");
	var message = strbundle.getString("revertdefault");
	var messagetitle = strbundle.getString("foxtesteralert");
	var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
	var result = prompts.confirm(window, messagetitle, message);

	if(result == true){//execute action if user confirms

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.foxtester.");

	    //fetch terminal path from prefs
	    var terminalpath = this.prefs.getCharPref("terminal");
	    //initialize terminal with path
	    var terminal = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    terminal.initWithPath(terminalpath);

	    //declare basic shell command lines
	    var bashline = "#!/bin/bash";
	    var newline = "\n";

	    //declare basic terminal command lines
	    var strbundle = document.getElementById("foxtesterstrings");
	    var pleasewaitmessage = strbundle.getString("pleasewait");
	    var pleasewait = "echo \""+pleasewaitmessage+"\"";
	    var endlinemessage = strbundle.getString("done");
	    var endline = "echo \""+endlinemessage+"\"";

	    //initiate /opt/firefox folder
	    var permanentfolderpath = "/opt/firefox";
	    var permanentfolder = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    permanentfolder.initWithPath(permanentfolderpath);

	    //initiate /usr/local/bin/firefox folder
	    var localbinfilepath = "/usr/bin/firefox";
	    var localbinfile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    localbinfile.initWithPath(localbinfilepath);

	    //initiate /usr/local/bin/firefox folder
	    var diversionfilepath = "/usr/bin/firefox.ubuntu";
	    var diversionfile = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	    diversionfile.initWithPath(diversionfilepath);

	    //remove and recreate temporary script
	    var tempscript = Components.classes["@mozilla.org/file/directory_service;1"]
		    .getService(Components.interfaces.nsIProperties)
		    .get("ProfD", Components.interfaces.nsIFile);
	    tempscript.append("extensions");
	    tempscript.append("foxtester@lovinglinux.megabyet.net");
	    tempscript.append("chrome");
	    tempscript.append("content");
	    tempscript.append("tmp");
	    tempscript.append("foxtester.sh");
	    if (tempscript.exists()) {
		tempscript.remove(false);
	    }
	    tempscript.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

	    if(tempscript.exists() && !tempscript.isDirectory() && permanentfolder.exists() && permanentfolder.isDirectory() && localbinfile.exists() && !localbinfile.isDirectory() && diversionfile.exists() && !diversionfile.isDirectory()){//check everything exists

		//declare command line to delete files
		var firstline = "sudo unlink \'"+permanentfolder.path+"/plugins\'";
		var secondline = "sudo rm -fr \'"+permanentfolder.path+"\' && sudo rm -f \'"+localbinfile.path+"\' && sudo dpkg-divert --rename --remove \'"+localbinfile.path+"\'";

		//write command lines to temporary script
		var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			.createInstance(Components.interfaces.nsIFileOutputStream);
		foStream.init(tempscript, 0x02 | 0x10 , 0777, 0);
		var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
			.createInstance(Components.interfaces.nsIConverterOutputStream);
		converter.init(foStream, "UTF-8", 0, 0);
		converter.writeString(bashline);
		converter.writeString(newline);
		converter.writeString(newline);
		converter.writeString(pleasewait);
		converter.writeString(newline);
		converter.writeString(firstline);
		converter.writeString(newline);
		converter.writeString(secondline);
		converter.writeString(newline);
		converter.writeString(endline);
		converter.close();

		if (terminal.exists()) {//check if terminal emulator exists and execute script
		    var process = Components.classes['@mozilla.org/process/util;1']
			    .createInstance(Components.interfaces.nsIProcess);
		    process.init(terminal);
		    var arguments = ["-e","'"+tempscript.path+"'"];
		    process.run(false, arguments, arguments.length);

		    //change system version preference
		    this.prefs.setCharPref("systemversion", "default");
		}
	    }
	}
    }
};
//event listeners to call the functions when window load and unload
window.addEventListener("unload", function(e) { foxtesterInterface.cleanUpTempFiles(); }, false);
