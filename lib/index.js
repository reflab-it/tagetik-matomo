function _log(data) {
  console.log("Tagetik Matomo");
  if (typeof data === "object") {
    console.table(data);
  } else {
    console.log(data);
  }
}

class TagetikMatomo {
  constructor(tracking_id, username, profile, role, should_track = true) {
    this.tracking_id = tracking_id;
    this.username = username;
    this.profile = profile;
    this.role = role;
    this._should_track = should_track;
    this._should_log = false;
    this.init();
    this.inject();
  }
  init() {
    let _paq = (window._paq = window._paq || []);
    // Matomo
    const u = "https://tagetik.matomo.cloud/";
    _paq.push(["addTracker", u + "matomo.php", this.tracking_id]);
    _paq.push(["setCustomDimension", 1, this.profile]);
    _paq.push(["setCustomDimension", 2, this.role]);
    this.log("Loaded Matomo with data:");
    this.log({
      "Tracking ID": this.tracking_id,
      "User role": this.role,
      "User profile": this.profile,
    });
  }
  inject() {
    var _paq = window._paq = window._paq || [];
    (function() {
      var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
      g.async=true; g.src='//cdn.matomo.cloud/tagetik.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
    })();
  }
  log(obj) {
    if (this._should_log) _log(obj);
  }
  enable_log() {
    this._should_log = true;
  }
  disable_log() {
    this._should_log = false;
  }
  should_track() {
    return this._should_track;
  }
  track_pageview(location, title) {
    let _location = null;
    try {
      const url = new URL(location);
      _location = `${url.pathname}`;
    } catch (error) {
      this.log(error);
      this.log("maybe relative?");
      _location = location.replace("?ajax_load=1", "");
      this.log("location is " + _location);
    }

    // Matomo requires to set first the custom url and title and then
    // track the page view; the url must contain the domain also
    this._track_on_matomo(["setDocumentTitle", title]);
    this._track_on_matomo([
      "setCustomUrl",
      document.location.origin + location,
    ]);
    this._track_on_matomo(["trackPageView"]);
  }
  _track_on_matomo(data) {
    let _paq = (window._paq = window._paq || []);
    if (!this.should_track()) {
      return;
    }

    if (this.username === null) this.username = "anonymous";
    // According to documentation:
    // You must then pass this User ID string to Matomo via the setUserId
    // method call just before calling any of the track*
    if (data[0].startsWith("track") && this.username != "anonymous") {
      _paq.push(["setUserId", this.username]);
    }
    _paq.push(data);
    if (this.username == "anonymous") {
      _paq.push(["appendToTrackingUrl", ""]);
    }
    this.log("Triggered on MATOMO: with data:");
    this.log(data);
  }
}

module.exports = TagetikMatomo;
