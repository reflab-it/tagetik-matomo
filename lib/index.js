function _log(data) {
  if (data === null) console.log("null data");
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
    this.inject();
  }

  isAbsoluteUrl(url) {
    // Verifica se l'URL inizia con uno schema come "http://", "https://", "ftp://", ecc.,
    // o se inizia con "//" (protocol-relative URL).
    return /^(?:[a-z]+:)?\/\//i.test(url);
  }

  init() {
    console.log("INIT matomo tgt");
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
    const scriptUrl = "//cdn.matomo.cloud/tagetik.matomo.cloud/matomo.js";

    // Controlla se uno script con lo stesso src è già stato inserito
    const existingScripts = document.querySelectorAll(
      `script[src="${scriptUrl}"]`
    );
    if (existingScripts.length > 0) {
      console.log("Matomo script is already injected.");
      return;
    }

    // Se lo script non è presente, procedi con l'iniezione
    const script = document.createElement("script");
    script.async = true;
    script.src = scriptUrl;
    document
      .getElementsByTagName("script")[0]
      .parentNode.insertBefore(
        script,
        document.getElementsByTagName("script")[0]
      );

    console.log("Matomo script injected successfully.");
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
    let _location = this.isAbsoluteUrl(location)
      ? location
      : `${document.location.origin}${
          location.startsWith("/") ? "" : "/"
        }${location.replace("?ajax_load=1", "")}`;

    this.log(`Processing pageview for: ${_location}`);
    this._track_on_matomo(["setDocumentTitle", title]);
    this._track_on_matomo(["setCustomUrl", _location]);
    this._track_on_matomo(["trackPageView"]);
  }

  _track_on_matomo(_data) {
    const data = _data;
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
    _paq.push(JSON.parse(JSON.stringify(data)));
    if (this.username == "anonymous") {
      _paq.push(["appendToTrackingUrl", ""]);
    }
    this.log("Triggered on MATOMO: with data:");
    this.log(JSON.parse(JSON.stringify(data)));
  }
}

module.exports = TagetikMatomo;
