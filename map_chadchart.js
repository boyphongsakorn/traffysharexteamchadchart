//API DOC: https://www.traffy.in.th/?page_id=4434#traffyshare-api-document
const base_url_api = "https://publicapi.traffy.in.th/share/teamchadchart"

const url_traffy_share_info = "https://www.traffy.in.th/?page_id=4434"

const url_traffy_share_api_doc = `${url_traffy_share_info}#traffyshare-api-document`

const url_reverse_geo = 'https://kong.traffy.in.th/fondue-reverse-geo'

let markers = []
let markerClusterer = null
let mapType = "marker"
let filterDistrict = null
let filterSubDistrict = null
let filterStartDate = null
let filterEndDate = null
let filterState = null

if (window.location.hostname != 'localhost') {
    if (location.protocol !== 'https:') {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
}



function initMap() {

    dayjs.extend(window.dayjs_plugin_customParseFormat)
    dayjs.extend(window.dayjs_plugin_buddhistEra)

    // https://trello.com/c/7o7u6an8
    // if (isDesktopDevice()) {
    document.getElementById('offcanvasScrolling').classList.toggle('show');
    // }


    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: { lat: 14.0772181, lng: 100.5976256 },
        mapTypeControl: false,
    });

    heatmap = new google.maps.visualization.HeatmapLayer({
        map: map,
        radius: 21,
        opacity: 1,
    });

    // var infowindowMarker = new google.maps.InfoWindow();
    // let infowindow = new google.maps.InfoWindow();


    //current location
    // if (navigator.geolocation) {
    //     navigator.geolocation.getCurrentPosition(function (position) {
    //         initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    //         map.setCenter(initialLocation);
    //         map.setZoom(15)

    //         //infowindowMarker.setPosition(initialLocation);
    //         //infowindowMarker.setContent("ตำแหน่งของคุณ");
    //         //infowindowMarker.open(map);
    //         var infowindow = new google.maps.InfoWindow();
    //         var userMarker = new google.maps.Marker({
    //             position: initialLocation,
    //             map: map,
    //             icon: 'https://share.traffy.in.th/img/current_location_icon.png',
    //             zIndex: 9999999
    //         });
    //         google.maps.event.addListener(userMarker, 'click', function() {
    //             infowindow.setContent("ตำแหน่งของคุณ");
    //             infowindow.open(map, this);
    //         });
    //     });
    // }
    //End current location


    searchPost()
    // topProblemtype()
    allProblemtype()
    getAllDistrict()
    getStatState()
    getCategoryStat()
    getSubDistrictStat()

}

function reportWindowSize() {
    //get height of window
    var windowHeight = $(window).height();
    //get height from navber
    let navbarHeight = $('#navbar').height();
    //height of map = height - navbar
    let mapHeight = windowHeight - navbarHeight;
    $('#map').css('height', mapHeight);
}

window.addEventListener('resize', reportWindowSize);

jQuery(document).ready(function ($) {
    //get height of window
    var windowHeight = $(window).height();
    //get height from navber
    let navbarHeight = $('#navbar').height();
    //height of map = height - navbar
    let mapHeight = windowHeight - navbarHeight;
    $('#map').css('height', mapHeight);
    //document.getElementById('map').style.setProperty('height', mapHeight + 'px', "important");

    $('#rangeDatepicker').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear'
        },
        drops: 'up'
    });

    $('#rangeDatepicker').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));

        filterStartDate = picker.startDate.format('YYYY-MM-DD')
        filterEndDate = picker.endDate.format('YYYY-MM-DD')

        searchPost()
    });

    $('#rangeDatepicker').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        filterStartDate = null
        filterEndDate = null
        console.log("clear")

        searchPost()
    });

    const myOffcanvas = document.getElementById('offcanvasScrolling');
    myOffcanvas.addEventListener('show.bs.offcanvas', event => {
        //alert('show');
        //get myOffcanvas width
        var myOffcanvasWidth = $(myOffcanvas).width();
        anime({
            targets: '#map',
            duration: 500,
            translateX: myOffcanvasWidth,
            easing: 'easeInOutExpo',
            complete: function(anim) {
                //set left of navbar and map to myOffcanvasWidth
                //$('#navbar').css('left', myOffcanvasWidth);
                //$('#map').css('left', myOffcanvasWidth);
            }
        })
        anime({
            targets: '#navbar',
            duration: 500,
            translateX: myOffcanvasWidth,
            easing: 'easeInOutExpo',
            complete: function(anim) {
                //set left of navbar and map to myOffcanvasWidth
                //$('#navbar').css('left', myOffcanvasWidth);
                //$('#map').css('left', myOffcanvasWidth);
            }
        })
        document.getElementById('map').setAttribute('style', 'top: 55px !important; overflow: hidden;width: calc(100% - ' + myOffcanvasWidth + 'px)');
        //set width of map to Width of map - myOffcanvasWidth
        //set width of navbar to Width of navbar - myOffcanvasWidth
        $('#navbar').css('width', 'calc(100% - ' + myOffcanvasWidth + 'px)');
    })

    myOffcanvas.addEventListener('hide.bs.offcanvas', event => {
        //alert('hidden');
        //reset left of navbar and map to 0
        anime({
            targets: '#map',
            duration: 500,
            translateX: 0,
            easing: 'easeInOutExpo',
            complete: function(anim) {
                //set left of navbar and map to myOffcanvasWidth
                //$('#navbar').css('left', myOffcanvasWidth);
                //$('#map').css('left', myOffcanvasWidth);
            }
        })
        anime({
            targets: '#navbar',
            duration: 500,
            translateX: 0,
            easing: 'easeInOutExpo',
            complete: function(anim) {
                //set left of navbar and map to myOffcanvasWidth
                //$('#navbar').css('left', myOffcanvasWidth);
                //$('#map').css('left', myOffcanvasWidth);
            }
        })
        //reset width of navbar and map to 100%
        $('#map').css('width', '100%');
        $('#navbar').css('width', '100%');
    })
});


