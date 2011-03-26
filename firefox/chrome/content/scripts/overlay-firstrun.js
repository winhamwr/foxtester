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

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

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

					var navbar = document.getElementById("nav-bar");
					var newset = navbar.currentSet + ",foxtester-toolbar-button";
					navbar.currentSet = newset;
					navbar.setAttribute("currentset", newset );
					document.persist("nav-bar", "currentset");

					//set preferences
					this.prefs.setBoolPref("firstrun",false);
					this.prefs.setCharPref("version",current);

					//get paths from environment variables
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

					//set preferences
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
				//get browser language
				var browserlang = navigator.language;
				this.prefs.setCharPref("language",browserlang);

				//get architecture
				var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
				.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

				if(!osString.match(/x86_64/)){
					this.prefs.setCharPref("architecture","i686");
				}else{
					this.prefs.setCharPref("architecture","x86_64");
				}

				//reset pref
				this.prefs.setCharPref("latestmozillacentral","");
				try{
					var downloadpage = "http://nightly.mozilla.org/";
					var downRequest = new XMLHttpRequest();
					downRequest.open('GET', downloadpage, true);
					downRequest.onreadystatechange=function(){
						if (this.readyState === 4 && this.status === 200) {

							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.foxtester.");

							//get pref
							var architecture = this.prefs.getCharPref("architecture");

							//process response
							var downsource = downRequest.responseText;
							var newline = downsource.split("\n");
							for(var i=0; i< newline.length; i++){
								if (newline[i].match(".en-US.linux-"+architecture+".tar.bz2")) {
									var fileuri = newline[i].replace(/<a href="/,"").replace(/\.tar\.bz2.*/,".tar.bz2");
									this.prefs.setCharPref("latestmozillacentral",fileuri);
								}
							}
						}
					};
					downRequest.send(null);
				}catch(e){
					//do nothing
				}
			}
		}
};
window.addEventListener("load", function(e) { setTimeout(function () { foxtesterFirstrun.init(); }, 150); }, false);
