// // Main Application JavaScript
// document.addEventListener('DOMContentLoaded', () => {
//   // Initialize the application
//   const app = {
//     apiBaseUrl: 'http://localhost:5000/api',
//     currentUser: null,
//     currentToken: null,
//     isAuthenticated: false,
//     currentRating: 0,
//     currentRideId: null,
//     currentRevieweeId: null,
    
//     // Application data
//     data: {
//       users: [
//         {id: 1, name: "John Driver", email: "john@example.com", phone: "+1234567890", type: "driver", rating: 4.8, rides_completed: 45},
//         {id: 2, name: "Sarah Passenger", email: "sarah@example.com", phone: "+1234567891", type: "passenger", rating: 4.9, rides_completed: 23},
//         {id: 3, name: "Mike Wheeler", email: "mike@example.com", phone: "+1234567892", type: "driver", rating: 4.7, rides_completed: 67},
//         {id: 4, name: "Emma Rider", email: "emma@example.com", phone: "+1234567893", type: "both", rating: 4.6, rides_completed: 34},
//         {id: 5, name: "David Traveler", email: "david@example.com", phone: "+1234567894", type: "passenger", rating: 4.5, rides_completed: 18}
//       ],
//       rides: [
//         {id: 1, driver_id: 1, origin: {lat: 40.7128, lng: -74.0060, address: "Times Square, NYC"}, destination: {lat: 40.7589, lng: -73.9851, address: "Central Park, NYC"}, departure_time: "2025-06-05T08:00:00", available_seats: 3, price_per_seat: 15, status: "available"},
//         {id: 2, driver_id: 3, origin: {lat: 40.7614, lng: -73.9776, address: "Grand Central, NYC"}, destination: {lat: 40.6892, lng: -74.0445, address: "Brooklyn Bridge, NYC"}, departure_time: "2025-06-05T09:30:00", available_seats: 2, price_per_seat: 12, status: "available"},
//         {id: 3, driver_id: 1, origin: {lat: 40.7505, lng: -73.9934, address: "Empire State Building, NYC"}, destination: {lat: 40.7282, lng: -74.0776, address: "Wall Street, NYC"}, departure_time: "2025-06-05T17:00:00", available_seats: 4, price_per_seat: 10, status: "available"},
//         {id: 4, driver_id: 4, origin: {lat: 40.7831, lng: -73.9712, address: "Upper East Side, NYC"}, destination: {lat: 40.7178, lng: -74.0431, address: "Tribeca, NYC"}, departure_time: "2025-06-05T18:30:00", available_seats: 1, price_per_seat: 20, status: "available"}
//       ],
//       ride_requests: [
//         {id: 1, ride_id: 1, passenger_id: 2, status: "pending", requested_at: "2025-06-04T20:30:00"},
//         {id: 2, ride_id: 2, passenger_id: 5, status: "confirmed", requested_at: "2025-06-04T19:15:00"}
//       ],
//       payments: [
//         {id: 1, ride_id: 2, total_amount: 24, split_details: [{user_id: 3, amount: 12}, {user_id: 5, amount: 12}], payment_method: "credit_card", status: "completed"},
//         {id: 2, ride_id: 1, total_amount: 45, split_details: [{user_id: 1, amount: 15}, {user_id: 2, amount: 15}, {user_id: 4, amount: 15}], payment_method: "digital_wallet", status: "pending"}
//       ],
//       reviews: [
//         {id: 1, ride_id: 2, reviewer_id: 5, reviewee_id: 3, rating: 5, comment: "Great driver, very punctual and safe driving!"},
//         {id: 2, ride_id: 2, reviewer_id: 3, reviewee_id: 5, rating: 4, comment: "Pleasant passenger, on time and friendly."}
//       ],
//       locations: [
//         {lat: 40.7128, lng: -74.0060, name: "Times Square", type: "landmark"},
//         {lat: 40.7589, lng: -73.9851, name: "Central Park", type: "park"},
//         {lat: 40.7614, lng: -73.9776, name: "Grand Central", type: "station"},
//         {lat: 40.6892, lng: -74.0445, name: "Brooklyn Bridge", type: "landmark"},
//         {lat: 40.7505, lng: -73.9934, name: "Empire State Building", type: "landmark"},
//         {lat: 40.7282, lng: -74.0776, name: "Wall Street", type: "financial"},
//         {lat: 40.7831, lng: -73.9712, name: "Upper East Side", type: "residential"},
//         {lat: 40.7178, lng: -74.0431, name: "Tribeca", type: "residential"}
//       ]
//     },
    
    
//     // Initialize the application
//     init() {
//       this.checkAuthStatus();
//       this.loadLocationOptions();
//       this.setupEventListeners();
//       this.setupAuthForms();
//       this.setDefaultDates();
//       this.loadLocationOptions();
//       this.setupEventListeners();
//       this.setupAuthForms();
      
//       // Set default date for search and offer forms
//       const tomorrow = new Date();
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const dateString = tomorrow.toISOString().split('T')[0];
//       document.getElementById('searchDate').value = dateString;
//       document.getElementById('offerDate').value = dateString;
//     },
    
//     checkAuthStatus() {
//       const token = localStorage.getItem('jwt_token');
//       if (token) {
//         this.currentToken = token;
//         this.fetchCurrentUser();
//       }
//     },
//     setDefaultDates() {
//       const tomorrow = new Date();
//       tomorrow.setDate(tomorrow.getDate() + 1);
//       const dateString = tomorrow.toISOString().split('T')[0];
//       document.getElementById('searchDate').value = dateString;
//       document.getElementById('offerDate').value = dateString;
//     },
//     // Fetch current user using stored token
//     async fetchCurrentUser() {
//       try {
//         const response = await fetch(`${this.apiBaseUrl}/current_user`, {
//           headers: {
//             'Authorization': `Bearer ${this.currentToken}`
//           }
//         });
        
//         if (!response.ok) throw new Error('Failed to fetch user');
        
//         const userData = await response.json();
//         this.currentUser = userData;
//         this.isAuthenticated = true;
//         this.updateAuthUI();
//       } catch (error) {
//         console.error('Error fetching user:', error);
//         this.logout();
//       }
//     },

//     // Setup all event listeners
//     setupEventListeners() {
//       // Navigation
//       document.querySelectorAll('.nav-link').forEach(link => {
//         link.addEventListener('click', (e) => {
//           e.preventDefault();
//           this.navigateToPage(e.target.dataset.page);
//         });
//       });
      
//       // Mobile navigation
//       document.getElementById('navbarToggle').addEventListener('click', () => {
//         document.querySelector('.navbar-menu').classList.toggle('active');
//       });
      
//       // Authentication
//       document.getElementById('authBtn').addEventListener('click', () => {
//         this.toggleModal('authModal', true);
//       });
      
//       // // Hero action buttons
//       // document.querySelector('[data-action="get-started"]').addEventListener('click', () => {
//       //   this.toggleModal('authModal', true);
//       // });
      
//       // document.querySelector('[data-action="learn-more"]').addEventListener('click', () => {
//       //   this.navigateToPage('find-rides');
//       // });
      
//       document.querySelector('[data-action="get-started"]').addEventListener('click', () => {
//         this.navigateToPage('find-rides');
//       });

//       // Close modals
//       document.querySelectorAll('.modal-close').forEach(closeBtn => {
//         closeBtn.addEventListener('click', () => {
//           const modalId = closeBtn.closest('.modal').id;
//           this.toggleModal(modalId, false);
//         });
//       });
      
//       // Close modals when clicking outside content
//       document.querySelectorAll('.modal').forEach(modal => {
//         modal.addEventListener('click', (e) => {
//           if (e.target === modal) {
//             this.toggleModal(modal.id, false);
//           }
//         });
//       });
      
//       // Search form
//       document.getElementById('searchForm').addEventListener('submit', (e) => {
//         e.preventDefault();
//         this.searchRides();
//       });
      
//       // Offer ride form
//       document.getElementById('offerRideForm').addEventListener('submit', (e) => {
//         e.preventDefault();
//         this.offerRide();
//       });
      
//       // My rides tabs
//       document.querySelectorAll('.tab-btn').forEach(tab => {
//         tab.addEventListener('click', () => {
//           this.changeTab(tab.dataset.tab);
//         });
//       });
      
//       // Profile actions
//       document.getElementById('editProfileBtn').addEventListener('click', () => {
//         this.showToast('Feature coming soon!', 'info');
//       });
      
//       document.getElementById('logoutBtn').addEventListener('click', () => {
//         this.logout();
//       });
      
//       // Payment processing
//       document.getElementById('processPayment').addEventListener('click', () => {
//         this.processPayment();
//       });
      
//       // Review submission
//       document.getElementById('submitReview').addEventListener('click', () => {
//         this.submitReview();
//       });
      
//       // Star rating
//       document.querySelectorAll('.star').forEach(star => {
//         star.addEventListener('click', () => {
//           this.setRating(parseInt(star.dataset.rating));
//         });
//       });
//     },
    
