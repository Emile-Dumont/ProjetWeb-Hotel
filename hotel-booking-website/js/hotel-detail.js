document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const hotelsPerPage = 3;
    let currentPage = 1;
    
    // Liste complète des hôtels (données simulées)
    const allHotels = [
        {
            id: 1,
            name: "Hôtel Luxe Paris",
            location: "Paris, France",
            image: "assets/images/hotels/hotelparis.jpeg",
            price: 180,
            originalPrice: 225,
            rating: 4.5,
            reviews: 120,
            amenities: ["WiFi", "Piscine", "Restaurant"],
            badge: "-20%"
        },
        {
            id: 2,
            name: "Resort Méditerranée",
            location: "Nice, France",
            image: "assets/images/hotels/hotelmed.jpg",
            price: 210,
            rating: 4.0,
            reviews: 87,
            amenities: ["WiFi", "Piscine", "Spa"]
        },
        {
            id: 3,
            name: "Chalet Alpin",
            location: "Chamonix, France",
            image: "assets/images/hotels/chaletalpin.jpg",
            price: 245,
            rating: 5.0,
            reviews: 45,
            amenities: ["WiFi", "Vue montagne", "Cheminée"],
            badge: "Nouveau"
        },
        // Ajout de nouveaux hôtels pour tester la pagination
        {
            id: 4,
            name: "Hôtel du Port",
            location: "Marseille, France",
            image: "assets/images/hotels/hotelparis.jpeg", // Réutilisation d'image à des fins de démo
            price: 165,
            rating: 3.5,
            reviews: 68,
            amenities: ["WiFi", "Vue mer", "Bar"]
        },
        {
            id: 5,
            name: "Le Grand Palace",
            location: "Lyon, France",
            image: "assets/images/hotels/hotelmed.jpg", // Réutilisation d'image à des fins de démo
            price: 230,
            originalPrice: 270,
            rating: 4.8,
            reviews: 132,
            amenities: ["WiFi", "Spa", "Restaurant"],
            badge: "-15%"
        },
        {
            id: 6,
            name: "Résidence Les Oliviers",
            location: "Aix-en-Provence, France",
            image: "assets/images/hotels/chaletalpin.jpg", // Réutilisation d'image à des fins de démo
            price: 175,
            rating: 4.2,
            reviews: 91,
            amenities: ["WiFi", "Piscine", "Parking"]
        },
        {
            id: 7,
            name: "Auberge de la Forêt",
            location: "Strasbourg, France",
            image: "assets/images/hotels/hotelparis.jpeg", // Réutilisation d'image à des fins de démo
            price: 120,
            rating: 3.8,
            reviews: 45,
            amenities: ["WiFi", "Restaurant", "Jardin"]
        },
        {
            id: 8,
            name: "Hôtel de la Plage",
            location: "Biarritz, France",
            image: "assets/images/hotels/hotelmed.jpg", // Réutilisation d'image à des fins de démo
            price: 195,
            rating: 4.3,
            reviews: 76,
            amenities: ["WiFi", "Vue mer", "Bar"],
            badge: "Populaire"
        },
        {
            id: 9,
            name: "Château des Vignes",
            location: "Bordeaux, France",
            image: "assets/images/hotels/chaletalpin.jpg", // Réutilisation d'image à des fins de démo
            price: 290,
            originalPrice: 320,
            rating: 4.7,
            reviews: 104,
            amenities: ["WiFi", "Dégustation", "Spa"],
            badge: "-10%"
        }
    ];
    
    // Calculer le nombre total de pages
    const totalPages = Math.ceil(allHotels.length / hotelsPerPage);
    
    // Fonction pour générer l'HTML d'un hôtel
    function generateHotelHTML(hotel) {
        let starsHTML = '';
        const fullStars = Math.floor(hotel.rating);
        const hasHalfStar = hotel.rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHTML += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHTML += '<i class="fas fa-star-half-alt"></i>';
            } else {
                starsHTML += '<i class="far fa-star"></i>';
            }
        }
        
        return `
            <div class="hotel-card">
                <div class="hotel-image">
                    <img src="${hotel.image}" alt="${hotel.name}">
                    ${hotel.badge ? `<div class="hotel-badge ${hotel.badge === 'Nouveau' ? 'new' : ''}">${hotel.badge}</div>` : ''}
                </div>
                <div class="hotel-info">
                    <h3>${hotel.name}</h3>
                    <div class="hotel-location"><i class="fas fa-map-marker-alt"></i> ${hotel.location}</div>
                    <div class="hotel-rating">
                        ${starsHTML}
                        <span>(${hotel.reviews} avis)</span>
                    </div>
                    <div class="hotel-amenities">
                        ${hotel.amenities.map(amenity => {
                            let icon = 'fa-check';
                            if (amenity === 'WiFi') icon = 'fa-wifi';
                            if (amenity === 'Piscine') icon = 'fa-swimming-pool';
                            if (amenity === 'Restaurant') icon = 'fa-utensils';
                            if (amenity === 'Spa') icon = 'fa-spa';
                            if (amenity === 'Vue montagne') icon = 'fa-snowflake';
                            if (amenity === 'Cheminée') icon = 'fa-fire';
                            if (amenity === 'Vue mer') icon = 'fa-water';
                            if (amenity === 'Bar') icon = 'fa-glass-martini-alt';
                            if (amenity === 'Parking') icon = 'fa-parking';
                            if (amenity === 'Jardin') icon = 'fa-leaf';
                            if (amenity === 'Dégustation') icon = 'fa-wine-glass-alt';
                            
                            return `<span><i class="fas ${icon}"></i> ${amenity}</span>`;
                        }).join('')}
                    </div>
                    <div class="hotel-price">
                        <span class="price">${hotel.price}€</span>
                        <span class="per-night">/ nuit</span>
                        ${hotel.originalPrice ? `<span class="original-price">${hotel.originalPrice}€</span>` : ''}
                    </div>
                    <a href="hotel-detail.html?id=${hotel.id}" class="btn btn-primary">Voir détails</a>
                </div>
            </div>
        `;
    }
    
    // Fonction pour afficher les hôtels de la page courante
    function displayHotelsForPage(page) {
        const startIndex = (page - 1) * hotelsPerPage;
        const endIndex = startIndex + hotelsPerPage;
        const hotelsToShow = allHotels.slice(startIndex, endIndex);
        
        const hotelsList = document.getElementById('hotels-list');
        hotelsList.innerHTML = '';
        
        hotelsToShow.forEach(hotel => {
            hotelsList.innerHTML += generateHotelHTML(hotel);
        });
        
        // Mettre à jour la pagination active
        updatePagination(page);
    }
    
    // Fonction pour mettre à jour l'affichage de la pagination
    function updatePagination(currentPage) {
        const paginationElement = document.querySelector('.pagination');
        let paginationHTML = '';
        
        // Bouton précédent
        if (currentPage > 1) {
            paginationHTML += `<a href="#" class="page-link prev" data-page="${currentPage - 1}"><i class="fas fa-angle-left"></i></a>`;
        }
        
        // Pages numérotées
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `<a href="#" class="page-link ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        
        // Bouton suivant
        if (currentPage < totalPages) {
            paginationHTML += `<a href="#" class="page-link next" data-page="${currentPage + 1}"><i class="fas fa-angle-right"></i></a>`;
        }
        
        paginationElement.innerHTML = paginationHTML;
        
        // Ajouter des écouteurs d'événement aux liens de pagination
        document.querySelectorAll('.pagination .page-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageNumber = parseInt(this.getAttribute('data-page'));
                currentPage = pageNumber;
                displayHotelsForPage(currentPage);
                
                // Remonter en haut de la liste des hôtels
                document.querySelector('.hotel-listing').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }
    
    // Filtrer les hôtels par nom ou emplacement
    document.getElementById('filter-btn').addEventListener('click', function() {
        const searchTerm = document.getElementById('search').value.toLowerCase();
        const priceFilter = document.getElementById('price-filter').value;
        
        let filteredHotels = [...allHotels];
        
        // Filtre par recherche
        if (searchTerm) {
            filteredHotels = filteredHotels.filter(hotel => 
                hotel.name.toLowerCase().includes(searchTerm) || 
                hotel.location.toLowerCase().includes(searchTerm)
            );
        }
        
        // Filtre par prix
        if (priceFilter) {
            filteredHotels = filteredHotels.filter(hotel => {
                if (priceFilter === 'low') return hotel.price < 100;
                if (priceFilter === 'medium') return hotel.price >= 100 && hotel.price < 200;
                if (priceFilter === 'high') return hotel.price >= 200;
                return true;
            });
        }
        
        // Mettre à jour le nombre total de pages basé sur les résultats filtrés
        const newTotalPages = Math.ceil(filteredHotels.length / hotelsPerPage);
        
        // Afficher le message si aucun hôtel ne correspond aux critères
        if (filteredHotels.length === 0) {
            document.getElementById('hotels-list').innerHTML = 
                '<div class="no-results">Aucun hôtel ne correspond à vos critères. Veuillez essayer une autre recherche.</div>';
            document.querySelector('.pagination').innerHTML = '';
            return;
        }
        
        // Afficher la première page des résultats filtrés
        currentPage = 1;
        
        const startIndex = 0;
        const endIndex = Math.min(hotelsPerPage, filteredHotels.length);
        const hotelsToShow = filteredHotels.slice(startIndex, endIndex);
        
        const hotelsList = document.getElementById('hotels-list');
        hotelsList.innerHTML = '';
        
        hotelsToShow.forEach(hotel => {
            hotelsList.innerHTML += generateHotelHTML(hotel);
        });
        
        // Mettre à jour la pagination
        let paginationHTML = '';
        
        // Bouton précédent (désactivé sur la première page)
        paginationHTML += `<a href="#" class="page-link prev disabled"><i class="fas fa-angle-left"></i></a>`;
        
        // Pages numérotées
        for (let i = 1; i <= newTotalPages; i++) {
            paginationHTML += `<a href="#" class="page-link ${i === 1 ? 'active' : ''}" data-page="${i}">${i}</a>`;
        }
        
        // Bouton suivant (si plus d'une page)
        if (newTotalPages > 1) {
            paginationHTML += `<a href="#" class="page-link next" data-page="2"><i class="fas fa-angle-right"></i></a>`;
        } else {
            paginationHTML += `<a href="#" class="page-link next disabled"><i class="fas fa-angle-right"></i></a>`;
        }
        
        document.querySelector('.pagination').innerHTML = paginationHTML;
        
        // Ajouter des écouteurs d'événements aux liens de pagination
        addPaginationEventListeners(filteredHotels);
    });
    
    function addPaginationEventListeners(hotelsArray) {
        document.querySelectorAll('.pagination .page-link:not(.disabled)').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageNumber = parseInt(this.getAttribute('data-page'));
                
                const startIndex = (pageNumber - 1) * hotelsPerPage;
                const endIndex = Math.min(startIndex + hotelsPerPage, hotelsArray.length);
                const hotelsToShow = hotelsArray.slice(startIndex, endIndex);
                
                const hotelsList = document.getElementById('hotels-list');
                hotelsList.innerHTML = '';
                
                hotelsToShow.forEach(hotel => {
                    hotelsList.innerHTML += generateHotelHTML(hotel);
                });
                
                // Mettre à jour la pagination active
                document.querySelectorAll('.pagination .page-link').forEach(pageLink => {
                    pageLink.classList.remove('active');
                });
                this.classList.add('active');
                
                // Mettre à jour les boutons précédent/suivant
                const prevButton = document.querySelector('.pagination .prev');
                const nextButton = document.querySelector('.pagination .next');
                
                if (pageNumber === 1) {
                    prevButton.classList.add('disabled');
                    prevButton.removeAttribute('data-page');
                } else {
                    prevButton.classList.remove('disabled');
                    prevButton.setAttribute('data-page', pageNumber - 1);
                }
                
                if (pageNumber === Math.ceil(hotelsArray.length / hotelsPerPage)) {
                    nextButton.classList.add('disabled');
                    nextButton.removeAttribute('data-page');
                } else {
                    nextButton.classList.remove('disabled');
                    nextButton.setAttribute('data-page', pageNumber + 1);
                }
                
                // Remonter en haut de la liste des hôtels
                document.querySelector('.hotel-listing').scrollIntoView({
                    behavior: 'smooth'
                });
            });
        });
    }
    
    // Initial display
    displayHotelsForPage(currentPage);
});