async function searchPost(trendProblemtype = undefined) {

    let url_geojson_hashtag = `${base_url_api}/geojson`
    let csv_url_dowload = `${base_url_api}/download`
    let url_api_json = `${base_url_api}/search`

    // console.log(trendProblemtype, "---")
    if (trendProblemtype == undefined) {
        var text_search = document.getElementById("input_search_text").value.trim();
        // console.log("else searchbox")
    } else {
        var text_search = trendProblemtype.trim()
        // console.log("else trendProblemtype")
    }

    if (text_search == "" && filterDistrict == null && filterSubDistrict == null && filterStartDate == null && filterEndDate == null && filterState == null) {
        url_geojson_hashtag = 'https://raw.githubusercontent.com/boyphongsakorn/traffysharexteamchadchart/main/geojson.json'
    }

    if (text_search != "ประเภท:ทั้งหมด") {
        if (text_search != "") {
            var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
            url_geojson_hashtag = `${url_geojson_hashtag}?text=${text_search}`
            csv_url_dowload = `${csv_url_dowload}?text=${text_search}`
            url_api_json = `${url_api_json}?text=${text_search}`
        }
    }

    if (filterDistrict != null) {
        var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
        //url_geojson_hashtag =  `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}district=${filterDistrict}`
        url_geojson_hashtag = url_geojson_hashtag + _parameter_url_style + "district=" + filterDistrict
        csv_url_dowload = `${csv_url_dowload}${_parameter_url_style}district=${filterDistrict}`
        url_api_json = `${url_api_json}${_parameter_url_style}district=${filterDistrict}`

    }

    if (filterSubDistrict != null) {
        var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
        //url_geojson_hashtag =  `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}subdistrict=${filterSubDistrict}`
        url_geojson_hashtag = url_geojson_hashtag + _parameter_url_style + "subdistrict=" + filterSubDistrict
        csv_url_dowload = `${csv_url_dowload}${_parameter_url_style}subdistrict=${filterSubDistrict}`
        url_api_json = `${url_api_json}${_parameter_url_style}subdistrict=${filterSubDistrict}`
    }

    /*if (filterEndDate != null) {
        console.log('1')
        var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
        url_geojson_hashtag =  `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        csv_url_dowload = `${csv_url_dowload}${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        url_api_json = `${url_api_json}${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        // console.log(`start=${filterStartDate}&end=${filterEndDate}`)
    }*/
    // TODO: comment 

    if (filterStartDate != null && filterEndDate != null) {
        console.log('2')
        var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
        //if(_parameter_url_style == '&'){
        url_geojson_hashtag = url_geojson_hashtag + `${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        //}else{
        //    url_geojson_hashtag = `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        //}
        if (filterState != null) {
            url_geojson_hashtag = url_geojson_hashtag + `&state=${filterState}`
        }/*else{
            url_geojson_hashtag =  `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        }*/
        csv_url_dowload = `${csv_url_dowload}${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        if (filterState != null) {
            csv_url_dowload = csv_url_dowload + `&state=${filterState}`
        }
        url_api_json = `${url_api_json}${_parameter_url_style}start=${filterStartDate}&end=${filterEndDate}`
        if (filterState != null) {
            url_api_json = url_api_json + `&state=${filterState}`
        }
        // console.log(`start=${filterStartDate}&end=${filterEndDate}`)
    }

    if (filterState != null) {
        var _parameter_url_style = url_geojson_hashtag.includes("?") ? '&' : '?';
        //url_geojson_hashtag =  `${url_geojson_hashtag}${_parameter_url_style}state=${filterState}`
        if (_parameter_url_style == '?') {
            if (filterState == "เสร็จสิ้น") {
                url_geojson_hashtag = `https://raw.githubusercontent.com/boyphongsakorn/traffysharexteamchadchart/main/geojson_complete.json`
            } else if (filterState == "รอรับเรื่อง") {
                url_geojson_hashtag = `https://raw.githubusercontent.com/boyphongsakorn/traffysharexteamchadchart/main/geojson_wait.json`
            } else if (filterState == "ส่งเรื่องแล้ว") {
                url_geojson_hashtag = `https://raw.githubusercontent.com/boyphongsakorn/traffysharexteamchadchart/main/geojson_send.json`
            }
        } else {
            /*if(_parameter_url_style == "?"){
                url_geojson_hashtag = `https://publicapi.traffy.in.th/share/teamchadchart/geojson${_parameter_url_style}state=${filterState}`
            }else{*/
            url_geojson_hashtag = `${url_geojson_hashtag}${_parameter_url_style}state=${filterState}`
            //}
            /*if(filterDistrict != null){
                url_geojson_hashtag = url_geojson_hashtag+`&district=${filterDistrict}`
            }
            if(filterSubDistrict != null){
                url_geojson_hashtag = url_geojson_hashtag+`&subdistrict=${filterSubDistrict}`
            }*/
        }
        csv_url_dowload = `${csv_url_dowload}${_parameter_url_style}state=${filterState}`
        url_api_json = `${url_api_json}${_parameter_url_style}state=${filterState}`
    }

    // console.log(filterDistrict, filterSubDistrict , "---")


    let responseAPI = await axios({
        method: 'get',
        url: url_geojson_hashtag,
    })


    var dataResultesFeatures = await responseAPI.data.features


    if (mapType == "marker" || mapType == "clustering") {
        // console.log("marker")
        setMarkerMap(dataResultesFeatures)
    } else if (mapType == "heatmap") {
        // console.log("heatmap")
        setHeatMap(dataResultesFeatures)
    }


    //ใส่ data เข้าตารางแสดงการค้นหา    
    let text_results_search = `ผลลัพธ์ ${responseAPI.data.total} รายการ  <a href="${csv_url_dowload}" class="badge rounded-pill" style="background-color: #201c51;">csv</a>`
        + ` <a href="${url_api_json}" class="badge rounded-pill" style="background-color: #201c51;" target="_blank">json</a>`
        + ` <a href="${url_traffy_share_api_doc}" target="_blank"> <img src="https://share.traffy.in.th/img/info-circle.svg" alt=""></a>`


    // <p><a href="#" class="badge bg-primary">csv</a> <a href="#" class="badge bg-primary">json</a> </p>

    textTrTable = ''
    var latlngbounds = new google.maps.LatLngBounds();

    let count_tr = 0
    dataResultesFeatures.forEach(function (v, index) {
        var data = v.properties
        latlngbounds.extend(new google.maps.LatLng(v.geometry.coordinates[1], v.geometry.coordinates[0]));


        // textTrTable = textTrTable + `<tr onclick="document.querySelector('.btn-close.text-reset').click(); clickTrListData(this, '${v.geometry.coordinates}')">
        //     <td><img src="${data.photo_url}" alt="" width="50"/></td>
        //     <td><div style="font-weight: bold; display: inline;">จุดเสี่ยง${data.type}: </div>${data.description}<br/>
        //     <div style="font-weight: bold; display: inline;">เมื่อ: </div>${converFormatTimestamp(data.timestamp)}<br/>
        //     <div style="font-weight: bold; display: inline;">ตำแหน่ง: </div>${data.address}<br/></td>
        //     </tr>`
        // })

        let txt_description = data.description
        let count_char_description = txt_description.length
        if (count_char_description > 200) {
            txt_description = txt_description.slice(0, 199) + `<div style="font-weight: bold; display: inline; font-size: 14px;" class="text-style">... อ่านเพิ่มเติม</div>`
        }

        var path_icon_info_type = getSrcIconInfoProblemType(data.type)

        let click_tr_hide_offcanvas = "document.querySelector('.btn-close.text-reset').click();"
        if (isDesktopDevice()) {
            click_tr_hide_offcanvas = ""
        }

        let photo_url = getURLimageThumbnail(data.photo_url).thumbnail

        txt_description = txt_description.replace("://", ":// ");

        let badge_state = styleBadge(data.state)

        if (count_tr < 50) {
            textTrTable = textTrTable + `<tr onclick="${click_tr_hide_offcanvas} clickTrListData(this, '${v.geometry.coordinates}')">
            <td><img src="${photo_url}" alt="" width="100%" class="rounded mx-auto d-block"/></td>
            <td><div style="font-weight: bold; display: inline; font-size: 18px;" class="text-style">จุดเสี่ยง: ${data.type} <img src="${path_icon_info_type}" class="float-end" width="22"> ${badge_state}</div>
            <br><div style="font-size: 14px;" class="text-style dont-break-out">${txt_description}</div>
            <div style="font-weight: bold; display: inline; font-size: 16px;" class="text-style">เมื่อ: ${converFormatTimestamp(data.timestamp)}</div><br/>
            <div style="font-weight: bold; font-size: 14px;" class="text-style">${data.address}<br/></div></td>
            </tr>`
        }
        count_tr += 1

    })// end 

    document.getElementById('count-results-search').innerHTML = text_results_search
    document.getElementById('tr-results-search').innerHTML = textTrTable

    if (markers.length != 0) {
        map.setCenter(latlngbounds.getCenter());
        map.fitBounds(latlngbounds);
        // map.setZoom(12)
    }

} // End of search


