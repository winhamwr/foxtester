var foxtesterFirstrun = {

		init: function(){//get current version from extension manager

			try {// Firefox <= 3.6

				//get current version from extension manager
				var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
				.getService(Components.interfaces.nsIExtensionManager);
				var current = gExtensionManager.getItemForID("foxtester@lovinglinux.megabyet.net").version;

				foxtesterFirstrun.updateInstall(current);
			}
			catch(e){// Firefox >=4.0

				//get current version from extension manager
				Components.utils.import("resource://gre/modules/AddonManager.jsm");

				AddonManager.getAddonByID("foxtester@lovinglinux.megabyet.net", function(addon) {

					var current = addon.version;
					foxtesterFirstrun.updateInstall(current);
				});
			}
			window.removeEventListener("load",function(){ foxtesterFirstrun.init(); },true);
		},

		updateInstall: function(aVersion){//check version and perform updates
			
			//get browser language
			var language;
			try{
			    language = Components.classes["@mozilla.org/intl/nslocaleservice;1"]
	            .getService(Components.interfaces.nsILocaleService)
	            .getSystemLocale()
	            .getCategory("NSILOCALE_MESSAGES");
			}catch(e){
				language = "en-US";
			}
			
			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");
			
			//set language
			this.prefs.setCharPref("language",language);

			//access database interface
			var database = Components.classes['@mozilla.org/file/directory_service;1']
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsILocalFile);
			database.append("foxtester.sqlite");

			var storageService = Components.classes["@mozilla.org/storage/service;1"]
			.getService(Components.interfaces.mozIStorageService);
			var mDBConn = storageService.openDatabase(database);

			//fetch localization from strbundle
			var strbundle = document.getElementById("foxtesterstrings");

			//firstrun and update declarations
			var ver = -1, firstrun = true;
			var current = aVersion;
			var terminalpath = false;

			try{//check for existing preferences
				ver = this.prefs.getCharPref("version");
				firstrun = this.prefs.getBoolPref("firstrun");
			}catch(e){
				//nothing
			}finally{

				if (firstrun){//actions specific for first installation

					//add button to navigation toolbar
					var navbar = document.getElementById("nav-bar");
					var newset = navbar.currentSet + ",foxtester-toolbar-button";
					navbar.currentSet = newset;
					navbar.setAttribute("currentset", newset );
					document.persist("nav-bar", "currentset");

					//set version preferences
					this.prefs.setBoolPref("firstrun",false);
					this.prefs.setCharPref("version",current);

					//get paths from environment variables and set terminal path in prefs
					var envpaths = Components.classes["@mozilla.org/process/environment;1"]
					.getService(Components.interfaces.nsIEnvironment)
					.get('PATH');

					if(envpaths){

						//split
						newpath = envpaths.split(":");

						//find
						for(var i=0; i< newpath.length; i++){

							//initiate file
							var gnometerminal = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
							gnometerminal.initWithPath(newpath[i]+"/gnome-terminal");
							if(gnometerminal.exists()){
								this.prefs.setCharPref("terminal",gnometerminal.path);
								terminalpath = true;
							}else{
								//initiate file
								var konsole = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
								konsole.initWithPath(newpath[i]+"/konsole");
								if(konsole.exists()){
									this.prefs.setCharPref("terminal",konsole.path);
									terminalpath = true;
								}else{
									//initiate file
									var xfce4 = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
									xfce4.initWithPath(newpath[i]+"/xfce4-terminal");
									if(xfce4.exists()){
										this.prefs.setCharPref("terminal",xfce4.path);
										terminalpath = true;
									}else{
										//initiate file
										var xterminal = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
										xterminal.initWithPath(newpath[i]+"/x-terminal-emulator");
										if(xterminal.exists()){
											this.prefs.setCharPref("terminal",xterminal.path);
											terminalpath = true;
										}
									}
								}
							}
						}
					}
					if(terminalpath === false){

						//reset terminal path
						this.prefs.setCharPref("terminal","");

						//alert user
						var message = strbundle.getString("terminalpath");
						var messagetitle = strbundle.getString("foxtesteralert");
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://foxtester/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}

				if (ver!=current && !firstrun){//actions specific for extension updates

					//set version preferences
					this.prefs.setCharPref("version",current);

					if (ver == "1.0.1" || ver == "1.0.0" ){//delete old version folder

						//delete /home/.foxtester
						var sourcefolder = Components.classes['@mozilla.org/file/directory_service;1']
						.getService(Components.interfaces.nsIProperties)
						.get("Home", Components.interfaces.nsIFile);
						sourcefolder.append(".foxtester");
						if(sourcefolder.exists() && sourcefolder.isDirectory()) {//delete sourcefolder
							sourcefolder.remove(true);
						}
						//reset the database
						mDBConn.executeSimpleSQL("DELETE FROM downloads");

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
							//delete old profile entries
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
				}

				//create database tables if not exists
				mDBConn.executeSimpleSQL("CREATE TABLE IF NOT EXISTS downloads (package TEXT PRIMARY KEY ON CONFLICT IGNORE NOT NULL, filepath TEXT, checksum TEXT DEFAULT 'no', installed TEXT DEFAULT 'no')");

				//create folders if not exists
				var installfolder = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
				installfolder.append("foxtester");
				installfolder.append("install");
				if(!installfolder.exists() || !installfolder.isDirectory()) {
					installfolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}
				var profilefolder = Components.classes['@mozilla.org/file/directory_service;1']
				.getService(Components.interfaces.nsIProperties)
				.get("ProfD", Components.interfaces.nsIFile);
				profilefolder.append("foxtester");
				profilefolder.append("profiles");
				if(!profilefolder.exists() || !profilefolder.isDirectory()) {
					profilefolder.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
				}

				//get architecture and set pref
				var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
				.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

				if(!osString.match(/x86_64/)){
					this.prefs.setCharPref("architecture","i686");
				}else{
					this.prefs.setCharPref("architecture","x86_64");
				}

				var firefox = this.prefs.getBoolPref("firefox");
				var fennec = this.prefs.getBoolPref("fennec");
				var seamonkey = this.prefs.getBoolPref("seamonkey");
				var thunderbird = this.prefs.getBoolPref("thunderbird");

				//get date and time
				var currentDate = new Date();
				var cmonth = currentDate.getMonth();
				var month = cmonth+1;
				var MM = "0" + month;
				MM = MM.substring(MM.length-2, MM.length);
				var day = currentDate.getDate();
				var DD = "0" + day;
				DD = DD.substring(DD.length-2, DD.length);
				var YYYY = currentDate.getFullYear();
				var currenttimestamp = YYYY+MM+DD;

				if(firefox === true){

					//*****************get latest-mozilla-central version for determining menu icons**********************
					var firefoxcentralversion = this.prefs.getCharPref("firefoxcentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(firefoxcentralversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("firefoxcentralversion",firefoxcentralversion);
					}
					//*****************get latest-mozilla-central version for determining menu icons**********************
					var firefoxauroraversion = this.prefs.getCharPref("firefoxaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(firefoxauroraversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("firefoxauroraversion",firefoxauroraversion);
					}
					//*****************get latest-mozilla-central version for determining menu icons**********************
					var firefoxbetaversion = this.prefs.getCharPref("firefoxbetapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(firefoxbetaversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("firefoxbetaversion",firefoxbetaversion);
					}

					//*****************get latest-mozilla-central for generating download menu**********************
					//reset pref
					this.prefs.setCharPref("firefoxcentralpath","empty");
					this.prefs.setCharPref("firefoxaurorapath","empty");
					this.prefs.setCharPref("firefoxbetapath","empty");
					//get update timestamp
					var firefoxcentralupdate = this.prefs.getIntPref("firefoxcentralupdate");
					var firefoxauroraupdate = this.prefs.getIntPref("firefoxauroraupdate");
					var firefoxbetaupdate = this.prefs.getIntPref("firefoxbetaupdate");

					//update firefoxcentral
					if(currenttimestamp > firefoxcentralupdate){

						//change firefoxcentralupdate to current timestamp
						this.prefs.setIntPref("firefoxcentralupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var firefoxcentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/";
							}else{
								var firefoxcentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central-l10n/";
							}
							var firefoxcentraldownRequest = new XMLHttpRequest();
							firefoxcentraldownRequest.open('GET', firefoxcentraldownloadpage, true);
							firefoxcentraldownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var firefoxcentraldownsource = firefoxcentraldownRequest.responseText;
									var firefoxcentralnewline = firefoxcentraldownsource.split("\n");
									for(var i=0; i< firefoxcentralnewline.length; i++){
										if (firefoxcentralnewline[i].match("firefox-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var firefoxcentralfileuri = firefoxcentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var firefoxcentralfileuri = firefoxcentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}											
											this.prefs.setCharPref("firefoxcentralpath",firefoxcentralfileuri);
										}
									}
									//set version for menu icons
									var firefoxcentralversion = this.prefs.getCharPref("firefoxcentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(firefoxcentralversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("firefoxcentralversion",firefoxcentralversion);							
									}
								}
							};
							firefoxcentraldownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}

					//update firefoxaurora
					if(currenttimestamp > firefoxauroraupdate){

						//change firefoxauroraupdate to current timestamp
						this.prefs.setIntPref("firefoxauroraupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var firefoxauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora/";
							}else{
								var firefoxauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora-l10n/";
							}
							var firefoxauroradownRequest = new XMLHttpRequest();
							firefoxauroradownRequest.open('GET', firefoxauroradownloadpage, true);
							firefoxauroradownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var firefoxauroradownsource = firefoxauroradownRequest.responseText;
									var firefoxauroranewline = firefoxauroradownsource.split("\n");
									for(var i=0; i< firefoxauroranewline.length; i++){
										if (firefoxauroranewline[i].match("firefox-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var firefoxaurorafileuri = firefoxauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var firefoxaurorafileuri = firefoxauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}	
											this.prefs.setCharPref("firefoxaurorapath",firefoxaurorafileuri);
										}
									}
									//set version for menu icons
									var firefoxauroraversion = this.prefs.getCharPref("firefoxaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(firefoxauroraversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("firefoxauroraversion",firefoxauroraversion);							
									}
								}
							};
							firefoxauroradownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}

					//update firefoxbeta
					if(currenttimestamp > firefoxbetaupdate){

						//change firefoxbetaupdate to current timestamp
						this.prefs.setIntPref("firefoxbetaupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var firefoxbetadownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta/";
							}else{
								var firefoxbetadownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta-l10n/";
							}
							var firefoxbetadownRequest = new XMLHttpRequest();
							firefoxbetadownRequest.open('GET', firefoxbetadownloadpage, true);
							firefoxbetadownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var firefoxbetadownsource = firefoxbetadownRequest.responseText;
									var firefoxbetanewline = firefoxbetadownsource.split("\n");
									for(var i=0; i< firefoxbetanewline.length; i++){
										if (firefoxbetanewline[i].match("firefox-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var firefoxbetafileuri = firefoxbetanewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var firefoxbetafileuri = firefoxbetanewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}	
											this.prefs.setCharPref("firefoxbetapath",firefoxbetafileuri);
										}
									}
									//set version for menu icons
									var firefoxbetaversion = this.prefs.getCharPref("firefoxbetapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(firefoxbetaversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("firefoxbetaversion",firefoxbetaversion);							
									}
								}
							};
							firefoxbetadownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}
				}else{
					//reset pref
					this.prefs.setCharPref("firefoxcentralpath","empty");
					this.prefs.setCharPref("firefoxaurorapath","empty");
					this.prefs.setCharPref("firefoxbetapath","empty");
				}

				if(fennec === true){

					//*****************get latest-mozilla-central version for determining menu icons**********************
					var fenneccentralversion = this.prefs.getCharPref("fenneccentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(fenneccentralversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("fenneccentralversion",fenneccentralversion);
					}
					//*****************get latest-mozilla-central version for determining menu icons**********************
					var fennecauroraversion = this.prefs.getCharPref("fennecaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(fennecauroraversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("fennecauroraversion",fennecauroraversion);
					}
					//*****************get latest-mozilla-central version for determining menu icons**********************
					var fennecbetaversion = this.prefs.getCharPref("fennecbetapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(fennecbetaversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("fennecbetaversion",fennecbetaversion);
					}

					//*****************get latest-mozilla-central for generating download menu**********************
					//reset pref
					this.prefs.setCharPref("fenneccentralpath","empty");
					this.prefs.setCharPref("fennecaurorapath","empty");
					this.prefs.setCharPref("fennecbetapath","empty");
					//get update timestamp
					var fenneccentralupdate = this.prefs.getIntPref("fenneccentralupdate");
					var fennecauroraupdate = this.prefs.getIntPref("fennecauroraupdate");
					var fennecbetaupdate = this.prefs.getIntPref("fennecbetaupdate");

					//update fenneccentral
					if(currenttimestamp > fenneccentralupdate){

						//change fenneccentralupdate to current timestamp
						this.prefs.setIntPref("fenneccentralupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var fenneccentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux/";
							}else{
								var fenneccentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux-l10n/";
							}
							var fenneccentraldownRequest = new XMLHttpRequest();
							fenneccentraldownRequest.open('GET', fenneccentraldownloadpage, true);
							fenneccentraldownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var fenneccentraldownsource = fenneccentraldownRequest.responseText;
									var fenneccentralnewline = fenneccentraldownsource.split("\n");
									for(var i=0; i< fenneccentralnewline.length; i++){
										if (fenneccentralnewline[i].match("fennec-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var fenneccentralfileuri = fenneccentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var fenneccentralfileuri = fenneccentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}											
											this.prefs.setCharPref("fenneccentralpath",fenneccentralfileuri);
										}
									}
									//set version for menu icons
									var fenneccentralversion = this.prefs.getCharPref("fenneccentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(fenneccentralversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("fenneccentralversion",fenneccentralversion);							
									}
								}
							};
							fenneccentraldownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}

					//update fennecaurora
					if(currenttimestamp > fennecauroraupdate){

						//change fennecauroraupdate to current timestamp
						this.prefs.setIntPref("fennecauroraupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var fennecauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux/";
							}else{
								var fennecauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux-l10n/";
							}
							var fennecauroradownRequest = new XMLHttpRequest();
							fennecauroradownRequest.open('GET', fennecauroradownloadpage, true);
							fennecauroradownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var fennecauroradownsource = fennecauroradownRequest.responseText;
									var fennecauroranewline = fennecauroradownsource.split("\n");
									for(var i=0; i< fennecauroranewline.length; i++){
										if (fennecauroranewline[i].match("fennec-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var fennecaurorafileuri = fennecauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var fennecaurorafileuri = fennecauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}	
											this.prefs.setCharPref("fennecaurorapath",fennecaurorafileuri);
										}
									}
									//set version for menu icons
									var fennecauroraversion = this.prefs.getCharPref("fennecaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(fennecauroraversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("fennecauroraversion",fennecauroraversion);							
									}
								}
							};
							fennecauroradownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}

					//update fennecbeta
					if(currenttimestamp > fennecbetaupdate){

						//change fennecbetaupdate to current timestamp
						this.prefs.setIntPref("fennecbetaupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var fennecbetadownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux/";
							}else{
								var fennecbetadownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux-l10n/";
							}
							var fennecbetadownRequest = new XMLHttpRequest();
							fennecbetadownRequest.open('GET', fennecbetadownloadpage, true);
							fennecbetadownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var fennecbetadownsource = fennecbetadownRequest.responseText;
									var fennecbetanewline = fennecbetadownsource.split("\n");
									for(var i=0; i< fennecbetanewline.length; i++){
										if (fennecbetanewline[i].match("fennec-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var fennecbetafileuri = fennecbetanewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var fennecbetafileuri = fennecbetanewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}	
											this.prefs.setCharPref("fennecbetapath",fennecbetafileuri);
										}
									}
									//set version for menu icons
									var fennecbetaversion = this.prefs.getCharPref("fennecbetapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(fennecbetaversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("fennecbetaversion",fennecbetaversion);							
									}
								}
							};
							fennecbetadownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}
				}else{
					//reset pref
					this.prefs.setCharPref("fenneccentralpath","empty");
					this.prefs.setCharPref("fennecaurorapath","empty");
					this.prefs.setCharPref("fennecbetapath","empty");
				}

				if(thunderbird === true){

					//*****************get latest-mozilla-central version for determining menu icons**********************
					var thunderbirdcentralversion = this.prefs.getCharPref("thunderbirdcentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(thunderbirdcentralversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("thunderbirdcentralversion",thunderbirdcentralversion);
					}
					//*****************get latest-mozilla-central version for determining menu icons**********************
					var thunderbirdauroraversion = this.prefs.getCharPref("thunderbirdaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
					if(thunderbirdauroraversion !== "empty"){
						//reset pref
						this.prefs.setCharPref("thunderbirdauroraversion",thunderbirdauroraversion);
					}

					//*****************get latest-mozilla-central for generating download menu**********************
					//reset pref
					this.prefs.setCharPref("thunderbirdcentralpath","empty");
					this.prefs.setCharPref("thunderbirdaurorapath","empty");

					//get update timestamp
					var thunderbirdcentralupdate = this.prefs.getIntPref("thunderbirdcentralupdate");
					var thunderbirdauroraupdate = this.prefs.getIntPref("thunderbirdauroraupdate");

					//update thunderbirdcentral
					if(currenttimestamp > thunderbirdcentralupdate){

						//change thunderbirdcentralupdate to current timestamp
						this.prefs.setIntPref("thunderbirdcentralupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var thunderbirdcentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central/";
							}else{
								var thunderbirdcentraldownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central-l10n/";
							}
							var thunderbirdcentraldownRequest = new XMLHttpRequest();
							thunderbirdcentraldownRequest.open('GET', thunderbirdcentraldownloadpage, true);
							thunderbirdcentraldownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var thunderbirdcentraldownsource = thunderbirdcentraldownRequest.responseText;
									var thunderbirdcentralnewline = thunderbirdcentraldownsource.split("\n");
									for(var i=0; i< thunderbirdcentralnewline.length; i++){
										if (thunderbirdcentralnewline[i].match("thunderbird-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var thunderbirdcentralfileuri = thunderbirdcentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var thunderbirdcentralfileuri = thunderbirdcentralnewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}											
											this.prefs.setCharPref("thunderbirdcentralpath",thunderbirdcentralfileuri);
										}
									}
									//set version for menu icons
									var thunderbirdcentralversion = this.prefs.getCharPref("thunderbirdcentralpath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(thunderbirdcentralversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("thunderbirdcentralversion",thunderbirdcentralversion);							
									}
								}
							};
							thunderbirdcentraldownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}

					//update thunderbirdaurora
					if(currenttimestamp > thunderbirdauroraupdate){

						//change thunderbirdauroraupdate to current timestamp
						this.prefs.setIntPref("thunderbirdauroraupdate",currenttimestamp);

						try{
							if(language === "en-US"){
								var thunderbirdauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora/";
							}else{
								var thunderbirdauroradownloadpage = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora-l10n/";
							}
							var thunderbirdauroradownRequest = new XMLHttpRequest();
							thunderbirdauroradownRequest.open('GET', thunderbirdauroradownloadpage, true);
							thunderbirdauroradownRequest.onreadystatechange=function(){
								if (this.readyState === 4 && this.status === 200) {

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.foxtester.");

									//get pref
									var architecture = this.prefs.getCharPref("architecture");
									var language = this.prefs.getCharPref("language");

									//process response
									var thunderbirdauroradownsource = thunderbirdauroradownRequest.responseText;
									var thunderbirdauroranewline = thunderbirdauroradownsource.split("\n");
									for(var i=0; i< thunderbirdauroranewline.length; i++){
										if (thunderbirdauroranewline[i].match("thunderbird-.*."+language+".linux-"+architecture+".tar.bz2")) {
											if(language === "en-US"){
												var thunderbirdaurorafileuri = thunderbirdauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}else{
												var thunderbirdaurorafileuri = thunderbirdauroranewline[i].replace(/.*<a href="/,"http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora-l10n/").replace(/\.tar\.bz2.*/,".tar.bz2");
											}	
											this.prefs.setCharPref("thunderbirdaurorapath",thunderbirdaurorafileuri);
										}
									}
									//set version for menu icons
									var thunderbirdauroraversion = this.prefs.getCharPref("thunderbirdaurorapath").replace(/.*\//g,"").replace(/\.[a-z]{2}-[A-Z]{2}\..*/,"").replace(/\.[a-z]{2}\..*/,"").replace(/.*-/,"").replace(/\.tar\.bz2/,"");
									if(thunderbirdauroraversion !== "empty"){
										//reset pref
										this.prefs.setCharPref("thunderbirdauroraversion",thunderbirdauroraversion);							
									}
								}
							};
							thunderbirdauroradownRequest.send(null);
						}catch(e){
							//do nothing
						}
					}
				}else{
					//reset pref
					this.prefs.setCharPref("thunderbirdcentralpath","empty");
					this.prefs.setCharPref("thunderbirdaurorapath","empty");
				}
			}
		}
};
window.addEventListener("load", function(e) { setTimeout(function () { foxtesterFirstrun.init(); }, 150); }, false);
