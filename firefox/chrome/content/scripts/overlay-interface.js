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

			//get current Firefox installation
			var browserlang = this.prefs.getCharPref("language");
			var architecture = this.prefs.getCharPref("architecture");

			//get current watchedfolder url
			var watchedfolder = this.prefs.getCharPref("watchedfolder");
			if(watchedfolder === ""){
				window.openDialog('chrome://foxtester/content/options.xul', 'foxtester-prefs', 'chrome,centerscreen,alwaysRaised');
			}

			//declare all variables as hidden
			var showinstallable = false;
			var showuninstallable = false;
			var showremovable = false;
			var showlaunchable = false;
			var showmakedefault = false;
			var showrevertdefault = false;
			var showdownload = false;

			//reset menu
			var installmenupopup = document.getElementById("foxtester-install-selected");
			var installmenupopupvbox = document.getElementById("foxtester-install-selected-vbox");
			try{
				installmenupopup.removeChild(installmenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var installnewvbox = document.createElement("vbox");
			installnewvbox.setAttribute("id","foxtester-install-selected-vbox");
			installmenupopup.appendChild(installnewvbox);
			var installmenuitem;

			//reset menu
			var launchmenupopup = document.getElementById("foxtester-launch-selected");
			var launchmenupopupvbox = document.getElementById("foxtester-launch-selected-vbox");
			try{
				launchmenupopup.removeChild(launchmenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var launchnewvbox = document.createElement("vbox");
			launchnewvbox.setAttribute("id","foxtester-launch-selected-vbox");
			launchmenupopup.appendChild(launchnewvbox);
			var launchmenuitem;

			//reset menu
			var uninstallmenupopup = document.getElementById("foxtester-uninstall-selected");
			var uninstallmenupopupvbox = document.getElementById("foxtester-uninstall-selected-vbox");
			try{
				uninstallmenupopup.removeChild(uninstallmenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var uninstallnewvbox = document.createElement("vbox");
			uninstallnewvbox.setAttribute("id","foxtester-uninstall-selected-vbox");
			uninstallmenupopup.appendChild(uninstallnewvbox);
			var uninstallmenuitem;

			//reset menu
			var removemenupopup = document.getElementById("foxtester-remove-selected");
			var removemenupopupvbox = document.getElementById("foxtester-remove-selected-vbox");
			try{
				removemenupopup.removeChild(removemenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var removenewvbox = document.createElement("vbox");
			removenewvbox.setAttribute("id","foxtester-remove-selected-vbox");
			removemenupopup.appendChild(removenewvbox);
			var removemenuitem;

			var makedefaultmenupopup = document.getElementById("foxtester-make-default-selected");
			var makedefaultmenupopupvbox = document.getElementById("foxtester-make-default-selected-vbox");
			try{
				makedefaultmenupopup.removeChild(makedefaultmenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var makedefaultnewvbox = document.createElement("vbox");
			makedefaultnewvbox.setAttribute("id","foxtester-make-default-selected-vbox");
			makedefaultmenupopup.appendChild(makedefaultnewvbox);
			var makedefaultmenuitem;

			//reset menu
			var downloadmenupopup = document.getElementById("foxtester-download-selected");
			var downloadmenupopupvbox = document.getElementById("foxtester-download-selected-vbox");
			try{
				downloadmenupopup.removeChild(downloadmenupopup.firstChild);
			}catch(e){
				//do nothing
			}
			var downloadnewvbox = document.createElement("vbox");
			downloadnewvbox.setAttribute("id","foxtester-download-selected-vbox");
			downloadmenupopup.appendChild(downloadnewvbox);
			var downloadmenuitem;

			//get download links and append menu
			var fileuri = this.prefs.getCharPref("latestmozillacentral");

			if(fileuri !== "empty"){

				//get selected date and time
				var currentDate = new Date();
				var cmonth = currentDate.getMonth();
				var month = cmonth+1;
				var MM = "0" + month;
				MM = MM.substring(MM.length-2, MM.length);
				var day = currentDate.getDate();
				var DD = "0" + day;
				DD = DD.substring(DD.length-2, DD.length);
				var hours = currentDate.getHours();
				var HH = "0" + hours;
				HH = HH.substring(HH.length-2, HH.length);
				var minutes = currentDate.getMinutes();
				var MI = "0" + minutes;
				MI = MI.substring(MI.length-2, MI.length);
				var seconds = currentDate.getSeconds();
				var SS = "0" + seconds;
				SS = SS.substring(SS.length-2, SS.length);
				var YYYY = currentDate.getFullYear();

				var filename = fileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");	

				try{
					var currentdownload = Components.classes["@mozilla.org/file/local;1"]
					.createInstance(Components.interfaces.nsILocalFile);
					currentdownload.initWithPath(watchedfolder);
					currentdownload.append(filename);
				}catch(e){
					//do nothing
				}

				if(!currentdownload.exists()){

					downloadmenuitem = document.createElement("menuitem");
					downloadmenuitem.setAttribute("label","latest-mozilla-central");
					downloadmenuitem.setAttribute("filepath",fileuri);
					downloadmenuitem.setAttribute("filename",filename);
					downloadmenuitem.setAttribute('oncommand',"foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');");
					downloadnewvbox.appendChild(downloadmenuitem);
					var showdownload = true;
				}
			}else{
				var showdownload = false;
			}

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
							mDBConn.beginTransaction();
							statement.params.media_value = media;
							statement.params.mediapath_value = mediapath;
							statement.executeStep();
							mDBConn.commitTransaction();
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
							mDBConn.beginTransaction();
							statement.params.media_value = media;
							statement.executeStep();
							mDBConn.commitTransaction();
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
					let installed = statement.row.installed;

					if (package.length > 0){//check if package is valid

						if (installed === "no"){//match if file has not been installed and set install/remove menus to be displayed

							//set install menu to be displayed
							var showinstallable = true;
							//set remove menu to be displayed
							var showremovable = true;

							//append install menuitems
							installmenuitem = document.createElement("menuitem");
							installmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
							installmenuitem.setAttribute("package",package);
							installmenuitem.setAttribute('oncommand',"foxtesterInterface.installSelected(this.getAttribute('package'));");
							installnewvbox.appendChild(installmenuitem);

							//append remove menuitems
							removemenuitem = document.createElement("menuitem");
							removemenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));	
							removemenuitem.setAttribute("package",package);
							removemenuitem.setAttribute('oncommand',"foxtesterInterface.removeSelected(this.getAttribute('package'));");
							removenewvbox.appendChild(removemenuitem);
						}
						if (installed === "yes"){//match if file has been installed and set uninstall/launch menus to be displayed

							//set uninstall menu to be displayed
							var showuninstallable = true;
							//set launch menu to be displayed
							var showlaunchable = true;
							//set make-default menu to be displayed
							var showmakedefault = true;

							//append uninstall menuitems
							uninstallmenuitem = document.createElement("menuitem");
							uninstallmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
							uninstallmenuitem.setAttribute("package",package);
							uninstallmenuitem.setAttribute('oncommand',"foxtesterInterface.uninstallSelected(this.getAttribute('package'));");
							uninstallnewvbox.appendChild(uninstallmenuitem);
							//append launch menuitems
							launchmenuitem = document.createElement("menuitem");
							launchmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));	
							launchmenuitem.setAttribute("package",package);
							launchmenuitem.setAttribute('oncommand',"foxtesterInterface.launchSelected(this.getAttribute('package'));");
							launchnewvbox.appendChild(launchmenuitem);
							//append makedefault menuitems
							makedefaultmenuitem = document.createElement("menuitem");
							makedefaultmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));	
							makedefaultmenuitem.setAttribute("package",package);
							makedefaultmenuitem.setAttribute('oncommand',"foxtesterInterface.makeDefault(this.getAttribute('package'));");
							makedefaultnewvbox.appendChild(makedefaultmenuitem);
						}
					}
				}
				mDBConn.commitTransaction();
				statement.reset();
			}

			try{
				var permanentfolderpath = "/opt/foxtester";
				var permanentfolder = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				permanentfolder.initWithPath(permanentfolderpath);
			}catch(e){
				//do nothing
			}

			try{
				var diversionfilepath = "/usr/bin/firefox.ubuntu";
				var diversionfile = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				diversionfile.initWithPath(diversionfilepath);
			}catch(e){
				//do nothing
			}
			if (diversionfile.exists() && !diversionfile.isDirectory()){
				var showmakedefault = false;
				var showrevertdefault = true;
			}else{
				var showrevertdefault = false;
				if(showuninstallable === true){
					var showmakedefault = true;
				}else{
					var showmakedefault = false;
				}
			}

			if (showinstallable === false){//match if install menu should not be displayed
				//hide install menu
				document.getElementById("foxtester-install").hidden = true;
			}else{
				document.getElementById("foxtester-install").hidden = false;
			}

			if (showlaunchable === false){//match if launch menu should not be displayed
				//hide launch menu
				document.getElementById("foxtester-launch").hidden = true;
			}else{
				document.getElementById("foxtester-launch").hidden = false;
			}

			if (showuninstallable === false){//match if uninstall menu should not be displayed
				//hide uninstall menu
				document.getElementById("foxtester-uninstall").hidden = true;
			}else{
				document.getElementById("foxtester-uninstall").hidden = false;
			}

			if (showremovable === false){//match if remove menu should not be displayed
				//hide remove menu
				document.getElementById("foxtester-remove").hidden = true;
			}else{
				document.getElementById("foxtester-remove").hidden = false;
			}

			if (showmakedefault === false){//match if make-default menu should not be displayed
				//hide make-default menu
				document.getElementById("foxtester-make-default").hidden = true;
			}else{
				document.getElementById("foxtester-make-default").hidden = false;
			}

			if (showrevertdefault === false){//match if revert-default menu should not be displayed
				//hide revert-default menu
				document.getElementById("foxtester-revert-default").hidden = true;
			}else{
				document.getElementById("foxtester-revert-default").hidden = false;
			}

			if (showrevertdefault === false && showmakedefault === false){//match if default separator should not be displayed
				//hide default separator
				document.getElementById("foxtester-default-separator").hidden = true;
			}else{
				document.getElementById("foxtester-default-separator").hidden = false;
			}

			if (showinstallable === false && showlaunchable === false){
				//hide uninstall separator
				document.getElementById("foxtester-uninstall-separator").hidden = true;
			}else{
				document.getElementById("foxtester-uninstall-separator").hidden = false;
			}

			if (showdownload === false){//match if install menu should not be displayed
				//hide dowload menu
				document.getElementById("foxtester-download").hidden = true;
			}else{
				document.getElementById("foxtester-download").hidden = false;
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
			//declare installation folder name based on file name
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.tar\.bz2/g,"").replace(/\./g,"-");
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

				//fetch message from strbundle
				var strbundle = document.getElementById("foxtesterstrings");
				var message = strbundle.getFormattedString("versioninstalled", [ aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"") ]);
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
			//declare installation folder name based on file name
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.tar\.bz2/g,"").replace(/\./g,"-");
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

			//initiate profile folder
			var profilefolder = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
			profilefolder.append("foxtester");
			profilefolder.append("profiles");
			profilefolder.append(profilename);

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
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.tar\.bz2/,"").replace(/\./g,"-");
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
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
				var profilepathline = "Path="+profile.path.replace(/.*\.mozilla\/firefox\//,"");
				var profilenameline = "Name="+profilename;
				//replace matched lines
				var newdata = data.replace(profilenameline,"");
				newdata = newdata.replace(profilepathline,"");
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

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var message = strbundle.getFormattedString("versionuninstalled", [ aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"") ]);
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
				var permanentfolderpath = "/opt/foxtester";
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
					var firstline = "sudo mkdir \'"+permanentfolder.path+"\'";
					//declare command to extract source file
					var secondline = "cd \'"+permanentfolder.path+"\' && sudo rm -fr \'"+permanentfolder.path+"/firefox\' && sudo tar -xvjf \'"+sourcefile.path+"\'";
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
					}else{
						var message = strbundle.getString("terminalpath");
						var messagetitle = strbundle.getString("foxtesteralert");
						//alert user
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}
				}
			}
		},

		resetAll: function () {

			//fetch message from strbundle
			var strbundle = document.getElementById("foxtesterstrings");
			var messagetitle = strbundle.getString("foxtesteralert");
			var message = strbundle.getString("reset");

			//prompt user for confirmation
			var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
			var result = prompts.confirm(window, messagetitle, message);

			if(result == true){//execute if user confirm

				//delete and recreate firefox installation folders to reset all installations
				var installfolder = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
				installfolder.append("foxtester");
				installfolder.append("install");
				if(installfolder.exists() && installfolder.isDirectory()) {
					installfolder.remove(true);
					installfolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}

				//delete and recreate firefox profile folders to reset all installations
				var profilesfolder = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
				profilesfolder.append("foxtester");
				profilesfolder.append("profiles");
				if(profilesfolder.exists() && profilesfolder.isDirectory()) {
					profilesfolder.remove(true);
					profilesfolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
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
					//replace foxtester lines
					var newdata = data.replace(/.*foxtester.*/g,"");
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

				//reset database
				mDBConn.executeSimpleSQL("DELETE FROM downloads");
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
				var permanentfolderpath = "/opt/foxtester";
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
					var firstline = "sudo unlink \'"+permanentfolder.path+"/firefox/plugins\'";
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
					}else{
						var message = strbundle.getString("terminalpath");
						var messagetitle = strbundle.getString("foxtesteralert");
						//alert user
						prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
						.getService(Components.interfaces.nsIPromptService);
						prompts.alert(window, messagetitle, message);
					}
				}
			}
		}
};
//event listeners to call the functions when window load and unload
window.addEventListener("unload", function(e) { foxtesterInterface.cleanUpTempFiles(); }, false);