function setMarkerMap(dataResultesFeatures) {
    // clear markers
    clearMarkerMap()

    markers = []
    //end clear markers

    var marker, i;

    infowindow = new google.maps.InfoWindow();
    dataResultesFeatures.forEach(function (v, index) {

        var data = v.properties

        var path_icon_marker = getSrcIconMarkerProblemType(data.type)


        var icon = {
            url: path_icon_marker, // url
            scaledSize: new google.maps.Size(28, 40), // scaled size
            origin: new google.maps.Point(0, 0), // origin
            anchor: new google.maps.Point(0, 0) // anchor
        };

        marker = new google.maps.Marker({
            position: new google.maps.LatLng(v.geometry.coordinates[1], v.geometry.coordinates[0]),
            map: map,
            icon: icon,
        });

        markers.push(marker);

        google.maps.event.addListener(marker, 'click', (function (marker, i) {
            return function () {
                if (infowindow) {
                    infowindow.close();
                }

                var info_content = infoWindowContent(data)

                infowindow.setContent(info_content);

                infowindow.setOptions({ pixelOffset: new google.maps.Size(0, -30) });
                infowindow.open(map, marker);
            }
        })(marker, i));


    })

    if (mapType == "clustering") {
        markerClusterer = new MarkerClusterer(map, markers, {
            imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
        });
    }

}// end setMarkerMap

