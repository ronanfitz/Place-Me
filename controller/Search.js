var rp = require("request-promise");

// const SECRET = process.env.FLICKR_API_SECRET;

class SearchController {
  constructor() {
    this.API_KEY = process.env.FLICKR_API_KEY;
    this.radius = 2; // 2km radius from coordinates
    this.accuracy = 11; // "city level"
    this.imageSort = "interestingness-desc"; // deafults to date-posted-desc
    this.imagesLoaded = 5; // 25 // defaults to 100 (max is 500)
    this.format = "json";
    this.imageSize = "c"; // 'c' is medium 800, 800 on longest side
  }

  getPictureData(lat, lon) {
    const SEARCH = `https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=${this
      .API_KEY}&safe_search=1&has_geo=true&lat=${lat}&lon=${lon}&radius=${this
      .radius}&accuracy=${this.accuracy}&sort=${this.imageSort}&per_page=${this
      .imagesLoaded}&format=${this.format}&nojsoncallback=1`;

    return rp(SEARCH).then(data => {
      let parsed = JSON.parse(data);
      let arrayOfPictureDataObjects = parsed.photos.photo;
      return arrayOfPictureDataObjects;
    });
  }

  generateObjects(picArray, lat, lon) {
    let justTheEssentials = picArray.map(pic => {
      let essentials = {};
      essentials[
        "url"
      ] = `https://farm${pic.farm}.staticflickr.com/${pic.server}/${pic.id}_${pic.secret}_${this
        .imageSize}.jpg`;
      essentials["lat"] = lat;
      essentials["lon"] = lon;

      return essentials;
    });
    return justTheEssentials;
  }

  // getInfo(pic) {
  //   const INFO = `https://api.flickr.com/services/rest/?method=flickr.photos.getInfo&api_key=0bf0839ee1fe6ee109720782d7ec8a63&photo_id=${pic.id}&format=json&nojsoncallback=1`;
  //
  //   return rp(INFO)
  //     .then(data => {
  //       let parsed = JSON.parse(data);
  //       return parsed;
  //     })
  //     .catch(apiErr => {
  //       console.log("INFO CALL FAILED", apiErr);
  //       return;
  //     });
  // }
}

module.exports = SearchController;
