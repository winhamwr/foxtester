//declare oserver
const FoxTesterWatchedFolderObserver =
{
		observe: function(subject, topic, prefName)
		{
			//check if preference changed
			if (topic == "nsPref:changed" && prefName == "extensions.foxtester.watchedfolder")
			{

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
		}
};

var foxtesterObserver = {//observer registring functions

		registerObserver: function(aEvent) {//register and unregister observer

			//declare observer type
			var FoxTesterWatchedFolderPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranchInternal);

			if (aEvent == "register"){//register observer
				FoxTesterWatchedFolderPrefService.addObserver("extensions.foxtester.watchedfolder", FoxTesterWatchedFolderObserver, false);
			}

			if (aEvent == "unregister"){//unregister observer
				FoxTesterWatchedFolderPrefService.removeObserver("extensions.foxtester.watchedfolder", FoxTesterWatchedFolderObserver);
			}
		}
};
window.addEventListener("load",function(){ foxtesterObserver.registerObserver('register'); },false);//launch observer register
window.addEventListener("unload",function(){ foxtesterObserver.registerObserver('unregister'); },false);//launch observer unregister