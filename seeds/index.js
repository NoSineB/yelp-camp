const mongoose = require("mongoose");
const cities = require("./cities");
const {places, descriptors} = require("./seedHelpers");
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapBoxToken = 'pk.eyJ1IjoiYmVuLWlzb24iLCJhIjoiY2x0bjNzb3poMDM0YzJqcDh6bHQ1NDcyaiJ9.dYQpbncBW6rLjVM51EG5Sg';

const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error:"));
db.once("open", () => {
    console.log("Database Connected");
})

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<25; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '65ccb3ca817e8cf05b28b2a4',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/dtflcs1ha/image/upload/f_auto,q_auto/v1/samples/landscapes/nature-mountains',
                    filename: 'None'
                },
                {
                    url: 'https://res.cloudinary.com/dtflcs1ha/image/upload/f_auto,q_auto/v1/samples/landscapes/girl-urban-view',
                    filename: 'None'

                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur, adipisicing elit. Maxime voluptatem a libero ex obcaecati dolores optio quasi sit tempore quaerat voluptatum blanditiis labore quas, quae, nihil, pariatur illo itaque earum.',
            price
        })
        const geoData = await geocoder.forwardGeocode({
            query: camp.location,
            limit: 1
        }).send()
        camp.geometry = geoData.body.features[0].geometry;
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});