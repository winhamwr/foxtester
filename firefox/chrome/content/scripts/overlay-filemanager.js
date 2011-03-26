var foxtesterFileManager = {

		openLink:function(aSite) {

			if(aSite == "mozillaftp"){
				var url = "ftp://ftp.mozilla.org/pub/mozilla.org/firefox/";
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

			var file = Components.classes["@mozilla.org/file/local;1"]
			.createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(watchedfolder);
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
};