var foxtesterFileManager = {

		openLink:function(aSite) {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

			var language = this.prefs.getCharPref("language");

			if(aSite == "firefox-releases"){
				var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/releases/";
			}
			if(aSite == "firefox-beta"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-beta-l10n/";
				}
			}
			if(aSite == "firefox-aurora"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-aurora-l10n/";
				}				
			}
			if(aSite == "firefox-central"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central-l10n/";
				}				
			}

			if(aSite == "fennec-releases"){
				var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/releases/";
			}
			if(aSite == "fennec-beta"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-beta-linux-l10n/";
				}
			}
			if(aSite == "fennec-aurora"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-aurora-linux-l10n/";
				}
			}
			if(aSite == "fennec-central"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/mobile/nightly/latest-mozilla-central-linux-l10n/";
				}
			}

			if(aSite == "thunderbird-releases"){
				var url = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/releases/";
			}
			if(aSite == "thunderbird-aurora"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-aurora-l10n/";
				}
			}
			if(aSite == "thunderbird-central"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/thunderbird/nightly/latest-comm-central-l10n/";
				}
			}

			if(aSite == "seamonkey-releases"){
				var url = "http://ftp.mozilla.org/pub/mozilla.org/seamonkey/releases/";
			}
			if(aSite == "seamonkey-central"){
				if(language === "en-US"){
					var url = "http://ftp.mozilla.org/pub/mozilla.org/seamonkey/nightly/latest-comm-central-trunk/";
				}else{
					var url = "http://ftp.mozilla.org/pub/mozilla.org/seamonkey/nightly/latest-comm-central-trunk-l10n/";
				}
			}

			if(aSite.match("file:") || aSite.match("http:")){
				var url = aSite;
			}

			//open site in new tab
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
			getService();
			var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
			var win = wmed.getMostRecentWindow("navigator:browser");

			if ( !win ) {

				win = window.openDialog("chrome://browser/content/browser.xul",
						"_blank",
						"chrome,all,dialog=no",
						url, null, null);
			}
			else {
				var content = win.document.getElementById("content");
				content.selectedTab = content.addTab(url);
			}
		},

		downloadFile: function (aSource,aFile,aMethod) {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

			//get prefs
			var watchedfolder = this.prefs.getCharPref("watchedfolder");

			if(watchedfolder !== ""){

				var file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(watchedfolder);

				if(file.exists() && file.isDirectory()){

					file.append(aFile);

					//download manager
					var dm = Components.classes["@mozilla.org/download-manager;1"].createInstance(Components.interfaces.nsIDownloadManager);

					// Create URI from which we want to download file
					var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
					var uri1 = ios.newURI(aSource, null, null);
					var uri2 = ios.newFileURI(file);

					//Download observer
					var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
					var pers = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(nsIWBP);
					pers.persistFlags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
					nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
					nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

					//Start download
					var dl = dm.addDownload(dm.DOWNLOAD_TYPE_DOWNLOAD, uri1, uri2,
							"", null, Math.round(Date.now() * 1000),
							null, pers);
					pers.progressListener = dl.QueryInterface(Components.interfaces.nsIWebProgressListener);
					pers.saveURI(dl.source, null, null, null, null, dl.targetFile);

					if(aMethod === "verbose"){
						//Show download manager
						var dm_ui = Components.classes["@mozilla.org/download-manager-ui;1"].createInstance(Components.interfaces.nsIDownloadManagerUI);
						dm_ui.show(window, dl.id, Components.interfaces.nsIDownloadManagerUI.REASON_NEW_DOWNLOAD);
					}
				}

			}
		}
};