function setHeatMap(dataResultesFeatures) {
    // clear markers
    clearMarkerMap()

    let dataHeatMap = []
    dataResultesFeatures.forEach(function (v, index) {
        dataHeatMap.push(new google.maps.LatLng(v.geometry.coordinates[1], v.geometry.coordinates[0]))
    })

    let pointHeatMap = new google.maps.MVCArray(dataHeatMap);
    heatmap.setData(pointHeatMap)
}

function clickMarkerModal(i, data) {
    var myModal = new bootstrap.Modal(document.getElementById("infoModal"), {});
    document.getElementById("infoModalLabel").innerHTML = data.description
    document.getElementById("modal-body-img").innerHTML = `<img src="${data.photo_url}" alt='photo' width='250'></img>`
    myModal.show();
}

async function topProblemtype(event) {
    let url_hashtag_trend = `${base_url_api}/trend`
    let responseAPI = await axios({
        method: 'get',
        url: url_hashtag_trend,
    })

    text = ''
    responseAPI.data.results.forEach(function (v, index) {
        text = text + `<a href="#" class="badge rounded-pill" style="background-color: #f15928;" onclick="clickHashtagBadge(this)" id="span-hashtag-trend-${index}">${v.problemtype_name}</a> `
    });
    document.getElementById('divTopproblemtype').innerHTML = text
    // hashtagTrend = responseAPI.data.results
}

// async function allProblemtype(event) {
//     let url_hashtag_trend = `${base_url_api}/trend-all`
//     let responseAPI =  await axios({
//         method: 'get',
//         url:  url_hashtag_trend,
//     })

//     text = ''
//     responseAPI.data.results.forEach(function(v , index) {
//         // container.append('<div>' + count + '</div>');
//         var prbt_color = getColorProblemType(v.problemtype_name)
//         text = text + `<a href="#" class="badge rounded-pill" style="background-color: ${prbt_color};" onclick="clickHashtagBadge(this)" id="span-hashtag-trend-${index}">${v.problemtype_name}</a> `
//     });
//     // console.log(responseAPI)
//     document.getElementById('divAllProblemtype').innerHTML= text
//     // hashtagTrend = responseAPI.data.results
// }

async function allProblemtype(event) {
    let url_hashtag_trend = `${base_url_api}/trend-all`
    let responseAPI = await axios({
        method: 'get',
        url: url_hashtag_trend,
    })

    let _problems = responseAPI.data.results
    _problems.unshift(
        {
            p_count: "91",
            problemtype_name: "ทั้งหมด"
        },

    )

    text = ''
    responseAPI.data.results.forEach(function (v, index) {
        // container.append('<div>' + count + '</div>');
        var prbt_color = getColorProblemType(v.problemtype_name)
        text = text + `<a href="#" class="badge rounded-pill" style="background-color: ${prbt_color}; font-size: 1rem; margin-top:4px;" onclick="clickHashtagBadge(this)" id="span-hashtag-trend-${index}">${v.problemtype_name}</a> `
    });
    // console.log(responseAPI)
    document.getElementById('divAllProblemtype').innerHTML = text
}