//     // Setup authentication forms
//     setupAuthForms() {
//       // Auth tabs
//       document.querySelectorAll('.auth-tab').forEach(tab => {
//         tab.addEventListener('click', () => {
//           document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
//           tab.classList.add('active');
          
//           document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
//           document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
//         });
//       });
      
//       // Login form
//       document.getElementById('loginForm').addEventListener('submit', (e) => {
//         e.preventDefault();
//         this.login();
//       });
      
//       // Register form
//       document.getElementById('registerForm').addEventListener('submit', (e) => {
//         e.preventDefault();
//         this.register();
//       });
//     },
    
//     // Load location options in dropdowns
//     loadLocationOptions() {
//       const originSelects = document.querySelectorAll('#searchOrigin, #offerOrigin');
//       const destinationSelects = document.querySelectorAll('#searchDestination, #offerDestination');
      
//       this.data.locations.forEach(location => {
//         const option = document.createElement('option');
//         option.value = JSON.stringify({lat: location.lat, lng: location.lng, address: location.name});
//         option.textContent = location.name;
        
//         originSelects.forEach(select => {
//           select.appendChild(option.cloneNode(true));
//         });
        
//         destinationSelects.forEach(select => {
//           select.appendChild(option.cloneNode(true));
//         });
//       });
//     },
    
//     // Navigate to a specific page
//     navigateToPage(pageName) {
//       // Check if authentication is required
//       const securedPages = ['offer-ride', 'my-rides', 'profile'];
//       if (securedPages.includes(pageName) && !this.isAuthenticated) {
//         this.showToast('Please login to access this page', 'warning');
//         this.toggleModal('authModal', true);
//         return;
//       }
      
//       // Hide all pages
//       document.querySelectorAll('.page').forEach(page => {
//         page.classList.remove('active');
//       });
      
//       // Show the selected page
//       document.getElementById(pageName).classList.add('active');
      
//       // Close mobile menu if open
//       document.querySelector('.navbar-menu').classList.remove('active');
      
//       // Update rides if navigating to my-rides
//       if (pageName === 'my-rides' && this.isAuthenticated) {
//         this.updateMyRides('upcoming');
//       }
      
//       // Update profile if navigating to profile
//       if (pageName === 'profile' && this.isAuthenticated) {
//         this.updateProfile();
//       }
//     },
    
//     // Toggle modal visibility
//     toggleModal(modalId, show) {
//       const modal = document.getElementById(modalId);
//       if (show) {
//         modal.classList.add('active');
//       } else {
//         modal.classList.remove('active');
//       }
//     },
    
//     // Change tab in the My Rides section
//     changeTab(tabName) {
//       // Update tab buttons
//       document.querySelectorAll('.tab-btn').forEach(tab => {
//         tab.classList.remove('active');
//       });
//       document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
      
//       // Update rides content
//       this.updateMyRides(tabName);
//     },
    
//     // // Login handler
//     // login() {
//     //   this.showLoading(true);
      
//     //   const email = document.getElementById('loginEmail').value;
//     //   const password = document.getElementById('loginPassword').value;
      
//     //   // Simulate API call
//     //   setTimeout(() => {
//     //     const user = this.data.users.find(u => u.email === email);
        
//     //     if (user) {
//     //       this.currentUser = user;
//     //       this.isAuthenticated = true;
//     //       this.updateAuthUI();
//     //       this.toggleModal('authModal', false);
//     //       this.showToast('Login successful!', 'success');
//     //       this.navigateToPage('home');
//     //     } else {
//     //       this.showToast('Invalid email or password', 'error');
//     //     }
        
//     //     // this.showLoading(false);
//     //   }, 1000);
//     // },
    
//     // // Register handler
//     // register() {
//     //   // this.showLoading(true);
      
//     //   const name = document.getElementById('registerName').value;
//     //   const email = document.getElementById('registerEmail').value;
//     //   const phone = document.getElementById('registerPhone').value;
//     //   const password = document.getElementById('registerPassword').value;
//     //   const type = document.getElementById('userType').value;
      
//     //   // Simulate API call
//     //   setTimeout(() => {
//     //     // Check if email already exists
//     //     if (this.data.users.some(u => u.email === email)) {
//     //       this.showToast('Email already in use', 'error');
//     //       // this.showLoading(false);
//     //       return;
//     //     }
        
//     //     // Create new user
//     //     const newUser = {
//     //       id: this.data.users.length + 1,
//     //       name,
//     //       email,
//     //       phone,
//     //       type,
//     //       rating: 0,
//     //       rides_completed: 0
//     //     };
        
//     //     this.data.users.push(newUser);
//     //     this.currentUser = newUser;
//     //     this.isAuthenticated = true;
//     //     this.updateAuthUI();
//     //     this.toggleModal('authModal', false);
//     //     this.showToast('Registration successful!', 'success');
//     //     this.navigateToPage('home');
//     //     // this.showLoading(false);
//     //   }, 1500);
//     // },
//     // Login handler
//     async login() {
//       const email = document.getElementById('loginEmail').value;
//       const password = document.getElementById('loginPassword').value;
      
//       try {
//         const response = await fetch(`${this.apiBaseUrl}/login`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email, password })
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Login failed');
//         }
        
//         const data = await response.json();
//         this.currentToken = data.access_token;
//         localStorage.setItem('jwt_token', this.currentToken);
//         this.currentUser = data.user;
//         this.isAuthenticated = true;
        
//         this.updateAuthUI();
//         this.toggleModal('authModal', false);
//         this.showToast('Login successful!', 'success');
//         this.navigateToPage('home');
//       } catch (error) {
//         this.showToast(error.message || 'Login failed', 'error');
//       }
//     },

//     // Register handler
//     async register() {
//       const name = document.getElementById('registerName').value;
//       const email = document.getElementById('registerEmail').value;
//       const phone = document.getElementById('registerPhone').value;
//       const password = document.getElementById('registerPassword').value;
//       // const type = document.getElementById('userType').value;
      
//       try {
//         const response = await fetch(`${this.apiBaseUrl}/register`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ name, email, phone, password})
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Registration failed');
//         }
        
//         const data = await response.json();
//         this.currentToken = data.access_token;
//         localStorage.setItem('jwt_token', this.currentToken);
//         this.currentUser = data.user;
//         this.isAuthenticated = true;
        
//         this.updateAuthUI();
//         this.toggleModal('authModal', false);
//         this.showToast('Registration successful!', 'success');
//         this.navigateToPage('home');
//       } catch (error) {
//         this.showToast(error.message || 'Registration failed', 'error');
//       }
//     },
    
//     // Logout handler
//     logout() {
//       this.currentUser = null;
//       this.isAuthenticated = false;
//       this.updateAuthUI();
//       this.navigateToPage('home');
//       this.showToast('Logged out successfully', 'success');
//     },
    
//     // Update UI based on authentication state
//     updateAuthUI() {
//       const authBtn = document.getElementById('authBtn');
//       if (this.isAuthenticated) {
//         authBtn.textContent = `${this.currentUser.name}`;
//       } else {
//         authBtn.textContent = 'Login';
//       }
//     },
    
//     // Update profile page
//     updateProfile() {
//       if (!this.isAuthenticated) return;
//       document.getElementById('profileInitials').textContent = this.currentUser.name[0];
//       document.getElementById('profileName').textContent = this.currentUser.name;
//       document.getElementById('profileEmail').textContent = this.currentUser.email;
//       document.getElementById('profileRating').textContent = this.currentUser.rating.toFixed(1);
//       document.getElementById('profileRides').textContent = this.currentUser.rides_completed;
//       document.getElementById('profileInitials').textContent = this.getInitials(this.currentUser.name);
//     },
    
//     // Search for rides
//     async searchRides() {
//       // this.showLoading(true);
      
//       const originStr = document.getElementById('searchOrigin').value;
//       const destinationStr = document.getElementById('searchDestination').value;
//       const date = document.getElementById('searchDate').value;
      
//       if (!originStr || !destinationStr || !date) {
//         this.showToast('Please fill out all search fields', 'warning');
//         // this.showLoading(false);
//         return;
//       }
      
//       const origin = JSON.parse(originStr);
//       const destination = JSON.parse(destinationStr);
      
//       try {
//         const params = new URLSearchParams({
//           origin_id: origin.id,
//           destination_id: destination.id,
//           date: date
//         });
        
//         const response = await fetch(`${this.apiBaseUrl}/rides?${params}`, {
//           headers: {
//             'Authorization': `Bearer ${this.currentToken}`
//           }
//         });
        
//         if (!response.ok) {
//           const errorData = await response.json();
//           throw new Error(errorData.message || 'Search failed');
//         }
        
//         const rides = await response.json();
//         this.displayRideResults(rides);
//       } catch (error) {
//         this.showToast(error.message || 'Failed to search rides', 'error');
//       }


