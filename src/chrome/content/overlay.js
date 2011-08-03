/* -*- Mode: js2; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

Components.utils.import("resource://moztray/commons.js");
Components.utils.import("resource://moztray/LibGtkStatusIcon.js");

const MOZT_ICON_DIR = "chrome/skin/";
const MOZT_ICON_SUFFIX = "32.png";

mozt.Main = {

  onLoad: function() {
    // initialization code
    this.initialized = null;
    this.strings = document.getElementById("moztray-strings");

    try {
      // Set up preference change observer
      mozt.Utils.prefService.QueryInterface(Ci.nsIPrefBranch2);
      mozt.Utils.prefService.addObserver("", this, false);
    }
    catch (ex) {
      Components.utils.reportError(ex);
      return false;
    }

    LibGtkStatusIcon.init();
    this.tray_icon  = LibGtkStatusIcon.gtk_status_icon_new();
    var mozApp = mozt.Utils.appInfoService.name;
    var icon_filename = MOZT_ICON_DIR + mozApp.toLowerCase() + MOZT_ICON_SUFFIX;
    LibGtkStatusIcon.gtk_status_icon_set_from_file(this.tray_icon,
                                                   icon_filename);
    // TODO: produces:
    // (firefox-bin:5302): Gdk-CRITICAL **: IA__gdk_window_get_root_coords: assertion `GDK_IS_WINDOW (window)' failed
    // (thunderbird-bin:5380): Gdk-CRITICAL **: IA__gdk_window_get_root_coords: assertion `GDK_IS_WINDOW (window)' failed
    LibGtkStatusIcon.gtk_status_icon_set_tooltip_text(this.tray_icon,
                                                      mozApp);

    mozt.Debug.dump('Moztray LOADED !');
    this.initialized = true;
    return true;
  },

  onQuit: function() {
    // Remove observer
    mozt.Utils.prefService.removeObserver("", this);
    LibGtkStatusIcon.shutdown();

    mozt.Debug.dump('Moztray UNLOADED !');
    this.initialized = false;
  },

  observe: function(subject, topic, data) {
    // Observer for pref changes
    if (topic != "nsPref:changed") return;
    mozt.Debug.dump('Pref changed: '+data);

    switch(data) {
    // case 'enabled':
    //   var enable = mozt.Utils.prefService.getBoolPref('enabled');
    //   this._toggle(enable);
    //   break;
    }
  },

};


// should be sufficient for a delayed Startup (no need for window.setTimeout())
// https://developer.mozilla.org/en/Extensions/Performance_best_practices_in_extensions
// https://developer.mozilla.org/en/XUL_School/JavaScript_Object_Management.html
window.addEventListener("load", function (e) { mozt.Main.onLoad(); }, false);
window.addEventListener("unload", function(e) { mozt.Main.onQuit(); }, false);
