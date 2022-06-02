const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require('fs');

fetch('https://share.traffy.in.th/js/map_chadchart.js')
    .then(res => res.text())
    .then(text => {
        //change in text from img/ to https://share.traffy.in.th/img/
        text = text.replace(/img\//g, 'https://share.traffy.in.th/img/');
        fs.writeFileSync('map_chadchart.js', text);
    })

fetch('https://share.traffy.in.th/css/style_chadchart.css')
.then(res => res.text())
    .then(text => {
        //change in text from ../fonts/ to https://share.traffy.in.th/fonts/
        text = text.replace(/\.\.\/fonts\//g, 'https://share.traffy.in.th/fonts/');
        fs.writeFileSync('style_chadchart.css', text);
    })