//       // Simulate API call to search for rides
//       setTimeout(() => {
//         // Filter rides based on search criteria
//         const searchDate = new Date(date);
//         const matchingRides = this.data.rides.filter(ride => {
//           const rideDate = new Date(ride.departure_time);
//           return rideDate.toDateString() === searchDate.toDateString() &&
//                  this.isNearby(ride.origin, origin) &&
//                  ride.destination.address === destination.address &&
//                  ride.status === 'available' &&
//                  ride.available_seats > 0;
//         });
        
//         const resultsContainer = document.getElementById('searchResults');
        
//         if (matchingRides.length === 0) {
//           resultsContainer.innerHTML = `
//             <div class="no-results">
//               <p>No rides found for your search criteria.</p>
//               <button class="btn btn--secondary mt-8" id="modifySearch">Modify Search</button>
//             </div>
//           `;
          
//           document.getElementById('modifySearch').addEventListener('click', () => {
//             document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth' });
//           });
//         } else {
//           resultsContainer.innerHTML = '';
          
//           matchingRides.forEach(ride => {
//             const driver = this.data.users.find(u => u.id === ride.driver_id);
//             const departureTime = new Date(ride.departure_time);
//             const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
//             const rideCard = document.createElement('div');
//             rideCard.className = 'ride-card';
//             rideCard.innerHTML = `
//               <div class="ride-header">
//                 <div class="ride-route">
//                   <h4>${ride.origin.address} → ${ride.destination.address}</h4>
//                   <div class="route-info">
//                     <span>${formattedTime}</span> • 
//                     <span>${this.calculateDistance(ride.origin, ride.destination).toFixed(1)} miles</span>
//                   </div>
//                 </div>
//                 <div class="ride-price">
//                   <div class="price">$${ride.price_per_seat}</div>
//                   <div class="price-per-seat">per seat</div>
//                 </div>
//               </div>
              
//               <div class="driver-info">
//                 <div class="driver-avatar">${this.getInitials(driver.name)}</div>
//                 <div class="driver-details">
//                   <h5>${driver.name}</h5>
//                   <div class="driver-rating">⭐ ${driver.rating.toFixed(1)} • ${driver.rides_completed} rides</div>
//                 </div>
//               </div>
              
//               <div class="ride-details-row">
//                 <div class="detail-item">
//                   <div class="detail-label">Seats</div>
//                   <div class="detail-value">${ride.available_seats} available</div>
//                 </div>
//                 <div class="detail-item">
//                   <div class="detail-label">Pickup</div>
//                   <div class="detail-value">< 500m away</div>
//                 </div>
//                 <div class="detail-item">
//                   <div class="detail-label">Status</div>
//                   <div class="detail-value">${ride.status}</div>
//                 </div>
//               </div>
              
//               <div class="ride-actions">
//                 <button class="btn btn--outline" data-action="details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--primary" data-action="request" data-ride-id="${ride.id}">Request Ride</button>
//               </div>
//             `;
            
//             resultsContainer.appendChild(rideCard);
//           });
          
//           // Add event listeners to ride action buttons
//           document.querySelectorAll('[data-action="details"]').forEach(btn => {
//             btn.addEventListener('click', () => {
//               this.viewRideDetails(btn.dataset.rideId);
//             });
//           });
          
//           document.querySelectorAll('[data-action="request"]').forEach(btn => {
//             btn.addEventListener('click', () => {
//               this.requestRide(btn.dataset.rideId);
//             });
//           });
//         }
        
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // Offer a new ride
//     offerRide() {
//       if (!this.isAuthenticated) {
//         this.showToast('Please login to offer a ride', 'warning');
//         this.toggleModal('authModal', true);
//         return;
//       }
      
//       // if (this.currentUser.type !== 'driver' && this.currentUser.type !== 'both') {
//       //   this.showToast('Your account is not registered as a driver', 'warning');
//       //   return;
//       // }
      
//       // this.showLoading(true);
      
//       const originStr = document.getElementById('offerOrigin').value;
//       const destinationStr = document.getElementById('offerDestination').value;
//       const date = document.getElementById('offerDate').value;
//       const time = document.getElementById('offerTime').value;
//       const seats = document.getElementById('offerSeats').value;
//       // const price = document.getElementById('offerPrice').value;
      
//       if (!originStr || !destinationStr || !date || !time || !seats ) {
//         this.showToast('Please fill out all ride details', 'warning');
//         // this.showLoading(false);
//         return;
//       }
      
//       const origin = JSON.parse(originStr);
//       const destination = JSON.parse(destinationStr);
//       const departureTime = `${date}T${time}:00`;
      
//       // Simulate API call to create a new ride
//       setTimeout(() => {
//         // Create new ride
//         const newRide = {
//           id: this.data.rides.length + 1,
//           driver_id: this.currentUser.id,
//           origin,
//           destination,
//           departure_time: departureTime,
//           available_seats: parseInt(seats),
//           price_per_seat: parseInt(price),
//           status: 'available'
//         };
        
//         this.data.rides.push(newRide);
        
//         // Reset form
//         document.getElementById('offerRideForm').reset();
        
//         this.showToast('Ride posted successfully!', 'success');
//         this.navigateToPage('my-rides');
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // View ride details
//     viewRideDetails(rideId) {
//       const ride = this.data.rides.find(r => r.id == rideId);
//       if (!ride) return;
      
//       const driver = this.data.users.find(u => u.id === ride.driver_id);
//       const departureTime = new Date(ride.departure_time);
//       const formattedDate = departureTime.toLocaleDateString();
//       const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
//       const rideDetails = document.getElementById('rideDetails');
//       rideDetails.innerHTML = `
//         <h3>Ride Details</h3>
        
//         <div class="route-map">
//           <div class="route-line">
//             <div class="route-dot start"></div>
//             <div class="route-path"></div>
//             <div class="route-dot end"></div>
//           </div>
//           <div class="route-addresses">
//             <div class="address">
//               <div class="address-label">From</div>
//               <div class="address-value">${ride.origin.address}</div>
//             </div>
//             <div class="address">
//               <div class="address-label">To</div>
//               <div class="address-value">${ride.destination.address}</div>
//             </div>
//           </div>
//         </div>
        
//         <div class="ride-details-grid">
//           <div class="detail-item">
//             <div class="detail-label">Date</div>
//             <div class="detail-value">${formattedDate}</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Time</div>
//             <div class="detail-value">${formattedTime}</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Price</div>
//             <div class="detail-value">$${ride.price_per_seat} per seat</div>
//           </div>
//           <div class="detail-item">
//             <div class="detail-label">Available Seats</div>
//             <div class="detail-value">${ride.available_seats}</div>
//           </div>
//         </div>
        
//         <div class="driver-details-section">
//           <h4>Driver Information</h4>
//           <div class="driver-info">
//             <div class="driver-avatar">${this.getInitials(driver.name)}</div>
//             <div class="driver-details">
//               <h5>${driver.name}</h5>
//               <div class="driver-contact">${driver.phone}</div>
//               <div class="driver-rating">⭐ ${driver.rating.toFixed(1)} • ${driver.rides_completed} rides</div>
//             </div>
//           </div>
//         </div>
        
//         <div class="ride-actions">
//           <button class="btn btn--outline" id="closeRideDetails">Close</button>
//           <button class="btn btn--primary" id="requestRideBtn">Request Ride</button>
//         </div>
//       `;
      
//       document.getElementById('closeRideDetails').addEventListener('click', () => {
//         this.toggleModal('rideModal', false);
//       });
      
//       document.getElementById('requestRideBtn').addEventListener('click', () => {
//         this.toggleModal('rideModal', false);
//         this.requestRide(rideId);
//       });
      
//       this.toggleModal('rideModal', true);
//     },
    
//     // Request a ride
//     requestRide(rideId) {
//       if (!this.isAuthenticated) {
//         this.showToast('Please login to request a ride', 'warning');
//         this.toggleModal('authModal', true);
//         return;
//       }
      
//       // this.showLoading(true);
      
//       // Simulate API call to request a ride
//       setTimeout(() => {
//         const ride = this.data.rides.find(r => r.id == rideId);
        
//         // Check if already requested
//         const existingRequest = this.data.ride_requests.find(
//           req => req.ride_id == rideId && req.passenger_id === this.currentUser.id
//         );
        
//         if (existingRequest) {
//           this.showToast('You have already requested this ride', 'info');
//           // this.showLoading(false);
//           return;
//         }
        
//         // Create new request
//         const newRequest = {
//           id: this.data.ride_requests.length + 1,
//           ride_id: parseInt(rideId),
//           passenger_id: this.currentUser.id,
//           status: 'pending',
//           requested_at: new Date().toISOString()
//         };
        
//         this.data.ride_requests.push(newRequest);
        