function closeInfoWindow(infoWindow) {
    if (infoWindow !== null) {
        google.maps.event.clearInstanceListeners(infoWindow);  // just in case handlers continue to stick around
        infoWindow.close();
        infoWindow = null;
    }
}


function clickTrListData(event, _latlng) {
    let latlng = _latlng.split(',')
    let lat = latlng[1]
    let lng = latlng[0]

    var latLng = new google.maps.LatLng(lat, lng); //Makes a latlng

    map.panTo(latLng); //Make map global
    map.setZoom(18)
    google.maps.event.trigger(markers[event.rowIndex - 1], 'click');
}


function clickHashtagBadge(event) {

    var queryproblemtypeTrend = "ประเภท:" + event.innerHTML
    document.getElementById("input_search_text").value = queryproblemtypeTrend;
    document.getElementById("input_slide_search_text").value = queryproblemtypeTrend;

    searchPost(queryproblemtypeTrend)
}


async function cluckSearchSlideBar() {
    var text_search = document.getElementById("input_slide_search_text").value.replace("#", "").trim();
    // alert(text_search)
    await searchPost(text_search)
}

window.onload = function () {
    let input_search_text = document.getElementById("input_search_text")
    let input_slide_search_text = document.getElementById("input_slide_search_text")

    input_search_text.addEventListener("keyup", function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            setTimeout(function () {
                document.getElementById("btn_search_hashtag").click();
            }, 250);
        }
    });

    input_slide_search_text.addEventListener("keyup", function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            setTimeout(function () {
                document.getElementById("btn_search_slidebar").click();
            }, 250)
        }
    });
}//End window.onload 


function converFormatTimestamp(_timestamp) {
    let date_and_time = dayjs(_timestamp, "YYYY-MM-DD+h:mm").add(7, 'hour').locale('th').format('D MMM BB HH:mm')
    return `${date_and_time} น.`
}


function getSrcIconInfoProblemType(_type_name) {
    var path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/อื่นๆ_กลม.png"
    switch (_type_name) {
        case "จราจร":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/จราจร_กลม.png"
            break;
        case "ขยะ":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/ขยะ_กลม.png"
            break;
        case "น้ำท่วม":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/น้ำท่วม_กลม.png"
            break;
        case "ความปลอดภัย":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/ความปลอดภัย_กลม.png"
            break;
        case "ทางเท้า":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/ทางเท้า_กลม.png"
            break;
        case "ป้ายหาเสียง":
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/ป้ายหาเสียง_กลม.png"
            break;
        default:
            //อื่นๆ
            path_icon_info_type = "https://share.traffy.in.th/img/icon-marker/อื่นๆ_กลม.png"
    }
    return path_icon_info_type
}

function getSrcIconMarkerProblemType(_type_name) {
    var path_icon_marker = "https://share.traffy.in.th/img/icon-marker/อื่นๆ_จุด@2x.png"
    switch (_type_name) {
        case "จราจร":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/จราจร_จุด@2x.png";
            break;
        case "ขยะ":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/ขยะ_จุด@2x.png";
            break;
        case "น้ำท่วม":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/น้ำท่วม_จุด@2x.png";
            break;
        case "ความปลอดภัย":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/ความปลอดภัย_จุด@2x.png";
            break;
        case "ทางเท้า":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/ทางเท้า_จุด@2x.png";
            break;
        case "ป้ายหาเสียง":
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/ป้ายหาเสียง_จุด.png";
            break;
        default:
            //อื่นๆ
            path_icon_marker = "https://share.traffy.in.th/img/icon-marker/อื่นๆ_จุด@2x.png";
    }
    return path_icon_marker
}


function getColorProblemType(_type_name) {

    var color_problem_type = "#b720b1"
    switch (_type_name) {
        case "จราจร":
            color_problem_type = "#f0a311";
            break;
        case "ขยะ":
            color_problem_type = "#5fd488";
            break;
        case "น้ำท่วม":
            color_problem_type = "#5fa9d4";
            break;
        case "ความปลอดภัย":
            color_problem_type = "#9d1b48";
            break;
        case "ทางเท้า":
            color_problem_type = "#5f7ad4";
            break;
        case "เสนอแนะ":
            color_problem_type = "#5b31ce";
            break;
        case "ป้ายหาเสียง":
            color_problem_type = "#965d2c";
            break;
        case "ทั้งหมด":
            color_problem_type = "#444aed";
            break;
        default:
            //อื่นๆ
            color_problem_type = "#b720b1";
    }
    return color_problem_type

}

