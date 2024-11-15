(function($) {
    "use strict";
    var HT = {}; 
    var homeStay = homeStay;
    let map; 
    let markers = []; 

    function createSlug(name) {
        const specialChars = {
            'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
            'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
            'â': 'a', 'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
            'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
            'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
            'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
            'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
            'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
            'đ': 'd'
        };
    
        name = name.split('').map(char => specialChars[char] || char).join('');
    
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-') 
            .replace(/^-+|-+$/g, ''); 
    }

    HT.loadMap = () => {
        
        var platform = new H.service.Platform({
            'apikey': 'HwI3lnNYwzirBSKkXL-dtfkv5hQMKc_gRxoh1El2k78'
        });

        var defaultLayers = platform.createDefaultLayers();

        var mapCenterLat = $('#mapContainer').data('lat'); 

        var mapCenterLong = $('#mapContainer').data('long'); 

        var zoom = $('#mapContainer').data('zoom');

        var map = new H.Map(document.getElementById('mapContainer'),
            defaultLayers.vector.normal.map,
            {
                zoom: zoom,  
                center: { 
                    lat: mapCenterLat, 
                    lng: mapCenterLong 
                },
                pixelRatio: window.devicePixelRatio || 1
            }
        );

        window.addEventListener('resize', () => map.getViewPort().resize());

        var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        var ui = H.ui.UI.createDefault(map, defaultLayers.vector.normal.map);

        var svgIcon = new H.map.Icon("https://son-le654.github.io/GGMaps/userfiles/image/location-2955.svg", { size: { w: 48, h: 48 }});

        if(cities){

            cities.forEach(function(city) {

                var LocatioOfMaker = { 
                    lat: parseFloat(city.lat), 
                    lng: parseFloat(city.long) 
                }
                
                var domMarker = new H.map.Marker(LocatioOfMaker, { icon:svgIcon } );

                domMarker.addEventListener('pointerdown', function() {

                    var curentUrl = window.location.href;

                    var name = createSlug(city.name);

                    var newUrl = curentUrl + 'location/' + name + '/' + city.id + '.html'  ;

                    window.location.href = newUrl

                });

                map.addObject(domMarker);

                var nameDiv = document.createElement('div');

                nameDiv.innerHTML = city.name;

                Object.assign(nameDiv.style, {
                    position: 'absolute', transform: 'translate(-50%, -10px)', color: 'black',
                    fontWeight: 'bold',fontSize: '13px',cursor: 'pointer', 
                });

                map.getElement().appendChild(nameDiv);

                map.addEventListener('mapviewchange', function() {

                    var coords = map.geoToScreen(LocatioOfMaker);

                    nameDiv.style.left = `${coords.x}px`;

                    nameDiv.style.top = `${coords.y + 10}px`;

                });

            });

        }
    
    };

    HT.changeColor = () => {
        $(document).on('click','.st', function(e){

            e.preventDefault();

            let _this = $(this)

            let color_id = _this.data('color')

            let city_id = _this.closest('.status').find('.ip-home').data('city')

            let homestay_id = _this.closest('.status').find('.ip-home').data('homestay')

            if(!_this.hasClass('active')){
                
                _this.closest('.status').find('.st').removeClass('active')

                $.ajax({

                    url: 'ajax/user/changeStatus', 

                    type: 'GET', 

                    data: {
                        color_id : color_id,
                        homestay_id : homestay_id,
                        city_id : city_id
                    }, 

                    dataType: 'json', 

                    success: function(res) {
                        if(res.homestay){
                            let items = res.homestay
                            HT.loadLocation(items)
                            _this.addClass('active')
                            _this.closest('.homestay-item').find('.color').css({
                                'border': `2px solid ${res.temp[0].code}`,
                                'color': `${res.temp[0].code}`
                            }).text(res.temp[0].description);
                        }
                    },
                });
    
            }
        })
    }

    HT.changePrice = () => {
        $(document).on('blur', '#quantity_price', function() {

            let _this = $(this)

            let city_id = _this.closest('.homestay-item').find('.ip-home').data('city')

            let homestay_id = _this.closest('.homestay-item').find('.ip-home').data('homestay')

            let price = _this.val()

            $.ajax({

                url: 'ajax/user/changePrice', 

                type: 'GET', 

                data: {
                    price : price,
                    homestay_id : homestay_id,
                    city_id : city_id
                }, 

                dataType: 'json', 

                success: function(res) {
                    if(res.homestay){
                        let items = res.homestay
                        HT.loadLocation(items)
                    }
                },
            });

        });
    };

    HT.changeGuest = () => {

        $(document).on('mouseleave', '.quantity_guest', function() {

            let _this = $(this);

            let previous_data  = _this.closest('.homestay-item').find('.cr').data('guest');

            let city_id = _this.closest('.homestay-item').find('.ip-home').data('city');

            let homestay_id = _this.closest('.homestay-item').find('.ip-home').data('homestay');

            let inputGuest = _this.closest('.homestay-item').find('#quantity_guest'); 

            let current_guests = parseInt(inputGuest.val());

            if (_this.hasClass('plus')) {

                current_guests += 1; 

            } else if (_this.hasClass('minus')) {

                current_guests = Math.max(1, current_guests - 1); 

            }

            if(previous_data !== current_guests){

                _this.closest('.homestay-item').find('.cr').data('guest', current_guests).attr('data-guest', current_guests);

                $.ajax({

                    url: 'ajax/user/changeGuest', 

                    type: 'GET', 

                    data: {
                        current_guests : current_guests,
                        homestay_id : homestay_id,
                        city_id : city_id
                    }, 

                    dataType: 'json', 

                    success: function(res) {
                        let items = res.homestay
                        HT.loadLocation(items)
                        _this.closest('.homestay-item').find('.customer').text(`${res.temp[0].current_guests} khách`);
                        _this.closest('.homestay-item').find('.cr').attr('data-guest', res.temp[0].current_guests)
                    },
                });
            }

        });
    }

    HT.btnClose = () => {
        $(document).on('click',('.btn-delete'), function(e){
            e.preventDefault();
            let _this = $(this)
            let publish = 0;
            let homestay_id = _this.closest('.lower').find('.info_homestay').data('id')
            let city_id = _this.closest('.lower').find('.info_homestay').data('city')
            $.ajax({

                url: 'ajax/user/changeClose', 

                type: 'GET', 

                data: {
                    homestay_id : homestay_id,
                    city_id : city_id,
                    publish : publish
                }, 

                dataType: 'json', 

                success: function(res) {
                    if(res.homestay == 0){
                        window.location.reload()
                    }
                    if(res.homestay){
                        let items = res.homestay
                        HT.loadLocation(items)
                    }
                },
            });

        })
    }

    HT.btnOpen = () => {
        $(document).on('click',('.btn-open'), function(e){
            e.preventDefault();
            let _this = $(this)
            let publish = 1;
            let homestay_id = _this.closest('.lower').find('.info_homestay').data('id')
            let city_id = _this.closest('.lower').find('.info_homestay').data('city')
            $.ajax({

                url: 'ajax/user/changeOpen', 

                type: 'GET', 

                data: {
                    homestay_id : homestay_id,
                    city_id : city_id,
                    publish : publish
                }, 

                dataType: 'json', 

                success: function(res) {
                    if(res.homestay){
                        let items = res.homestay
                        HT.loadLocation(items)
                    }
                },
            });

        })
    }

    HT.loadLocation = (items) => {

        if(map) {
            clearMarkers();
            map.dispose();
            map = null; 
        }

        var platform = new H.service.Platform({
            'apikey': 'HwI3lnNYwzirBSKkXL-dtfkv5hQMKc_gRxoh1El2k78'
        });

        var defaultLayers = platform.createDefaultLayers({
            tileSize: 256,
            ppi: 320
        });

        var latLocation = $('#mapLocation').data('lat');

        var longLocation = $('#mapLocation').data('long');

        map = new H.Map(document.getElementById('mapLocation'), defaultLayers.vector.normal.map, {
            center: { lat: latLocation, lng: longLocation },
            zoom: 12,
            pixelRatio: 1
        });

        window.addEventListener('resize', () => map.getViewPort().resize());

        var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));

        var ui = H.ui.UI.createDefault(map, defaultLayers.vector.normal.map);

        if (typeof items === 'object' && !Array.isArray(items)) {
            items = Object.values(items);
        }
        
        const dataToUse = Array.isArray(items) && items.length > 0 ? items : (typeof list_homestay !== 'undefined' && list_homestay.length > 0 ? list_homestay : []);

        // requestAnimationFrame(() => {
        //     dataToUse.forEach(item => {
        //         addMarker(item, ui); 
        //     });
        // });

        dataToUse.forEach(item => addMarker(item, ui));

    }

    let currentBubble = null;

    function addMarker(item, ui) {

        const locationOfMarker = {

            lat: parseFloat(item.lat),

            lng: parseFloat(item.long)

        };

        const domIcon = HT.createCircularDomIconWithLabel(item.image, item.name, item.current_guests, item.note,  48, item.code);

        const domMarker = HT.createDomMarkerWithOffset(locationOfMarker, domIcon);

        map.addObject(domMarker);

        markers.push(domMarker);

        const nameDiv = document.createElement('div');

        nameDiv.innerHTML = item.name;

        nameDiv.className = 'homestay';

        Object.assign(nameDiv.style, {
            background: item.code,
        });

        map.getElement().appendChild(nameDiv);

        map.addEventListener('mapviewchange', () => {
            const coords = map.geoToScreen(locationOfMarker);
            nameDiv.style.left = `${coords.x}px`;
            nameDiv.style.top = `${coords.y + 10}px`;
        });

        domMarker.addEventListener('tap', () => {

            const popupContent = document.querySelector('.popup-content');  

            const buttonPermission = document.querySelector('.button-premission');

            if (currentBubble) {
                ui.removeBubble(currentBubble);
            }

            currentBubble = new H.ui.InfoBubble(locationOfMarker, {
                content: HT.loadPopUp(item)
            });

            ui.addBubble(currentBubble);

            HT.swiperPopup();

            const item_id = item.id;

            if(popupContent) {
                
                popupContent.classList.add('active');

                buttonPermission.classList.remove('active');

                const listItem = document.querySelectorAll('.homestay-item');

                listItem.forEach((li) => {
                    if (li.id == item_id) {
                        li.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        li.focus(); 
                    }
                });
            }
        });
    }


    function clearMarkers() {
        markers.forEach(marker => map.removeObject(marker));
        markers = []; 
    }


    HT.loadPopUp = (item) => {

        let slides = '';

        let temp = item.album;

        if(temp){
            let album = JSON.parse(temp)
            album.forEach(image => {
                slides += `<div class="swiper-slide">
                        <div class="slide-item">
                            <span class="image img-cover"><img src="${image}" alt=""></span>
                        </div>
                    </div>`;
            });
        }else{
            slides += `<div class="swiper-slide">
                <div class="slide-item">
                    <span class="image img-cover"><img src="${item.image}" alt=""></span>
                </div>
            </div>`;
        }


        let html = `<div class="popup">
                        <div class="panel-album">
                            <div class="swiper-container">
                                <div class="swiper-button-next"></div>
                                <div class="swiper-button-prev"></div>
                                <div class="swiper-wrapper">
                                    ${slides}
                                </div>
                                <div class="swiper-pagination"></div>
                            </div>
                        </div>
                        <strong>${item.name} </span></strong>
                        <div class="info">
                            <div class="uk-grid uk-grid-medium">
                                <div class="uk-width-medium-2-3">
                                    <div class="wrapper">
                                        <a href="${item.link}" class="map" id="link" target="_blank">
                                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M7.37464 13.0262C8.64995 11.921 11.5941 9.0207 11.5941 5.79704C11.5941 3.14771 9.44636 1 6.79704 1C4.14771 1 2 3.14771 2 5.79704C2 9.0207 4.94412 11.921 6.21943 13.0262C6.55458 13.3166 7.03949 13.3166 7.37464 13.0262Z" fill="#D7E0FF" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                                <path d="M6.79705 7.48014C7.88217 7.48014 8.76183 6.60048 8.76183 5.51536C8.76183 4.43024 7.88217 3.55058 6.79705 3.55058C5.71194 3.55058 4.83228 4.43024 4.83228 5.51536C4.83228 6.60048 5.71194 7.48014 6.79705 7.48014Z" fill="white" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                            </svg>
                                            Đường dẫn
                                        </a>
                                        <button id="copyBtn">Copy Link</button>
                                    </div>
                                </div>
                                <div class="uk-width-medium-1-3">
                                    <p class="price">
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M7.93323 1.1397L2.79016 4.244L10.8577 4.95292L9.31607 1.56777C9.07585 1.04029 8.42944 0.840196 7.93323 1.1397Z" fill="white"/>
                                            <path d="M1.5456 10.9204C1.70795 11.8424 2.44527 12.5832 3.37082 12.7236C4.28984 12.8631 5.11971 13 6.39428 13C7.66884 13 8.49871 12.8631 9.41773 12.7236C10.3433 12.5832 11.0806 11.8424 11.2429 10.9204C11.3682 10.2091 11.4825 9.59134 11.4825 8.39637C11.4825 7.2014 11.3682 6.58368 11.2429 5.87234C11.0806 4.95039 10.3433 4.20954 9.41773 4.06912C8.49871 3.92969 7.66884 3.79278 6.39428 3.79278C5.11971 3.79278 4.28984 3.92969 3.37082 4.06912C2.44527 4.20954 1.70795 4.95039 1.5456 5.87234C1.42034 6.58368 1.30609 7.2014 1.30609 8.39637C1.30609 9.59134 1.42034 10.2091 1.5456 10.9204Z" fill="#D7E0FF" stroke="#A6A6A6" stroke-width="1.5"/>
                                            <path d="M11.6939 9.80163H8.81723C8.01434 9.80163 7.36346 9.15076 7.36346 8.34786C7.36346 7.54497 8.01434 6.8941 8.81723 6.8941H11.6939C12.2462 6.8941 12.6939 7.34181 12.6939 7.8941V8.80163C12.6939 9.35391 12.2462 9.80163 11.6939 9.80163Z" fill="white" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round"/>
                                            <path d="M2.79016 4.244L7.93323 1.1397C8.42944 0.840196 9.07585 1.04029 9.31607 1.56777L10.8577 4.95292" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round"/>
                                        </svg>
                                        ${addCommas(item.price)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="status">
                            <p class="hour">
                                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="10.5" cy="10.5" r="9.5" fill="#D7E0FF" stroke="#A6A6A6" stroke-width="1.5"/>
                                    <path d="M10 7V10.75L13 13" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>${open_hours[item.open_hours]}</span>
                            </p>
                            <p class="room">
                                <svg width="22" height="25" viewBox="0 0 22 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.83496 5.52686C0.913258 7.73847 0.921047 13.8531 1.08358 16.8479C1.1192 17.5043 1.68999 18 2.37476 18H10.6252C11.31 18 11.8808 17.5043 11.9164 16.8479C12.079 13.8531 12.0867 7.73847 11.165 5.52686C10.6216 4.83135 9.28033 3.39849 7.64731 2.33839C6.95229 1.8872 6.04771 1.8872 5.35269 2.33839C3.71967 3.39849 2.37843 4.83135 1.83496 5.52686Z" fill="white" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M11.2547 9H14.3899C15.4944 9 16.4447 9.49907 16.6498 10.5043C16.9645 12.0464 17.1694 14.6621 16.809 18H10C10.7132 18 11.3076 17.5018 11.3447 16.8422C11.4539 14.9011 11.496 11.6561 11.2547 9Z" fill="#D7E0FF" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 11H7" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 18V15" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                    <path d="M6 7H7" stroke="#A6A6A6" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                                </svg>
                                <span>${total_rooms[item.total_rooms]} Phòng</span>
                            </p>
                            <p class="color">
                                <span style="border:1px solid ${item.code}; color: ${item.code};">${item.description}</span>
                            </p>
                        </div>
                    </div>`
        return html;
    }


    HT.swiperPopup = () => {
		var swiper = new Swiper(".panel-album .swiper-container", {
			loop: false,
			pagination: {
				el: '.swiper-pagination',
			},
			spaceBetween: 20,
			slidesPerView: 2,
			breakpoints: {
				300: {
					slidesPerView: 1,
				},
				500: {
				  slidesPerView: 1,
				},
				768: {
				  slidesPerView: 1,
				},
				1280: {
					slidesPerView: 1,
				}
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			
		});
	}


    HT.createCircularDomIconWithLabel = (imageUrl, label, guest , note , size = 64, background) => {

        const container = document.createElement('div');

        container.style.position = 'relative';
    
        const img = document.createElement('div');

        img.className = 'circular-marker';

        img.style.backgroundImage = `url(${imageUrl})`;
        
        img.style.width = `${size}px`;

        img.style.height = `${size}px`;

        Object.assign(img.style, {
            backgroundSize: 'cover',  
            borderRadius: '50%',      
            border: `3px solid ${background}`, 
            boxShadow: '0 0 5px rgba(0, 0, 0, 0.3)' 
        });

        const labelDiv = document.createElement('div');

        labelDiv.className = 'marker-label';

        let text = `
           <a href=""><span>
                <svg fill="#fff" width="800px" height="800px" viewBox="0 0 36 36" version="1.1"  preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                    <title>users-solid</title>
                    <path class="clr-i-solid clr-i-solid-path-1" d="M12,16.14q-.43,0-.87,0a8.67,8.67,0,0,0-6.43,2.52l-.24.28v8.28H8.54v-4.7l.55-.62.25-.29a11,11,0,0,1,4.71-2.86A6.59,6.59,0,0,1,12,16.14Z"></path><path class="clr-i-solid clr-i-solid-path-2" d="M31.34,18.63a8.67,8.67,0,0,0-6.43-2.52,10.47,10.47,0,0,0-1.09.06,6.59,6.59,0,0,1-2,2.45,10.91,10.91,0,0,1,5,3l.25.28.54.62v4.71h3.94V18.91Z"></path><path class="clr-i-solid clr-i-solid-path-3" d="M11.1,14.19c.11,0,.2,0,.31,0a6.45,6.45,0,0,1,3.11-6.29,4.09,4.09,0,1,0-3.42,6.33Z"></path><path class="clr-i-solid clr-i-solid-path-4" d="M24.43,13.44a6.54,6.54,0,0,1,0,.69,4.09,4.09,0,0,0,.58.05h.19A4.09,4.09,0,1,0,21.47,8,6.53,6.53,0,0,1,24.43,13.44Z"></path><circle class="clr-i-solid clr-i-solid-path-5" cx="17.87" cy="13.45" r="4.47"></circle><path class="clr-i-solid clr-i-solid-path-6" d="M18.11,20.3A9.69,9.69,0,0,0,11,23l-.25.28v6.33a1.57,1.57,0,0,0,1.6,1.54H23.84a1.57,1.57,0,0,0,1.6-1.54V23.3L25.2,23A9.58,9.58,0,0,0,18.11,20.3Z"></path>
                    <rect x="0" y="0" width="36" height="36" fill-opacity="0"/>
                </svg>
                ${guest} </span>
        `;

        if(guest != 0){
            labelDiv.innerHTML = label + ' '  + text ;
        }else{
            labelDiv.innerHTML = label;
        }
        

        Object.assign(labelDiv.style, {
            background: background || 'rgba(0, 0, 0, 0.5)',
            padding: '3px 10px',
            fontWeight:'normal',
            color:'#fff',
            textAlign:'center',
            textShadow:'none',
        });
    
        container.appendChild(img);

        container.appendChild(labelDiv);

        if(note){

            const notificationDiv = document.createElement('div');

            notificationDiv.className = 'notification-badge';

            notificationDiv.textContent = note;
        
            Object.assign(notificationDiv.style, {
                position: 'absolute',
                bottom: '60px',  
                left: '50%',              
                transform: 'translateX(-50%)',  
                backgroundColor: '#fff',
                color: '#000',           
                padding: '5px 8px',            
                borderRadius: '5px',       
                // border : '1px solid rgba(0, 0, 0, 0.5)',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                width: 'max-content',
                textAlign: 'center',
                whiteSpace: 'nowrap',      
                zIndex: '10',               
                transition: 'opacity 0.3s', 
            });

            const arrowDiv = document.createElement('div');

            Object.assign(arrowDiv.style, {
                position: 'absolute',
                top: '100%', 
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '5px',
                borderStyle: 'solid',
                borderColor: 'rgba(0, 0, 0, 0.8) transparent transparent transparent'  
            });
            notificationDiv.appendChild(arrowDiv);

            container.appendChild(notificationDiv);
        }
        
        return new H.map.DomIcon(container);
    }
    
    HT.createDomMarkerWithOffset = (location, icon, offsetY = -24) => {
        return new H.map.DomMarker(location, {
            icon: icon,
            anchor: { x: 24, y: 48 + Math.abs(offsetY) }
        });
    }

    HT.changeQuantity = () => {

		$(document).on('click','.quantity-button', function(){

			let _this = $(this)

            let quantityInput = _this.closest('.quantitybox').find('.quantity-text');

            let quantity = _this.closest('.quantitybox').find('.quantity-text').val();

			let newQuantity = 0

			if(_this.hasClass('minus')){
                newQuantity =  quantity - 1
			}else{
                newQuantity = parseInt(quantity) + 1
			}
			if(newQuantity < 1){
				newQuantity = 1
			}
			quantityInput.val(newQuantity)
		})

	}

    HT.open = () => {
        $(document).on('click','.btn-per', function(){
            $('.popup-content').addClass('active'),
            $('.button-premission').removeClass('active')
        });
    }

    HT.close = () => {
		$('.filter-close').on('click', function(){
			$('.popup-content').removeClass('active'),
            $('.button-premission').addClass('active')
		})
	}

    HT.addActive = () => {

        $(document).ready(function() {

            var currentUrl = window.location.href;

            $('.location-item').each(function() {

                var linkUrl = $(this).attr('href');

                if (linkUrl === currentUrl) {

                    $(this).addClass('active');

                }
            });
        });

    }

    HT.reset = () => {
        $(document).on('click','.btn-reset', function(e){

            e.preventDefault();

            let _this = $(this)

            const val_default = 0;

            const color_id = 1;

            let homestay_id = _this.closest('.homestay-item').find('.info_homestay').data('id')

            let city_id = _this.closest('.homestay-item').find('.info_homestay').data('city')

            let note = _this.closest('.homestay-item').find('.nt').data('note')

            _this.closest('.homestay-item').find('input[id="quantity_guest"]').val(val_default);

            $.ajax({

                url: 'ajax/user/resetHomeStay', 

                type: 'GET', 

                data: {
                    current_guests : val_default,
                    homestay_id : homestay_id,
                    city_id : city_id,
                    note : '',
                    color_id : color_id
                }, 

                dataType: 'json', 

                success: function(res) {
                    let items = res.homestay
                    HT.loadLocation(items)
                    if(res.temp){
                        $(`#modal-${res.temp.id} .note`).val(res.temp.note)
                        $('.status a').removeClass('active')
                        $(`.status a[data-color="${res.temp.color_id}"]`).addClass('active')
                    }
                },
            });

        })
    }

    HT.openArrow = () => {
        $(document).on('click','.btn-arr', function(){
            $('.sidebar').removeClass('active'),
            $('.button-arrow').addClass('active')
        });
    }

    HT.closeArrow = () => {
        $(document).on('click','.btn-close', function(){
            $('.sidebar').addClass('active'),
            $('.button-arrow').removeClass('active')
        });
    }

    HT.int = () => {
        $(document).on('change keyup blur', '.int', function(){
            let _this = $(this)
            let value = _this.val()
            if(value === ''){
                $(this).val('0')
            }
            value = value.replace(/\./gi, "")
            _this.val(HT.addCommas(value))
            if(isNaN(value)){
                _this.val('0')
            }
        })

        $(document).on('keydown', '.int', function(e){
            let _this = $(this)
            let data = _this.val()
            if(data == 0){
                let unicode = e.keyCode || e.which;
                if(unicode != 190){
                    _this.val('')
                }
            }
        })
    }

    HT.addCommas = (nStr) => { 
        nStr = String(nStr);
        nStr = nStr.replace(/\./gi, "");
        let str ='';
        for (let i = nStr.length; i > 0; i -= 3){
            let a = ( (i-3) < 0 ) ? 0 : (i-3);
            str= nStr.slice(a,i) + '.' + str;
        }
        str= str.slice(0,str.length-1);
        return str;
    }

    HT.updateModal = () => {
        $(document).on('click','.uk-modal-dialog .btn-submit', function(e){
            e.preventDefault();
            let _this = $(this)
            let name = _this.closest('.uk-modal-dialog').find('input[name=name]').val()
            let price = _this.closest('.uk-modal-dialog').find('input[name=price]').val()
            let link = _this.closest('.uk-modal-dialog').find('input[name=link]').val()
            let lat = _this.closest('.uk-modal-dialog').find('input[name=lat]').val()
            let long = _this.closest('.uk-modal-dialog').find('input[name=long]').val()
            let note = _this.closest('.uk-modal-dialog').find('textarea[name=note]').val()
            let open_hours = _this.closest('.uk-modal-dialog').find('select[name=open_hours]').val()
            let total_rooms = _this.closest('.uk-modal-dialog').find('select[name=total_rooms]').val()
            let current_guests = _this.closest('.uk-modal-dialog').find('select[name=current_guests]').val()
            let city_id = _this.closest('.uk-modal-dialog').find('select[name=city_id]').val()
            let homestay_id = _this.closest('.uk-modal-dialog').find('.homestay').data('id')
            $.ajax({

                url: 'ajax/user/updateHomeStay', 

                type: 'GET', 

                data: {
                    name : name,
                    price : price,
                    link : link,
                    lat : lat,
                    long : long,
                    note : note,
                    open_hours : open_hours,
                    total_rooms : total_rooms,
                    current_guests : current_guests,
                    city_id : city_id,
                    homestay_id : homestay_id
                }, 

                dataType: 'json', 

                success: function(res) {
                    let items = res.homestay
                    HT.loadLocation(items)
                    window.location.reload()
                },
            });
        })
    }

    HT.copyLink = () => {
        $(document).on('click', '#copyBtn', function() {
            let _this = $(this); 
            let link = _this.closest('.info').find('#link').attr('href');
            if(link) {
                navigator.clipboard.writeText(link).then(function() {
                    alert('Đã copy link: ' + link);
                }).catch(function(error) {
                    console.error('Có lỗi khi copy:', error);
                    alert('Không thể copy link.');
                });
            }
        });
    };
    
    


    

    $(document).ready(function(){

        HT.copyLink()

        HT.btnOpen()

        HT.btnClose()

        HT.updateModal()

        HT.int()

        if ($(window).width() <= 600) {
            $('.sidebar').addClass('active');
            $('.button-arrow').removeClass('active');
        }

        HT.changeGuest()

        HT.changePrice()

        HT.changeColor()

        HT.openArrow()
        
        HT.closeArrow()

        HT.reset()

        HT.addActive()

        HT.open()

        HT.close()

        HT.changeQuantity()

        if($('#mapContainer').length > 0) {
            HT.loadMap()
        }
    
        if($('#mapLocation').length > 0) {
            HT.loadLocation();
        }
    });

})(jQuery);
addCommas = (nStr) => { 
    nStr = String(nStr);
    nStr = nStr.replace(/\./gi, "");
    let str ='';
    for (let i = nStr.length; i > 0; i -= 3){
        let a = ( (i-3) < 0 ) ? 0 : (i-3);
        str= nStr.slice(a,i) + '.' + str;
    }
    str= str.slice(0,str.length-1);
    return str;
}