//         this.showToast('Ride requested successfully! Waiting for driver confirmation.', 'success');
//         this.navigateToPage('my-rides');
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // Update My Rides page based on selected tab
//     updateMyRides(tabName) {
//       if (!this.isAuthenticated) return;
      
//       const ridesContent = document.getElementById('ridesContent');
      
//       // Filter rides based on tab
//       let filteredRides = [];
      
//       if (tabName === 'upcoming') {
//         // Get rides where user is a passenger with pending or confirmed status
//         const userRequests = this.data.ride_requests.filter(
//           req => req.passenger_id === this.currentUser.id && 
//                 (req.status === 'pending' || req.status === 'confirmed')
//         );
        
//         filteredRides = userRequests.map(req => {
//           const ride = this.data.rides.find(r => r.id === req.ride_id);
//           return {
//             ...ride,
//             request_status: req.status,
//             request_id: req.id
//           };
//         });
//       } else if (tabName === 'completed') {
//         // Get completed rides
//         const userRequests = this.data.ride_requests.filter(
//           req => req.passenger_id === this.currentUser.id && req.status === 'completed'
//         );
        
//         filteredRides = userRequests.map(req => {
//           const ride = this.data.rides.find(r => r.id === req.ride_id);
//           return {
//             ...ride,
//             request_status: 'completed',
//             request_id: req.id
//           };
//         });
//       } else if (tabName === 'offered') {
//         // Get rides offered by the user
//         filteredRides = this.data.rides.filter(ride => ride.driver_id === this.currentUser.id);
//       }
      
//       if (filteredRides.length === 0) {
//         ridesContent.innerHTML = `
//           <div class="no-rides">
//             <p>No ${tabName} rides found.</p>
//             ${tabName === 'offered' ? 
//               '<button class="btn btn--primary mt-8" id="offerNewRide">Offer a New Ride</button>' : 
//               '<button class="btn btn--primary mt-8" id="findRides">Find Rides</button>'}
//           </div>
//         `;
        
//         if (tabName === 'offered') {
//           document.getElementById('offerNewRide').addEventListener('click', () => {
//             this.navigateToPage('offer-ride');
//           });
//         } else {
//           document.getElementById('findRides').addEventListener('click', () => {
//             this.navigateToPage('find-rides');
//           });
//         }
//       } else {
//         ridesContent.innerHTML = '';
        
//         filteredRides.forEach(ride => {
//           const driver = this.data.users.find(u => u.id === ride.driver_id);
//           const departureTime = new Date(ride.departure_time);
//           const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//           const formattedDate = departureTime.toLocaleDateString();
          
//           const rideCard = document.createElement('div');
//           rideCard.className = 'ride-card';
          
//           let actionButtons = '';
          
//           if (tabName === 'upcoming') {
//             if (ride.request_status === 'pending') {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="cancel-request" data-request-id="${ride.request_id}">Cancel Request</button>
//               `;
//             } else if (ride.request_status === 'confirmed') {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--primary" data-action="view-payment" data-ride-id="${ride.id}">Payment</button>
//               `;
//             }
//           } else if (tabName === 'completed') {
//             // Check if user has already reviewed this ride
//             const hasReviewed = this.data.reviews.some(
//               rev => rev.ride_id === ride.id && rev.reviewer_id === this.currentUser.id
//             );
            
//             if (!hasReviewed) {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--primary" data-action="leave-review" data-ride-id="${ride.id}" data-reviewee-id="${ride.driver_id}">Leave Review</button>
//               `;
//             } else {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--secondary" disabled>Reviewed</button>
//               `;
//             }
//           } else if (tabName === 'offered') {
//             // Get pending requests for this ride
//             const pendingRequests = this.data.ride_requests.filter(
//               req => req.ride_id === ride.id && req.status === 'pending'
//             );
            
//             if (pendingRequests.length > 0) {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--primary" data-action="view-requests" data-ride-id="${ride.id}">View Requests (${pendingRequests.length})</button>
//               `;
//             } else {
//               actionButtons = `
//                 <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
//                 <button class="btn btn--secondary" disabled>No Requests</button>
//               `;
//             }
//           }
          
//           rideCard.innerHTML = `
//             <div class="ride-header">
//               <div class="ride-route">
//                 <h4>${ride.origin.address} → ${ride.destination.address}</h4>
//                 <div class="route-info">
//                   <span>${formattedDate} at ${formattedTime}</span> • 
//                   <span>${this.calculateDistance(ride.origin, ride.destination).toFixed(1)} miles</span>
//                 </div>
//               </div>
//               <div class="ride-price">
//                 <div class="price">$${ride.price_per_seat}</div>
//                 <div class="price-per-seat">per seat</div>
//               </div>
//             </div>
            
//             <div class="driver-info">
//               <div class="driver-avatar">${this.getInitials(driver.name)}</div>
//               <div class="driver-details">
//                 <h5>${driver.name}</h5>
//                 <div class="driver-rating">⭐ ${driver.rating.toFixed(1)} • ${driver.rides_completed} rides</div>
//               </div>
//             </div>
            
//             <div class="ride-details-row">
//               <div class="detail-item">
//                 <div class="detail-label">Seats</div>
//                 <div class="detail-value">${ride.available_seats} available</div>
//               </div>
//               <div class="detail-item">
//                 <div class="detail-label">Status</div>
//                 <div class="detail-value">${tabName === 'upcoming' ? ride.request_status : ride.status}</div>
//               </div>
//             </div>
            
//             <div class="ride-actions">
//               ${actionButtons}
//             </div>
//           `;
          
//           ridesContent.appendChild(rideCard);
//         });
        
//         // Add event listeners to ride action buttons
//         document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
//           btn.addEventListener('click', () => {
//             this.viewRideDetails(btn.dataset.rideId);
//           });
//         });
        
//         document.querySelectorAll('[data-action="cancel-request"]').forEach(btn => {
//           btn.addEventListener('click', () => {
//             this.cancelRequest(btn.dataset.requestId);
//           });
//         });
        
//         document.querySelectorAll('[data-action="view-payment"]').forEach(btn => {
//           btn.addEventListener('click', () => {
//             this.viewPayment(btn.dataset.rideId);
//           });
//         });
        
//         document.querySelectorAll('[data-action="leave-review"]').forEach(btn => {
//           btn.addEventListener('click', () => {
//             this.leaveReview(btn.dataset.rideId, btn.dataset.revieweeId);
//           });
//         });
        
//         document.querySelectorAll('[data-action="view-requests"]').forEach(btn => {
//           btn.addEventListener('click', () => {
//             this.viewRequests(btn.dataset.rideId);
//           });
//         });
//       }
//     },
    
//     // Cancel a ride request
//     cancelRequest(requestId) {
//       // this.showLoading(true);
      
//       // Simulate API call to cancel request
//       setTimeout(() => {
//         const requestIndex = this.data.ride_requests.findIndex(req => req.id == requestId);
        
//         if (requestIndex !== -1) {
//           this.data.ride_requests.splice(requestIndex, 1);
//           this.showToast('Ride request cancelled successfully', 'success');
//           this.updateMyRides('upcoming');
//         } else {
//           this.showToast('Error cancelling request', 'error');
//         }
        
//         // this.showLoading(false);
//       }, 1000);
//     },
    
//     // View payment details for a ride
//     viewPayment(rideId) {
//       const ride = this.data.rides.find(r => r.id == rideId);
//       if (!ride) return;
      
//       const payment = this.data.payments.find(p => p.ride_id == rideId);
//       const driver = this.data.users.find(u => u.id === ride.driver_id);
      
//       const paymentDetails = document.getElementById('paymentDetails');
//       const paymentBreakdown = document.getElementById('paymentBreakdown');
      
//       paymentBreakdown.innerHTML = `
//         <div class="payment-breakdown">
//           <div class="payment-row">
//             <span>Ride fare (1 seat)</span>
//             <span>$${ride.price_per_seat}</span>
//           </div>
//           <div class="payment-row">
//             <span>Service fee</span>
//             <span>$2.00</span>
//           </div>
//           <div class="payment-row total">
//             <span>Total</span>
//             <span>$${ride.price_per_seat + 2}</span>
//           </div>
//         </div>
//       `;
      
//       document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
//         if (payment && input.value === payment.payment_method) {
//           input.checked = true;
//         }
//       });
      
//       this.toggleModal('paymentModal', true);
//     },
    
//     // Process payment for a ride
//     processPayment() {
//       // this.showLoading(true);
      
//       const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
      
//       // Simulate API call to process payment
//       setTimeout(() => {
//         this.showToast('Payment processed successfully!', 'success');
//         this.toggleModal('paymentModal', false);
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // Leave a review for a driver or passenger
//     leaveReview(rideId, revieweeId) {
//       this.currentRideId = rideId;
//       this.currentRevieweeId = revieweeId;
      
//       const reviewee = this.data.users.find(u => u.id == revieweeId);
//       document.getElementById('revieweeName').textContent = reviewee.name;
      
