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

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

			//get current Firefox installation
			var browserlang = this.prefs.getCharPref("language");
			var architecture = this.prefs.getCharPref("architecture");

			var firefox = this.prefs.getBoolPref("firefox");
			var fennec = this.prefs.getBoolPref("fennec");
			var seamonkey = this.prefs.getBoolPref("seamonkey");
			var thunderbird = this.prefs.getBoolPref("thunderbird");

			//get current watchedfolder url
			var watchedfolder = this.prefs.getCharPref("watchedfolder");
			if(watchedfolder === "" || (firefox === false && fennec === false && seamonkey === false && thunderbird === false)){
				window.openDialog('chrome://foxtester/content/options.xul', 'foxtester-prefs', 'chrome,centerscreen,alwaysRaised');
			}

			//declare all variables as hidden
			var showinstallable = false;
			var showuninstallable = false;
			var showremovable = false;
			var showlaunchable = false;
			var showmakedefault = false;
			var showrevertdefault = false;
			var showfirefoxcentraldownload = false;
			var showfirefoxauroradownload = false;
			var showfirefoxbetadownload = false;
			var showfenneccentraldownload = false;
			var showfennecauroradownload = false;
			var showfennecbetadownload = false;
			var showthunderbirdcentraldownload = false;
			var showthunderbirdauroradownload = false;

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

			if(firefox === true){

				//get download links and append menu
				var firefoxcentralfileuri = this.prefs.getCharPref("firefoxcentralpath");
				var firefoxcentralversion = this.prefs.getCharPref("firefoxcentralversion");//this is used only for determining menu icons
				var firefoxaurorafileuri = this.prefs.getCharPref("firefoxaurorapath");
				var firefoxauroraversion = this.prefs.getCharPref("firefoxauroraversion");//this is used only for determining menu icons
				var firefoxbetafileuri = this.prefs.getCharPref("firefoxbetapath");
				var firefoxbetaversion = this.prefs.getCharPref("firefoxbetaversion");//this is used only for determining menu icons

				if(firefoxcentralfileuri !== "empty"){

					var firefoxcentralfilename = firefoxcentralfileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var firefoxcentralcurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						firefoxcentralcurrentdownload.initWithPath(watchedfolder);
						firefoxcentralcurrentdownload.append(firefoxcentralfilename);
					}catch(e){
						//do nothing
					}

					if(!firefoxcentralcurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-central");
						downloadmenuitem.setAttribute("tooltiptext","Firefox");
						downloadmenuitem.setAttribute("filepath",firefoxcentralfileuri);
						downloadmenuitem.setAttribute("filename",firefoxcentralfilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfirefoxcentraldownload = true;
					}
				}else{
					showfirefoxcentraldownload = false;
				}

				if(firefoxaurorafileuri !== "empty"){

					var firefoxaurorafilename = firefoxaurorafileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var firefoxauroracurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						firefoxauroracurrentdownload.initWithPath(watchedfolder);
						firefoxauroracurrentdownload.append(firefoxaurorafilename);
					}catch(e){
						//do nothing
					}

					if(!firefoxauroracurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-aurora");
						downloadmenuitem.setAttribute("tooltiptext","Firefox");
						downloadmenuitem.setAttribute("filepath",firefoxaurorafileuri);
						downloadmenuitem.setAttribute("filename",firefoxaurorafilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfirefoxauroradownload = true;
					}
				}else{
					showfirefoxauroradownload = false;
				}

				if(firefoxbetafileuri !== "empty"){

					var firefoxbetafilename = firefoxbetafileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var firefoxbetacurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						firefoxbetacurrentdownload.initWithPath(watchedfolder);
						firefoxbetacurrentdownload.append(firefoxbetafilename);
					}catch(e){
						//do nothing
					}

					if(!firefoxbetacurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-beta");
						downloadmenuitem.setAttribute("tooltiptext","Firefox");
						downloadmenuitem.setAttribute("filepath",firefoxbetafileuri);
						downloadmenuitem.setAttribute("filename",firefoxbetafilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfirefoxbetadownload = true;
					}
				}else{
					showfirefoxbetadownload = false;
				}

			}else{
				showfirefoxcentraldownload = false;
				showfirefoxauroradownload = false;
				showfirefoxbetadownload = false;
			}

			if(fennec === true){

				//get download links and append menu
				var fenneccentralfileuri = this.prefs.getCharPref("fenneccentralpath");
				var fenneccentralversion = this.prefs.getCharPref("fenneccentralversion");//this is used only for determining menu icons
				var fennecaurorafileuri = this.prefs.getCharPref("fennecaurorapath");
				var fennecauroraversion = this.prefs.getCharPref("fennecauroraversion");//this is used only for determining menu icons
				var fennecbetafileuri = this.prefs.getCharPref("fennecbetapath");
				var fennecbetaversion = this.prefs.getCharPref("fennecbetaversion");//this is used only for determining menu icons

				if(fenneccentralfileuri !== "empty"){

					var fenneccentralfilename = fenneccentralfileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var fenneccentralcurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						fenneccentralcurrentdownload.initWithPath(watchedfolder);
						fenneccentralcurrentdownload.append(fenneccentralfilename);
					}catch(e){
						//do nothing
					}

					if(!fenneccentralcurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-central");
						downloadmenuitem.setAttribute("tooltiptext","Fennec");
						downloadmenuitem.setAttribute("filepath",fenneccentralfileuri);
						downloadmenuitem.setAttribute("filename",fenneccentralfilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfenneccentraldownload = true;
					}
				}else{
					showfenneccentraldownload = false;
				}

				if(fennecaurorafileuri !== "empty"){

					var fennecaurorafilename = fennecaurorafileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var fennecauroracurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						fennecauroracurrentdownload.initWithPath(watchedfolder);
						fennecauroracurrentdownload.append(fennecaurorafilename);
					}catch(e){
						//do nothing
					}

					if(!fennecauroracurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-aurora");
						downloadmenuitem.setAttribute("tooltiptext","Fennec");
						downloadmenuitem.setAttribute("filepath",fennecaurorafileuri);
						downloadmenuitem.setAttribute("filename",fennecaurorafilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfennecauroradownload = true;
					}
				}else{
					showfennecauroradownload = false;
				}

				if(fennecbetafileuri !== "empty"){

					var fennecbetafilename = fennecbetafileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var fennecbetacurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						fennecbetacurrentdownload.initWithPath(watchedfolder);
						fennecbetacurrentdownload.append(fennecbetafilename);
					}catch(e){
						//do nothing
					}

					if(!fennecbetacurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-mozilla-beta");
						downloadmenuitem.setAttribute("tooltiptext","Fennec");
						downloadmenuitem.setAttribute("filepath",fennecbetafileuri);
						downloadmenuitem.setAttribute("filename",fennecbetafilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showfennecbetadownload = true;
					}
				}else{
					showfennecbetadownload = false;
				}

			}else{
				showfenneccentraldownload = false;
				showfennecauroradownload = false;
				showfennecbetadownload = false;
			}

			if(thunderbird === true){

				//get download links and append menu
				var thunderbirdcentralfileuri = this.prefs.getCharPref("thunderbirdcentralpath");
				var thunderbirdcentralversion = this.prefs.getCharPref("thunderbirdcentralversion");//this is used only for determining menu icons
				var thunderbirdaurorafileuri = this.prefs.getCharPref("thunderbirdaurorapath");
				var thunderbirdauroraversion = this.prefs.getCharPref("thunderbirdauroraversion");//this is used only for determining menu icons

				if(thunderbirdcentralfileuri !== "empty"){

					var thunderbirdcentralfilename = thunderbirdcentralfileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var thunderbirdcentralcurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						thunderbirdcentralcurrentdownload.initWithPath(watchedfolder);
						thunderbirdcentralcurrentdownload.append(thunderbirdcentralfilename);
					}catch(e){
						//do nothing
					}

					if(!thunderbirdcentralcurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-comm-central");
						downloadmenuitem.setAttribute("tooltiptext","Thunderbird");
						downloadmenuitem.setAttribute("filepath",thunderbirdcentralfileuri);
						downloadmenuitem.setAttribute("filename",thunderbirdcentralfilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showthunderbirdcentraldownload = true;
					}
				}else{
					showthunderbirdcentraldownload = false;
				}

				if(thunderbirdaurorafileuri !== "empty"){

					var thunderbirdaurorafilename = thunderbirdaurorafileuri.replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2").replace(/\.[a-z]{2}\..*/,"."+YYYY+MM+DD+".tar.bz2");

					try{
						var thunderbirdauroracurrentdownload = Components.classes["@mozilla.org/file/local;1"]
						.createInstance(Components.interfaces.nsILocalFile);
						thunderbirdauroracurrentdownload.initWithPath(watchedfolder);
						thunderbirdauroracurrentdownload.append(thunderbirdaurorafilename);
					}catch(e){
						//do nothing
					}

					if(!thunderbirdauroracurrentdownload.exists()){

						downloadmenuitem = document.createElement("menuitem");
						downloadmenuitem.setAttribute("label","latest-comm-aurora");
						downloadmenuitem.setAttribute("tooltiptext","Thunderbird");
						downloadmenuitem.setAttribute("filepath",thunderbirdaurorafileuri);
						downloadmenuitem.setAttribute("filename",thunderbirdaurorafilename);
						downloadmenuitem.setAttribute("class","menuitem-iconic");
						downloadmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
						downloadmenuitem.addEventListener('command',function (){foxtesterFileManager.downloadFile(this.getAttribute('filepath'),this.getAttribute('filename'),'verbose');},false);
						downloadnewvbox.appendChild(downloadmenuitem);
						showthunderbirdauroradownload = true;
					}
				}else{
					showthunderbirdauroradownload = false;
				}

			}else{
				showthunderbirdcentraldownload = false;
				showthunderbirdauroradownload = false;
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
				
				mDBConn.beginTransaction();

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

						if ((media.match("firefox-") || media.match("thunderbird-") || media.match("seamonkey-") || media.match("fennec-")) && media.match(".tar.bz2") && !media.match("source") && !media.match(".part")){//match installable firefox archives
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

						if ((media.match("firefox-") || media.match("thunderbird-") || media.match("seamonkey-") || media.match("fennec-")) && media.match(".tar.bz2") && !media.match("source") && media.match(".part")){//match partial download
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
				var statement = mDBConn.createStatement("SELECT * FROM downloads ORDER BY package desc");
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
							if(package.match(/fennec/) && fennec === true){
								installmenuitem = document.createElement("menuitem");
								installmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								installmenuitem.setAttribute("package",package);
								installmenuitem.setAttribute("class","menuitem-iconic");
								installmenuitem.setAttribute("tooltiptext","Fennec");
								installmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
								installmenuitem.addEventListener('command',function (){foxtesterInterface.installSelected(this.getAttribute('package'));},false);
								installnewvbox.appendChild(installmenuitem);
							}else if(package.match(/seamonkey/) && seamonkey === true){
								installmenuitem = document.createElement("menuitem");
								installmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								installmenuitem.setAttribute("package",package);
								installmenuitem.setAttribute("class","menuitem-iconic");
								installmenuitem.setAttribute("tooltiptext","Seamonkey");
								installmenuitem.setAttribute("image","chrome://foxtester/skin/seamonkey16.png");
								installmenuitem.addEventListener('command',function (){foxtesterInterface.installSelected(this.getAttribute('package'));},false);
								installnewvbox.appendChild(installmenuitem);
							}else if(package.match(/thunderbird/) && thunderbird === true){
								installmenuitem = document.createElement("menuitem");
								installmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								installmenuitem.setAttribute("package",package);
								installmenuitem.setAttribute("tooltiptext","Thunderbird");
								if(package.match(thunderbirdcentralversion)){
									installmenuitem.setAttribute("class","menuitem-iconic");
									installmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else if(package.match(thunderbirdauroraversion)){
									installmenuitem.setAttribute("class","menuitem-iconic");
									installmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										installmenuitem.setAttribute("class","menuitem-iconic");
										installmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird-unknown16.png");
									}else{
										installmenuitem.setAttribute("class","menuitem-iconic");
										installmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird16.png");
									}
								}
								installmenuitem.addEventListener('command',function (){foxtesterInterface.installSelected(this.getAttribute('package'));},false);
								installnewvbox.appendChild(installmenuitem);
							}else if(package.match(/firefox/) && firefox === true){
								installmenuitem = document.createElement("menuitem");
								installmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								installmenuitem.setAttribute("package",package);
								installmenuitem.setAttribute("tooltiptext","Firefox");
								if(package.match(firefoxcentralversion)){
									installmenuitem.setAttribute("class","menuitem-iconic");
									installmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
								}else if(package.match(firefoxauroraversion)){
									installmenuitem.setAttribute("class","menuitem-iconic");
									installmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
								}else if(package.match(firefoxbetaversion)){
									installmenuitem.setAttribute("class","menuitem-iconic");
									installmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										installmenuitem.setAttribute("class","menuitem-iconic");
										installmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-unknown16.png");
									}else{
										installmenuitem.setAttribute("class","menuitem-iconic");
										installmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-release16.png");
									}
								}
								installmenuitem.addEventListener('command',function (){foxtesterInterface.installSelected(this.getAttribute('package'));},false);
								installnewvbox.appendChild(installmenuitem);
							}

							//append remove menuitems
							if(package.match(/fennec/) && fennec === true){
								removemenuitem = document.createElement("menuitem");
								removemenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								removemenuitem.setAttribute("package",package);
								removemenuitem.setAttribute("class","menuitem-iconic");
								removemenuitem.setAttribute("tooltiptext","Fennec");
								removemenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
								removemenuitem.addEventListener('command',function (){foxtesterInterface.removeSelected(this.getAttribute('package'));},false);
								removenewvbox.appendChild(removemenuitem);
							}else if(package.match(/seamonkey/) && seamonkey === true){
								removemenuitem = document.createElement("menuitem");
								removemenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								removemenuitem.setAttribute("package",package);
								removemenuitem.setAttribute("class","menuitem-iconic");
								removemenuitem.setAttribute("tooltiptext","Seamonkey");
								removemenuitem.setAttribute("image","chrome://foxtester/skin/seamonkey16.png");
								removemenuitem.addEventListener('command',function (){foxtesterInterface.removeSelected(this.getAttribute('package'));},false);
								removenewvbox.appendChild(removemenuitem);
							}else if(package.match(/thunderbird/) && thunderbird === true){
								removemenuitem = document.createElement("menuitem");
								removemenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								removemenuitem.setAttribute("package",package);
								removemenuitem.setAttribute("tooltiptext","Thunderbird");
								if(package.match(thunderbirdcentralversion)){
									removemenuitem.setAttribute("class","menuitem-iconic");
									removemenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else if(package.match(thunderbirdauroraversion)){
									removemenuitem.setAttribute("class","menuitem-iconic");
									removemenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										removemenuitem.setAttribute("class","menuitem-iconic");
										removemenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird-unknown16.png");
									}else{
										removemenuitem.setAttribute("class","menuitem-iconic");
										removemenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird16.png");
									}
								}
								removemenuitem.addEventListener('command',function (){foxtesterInterface.removeSelected(this.getAttribute('package'));},false);
								removenewvbox.appendChild(removemenuitem);
							}else if(package.match(/firefox/) && firefox === true){
								removemenuitem = document.createElement("menuitem");
								removemenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								removemenuitem.setAttribute("package",package);
								removemenuitem.setAttribute("tooltiptext","Firefox");
								if(package.match(firefoxcentralversion)){
									removemenuitem.setAttribute("class","menuitem-iconic");
									removemenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
								}else if(package.match(firefoxauroraversion)){
									removemenuitem.setAttribute("class","menuitem-iconic");
									removemenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
								}else if(package.match(firefoxbetaversion)){
									removemenuitem.setAttribute("class","menuitem-iconic");
									removemenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										removemenuitem.setAttribute("class","menuitem-iconic");
										removemenuitem.setAttribute("image","chrome://foxtester/skin/firefox-unknown16.png");
									}else{
										removemenuitem.setAttribute("class","menuitem-iconic");
										removemenuitem.setAttribute("image","chrome://foxtester/skin/firefox-release16.png");
									}
								}
								removemenuitem.addEventListener('command',function (){foxtesterInterface.removeSelected(this.getAttribute('package'));},false);
								removenewvbox.appendChild(removemenuitem);
							}
						}
						if (installed === "yes"){//match if file has been installed and set uninstall/launch menus to be displayed

							//set uninstall menu to be displayed
							var showuninstallable = true;
							//set launch menu to be displayed
							var showlaunchable = true;
							//set make-default menu to be displayed
							if(package.match(/firefox/) && firefox === true){
								var showmakedefault = true;
							}

							//append uninstall menuitems
							if(package.match(/fennec/) && fennec === true){
								uninstallmenuitem = document.createElement("menuitem");
								uninstallmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								uninstallmenuitem.setAttribute("package",package);
								uninstallmenuitem.setAttribute("class","menuitem-iconic");
								uninstallmenuitem.setAttribute("tooltiptext","Fennec");
								uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
								uninstallmenuitem.addEventListener('command',function (){foxtesterInterface.uninstallSelected(this.getAttribute('package'));},false);
								uninstallnewvbox.appendChild(uninstallmenuitem);
							}else if(package.match(/seamonkey/) && seamonkey === true){
								uninstallmenuitem = document.createElement("menuitem");
								uninstallmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								uninstallmenuitem.setAttribute("package",package);
								uninstallmenuitem.setAttribute("class","menuitem-iconic");
								uninstallmenuitem.setAttribute("tooltiptext","Seamonkey");
								uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/seamonkey16.png");
								uninstallmenuitem.addEventListener('command',function (){foxtesterInterface.uninstallSelected(this.getAttribute('package'));},false);
								uninstallnewvbox.appendChild(uninstallmenuitem);
							}else if(package.match(/thunderbird/) && thunderbird === true){
								uninstallmenuitem = document.createElement("menuitem");
								uninstallmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								uninstallmenuitem.setAttribute("package",package);
								uninstallmenuitem.setAttribute("tooltiptext","Thunderbird");
								if(package.match(thunderbirdcentralversion)){
									uninstallmenuitem.setAttribute("class","menuitem-iconic");
									uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else if(package.match(thunderbirdauroraversion)){
									uninstallmenuitem.setAttribute("class","menuitem-iconic");
									uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										uninstallmenuitem.setAttribute("class","menuitem-iconic");
										uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird-unknown16.png");
									}else{
										uninstallmenuitem.setAttribute("class","menuitem-iconic");
										uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird16.png");
									}
								}
								uninstallmenuitem.addEventListener('command',function (){foxtesterInterface.uninstallSelected(this.getAttribute('package'));},false);
								uninstallnewvbox.appendChild(uninstallmenuitem);
							}else if(package.match(/firefox/) && firefox === true){
								uninstallmenuitem = document.createElement("menuitem");
								uninstallmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								uninstallmenuitem.setAttribute("package",package);
								uninstallmenuitem.setAttribute("tooltiptext","Firefox");
								if(package.match(firefoxcentralversion)){
									uninstallmenuitem.setAttribute("class","menuitem-iconic");
									uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
								}else if(package.match(firefoxauroraversion)){
									uninstallmenuitem.setAttribute("class","menuitem-iconic");
									uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
								}else if(package.match(firefoxbetaversion)){
									uninstallmenuitem.setAttribute("class","menuitem-iconic");
									uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										uninstallmenuitem.setAttribute("class","menuitem-iconic");
										uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-unknown16.png");
									}else{
										uninstallmenuitem.setAttribute("class","menuitem-iconic");
										uninstallmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-release16.png");
									}
								}
								uninstallmenuitem.addEventListener('command',function (){foxtesterInterface.uninstallSelected(this.getAttribute('package'));},false);
								uninstallnewvbox.appendChild(uninstallmenuitem);
							}

							//append launch menuitems
							if(package.match(/fennec/) && fennec === true){
								launchmenuitem = document.createElement("menuitem");
								launchmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								launchmenuitem.setAttribute("package",package);
								launchmenuitem.setAttribute("class","menuitem-iconic");
								launchmenuitem.setAttribute("tooltiptext","Fennec");
								launchmenuitem.setAttribute("image","chrome://foxtester/skin/fennec16.png");
								launchmenuitem.addEventListener('command',function (){foxtesterInterface.launchSelected(this.getAttribute('package'));},false);
								launchnewvbox.appendChild(launchmenuitem);
							}else if(package.match(/seamonkey/) && seamonkey === true){
								launchmenuitem = document.createElement("menuitem");
								launchmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								launchmenuitem.setAttribute("package",package);
								launchmenuitem.setAttribute("class","menuitem-iconic");
								launchmenuitem.setAttribute("tooltiptext","Seamonkey");
								launchmenuitem.setAttribute("image","chrome://foxtester/skin/seamonkey16.png");
								launchmenuitem.addEventListener('command',function (){foxtesterInterface.launchSelected(this.getAttribute('package'));},false);
								launchnewvbox.appendChild(launchmenuitem);
							}else if(package.match(/thunderbird/) && thunderbird === true){
								launchmenuitem = document.createElement("menuitem");
								launchmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								launchmenuitem.setAttribute("package",package);
								launchmenuitem.setAttribute("tooltiptext","Thunderbird");
								if(package.match(thunderbirdcentralversion)){
									launchmenuitem.setAttribute("class","menuitem-iconic");
									launchmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else if(package.match(thunderbirdauroraversion)){
									launchmenuitem.setAttribute("class","menuitem-iconic");
									launchmenuitem.setAttribute("image","chrome://foxtester/skin/miramar16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										launchmenuitem.setAttribute("class","menuitem-iconic");
										launchmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird-unknown16.png");
									}else{
										launchmenuitem.setAttribute("class","menuitem-iconic");
										launchmenuitem.setAttribute("image","chrome://foxtester/skin/thunderbird16.png");
									}
								}
								launchmenuitem.addEventListener('command',function (){foxtesterInterface.launchSelected(this.getAttribute('package'));},false);
								launchnewvbox.appendChild(launchmenuitem);
							}else if(package.match(/firefox/) && firefox === true){
								launchmenuitem = document.createElement("menuitem");
								launchmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));
								launchmenuitem.setAttribute("package",package);
								launchmenuitem.setAttribute("tooltiptext","Firefox");
								if(package.match(firefoxcentralversion)){
									launchmenuitem.setAttribute("class","menuitem-iconic");
									launchmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
								}else if(package.match(firefoxauroraversion)){
									launchmenuitem.setAttribute("class","menuitem-iconic");
									launchmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
								}else if(package.match(firefoxbetaversion)){
									launchmenuitem.setAttribute("class","menuitem-iconic");
									launchmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										launchmenuitem.setAttribute("class","menuitem-iconic");
										launchmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-unknown16.png");
									}else{
										launchmenuitem.setAttribute("class","menuitem-iconic");
										launchmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-release16.png");
									}
								}
								launchmenuitem.addEventListener('command',function (){foxtesterInterface.launchSelected(this.getAttribute('package'));},false);
								launchnewvbox.appendChild(launchmenuitem);
							}

							//append makedefault menuitems
							if(!package.match(/fennec/) && !package.match(/seamonkey/) && !package.match(/thunderbird/) && firefox === true){
								makedefaultmenuitem = document.createElement("menuitem");
								makedefaultmenuitem.setAttribute("label",package.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,""));	
								makedefaultmenuitem.setAttribute("package",package);
								makedefaultmenuitem.setAttribute("tooltiptext","Firefox");
								if(package.match(firefoxcentralversion)){
									makedefaultmenuitem.setAttribute("class","menuitem-iconic");
									makedefaultmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-nightly16.png");
								}else if(package.match(firefoxauroraversion)){
									makedefaultmenuitem.setAttribute("class","menuitem-iconic");
									makedefaultmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-aurora16.png");
								}else if(package.match(firefoxbetaversion)){
									makedefaultmenuitem.setAttribute("class","menuitem-iconic");
									makedefaultmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-beta16.png");
								}else{
									if(package.match(/.*\.[0-9]{8}\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}a.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}b.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}rc.*\.tar\.bz2/) || package.match(/firefox-[0-9]{1}\.[0-9]{1,2}[a-z]{1,4}.*\.tar\.bz2/)){
										makedefaultmenuitem.setAttribute("class","menuitem-iconic");
										makedefaultmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-unknown16.png");
									}else{
										makedefaultmenuitem.setAttribute("class","menuitem-iconic");
										makedefaultmenuitem.setAttribute("image","chrome://foxtester/skin/firefox-release16.png");
									}
								}
								makedefaultmenuitem.addEventListener('command',function (){foxtesterInterface.makeDefault(this.getAttribute('package'));},false);
								makedefaultnewvbox.appendChild(makedefaultmenuitem);
							}
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
			}

			if(firefox === true){
				//hide browse menu
				document.getElementById("foxtester-browse-selected-releases-firefox").hidden = false;
				//document.getElementById("foxtester-browse-selected-beta-firefox").hidden = false;
				document.getElementById("foxtester-browse-selected-aurora-firefox").hidden = false;
				document.getElementById("foxtester-browse-selected-central-firefox").hidden = false;
				document.getElementById("foxtester-separator-firefox").hidden = false;
			}else{
				document.getElementById("foxtester-browse-selected-releases-firefox").hidden = true;
				//document.getElementById("foxtester-browse-selected-beta-firefox").hidden = true;
				document.getElementById("foxtester-browse-selected-aurora-firefox").hidden = true;
				document.getElementById("foxtester-browse-selected-central-firefox").hidden = true;
				document.getElementById("foxtester-separator-firefox").hidden = true;
			}

			if(fennec === true){
				//hide browse menu
				document.getElementById("foxtester-browse-selected-releases-fennec").hidden = false;
				document.getElementById("foxtester-browse-selected-beta-fennec").hidden = false;
				document.getElementById("foxtester-browse-selected-aurora-fennec").hidden = false;
				document.getElementById("foxtester-browse-selected-central-fennec").hidden = false;
				document.getElementById("foxtester-separator-fennec").hidden = false;
			}else{
				document.getElementById("foxtester-browse-selected-releases-fennec").hidden = true;
				document.getElementById("foxtester-browse-selected-beta-fennec").hidden = true;
				document.getElementById("foxtester-browse-selected-aurora-fennec").hidden = true;
				document.getElementById("foxtester-browse-selected-central-fennec").hidden = true;
				document.getElementById("foxtester-separator-fennec").hidden = true;
			}

			if(seamonkey === true){
				//hide browse menu
				document.getElementById("foxtester-browse-selected-releases-seamonkey").hidden = false;
				document.getElementById("foxtester-browse-selected-central-seamonkey").hidden = false;
				document.getElementById("foxtester-separator-seamonkey").hidden = false;
			}else{
				document.getElementById("foxtester-browse-selected-releases-seamonkey").hidden = true;
				document.getElementById("foxtester-browse-selected-central-seamonkey").hidden = true;
				document.getElementById("foxtester-separator-seamonkey").hidden = true;
			}

			if(thunderbird === true){
				//hide browse menu
				document.getElementById("foxtester-browse-selected-releases-thunderbird").hidden = false;
				document.getElementById("foxtester-browse-selected-aurora-thunderbird").hidden = false;
				document.getElementById("foxtester-browse-selected-central-thunderbird").hidden = false;
			}else{
				document.getElementById("foxtester-browse-selected-releases-thunderbird").hidden = true;
				document.getElementById("foxtester-browse-selected-aurora-thunderbird").hidden = true;
				document.getElementById("foxtester-browse-selected-central-thunderbird").hidden = true;
			}

			if(fennec === false && seamonkey === false && thunderbird === false){
				try{
					document.getElementById("foxtester-separator-firefox").hidden = true;
				}catch(e){
					//do nothing
				}					
			}else if(fennec === true && seamonkey === false && thunderbird === false){
				document.getElementById("foxtester-separator-fennec").hidden = true;
			}else if(seamonkey === true && thunderbird === false){
				document.getElementById("foxtester-separator-seamonkey").hidden = true;
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

			if (showfirefoxcentraldownload === false 
					&& showfirefoxauroradownload === false 
					&& showfirefoxbetadownload === false
					&& showfenneccentraldownload === false 
					&& showfennecauroradownload === false 
					&& showfennecbetadownload === false
					&& showthunderbirdcentraldownload === false 
					&& showthunderbirdauroradownload === false 

			){//match if install menu should not be displayed
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.[a-z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
			//declare installation folder name based on file name
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/\.tar\.bz2/g,"").replace(/\./g,"-");
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

				if(profilename.match(/fennec/)){
					//declare command line to change dir to installation folder
					var thirdline = "cd \'"+installfolder.path+"\'";
					//declare command to extract source file
					var fourthline = "tar -xvjf \'"+sourcefile.path+"\'";
					//declare command line to change dir to home
					var fifthline = "cd";			
					//declare command line to create new profile
					var sixthline = ""+installfolder.path+"/fennec/fennec -no-remote -CreateProfile \""+profilename+" "+profile.path+"\"";
				}else if(profilename.match(/seamonkey/)){
					//declare command line to change dir to installation folder
					var thirdline = "cd \'"+installfolder.path+"\'";
					//declare command to extract source file
					var fourthline = "tar -xvjf \'"+sourcefile.path+"\'";
					//declare command line to change dir to home
					var fifthline = "cd";			
					//declare command line to create new profile
					var sixthline = ""+installfolder.path+"/seamonkey/seamonkey -no-remote -CreateProfile \""+profilename+" "+profile.path+"\"";
					//declare command line to copy plugins to new installation folder
					var seventhline = "rm -fr \'"+installfolder.path+"/seamonkey/plugins/\' && ln -s \'"+pluginfolder.path+"\' \'"+installfolder.path+"/seamonkey/plugins\'";
				}else if(profilename.match(/thunderbird/)){
					//declare command line to change dir to installation folder
					var thirdline = "cd \'"+installfolder.path+"\'";
					//declare command to extract source file
					var fourthline = "tar -xvjf \'"+sourcefile.path+"\'";
					//declare command line to change dir to home
					var fifthline = "cd";			
					//declare command line to create new profile
					var sixthline = ""+installfolder.path+"/thunderbird/thunderbird -no-remote -CreateProfile \""+profilename+" "+profile.path+"\"";
				}else if(profilename.match(/firefox/)){
					//declare command line to change dir to installation folder
					var thirdline = "cd \'"+installfolder.path+"\'";
					//declare command to extract source file
					var fourthline = "tar -xvjf \'"+sourcefile.path+"\'";
					//declare command line to change dir to home
					var fifthline = "cd";
					//declare command line to create new profile
					var sixthline = "firefox -no-remote -CreateProfile \""+profilename+" "+profile.path+"\"";
					//declare command line to copy plugins to new installation folder
					var seventhline = "rm -fr \'"+installfolder.path+"/firefox/plugins/\' && ln -s \'"+pluginfolder.path+"\' \'"+installfolder.path+"/firefox/plugins\'";
				}

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
				if(!profilename.match(/fennec/) && !profilename.match(/thunderbird/) ){
					converter.writeString(newline);
					converter.writeString(seventhline);
				}
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
				var message = strbundle.getFormattedString("versioninstalled", [ aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"") ]);
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.[a-z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
			//declare installation folder name based on file name
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/\.tar\.bz2/g,"").replace(/\./g,"-");
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

				if(profilename.match(/fennec/)){
					//declare command line
					var commandline = "\'"+installfolder.path+"/fennec/fennec\' -P -no-remote \""+profilename+"\"";
				}else if(profilename.match(/seamonkey/)){
					//declare command line
					var commandline = "\'"+installfolder.path+"/seamonkey/seamonkey\' -P -no-remote \""+profilename+"\"";
				}else if(profilename.match(/thunderbird/)){
					//declare command line
					var commandline = "\'"+installfolder.path+"/thunderbird/thunderbird\' -P -no-remote \""+profilename+"\"";
				}else if(profilename.match(/firefox/)){
					//declare command line
					var commandline = "\'"+installfolder.path+"/firefox/firefox\' -P -no-remote \""+profilename+"\"";
				}

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
			var installfoldername = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/\.tar\.bz2/,"").replace(/\./g,"-");
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

				if(!aFile.match(/fennec/) && !aFile.match(/thunderbird/)){
					if(aFile.match(/seamonkey/)){
						//declare command line
						var firstline = "unlink \'"+installfolder.path+"/seamonkey/plugins\'";	
					}else{
						//declare command line
						var firstline = "unlink \'"+installfolder.path+"/firefox/plugins\'";	
					}			
				}
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
				if(!aFile.match(/fennec/) && !aFile.match(/thunderbird/)){
					converter.writeString(firstline);
					converter.writeString(newline);
				}
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
			var profilename = aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"-foxtester").replace(/\.[a-z]{2}\..*/,"-foxtester").replace(/\.tar\.bz2/g,"-foxtester").replace(/\./g,"-");
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

			if(aFile.match(/thunderbird/)){
				//initiate profile.ini file
				var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsILocalFile);
				profilesini.append(".thunderbird");
				profilesini.append("profiles.ini");
			}else{
				//initiate profile.ini file
				var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsILocalFile);
				profilesini.append(".mozilla");
				if(aFile.match(/fennec/)){
					profilesini.append("fennec");
				}else if(aFile.match(/seamonkey/)){
					profilesini.append("seamonkey");
				}else{
					profilesini.append("firefox");
				}
				profilesini.append("profiles.ini");
			}

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
				var profilepathline = "Path="+profile.path;
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
			var message = strbundle.getFormattedString("versionuninstalled", [ aFile.replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"") ]);
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

				//initiate fennec profile.ini file
				var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsILocalFile);
				profilesini.append(".mozilla");
				profilesini.append("fennec");
				profilesini.append("profiles.ini");

				if(profilesini.exists()){
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
				}

				//initiate seamonkey profile.ini file
				var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsILocalFile);
				profilesini.append(".mozilla");
				profilesini.append("seamonkey");
				profilesini.append("profiles.ini");

				if(profilesini.exists()){
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
				}

				//initiate thunderbird profile.ini file
				var profilesini = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("Home", Components.interfaces.nsILocalFile);
				profilesini.append(".thunderbird");
				profilesini.append("profiles.ini");

				if(profilesini.exists()){
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
				}

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
