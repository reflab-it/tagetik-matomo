let tagetik_matomo = {};

function _log(data)
{
    if (typeof (data) === "object")
    {
        console.table(data);
    } else
    {
        console.log(data);
    }
};


tagetik_matomo.init = function (matomo_tracking_id, username = null, should_track = true)
{
    tagetik_matomo.username = username !== null ? username : null;
    tagetik_matomo.username = null;
    tagetik_matomo.should_track = should_track;
    var _paq = window._paq = window._paq || [];

    // Matomo
    var u = "https://tagetik.matomo.cloud/";
    _paq.push(['addTracker', u + 'matomo.php', matomo_tracking_id]);
    _paq.push(['setCustomDimension', 1, this_user_profile]);
    _paq.push(['setCustomDimension', 2, this_user_role]);
    _log('Loaded Matomo with data:')
    _log({
        'Tracking ID': matomo_tracking_id,
        'User role': this_user_role,
        'User profile': this_user_profile
    })
};


tagetik_matomo.should_track = function ()
{
    if (tagetik_matomo.should_track) return true;
    return false;
};

tagetik_matomo.track_pageview = function(location, title)
{
    let _location = null;
    try
    {
        const url = new URL(location);
        _location = `${url.pathname}`
    } catch (error)
    {
        _log(error);
        _location = location.replace('?ajax_load=1', '');
    }

    // Matomo requires to set first the custom url and title and then
    // track the page view; the url must contain the domain also
    tagetik_matomo._track_on_matomo(['setDocumentTitle', title])
    tagetik_matomo._track_on_matomo(['setCustomUrl', document.location.origin + location])
    tagetik_matomo._track_on_matomo(['trackPageView'])
};

tagetik_matomo._track_on_matomo = function (data)
{
    var _paq = window._paq = window._paq || [];
    if (!tagetik_matomo.should_track()) { return }

    this_user_name = tagetik_matomo.username;
    if (this_user_name === null) this_user_name = 'anonymous';
    // According to documentation:
    // You must then pass this User ID string to Matomo via the setUserId
    // method call just before calling any of the track*
    if (data[0].startsWith("track") && this_user_name != "anonymous")
    {
        _paq.push(['setUserId', this_user_name]);
    }
    _paq.push(data);
    if (this_user_name == "anonymous")
    {
        _paq.push(['appendToTrackingUrl', '']);
    }
    _log("Triggered on MATOMO: with data:")
    _log(data)
};

module.exports = tagetik_matomo;