//       // Reset stars
//       this.setRating(0);
//       document.getElementById('reviewComment').value = '';
      
//       this.toggleModal('reviewModal', true);
//     },
    
//     // Submit a review
//     submitReview() {
//       if (this.currentRating === 0) {
//         this.showToast('Please select a rating', 'warning');
//         return;
//       }
      
//       // this.showLoading(true);
      
//       const comment = document.getElementById('reviewComment').value;
      
//       // Simulate API call to submit review
//       setTimeout(() => {
//         const newReview = {
//           id: this.data.reviews.length + 1,
//           ride_id: this.currentRideId,
//           reviewer_id: this.currentUser.id,
//           reviewee_id: this.currentRevieweeId,
//           rating: this.currentRating,
//           comment: comment
//         };
        
//         this.data.reviews.push(newReview);
        
//         // Update reviewee's rating
//         const reviewee = this.data.users.find(u => u.id == this.currentRevieweeId);
//         const revieweeReviews = this.data.reviews.filter(r => r.reviewee_id == this.currentRevieweeId);
//         const totalRating = revieweeReviews.reduce((sum, r) => sum + r.rating, 0);
//         reviewee.rating = totalRating / revieweeReviews.length;
        
//         this.showToast('Review submitted successfully!', 'success');
//         this.toggleModal('reviewModal', false);
//         this.updateMyRides('completed');
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // Set rating for review
//     setRating(rating) {
//       this.currentRating = rating;
      
//       const stars = document.querySelectorAll('.star');
//       stars.forEach((star, index) => {
//         if (index < rating) {
//           star.classList.add('active');
//         } else {
//           star.classList.remove('active');
//         }
//       });
//     },
    
//     // View ride requests (for drivers)
//     viewRequests(rideId) {
//       const ride = this.data.rides.find(r => r.id == rideId);
//       if (!ride) return;
      
//       const requests = this.data.ride_requests.filter(req => req.ride_id == rideId && req.status === 'pending');
      
//       const rideDetails = document.getElementById('rideDetails');
//       rideDetails.innerHTML = `
//         <h3>Ride Requests</h3>
        
//         <div class="ride-info">
//           <h4>${ride.origin.address} → ${ride.destination.address}</h4>
//           <p>Departure: ${new Date(ride.departure_time).toLocaleString()}</p>
//         </div>
        
//         <div class="requests-list">
//           ${requests.length > 0 ? '' : '<p>No pending requests for this ride.</p>'}
//         </div>
//       `;
      
//       const requestsList = rideDetails.querySelector('.requests-list');
      
//       requests.forEach(request => {
//         const passenger = this.data.users.find(u => u.id === request.passenger_id);
//         const requestItem = document.createElement('div');
//         requestItem.className = 'request-item';
//         requestItem.innerHTML = `
//           <div class="passenger-info">
//             <div class="passenger-avatar">${this.getInitials(passenger.name)}</div>
//             <div class="passenger-details">
//               <h5>${passenger.name}</h5>
//               <div class="passenger-rating">⭐ ${passenger.rating.toFixed(1)} • ${passenger.rides_completed} rides</div>
//             </div>
//           </div>
          
//           <div class="request-actions">
//             <button class="btn btn--outline" data-action="reject" data-request-id="${request.id}">Reject</button>
//             <button class="btn btn--primary" data-action="accept" data-request-id="${request.id}">Accept</button>
//           </div>
//         `;
        
//         requestsList.appendChild(requestItem);
//       });
      
//       document.querySelectorAll('[data-action="accept"]').forEach(btn => {
//         btn.addEventListener('click', () => {
//           this.respondToRequest(btn.dataset.requestId, 'confirmed');
//         });
//       });
      
//       document.querySelectorAll('[data-action="reject"]').forEach(btn => {
//         btn.addEventListener('click', () => {
//           this.respondToRequest(btn.dataset.requestId, 'rejected');
//         });
//       });
      
//       this.toggleModal('rideModal', true);
//     },
    
//     // Respond to ride request (accept/reject)
//     respondToRequest(requestId, status) {
//       // this.showLoading(true);
      
//       // Simulate API call to respond to request
//       setTimeout(() => {
//         const request = this.data.ride_requests.find(req => req.id == requestId);
//         if (request) {
//           request.status = status;
          
//           if (status === 'confirmed') {
//             // Update available seats
//             const ride = this.data.rides.find(r => r.id === request.ride_id);
//             if (ride) {
//               ride.available_seats -= 1;
//             }
            
//             // Create payment record if it doesn't exist
//             const existingPayment = this.data.payments.find(p => p.ride_id === request.ride_id);
//             if (!existingPayment) {
//               const ride = this.data.rides.find(r => r.id === request.ride_id);
//               const newPayment = {
//                 id: this.data.payments.length + 1,
//                 ride_id: request.ride_id,
//                 total_amount: ride.price_per_seat,
//                 split_details: [
//                   { user_id: this.currentUser.id, amount: 0 },
//                   { user_id: request.passenger_id, amount: ride.price_per_seat }
//                 ],
//                 payment_method: 'credit_card',
//                 status: 'pending'
//               };
              
//               this.data.payments.push(newPayment);
//             }
            
//             this.showToast('Request accepted! Passenger has been notified.', 'success');
//           } else {
//             this.showToast('Request rejected.', 'info');
//           }
          
//           this.toggleModal('rideModal', false);
//           this.updateMyRides('offered');
//         }
        
//         // this.showLoading(false);
//       }, 1500);
//     },
    
//     // Show loading spinner
//     // // showLoading(show) {
//     //   const spinner = document.getElementById('loadingSpinner');
//     //   if (show) {
//     //     spinner.classList.remove('hidden');
//     //   } else {
//     //     spinner.classList.add('hidden');
//     //   }
//     // },
    
//     // Show toast notification
//     showToast(message, type = 'info') {
//       const toastContainer = document.getElementById('toastContainer');
//       const toast = document.createElement('div');
//       toast.className = `toast ${type}`;
//       toast.textContent = message;
      
//       toastContainer.appendChild(toast);
      
//       // Auto remove after 3 seconds
//       setTimeout(() => {
//         toast.style.opacity = '0';
//         setTimeout(() => {
//           toastContainer.removeChild(toast);
//         }, 300);
//       }, 3000);
//     },
    
//     // Helper function to get initials from name
//     getInitials(name) {
//       return name
//         .split(' ')
//         .map(part => part.charAt(0))
//         .join('')
//         .toUpperCase();
//     },
    
//     // Check if locations are within 500m of each other
//     isNearby(loc1, loc2) {
//       // Simple distance calculation for demonstration
//       const distance = this.calculateDistance(loc1, loc2);
//       // 0.3 miles is approximately 500m
//       return distance <= 0.3;
//     },
    
//     // Calculate distance between two points (simplified for demo)
//     calculateDistance(loc1, loc2) {
//       // Using Euclidean distance for simplicity
//       const latDiff = loc1.lat - loc2.lat;
//       const lngDiff = loc1.lng - loc2.lng;
      
//       // Scale factor to approximate miles (simplified)
//       return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69;
//     }
//   };
  
//   // Initialize the application
//   app.init();
// });

