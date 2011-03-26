var foxtesterOptions = {

		openFile : function(aText) {//select terminal emulator executable and add path to preference

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

			//open file picker
			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fp = Components.classes["@mozilla.org/filepicker;1"]
			.createInstance(nsIFilePicker);
			fp.init(window, aText, nsIFilePicker.modeOpen);
			var rv = fp.show();
			if (rv == nsIFilePicker.returnOK) {
				var file = fp.file;
				//add path to terminal preference
				this.prefs.setCharPref("terminal", file.path);
			}
		},//end of function

		openFolder : function(aText, aPreference) {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.foxtester.");

			//get watchedfolder path from preferences
			var watchedfolder = this.prefs.getCharPref("watchedfolder");

			if (watchedfolder !== "" && aPreference !== "pluginfolder"){//alert user if watchedfolder is to be changed from previous user configuration and launch folder picker

				//fetch message from strbundle
				var strbundle = document.getElementById("foxtesterstrings");
				var message = strbundle.getString("watchedfolderalert");
				var messagetitle = strbundle.getString("foxtesteralert");
				//prompt user for confirmation
				var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
				var result = prompts.confirm(window, messagetitle, message);

				if(result == true){//launch the folder picker if the user confirms

					//launch the folder picker
					var nsIFilePicker = Components.interfaces.nsIFilePicker;
					var fp = Components.classes["@mozilla.org/filepicker;1"]
					.createInstance(nsIFilePicker);
					fp.init(window, aText, nsIFilePicker.modeGetFolder);
					var rv = fp.show();
					if (rv == nsIFilePicker.returnOK) {
						var file = fp.file;
						//set the new folder path preference
						this.prefs.setCharPref(aPreference, file.path);
					}
				}
			}

			if (watchedfolder == "" || aPreference == "pluginfolder"){//launch watchedfolder picker for the first time or pluginfolder picker

				//launch the folder picker
				var nsIFilePicker = Components.interfaces.nsIFilePicker;
				var fp = Components.classes["@mozilla.org/filepicker;1"]
				.createInstance(nsIFilePicker);
				fp.init(window, aText, nsIFilePicker.modeGetFolder);
				var rv = fp.show();
				if (rv == nsIFilePicker.returnOK) {
					var file = fp.file;
					//set the new folder path preference
					this.prefs.setCharPref(aPreference, file.path);
				}
			}
		}
};