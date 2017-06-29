exports.seed = function(knex, Promise) {
  return knex("pictures").then(function() {
    return knex("pictures")
      .insert([
        {
          picture_id: 1,
          url: "https://farm1.staticflickr.com/2/1418878_1e92283336_m.jpg",
          lat: "54.627389",
          lon: "-122.500307"
        },
        {
          picture_id: 2,
          url: "https://farm1.staticflickr.com/2/9998878_4m62283336_l.jpg",
          lat: "44.600389",
          lon: "-122.726307"
        },
        {
          picture_id: 3,
          url: "https://farm1.staticflickr.com/2/1418111_0a92445936_k.jpg",
          lat: "51.627900",
          lon: "-122.444307"
        },
        {
          picture_id: 4,
          url: "https://farm1.staticflickr.com/2/3788878_2f56283336_m.jpg",
          lat: "56.627389",
          lon: "-122.726777"
        }
      ])
      .then(() => {
        return knex.raw(
          "SELECT setval('pictures_picture_id_seq', (SELECT MAX(picture_id) FROM pictures));"
        );
      });
  });
};