// Main Application JavaScript
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the application
  const app = {
    apiBaseUrl: 'http://10.113.21.159:5000/api',
    currentUser: null,
    currentToken: null,
    isAuthenticated: false,
    currentRating: 0,
    currentRideId: null,
    currentRevieweeId: null,
    
    // Initialize the application
    init() {
      this.checkAuthStatus();
      this.setupEventListeners();
      this.setupAuthForms();
      this.setDefaultDates();
      this.loadLocationOptions();
    },
    
    checkAuthStatus() {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        this.currentToken = token;
        this.fetchCurrentUser();
      }
    },
    
    setDefaultDates() {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      document.getElementById('searchDate').value = dateString;
      document.getElementById('offerDate').value = dateString;
    },
    
    // Fetch current user using stored token
    async fetchCurrentUser() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/current_user`, {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch user');
        
        const userData = await response.json();
        this.currentUser = userData;
        this.isAuthenticated = true;
        this.updateAuthUI();
      } catch (error) {
        console.error('Error fetching user:', error);
        this.logout();
      }
    },

    // Setup all event listeners
    setupEventListeners() {
      // Navigation
      document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          this.navigateToPage(e.target.dataset.page);
        });
      });
      
      // Mobile navigation
      document.getElementById('navbarToggle').addEventListener('click', () => {
        document.querySelector('.navbar-menu').classList.toggle('active');
      });
      
      // Authentication
      document.getElementById('authBtn').addEventListener('click', () => {
        this.toggleModal('authModal', true);
      });
      
      document.querySelector('[data-action="get-started"]').addEventListener('click', () => {
        this.navigateToPage('find-rides');
      });

      // Close modals
      document.querySelectorAll('.modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
          const modalId = closeBtn.closest('.modal').id;
          this.toggleModal(modalId, false);
        });
      });
      
      // Close modals when clicking outside content
      document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.toggleModal(modal.id, false);
          }
        });
      });
      
      // Search form
      document.getElementById('searchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.searchRides();
      });
      
      // Offer ride form
      document.getElementById('offerRideForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.offerRide();
      });
      
      // My rides tabs
      document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
          this.changeTab(tab.dataset.tab);
        });
      });
      
      // Profile actions
      document.getElementById('editProfileBtn').addEventListener('click', () => {
        this.showToast('Feature coming soon!', 'info');
      });
      
      document.getElementById('logoutBtn').addEventListener('click', () => {
        this.logout();
      });
      
      // Payment processing
      document.getElementById('processPayment').addEventListener('click', () => {
        this.processPayment();
      });
      
      // Review submission
      document.getElementById('submitReview').addEventListener('click', () => {
        this.submitReview();
      });
      
      // Star rating
      document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', () => {
          this.setRating(parseInt(star.dataset.rating));
        });
      });
    },
    
    // Setup authentication forms
    setupAuthForms() {
      // Auth tabs
      document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
          document.getElementById(`${tab.dataset.tab}Form`).classList.add('active');
        });
      });
      
      // Login form
      document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.login();
      });
      
      // Register form
      document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        this.register();
      });
    },
    
    // Load location options from API
    async loadLocationOptions() {
      try {
        const response = await fetch(`${this.apiBaseUrl}/locations`);
        if (!response.ok) throw new Error('Failed to load locations');
        
        const locations = await response.json();
        const originSelects = document.querySelectorAll('#searchOrigin, #offerOrigin');
        const destinationSelects = document.querySelectorAll('#searchDestination, #offerDestination');
        
        // Clear existing options
        originSelects.forEach(select => select.innerHTML = '');
        destinationSelects.forEach(select => select.innerHTML = '');
        
        locations.forEach(location => {
          const option = document.createElement('option');
          option.value = JSON.stringify({lat: location.lat, lng: location.lng, address: location.name});
          option.textContent = location.name;
          
          originSelects.forEach(select => {
            select.appendChild(option.cloneNode(true));
          });
          
          destinationSelects.forEach(select => {
            select.appendChild(option.cloneNode(true));
          });
        });
      } catch (error) {
        this.showToast('Failed to load locations', 'error');
        console.error('Error loading locations:', error);
      }
    },
    
    // Navigate to a specific page
    navigateToPage(pageName) {
      // Check if authentication is required
      const securedPages = ['offer-ride', 'my-rides', 'profile'];
      if (securedPages.includes(pageName) && !this.isAuthenticated) {
        this.showToast('Please login to access this page', 'warning');
        this.toggleModal('authModal', true);
        return;
      }
      
      // Hide all pages
      document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
      });
      
      // Show the selected page
      document.getElementById(pageName).classList.add('active');
      
      // Close mobile menu if open
      document.querySelector('.navbar-menu').classList.remove('active');
      
      // Update rides if navigating to my-rides
      if (pageName === 'my-rides' && this.isAuthenticated) {
        this.updateMyRides('upcoming');
      }
      
      // Update profile if navigating to profile
      if (pageName === 'profile' && this.isAuthenticated) {
        this.updateProfile();
      }
    },
    
    // Toggle modal visibility
    toggleModal(modalId, show) {
      const modal = document.getElementById(modalId);
      if (show) {
        modal.classList.add('active');
      } else {
        modal.classList.remove('active');
      }
    },
    
    // Change tab in the My Rides section
    changeTab(tabName) {
      // Update tab buttons
      document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
      
      // Update rides content
      this.updateMyRides(tabName);
    },
    
    // Login handler
    async login() {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
        
        const data = await response.json();
        this.currentToken = data.access_token;
        localStorage.setItem('jwt_token', this.currentToken);
        this.currentUser = data.user;
        this.isAuthenticated = true;
        
        this.updateAuthUI();
        this.toggleModal('authModal', false);
        this.showToast('Login successful!', 'success');
        this.navigateToPage('home');
      } catch (error) {
        this.showToast(error.message || 'Login failed', 'error');
      }
    },

    // Register handler
    async register() {
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const phone = document.getElementById('registerPhone').value;
      const password = document.getElementById('registerPassword').value;
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Registration failed');
        }
        
        const data = await response.json();
        this.currentToken = data.access_token;
        localStorage.setItem('jwt_token', this.currentToken);
        this.currentUser = data.user;
        this.isAuthenticated = true;
        
        this.updateAuthUI();
        this.toggleModal('authModal', false);
        this.showToast('Registration successful!', 'success');
        this.navigateToPage('home');
      } catch (error) {
        this.showToast(error.message || 'Registration failed', 'error');
      }
    },
    
    // Logout handler
    logout() {
      this.currentUser = null;
      this.currentToken = null;
      this.isAuthenticated = false;
      localStorage.removeItem('jwt_token');
      this.updateAuthUI();
      this.navigateToPage('home');
      this.showToast('Logged out successfully', 'success');
    },
    
    // Update UI based on authentication state
    updateAuthUI() {
      const authBtn = document.getElementById('authBtn');
      if (this.isAuthenticated) {
        authBtn.textContent = `${this.currentUser.name}`;
      } else {
        authBtn.textContent = 'Login';
      }
    },
    
    // Update profile page
    updateProfile() {
      if (!this.isAuthenticated) return;
      document.getElementById('profileInitials').textContent = this.currentUser.name[0];
      document.getElementById('profileName').textContent = this.currentUser.name;
      document.getElementById('profileEmail').textContent = this.currentUser.email;
      document.getElementById('profileRating').textContent = this.currentUser.rating.toFixed(1);
      document.getElementById('profileRides').textContent = this.currentUser.rides_completed;
      document.getElementById('profileInitials').textContent = this.getInitials(this.currentUser.name);
    },
    
    // Search for rides
    async searchRides() {
      const originStr = document.getElementById('searchOrigin').value;
      const destinationStr = document.getElementById('searchDestination').value;
      const date = document.getElementById('searchDate').value;
      
      if (!originStr || !destinationStr || !date) {
        this.showToast('Please fill out all search fields', 'warning');
        return;
      }
      
      try {
        const origin = JSON.parse(originStr);
        const destination = JSON.parse(destinationStr);
        
        const response = await fetch(`${this.apiBaseUrl}/rides/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({
            origin,
            destination,
            date
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Search failed');
        }
        
        const rides = await response.json();
        this.displayRideResults(rides);
      } catch (error) {
        this.showToast(error.message || 'Failed to search rides', 'error');
      }
    },
    
    // Display ride search results
    displayRideResults(rides) {
      const resultsContainer = document.getElementById('searchResults');
      
      if (rides.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>No rides found for your search criteria.</p>
            <button class="btn btn--secondary mt-8" id="modifySearch">Modify Search</button>
          </div>
        `;
        
        document.getElementById('modifySearch').addEventListener('click', () => {
          document.getElementById('searchForm').scrollIntoView({ behavior: 'smooth' });
        });
        return;
      }
      
      resultsContainer.innerHTML = '';
      
      rides.forEach(ride => {
        const departureTime = new Date(ride.departure_time);
        const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const rideCard = document.createElement('div');
        rideCard.className = 'ride-card';
        rideCard.innerHTML = `
          <div class="ride-header">
            <div class="ride-route">
              <h4>${ride.origin.address} → ${ride.destination.address}</h4>
              <div class="route-info">
                <span>${formattedTime}</span> • 
                <span>${this.calculateDistance(ride.origin, ride.destination).toFixed(1)} miles</span>
              </div>
            </div>
            <div class="ride-price">
              <div class="price">$${ride.price_per_seat}</div>
              <div class="price-per-seat">per seat</div>
            </div>
          </div>
          
          <div class="driver-info">
            <div class="driver-avatar">${this.getInitials(ride.driver.name)}</div>
            <div class="driver-details">
              <h5>${ride.driver.name}</h5>
              <div class="driver-rating">⭐ ${ride.driver.rating.toFixed(1)} • ${ride.driver.rides_completed} rides</div>
            </div>
          </div>
          
          <div class="ride-details-row">
            <div class="detail-item">
              <div class="detail-label">Seats</div>
              <div class="detail-value">${ride.available_seats} available</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Pickup</div>
              <div class="detail-value">< 500m away</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status</div>
              <div class="detail-value">${ride.status}</div>
            </div>
          </div>
          
          <div class="ride-actions">
            <button class="btn btn--outline" data-action="details" data-ride-id="${ride.id}">View Details</button>
            <button class="btn btn--primary" data-action="request" data-ride-id="${ride.id}">Request Ride</button>
          </div>
        `;
        
        resultsContainer.appendChild(rideCard);
      });
      
      // Add event listeners to ride action buttons
      document.querySelectorAll('[data-action="details"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.viewRideDetails(btn.dataset.rideId);
        });
      });
      
      document.querySelectorAll('[data-action="request"]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.requestRide(btn.dataset.rideId);
        });
      });
    },
    
    // Offer a new ride
    // async offerRide() {
    //   if (!this.isAuthenticated) {
    //     this.showToast('Please login to offer a ride', 'warning');
    //     this.toggleModal('authModal', true);
    //     return;
    //   }
      
    //   const originStr = document.getElementById('offerOrigin').value;
    //   const destinationStr = document.getElementById('offerDestination').value;
    //   const date = document.getElementById('offerDate').value;
    //   const time = document.getElementById('offerTime').value;
    //   const seats = document.getElementById('offerSeats').value;
    //   const price = document.getElementById('offerPrice').value;
      
    //   if (!originStr || !destinationStr || !date || !time || !seats || !price) {
    //     this.showToast('Please fill out all ride details', 'warning');
    //     return;
    //   }
      
    //   try {
    //     const origin = JSON.parse(originStr);
    //     const destination = JSON.parse(destinationStr);
    //     const departureTime = `${date}T${time}:00`;
        
    //     const response = await fetch(`${this.apiBaseUrl}/rides`, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${this.currentToken}`
    //       },
    //       body: JSON.stringify({
    //         origin,
    //         destination,
    //         departure_time: departureTime,
    //         available_seats: parseInt(seats),
    //         price_per_seat: parseInt(price)
    //       })
    //     });
        
    //     if (!response.ok) {
    //       const errorData = await response.json();
    //       throw new Error(errorData.message || 'Failed to create ride');
    //     }
        
    //     document.getElementById('offerRideForm').reset();
    //     this.showToast('Ride posted successfully!', 'success');
    //     this.navigateToPage('my-rides');
    //   } catch (error) {
    //     this.showToast(error.message || 'Failed to post ride', 'error');
    //   }
    // },
    
    async offerRide() {
      if (!this.isAuthenticated) {
        this.showToast('Please login to offer a ride', 'warning');
        this.toggleModal('authModal', true);
        return;
      }
    
      const pickupCoords = document.getElementById('pickupCoords').value;
      const destinationCoords = document.getElementById('destinationCoords').value;
      const date = document.getElementById('offerDate').value;
      const time = document.getElementById('offerTime').value;
      const seats = document.getElementById('offerSeats').value;
      const price = document.getElementById('offerPrice').value;
    
      if (!pickupCoords || !destinationCoords || !date || !time || !seats || !price) {
        this.showToast('Please fill out all ride details', 'warning');
        return;
      }
    
      try {
        const [pickupLat, pickupLng] = pickupCoords.split(',').map(coord => parseFloat(coord.trim()));
        const [destLat, destLng] = destinationCoords.split(',').map(coord => parseFloat(coord.trim()));
        const departureTime = `${date}T${time}:00`;
    
        const origin = {
          lat: pickupLat,
          lng: pickupLng,
          address: `Lat: ${pickupLat}, Lng: ${pickupLng}`
        };
    
        const destination = {
          lat: destLat,
          lng: destLng,
          address: `Lat: ${destLat}, Lng: ${destLng}`
        };
    
        const response = await fetch(`${this.apiBaseUrl}/rides`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({
            origin,
            destination,
            departure_time: departureTime,
            available_seats: parseInt(seats),
            price_per_seat: parseInt(price)
          })
        });
    
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create ride');
        }
    
        document.getElementById('offerRideForm').reset();
        this.showToast('Ride posted successfully!', 'success');
        this.navigateToPage('my-rides');
      } catch (error) {
        this.showToast(error.message || 'Failed to post ride', 'error');
      }
    },
    

    // View ride details
    async viewRideDetails(rideId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}`, {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch ride details');
        
        const ride = await response.json();
        
        const departureTime = new Date(ride.departure_time);
        const formattedDate = departureTime.toLocaleDateString();
        const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const rideDetails = document.getElementById('rideDetails');
        rideDetails.innerHTML = `
          <h3>Ride Details</h3>
          
          <div class="route-map">
            <div class="route-line">
              <div class="route-dot start"></div>
              <div class="route-path"></div>
              <div class="route-dot end"></div>
            </div>
            <div class="route-addresses">
              <div class="address">
                <div class="address-label">From</div>
                <div class="address-value">${ride.origin.address}</div>
              </div>
              <div class="address">
                <div class="address-label">To</div>
                <div class="address-value">${ride.destination.address}</div>
              </div>
            </div>
          </div>
          
          <div class="ride-details-grid">
            <div class="detail-item">
              <div class="detail-label">Date</div>
              <div class="detail-value">${formattedDate}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Time</div>
              <div class="detail-value">${formattedTime}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Price</div>
              <div class="detail-value">$${ride.price_per_seat} per seat</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Available Seats</div>
              <div class="detail-value">${ride.available_seats}</div>
            </div>
          </div>
          
          <div class="driver-details-section">
            <h4>Driver Information</h4>
            <div class="driver-info">
              <div class="driver-avatar">${this.getInitials(ride.driver.name)}</div>
              <div class="driver-details">
                <h5>${ride.driver.name}</h5>
                <div class="driver-contact">${ride.driver.phone}</div>
                <div class="driver-rating">⭐ ${ride.driver.rating.toFixed(1)} • ${ride.driver.rides_completed} rides</div>
              </div>
            </div>
          </div>
          
          <div class="ride-actions">
            <button class="btn btn--outline" id="closeRideDetails">Close</button>
            <button class="btn btn--primary" id="requestRideBtn">Request Ride</button>
          </div>
        `;
        
        document.getElementById('closeRideDetails').addEventListener('click', () => {
          this.toggleModal('rideModal', false);
        });
        
        document.getElementById('requestRideBtn').addEventListener('click', () => {
          this.toggleModal('rideModal', false);
          this.requestRide(rideId);
        });
        
        this.toggleModal('rideModal', true);
      } catch (error) {
        this.showToast('Failed to load ride details', 'error');
      }
    },
    
    // Request a ride
    async requestRide(rideId) {
      if (!this.isAuthenticated) {
        this.showToast('Please login to request a ride', 'warning');
        this.toggleModal('authModal', true);
        return;
      }
      
      try {
        const response = await fetch(`${this.apiBaseUrl}/ride_requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({
            ride_id: parseInt(rideId)
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to request ride');
        }
        
        this.showToast('Ride requested successfully! Waiting for driver confirmation.', 'success');
        this.navigateToPage('my-rides');
      } catch (error) {
        this.showToast(error.message || 'Failed to request ride', 'error');
      }
    },
    
    // Update My Rides page based on selected tab
    async updateMyRides(tabName) {
      if (!this.isAuthenticated) return;
      
      const ridesContent = document.getElementById('ridesContent');
      
      try {
        let endpoint = '';
        if (tabName === 'upcoming') {
          endpoint = '/rides/passenger/upcoming';
        } else if (tabName === 'completed') {
          endpoint = '/rides/passenger/completed';
        } else if (tabName === 'offered') {
          endpoint = '/rides/driver';
        }
        
        const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch rides');
        
        const rides = await response.json();
        
        if (rides.length === 0) {
          ridesContent.innerHTML = `
            <div class="no-rides">
              <p>No ${tabName} rides found.</p>
              ${tabName === 'offered' ? 
                '<button class="btn btn--primary mt-8" id="offerNewRide">Offer a New Ride</button>' : 
                '<button class="btn btn--primary mt-8" id="findRides">Find Rides</button>'}
            </div>
          `;
          
          if (tabName === 'offered') {
            document.getElementById('offerNewRide').addEventListener('click', () => {
              this.navigateToPage('offer-ride');
            });
          } else {
            document.getElementById('findRides').addEventListener('click', () => {
              this.navigateToPage('find-rides');
            });
          }
          return;
        }
        
        ridesContent.innerHTML = '';
        
        rides.forEach(ride => {
          const departureTime = new Date(ride.departure_time);
          const formattedTime = departureTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const formattedDate = departureTime.toLocaleDateString();
          
          const rideCard = document.createElement('div');
          rideCard.className = 'ride-card';
          
          let actionButtons = '';
          
          if (tabName === 'upcoming') {
            if (ride.request_status === 'pending') {
              actionButtons = `
                <button class="btn btn--outline" data-action="cancel-request" data-request-id="${ride.request_id}">Cancel Request</button>
              `;
            } else if (ride.request_status === 'confirmed') {
              actionButtons = `
                <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
                <button class="btn btn--primary" data-action="view-payment" data-ride-id="${ride.id}">Payment</button>
              `;
            }
          } else if (tabName === 'completed') {
            if (!ride.has_reviewed) {
              actionButtons = `
                <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
                <button class="btn btn--primary" data-action="leave-review" data-ride-id="${ride.id}" data-reviewee-id="${ride.driver_id}">Leave Review</button>
              `;
            } else {
              actionButtons = `
                <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
                <button class="btn btn--secondary" disabled>Reviewed</button>
              `;
            }
          } else if (tabName === 'offered') {
            if (ride.pending_requests > 0) {
              actionButtons = `
                <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
                <button class="btn btn--primary" data-action="view-requests" data-ride-id="${ride.id}">View Requests (${ride.pending_requests})</button>
              `;
            } else {
              actionButtons = `
                <button class="btn btn--outline" data-action="view-details" data-ride-id="${ride.id}">View Details</button>
                <button class="btn btn--secondary" disabled>No Requests</button>
              `;
            }
          }
          
          rideCard.innerHTML = `
          <div class="ride-header">
          <div class="ride-route">
            <h4>${ride.origin.address} → ${ride.destination.address}</h4>
            <div class="route-info">
              <span>${formattedDate} at ${formattedTime}</span> • 
              <span>${this.calculateDistance(ride.origin, ride.destination).toFixed(1)} miles</span>
            </div>
          </div>
          <div class="ride-price">
            <div class="price">$${ride.price_per_seat}</div>
            <div class="price-per-seat">per seat</div>
          </div>
        </div>
      
        <div class="driver-info">
          <div class="driver-avatar">${this.getInitials('You')}</div>
          <div class="driver-details">
            <h5>You</h5>
            <div class="driver-rating">⭐ N/A • N/A rides</div>
          </div>
        </div>
      
        <div class="ride-details-row">
          <div class="detail-item">
            <div class="detail-label">Seats</div>
            <div class="detail-value">${ride.available_seats} available</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">Status</div>
            <div class="detail-value">${ride.status}</div>
          </div>
        </div>
      
        <div class="ride-actions">
          ${actionButtons}
        </div>
          `;
          
          ridesContent.appendChild(rideCard);
        });
        
        // Add event listeners to ride action buttons
        document.querySelectorAll('[data-action="view-details"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.viewRideDetails(btn.dataset.rideId);
          });
        });
        
        document.querySelectorAll('[data-action="cancel-request"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.cancelRequest(btn.dataset.requestId);
          });
        });
        
        document.querySelectorAll('[data-action="view-payment"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.viewPayment(btn.dataset.rideId);
          });
        });
        
        document.querySelectorAll('[data-action="leave-review"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.leaveReview(btn.dataset.rideId, btn.dataset.revieweeId);
          });
        });
        
        document.querySelectorAll('[data-action="view-requests"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.viewRequests(btn.dataset.rideId);
          });
        });
      } catch (error) {
        this.showToast('Failed to load rides'+error, 'error');
      }
    },
    
    // Cancel a ride request
    async cancelRequest(requestId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/ride_requests/${requestId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to cancel request');
        
        this.showToast('Ride request cancelled successfully', 'success');
        this.updateMyRides('upcoming');
      } catch (error) {
        this.showToast('Failed to cancel request', 'error');
      }
    },
    
    // View payment details for a ride
    async viewPayment(rideId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}/payment`, {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch payment details');
        
        const payment = await response.json();
        const paymentBreakdown = document.getElementById('paymentBreakdown');
        
        paymentBreakdown.innerHTML = `
          <div class="payment-breakdown">
            <div class="payment-row">
              <span>Ride fare (1 seat)</span>
              <span>$${payment.ride_fare}</span>
            </div>
            <div class="payment-row">
              <span>Service fee</span>
              <span>$${payment.service_fee}</span>
            </div>
            <div class="payment-row total">
              <span>Total</span>
              <span>$${payment.total}</span>
            </div>
          </div>
        `;
        
        document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
          if (input.value === payment.payment_method) {
            input.checked = true;
          }
        });
        
        this.toggleModal('paymentModal', true);
      } catch (error) {
        this.showToast('Failed to load payment details', 'error');
      }
    },
    
    // Process payment for a ride
    async processPayment() {
      try {
        const rideId = document.querySelector('[data-action="view-payment"]').dataset.rideId;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        const response = await fetch(`${this.apiBaseUrl}/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({
            ride_id: parseInt(rideId),
            payment_method: paymentMethod
          })
        });
        
        if (!response.ok) throw new Error('Payment failed');
        
        this.showToast('Payment processed successfully!', 'success');
        this.toggleModal('paymentModal', false);
      } catch (error) {
        this.showToast('Payment failed', 'error');
      }
    },
    
    // Leave a review for a driver or passenger
    leaveReview(rideId, revieweeId) {
      this.currentRideId = rideId;
      this.currentRevieweeId = revieweeId;
      
      document.getElementById('revieweeName').textContent = 'Driver';
      this.setRating(0);
      document.getElementById('reviewComment').value = '';
      
      this.toggleModal('reviewModal', true);
    },
    
    // Submit a review
    async submitReview() {
      if (this.currentRating === 0) {
        this.showToast('Please select a rating', 'warning');
        return;
      }
      
      try {
        const comment = document.getElementById('reviewComment').value;
        
        const response = await fetch(`${this.apiBaseUrl}/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({
            ride_id: this.currentRideId,
            reviewee_id: this.currentRevieweeId,
            rating: this.currentRating,
            comment
          })
        });
        
        if (!response.ok) throw new Error('Failed to submit review');
        
        this.showToast('Review submitted successfully!', 'success');
        this.toggleModal('reviewModal', false);
        this.updateMyRides('completed');
      } catch (error) {
        this.showToast('Failed to submit review', 'error');
      }
    },
    
    // Set rating for review
    setRating(rating) {
      this.currentRating = rating;
      
      const stars = document.querySelectorAll('.star');
      stars.forEach((star, index) => {
        if (index < rating) {
          star.classList.add('active');
        } else {
          star.classList.remove('active');
        }
      });
    },
    
    // View ride requests (for drivers)
    async viewRequests(rideId) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/rides/${rideId}/requests`, {
          headers: {
            'Authorization': `Bearer ${this.currentToken}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch requests');
        
        const requests = await response.json();
        const ride = requests[0]?.ride; // Assuming first request has ride info
        
        const rideDetails = document.getElementById('rideDetails');
        rideDetails.innerHTML = `
          <h3>Ride Requests</h3>
          
          <div class="ride-info">
            <h4>${ride.origin.address} → ${ride.destination.address}</h4>
            <p>Departure: ${new Date(ride.departure_time).toLocaleString()}</p>
          </div>
          
          <div class="requests-list">
            ${requests.length > 0 ? '' : '<p>No pending requests for this ride.</p>'}
          </div>
        `;
        
        const requestsList = rideDetails.querySelector('.requests-list');
        
        requests.forEach(request => {
          const requestItem = document.createElement('div');
          requestItem.className = 'request-item';
          requestItem.innerHTML = `
            <div class="passenger-info">
              <div class="passenger-avatar">${this.getInitials(request.passenger.name)}</div>
              <div class="passenger-details">
                <h5>${request.passenger.name}</h5>
                <div class="passenger-rating">⭐ ${request.passenger.rating.toFixed(1)} • ${request.passenger.rides_completed} rides</div>
              </div>
            </div>
            
            <div class="request-actions">
              <button class="btn btn--outline" data-action="reject" data-request-id="${request.id}">Reject</button>
              <button class="btn btn--primary" data-action="accept" data-request-id="${request.id}">Accept</button>
            </div>
          `;
          
          requestsList.appendChild(requestItem);
        });
        
        document.querySelectorAll('[data-action="accept"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.respondToRequest(btn.dataset.requestId, 'confirmed');
          });
        });
        
        document.querySelectorAll('[data-action="reject"]').forEach(btn => {
          btn.addEventListener('click', () => {
            this.respondToRequest(btn.dataset.requestId, 'rejected');
          });
        });
        
        this.toggleModal('rideModal', true);
      } catch (error) {
        this.showToast('Failed to load requests', 'error');
      }
    },
    
    // Respond to ride request (accept/reject)
    async respondToRequest(requestId, status) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/ride_requests/${requestId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.currentToken}`
          },
          body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Failed to respond to request');
        
        if (status === 'confirmed') {
          this.showToast('Request accepted! Passenger has been notified.', 'success');
        } else {
          this.showToast('Request rejected.', 'info');
        }
        
        this.toggleModal('rideModal', false);
        this.updateMyRides('offered');
      } catch (error) {
        this.showToast('Failed to respond to request', 'error');
      }
    },
    
    // Show toast notification
    showToast(message, type = 'info') {
      const toastContainer = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.textContent = message;
      
      toastContainer.appendChild(toast);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
          toastContainer.removeChild(toast);
        }, 300);
      }, 3000);
    },
    
    // Helper function to get initials from name
    getInitials(name) {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase();
    },
    
    // Calculate distance between two points (simplified for demo)
    calculateDistance(loc1, loc2) {
      // Using Euclidean distance for simplicity
      const latDiff = loc1.lat - loc2.lat;
      const lngDiff = loc1.lng - loc2.lng;
      
      // Scale factor to approximate miles (simplified)
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69;
    }
  };
  
  // Initialize the application
  app.init();
});