function selectMapTypes(selectObject) {
    var _map_type = selectObject.value;
    // console.log(value);

    switch (_map_type) {
        case "heatmap":
            mapType = "heatmap"
            heatmap.setMap(map);
            map.data.setMap(null);
            searchPost()
            break;
        case "clustering":
            mapType = "clustering"
            heatmap.setMap(null);
            map.data.setMap(map);
            searchPost()
            break;

        default:
            //marker
            mapType = "marker"
            heatmap.setMap(null);
            map.data.setMap(map);
            searchPost()
            break;
    }

}

function clearMarkerMap() {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    if (markerClusterer != null) {
        markerClusterer.clearMarkers();
    }
}

function isDesktopDevice() {
    return (!(/Mobi|Android/i.test(navigator.userAgent)) || (screen.width >= 769))
}

async function getAllDistrict() {
    let _url = `${url_reverse_geo}/?action=list_district&province_selected=กรุงเทพมหานคร&limit=0`
    let responseAPI = await axios({
        method: 'get',
        url: _url,
    })

    let dataDistricts = await responseAPI.data.results
    let _selecter = '<option selected value="ทั้งหมด">ทั้งหมด</option>'


    dataDistricts.forEach(_name => {
        _selecter = _selecter + `<option value="${_name.name}">${_name.name}</option>`
    });
    document.getElementById('select-district').innerHTML = _selecter

}

async function selectChangeDistrict(selectObject) {

    var _district = selectObject.value
    // console.log("_district:", _district)
    document.getElementById("input_search_text").value = "";
    document.getElementById("input_slide_search_text").value = "";

    var e = document.getElementById("select-district");
    var selectDistrict = e.options[e.selectedIndex].text;


    if (_district == 'ทั้งหมด') {
        document.getElementById('divSubDistrict').style.display = "none"
        //ถ้าเขตเป็น all ให้แสดงแขวงทั้งหมดไม่ต้อนค้นหา
        filterSubDistrict = null
        filterDistrict = null
    } else {
        document.getElementById('divSubDistrict').style.display = "block"
        let _url = `${url_reverse_geo}/?action=list_subdistrict&district_selected=${_district}&province_selected=กรุงเทพมหานคร&limit=0`
        let responseAPI = await axios({
            method: 'get',
            url: _url,
        })
        let dataDistricts = await responseAPI.data.results
        let _selecter = '<option selected value="ทั้งหมด">ทั้งหมด</option>'

        dataDistricts.forEach(_name => {
            _selecter = _selecter + `<option value="${_name.name}">${_name.name}</option>`
        });
        document.getElementById('select-subdistrict').innerHTML = _selecter


        filterDistrict = selectDistrict
        filterSubDistrict = null
    }//End if (_district == 'all')

    searchPost()
}//End 

function selectChangeSubDistrict(selectObject) {

    // var e = document.getElementById("select-subdistrict");
    // var selectSubDistrict = e.options[e.selectedIndex].text;
    var selectSubDistrict = selectObject.value
    // console.log(selectSubDistrict, "---")
    if (selectSubDistrict == 'ทั้งหมด') {
        //ถ้าแขวงเป็น all ให้แสดงแขวงทั้งหมดไม่ต้อนค้นหา
        filterSubDistrict = null
    } else {

        filterSubDistrict = selectSubDistrict
    }

    searchPost()
}


function CommonShowHide(ElementId, element, value) {
    document
        .getElementById(ElementId)
        .style
        .display = element.value == value ? 'block' : 'none';
}


function clearSearch() {
    location.reload();
}


function getURLimageThumbnail(photo_url) {

    try {
        let image_name = photo_url.split("/")[6].split(".")[0]
        let image_directory_date = photo_url.split("/")[5]
        let photo_type = photo_url.split("/")[6].split(".")[1]

        if (photo_type == "png") {
            photo_type = `.${photo_type}`
        } else {
            photo_type = `-90.${photo_type}`
        }

        return {
            "thumbnail": `https://storage.googleapis.com/traffy_public_bucket/_s_/attachment/${image_directory_date}/${image_name}-thumbnail-400x400${photo_type}`
        }
    } catch (error) {
        return ''
    }
} //End getURLimageThumbnail


function styleBadge(str_state) {
    let badge_state = ''

    switch (str_state) {
        case "รอรับเรื่อง":
            badge_state = `<span class="badge rounded-pill badge-state-start float-end" style="margin-right: 4px;  display: inline; font-size: 10px;">
            <img src="https://share.traffy.in.th/img/icon-state-start.png" class="float-start" width="9" style="margin-right: 4px;">
            ${str_state}</span>`
            break;
        case "ส่งเรื่องแล้ว":
            badge_state = `<span class="badge rounded-pill badge-state-inprogress float-end" style="margin-right: 4px;  display: inline; font-size: 10px;">
            <img src="https://share.traffy.in.th/img/icon-state-inprogress.png" class="float-start" width="9" style="margin-right: 4px;">
            ${str_state}</span>`
            break;

        case "เสร็จสิ้น":
            badge_state = `<span class="badge rounded-pill badge-state-finish float-end" style="margin-right: 4px;  display: inline; font-size: 10px;">
            <img src="https://share.traffy.in.th/img/icon-state-finish.png" class="float-start" width="9" style="margin-right: 4px;">
            ${str_state}</span>`
            break;

        default:
            badge_state = '';
    }

    return badge_state

}

