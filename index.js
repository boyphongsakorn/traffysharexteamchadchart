const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

/*fetch('https://share.traffy.in.th/js/map_chadchart.js')
    .then(res => res.text())
    .then(text => {
        //change in text from img/ to https://share.traffy.in.th/img/
        text = text.replace(/img\//g, 'https://anywhere.pwisetthon.com/https://share.traffy.in.th/img/');
        fs.writeFileSync('map_chadchart.js', text);
    })

fetch('https://share.traffy.in.th/css/style_chadchart.css')
.then(res => res.text())
    .then(text => {
        //change in text from ../fonts/ to https://share.traffy.in.th/fonts/
        text = text.replace(/\.\.\/fonts\//g, 'https://anywhere.pwisetthon.com/https://share.traffy.in.th/fonts/');
        fs.writeFileSync('style_chadchart.css', text);
    })*/

fetch('https://publicapi.traffy.in.th/share/teamchadchart/geojson')
    .then(res => res.json())
    .then(json => {
        //remove duplicate json in json.features
        const unique = (value, index, self) => self.indexOf(value) === index;
        json.features = json.features.filter(unique);
        fs.writeFileSync('geojson.json', JSON.stringify(json));
    })

fetch('https://publicapi.traffy.in.th/share/teamchadchart/geojson?state_type=finish')
    .then(res => res.json())
    .then(json => {
        //remove duplicate json in json.features
        const unique = (value, index, self) => self.indexOf(value) === index;
        json.features = json.features.filter(unique);
        fs.writeFileSync('geojson_complete.json', JSON.stringify(json));
    })

fetch('https://publicapi.traffy.in.th/share/teamchadchart/geojson?state_type=start')
    .then(res => res.json())
    .then(json => {
        //remove duplicate json in json.features
        const unique = (value, index, self) => self.indexOf(value) === index;
        json.features = json.features.filter(unique);
        fs.writeFileSync('geojson_wait.json', JSON.stringify(json));
    })

fetch('https://publicapi.traffy.in.th/share/teamchadchart/geojson?state_type=inprogress')
    .then(res => res.json())
    .then(json => {
        //remove duplicate json in json.features
        const unique = (value, index, self) => self.indexOf(value) === index;
        json.features = json.features.filter(unique);
        fs.writeFileSync('geojson_send.json', JSON.stringify(json));
    })