function styleBadgeInfoWindows(str_state) {
    let badge_state = ''

    switch (str_state) {
        case "รอรับเรื่อง":
            badge_state = `<span class="badge rounded-pill badge-state-start float-end" style="margin-right: 0px;  display: inline; font-size: 10px; ">
            <img src="https://share.traffy.in.th/img/icon-state-start.png" class="float-start" width="9" style="margin-right: 4px;">
            รอรับเรื่อง</span>`
            break;
        case "ส่งเรื่องแล้ว":
            badge_state = `<span class="badge rounded-pill badge-state-inprogress float-end" style="margin-right: 4px;  display: inline; font-size: 10px;">
            <img src="https://share.traffy.in.th/img/icon-state-inprogress.png" class="float-start" width="9" style="margin-right: 4px;">
            ส่งเรื่องแล้ว</span>`
            break;

        case "เสร็จสิ้น":
            badge_state = `<span class="badge rounded-pill badge-state-finish float-end" style="margin-right: 4px;  display: inline; font-size: 10px;">
            <img src="https://share.traffy.in.th/img/icon-state-finish.png" class="float-start" width="9" style="margin-right: 4px;">
            ${str_state}</span>`
            break;

        default:
            badge_state = '';
    }

    return badge_state

}//End styleBadgeInfoWindows

// selectMapTypes

function selectState(selectObject) {
    var _state = selectObject.value

    document.getElementById("input_search_text").value = "";
    document.getElementById("input_slide_search_text").value = "";

    if (_state == "all") {
        filterState = null
    } else {
        filterState = _state
    }

    searchPost()
}

function signSelectState(_str_state) {
    var _state = _str_state

    document.getElementById("input_search_text").value = "";
    document.getElementById("input_slide_search_text").value = "";

    if (_state == "all") {
        filterState = null
    } else {
        filterState = _state
    }

    searchPost()
}



function infoWindowContent(data) {

    let content = ''
    let photo_url = getURLimageThumbnail(data.photo_url).thumbnail
    var path_icon_info_type = getSrcIconInfoProblemType(data.type)
    var _badge_state = styleBadgeInfoWindows(data.state)

    if (data.state == "รอรับเรื่อง") {
        content = `<div>
        <img src="${photo_url}" class="card-img-top img-fluid rounded mx-auto d-block " alt="..."  style="max-width: 260px; max-height: 190px; object-fit: contain;">
        <div class="card-body" style='font-family: MitrFont; padding-left:0;'>
          <div class="card-title" style='padding:0;'>
            <h5 style="font-weight: bold; display:inline;"><img src="${path_icon_info_type}" style='padding:0; margin:0;'> จุดเสี่ยง${data.type} ${_badge_state}<h5/>
          </div>      
          <p class="card-text" class="read">${data.description}</p>
          <p class="card-text" class="read">${data.address}</p>
          <p class="card-text" style="font-weight: bold;">${converFormatTimestamp(data.timestamp)}</p>     
        </div>
        </div>
        `
    } else {
        let after_photo_url = `https://share.traffy.in.th/img/logo-teamchadchart-360.jpg`

        if (data.after_photo != '') {
            after_photo_url = getURLimageThumbnail(data.after_photo).thumbnail
            console.log(after_photo_url)
        }

        content = `<div style='font-family: MitrFont;'>
        <div class="d-flex justify-content-between">
        <div style="text-align:center" class="flex-fill">
          <div style="height: 190px; display: flex;  justify-content: center; align-items: center;" >  
            <img src="${photo_url}" class="card-img-top img-fluid rounded mx-auto d-block " alt="..."  style="max-width: 260px; max-height: 190px; object-fit: contain;">
          </div>
          <div>ก่อน</div>
        </div>
        <div style="text-align:center" class="flex-fill">
            <div style="height: 190px; display: flex; justify-content: center; align-items: center;" >  
                <img src="${after_photo_url}" class="card-img-top img-fluid rounded mx-auto d-block " alt="..."  style="max-width: 260px; max-height: 190px; object-fit: contain;">
            </div>
            <div>หลัง</div>
        </div>
        </div>
        <div class="card-body" style='padding-left:0;'>
        <div class="card-title" style='padding:0;'>
            <h5 style="font-weight: bold; display:inline;"><img src="${path_icon_info_type}" style='padding:0; margin:0;'> จุดเสี่ยง${data.type} ${_badge_state}<h5/>
        </div>      
        <p class="card-text" class="read">${data.description}</p>
        <p class="card-text" class="read">${data.address}</p>
        <p class="card-text" style="font-weight: bold;">${converFormatTimestamp(data.timestamp)}</p>     
        </div>
        </div>
    `
    }

    return content
}

async function getStatState() {
    let _url = `${base_url_api}/sum_state?state=start,inprogress,finish`
    let responseAPI = await axios({
        method: 'get',
        url: _url,
    })

    _stat = responseAPI.data

    document.getElementById('stat-start').innerHTML = _stat.start
    document.getElementById('stat-inprogress').innerHTML = _stat.inprogress
    document.getElementById('stat-finish').innerHTML = _stat.finish
    document.getElementById('stat-total').innerHTML = _stat.total

}// End getStatState


function clickLiCategoryUnitStat(_type) {
    let _ul = document.getElementById("ul-category");
    let listItems = _ul.querySelectorAll('li');

    for (li of listItems) {
        if (li.value != _type) {
            li.classList.remove("select-li-active");
        } else {
            li.classList.add("select-li-active");
        }
    }

    let limit = 5
    switch (_type) {
        case '0':
            limit = 5
            break;
        case '1':
            limit = 100
            break;
    }
    getCategoryStat(limit)
}

async function getCategoryStat(_limit = 100) {
    let responseAPI = await axios({
        method: 'get',
        url: `https://anywhere.pwisetthon.com/${base_url_api}/trend-all?limit=${_limit}`,
    })
    let dataCategoryStat = await responseAPI.data

    console.log(dataCategoryStat)

    let _labels = []
    let _data = []
    let _color = []

    dataCategoryStat.results = dataCategoryStat.results.sort((a, b) => b['p_count'] - a['p_count']);

    dataCategoryStat.results.forEach(i => {
        _data.push(i.p_count)
        _labels.push(i.problemtype_name)
        _color.push(getColorProblemType(i.problemtype_name))
    });

    let unitStatChart = document.getElementById('categoryUnitStatChart').getContext('2d');
    let chartStatus = Chart.getChart("categoryUnitStatChart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }

    const config = {
        type: 'bar',
        data: {
            labels: _labels,
            datasets: [{
                label: '',
                data: _data,
                backgroundColor: _color,
                borderColor: _color,
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'x',
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                bar: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: false,
                },
                title: {
                    display: false,
                    text: 'Chart.js Horizontal Bar Chart'
                }
            }
        },
    };

    new Chart(unitStatChart, config);

    /*new Chart(unitStatChart, {
        type: 'bar',
        data: {
            labels: _labels,
            datasets: [{
                label: '',
                data: _data,
                backgroundColor: _color,
                borderColor: _color,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'x',
            plugins: {
                legend: {
                  display: false
                }
            } //End plugins
        }// End options
    });*/
} //End getEventStat


function clickLiSubDistrict(_type) {
    let _ul = document.getElementById("ul-province");
    let listItems = _ul.querySelectorAll('li');

    for (li of listItems) {
        if (li.value != _type) {
            li.classList.remove("select-li-active");
        } else {
            li.classList.add("select-li-active");
        }
    }

    let limit = 8
    switch (_type) {
        case '0':
            limit = 6
            break;
        case '1':
            limit = 11
            break;
        case '2':
            limit = 1000
            break;
    }
    getSubDistrictStat(limit)
}


async function getSubDistrictStat(_limit = 10) {

    let responseAPI = await axios({
        method: 'get',
        url: `${base_url_api}/subdistrict-stat?limit=${_limit}`,
    })
    let dataStat = await responseAPI.data

    let _labels = []
    let _data = []

    dataStat.forEach(i => {
        _data.push(i.count)
        _labels.push(i.district)
    });


    let unitStatChart = document.getElementById('subDistrictStatChart').getContext('2d');

    let chartStatus = Chart.getChart("subDistrictStatChart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }

    let _aspectRatio = 1
    if (_limit > 15) {
        _aspectRatio = 0.2
    }

    const config = {
        type: 'bar',
        data: {
            labels: _labels,
            datasets: [{
                label: '',
                data: _data,
                backgroundColor: '#F418FB',
                borderColor: '#F418FB',
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            // Elements options apply to all of the options unless overridden in a dataset
            // In this case, we are setting the border of each horizontal bar to be 2px wide
            elements: {
                bar: {
                    borderWidth: 2,
                }
            },
            responsive: true,
            aspectRatio: _aspectRatio,
            plugins: {
                legend: {
                    position: false,
                },
                title: {
                    display: false,
                    text: 'Chart.js Horizontal Bar Chart'
                }
            }
        },
    };

    new Chart(unitStatChart, config)

} //End getEventStat