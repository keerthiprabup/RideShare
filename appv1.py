
#hamme
# app.py
from flask import Flask, request, jsonify
import psycopg2
import psycopg2.extras
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
import os
from dotenv import load_dotenv
from flask import render_template
from flask_cors import CORS
from math import radians, sin, cos, sqrt, atan2

load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY'] = 'hallelooya'  
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
jwt = JWTManager(app)

# Database connection helper
def get_db_connection():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/current_user', methods=['GET'])
@jwt_required()
def current_user():
    try:
        user_id = get_jwt_identity()
        if not user_id:
            return jsonify({'message': 'Invalid token'}), 401
            
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT id, name, email, phone, rating, rides_completed
            FROM users 
            WHERE id = %s
        """, (user_id,))
        
        user = cur.fetchone()
        
        if not user:
            return jsonify({'message': 'User not found'}), 404
        
        return jsonify(dict(user))
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    required_fields = ['name', 'email', 'phone', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Check if email or username exists
        cur.execute("SELECT id FROM users WHERE email = %s OR name = %s", (data['email'], data['name']))
        if cur.fetchone():
            return jsonify({'message': 'Email or username already in use'}), 400
        
        # Create new user
        hashed_pw = generate_password_hash(data['password'])
        cur.execute(
            "INSERT INTO users (name, email, phone, password_hash) "
            "VALUES (%s, %s, %s, %s) RETURNING id, name, email, phone",
            (data['name'], data['email'], data['phone'], hashed_pw)
        )
        user = cur.fetchone()
        conn.commit()
        
        access_token = create_access_token(identity=str(user['id']))
        return jsonify({
            'message': 'Registration successful',
            'access_token': access_token,
            'user': dict(user)
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("SELECT * FROM users WHERE email = %s", (data['email'],))
        user = cur.fetchone()
        
        if not user or not check_password_hash(user['password_hash'], data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        access_token = create_access_token(identity=str(user['id']))
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'phone': user['phone'],
                'rating': user['rating'],
                'rides_completed': user['rides_completed']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# @app.route('/api/rides/search', methods=['POST'])
# @jwt_required()
# def search_rides():
#     data = request.get_json()
#     origin = data.get('origin')
#     destination = data.get('destination')
#     date = data.get('date')
#     proximity = data.get('proximity')
    
#     if not all([origin, destination, date]):
#         return jsonify({'message': 'Missing parameters'}), 400
    
#     try:
#         conn = get_db_connection()
#         cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
#         # Extract location IDs from coordinates
#         cur.execute("""
#             SELECT r.*, 
#                    u.name AS driver_name, 
#                    u.rating AS driver_rating, 
#                    u.rides_completed AS driver_rides_completed,
#                    lo.name AS origin_name,
#                    ld.name AS destination_name
#             FROM ride r
#             JOIN users u ON r.driver_id = u.id
#             JOIN location lo ON r.origin_id = lo.id
#             JOIN location ld ON r.destination_id = ld.id
#             WHERE DATE(r.departure_time) = %s 
#             AND r.origin_id = (SELECT id FROM location WHERE lat = %s AND lng = %s LIMIT 1)
#             AND r.destination_id = (SELECT id FROM location WHERE lat = %s AND lng = %s LIMIT 1)
#             AND r.status = 'available'
#             AND r.available_seats > 0
#         """, (date, origin['lat'], origin['lng'], destination['lat'], destination['lng']))
        
#         rides = cur.fetchall()
        
#         # Format rides for response
#         formatted_rides = []
#         for ride in rides:
#             ride_dict = dict(ride)
#             ride_dict['origin'] = {
#                 'lat': origin['lat'],
#                 'lng': origin['lng'],
#                 'address': ride_dict['origin_name']
#             }
#             ride_dict['destination'] = {
#                 'lat': destination['lat'],
#                 'lng': destination['lng'],
#                 'address': ride_dict['destination_name']
#             }
#             ride_dict['driver'] = {
#                 'name': ride_dict['driver_name'],
#                 'rating': ride_dict['driver_rating'],
#                 'rides_completed': ride_dict['driver_rides_completed']
#             }
#             formatted_rides.append(ride_dict)
            
#         return jsonify(formatted_rides)
        
#     except Exception as e:
#         return jsonify({'error': str(e)}), 500
#     finally:
#         cur.close()
#         conn.close()

@app.route('/api/rides/search', methods=['POST'])
@jwt_required()
def search_rides():
    data = request.get_json()
    origin = data.get('origin')
    destination = data.get('destination')
    date = data.get('date')
    proximity = data.get('proximity')  # In meters
    
    if not all([origin, destination, date, proximity]):
        return jsonify({'message': 'Missing parameters'}), 400

    # Convert proximity to kilometers
    proximity_km = float(proximity) / 1000.0

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Select all rides for the date and with available seats
        cur.execute("""
            SELECT r.*, 
                   u.name AS driver_name, 
                   u.rating AS driver_rating, 
                   u.rides_completed AS driver_rides_completed,
                   lo.lat AS origin_lat,
                   lo.lng AS origin_lng,
                   lo.name AS origin_name,
                   ld.lat AS dest_lat,
                   ld.lng AS dest_lng,
                   ld.name AS destination_name
            FROM ride r
            JOIN users u ON r.driver_id = u.id
            JOIN location lo ON r.origin_id = lo.id
            JOIN location ld ON r.destination_id = ld.id
            WHERE DATE(r.departure_time) = %s 
              AND r.status = 'available'
              AND r.available_seats > 0
        """, (date,))
        
        rides = cur.fetchall()

        # Haversine function
        def haversine(lat1, lng1, lat2, lng2):
            R = 6371  # Earth radius in kilometers
            dlat = radians(lat2 - lat1)
            dlng = radians(lng2 - lng1)
            a = sin(dlat / 2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2)**2
            c = 2 * atan2(sqrt(a), sqrt(1 - a))
            return R * c
        
        # Filter by proximity
        filtered_rides = []
        for ride in rides:
            if haversine(origin['lat'], origin['lng'], ride['origin_lat'], ride['origin_lng']) <= proximity_km and haversine(destination['lat'], destination['lng'], ride['dest_lat'], ride['dest_lng']) <= proximity_km:
                ride_dict = dict(ride)
                ride_dict['origin'] = {
                    'lat': ride['origin_lat'],
                    'lng': ride['origin_lng'],
                    'address': ride['origin_name']
                }
                ride_dict['destination'] = {
                    'lat': ride['dest_lat'],
                    'lng': ride['dest_lng'],
                    'address': ride['destination_name']
                }
                ride_dict['driver'] = {
                    'name': ride['driver_name'],
                    'rating': ride['driver_rating'],
                    'rides_completed': ride['driver_rides_completed']
                }
                filtered_rides.append(ride_dict)

        return jsonify(filtered_rides)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()


@app.route('/api/rides', methods=['POST'])
@jwt_required()
def create_ride():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    required_fields = ['origin', 'destination', 'departure_time', 'available_seats', 'price_per_seat']
    
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Get or create origin location
        cur.execute("""
            INSERT INTO location (lat, lng, name, type) 
            VALUES (%s, %s, %s, 'address')
            ON CONFLICT (lat, lng) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, (data['origin']['lat'], data['origin']['lng'], data['origin']['address']))
        origin_id = cur.fetchone()['id']
        
        # Get or create destination location
        cur.execute("""
            INSERT INTO location (lat, lng, name, type) 
            VALUES (%s, %s, %s, 'address')
            ON CONFLICT (lat, lng) DO UPDATE SET name = EXCLUDED.name
            RETURNING id
        """, (data['destination']['lat'], data['destination']['lng'], data['destination']['address']))
        destination_id = cur.fetchone()['id']
        
        # Create new ride
        cur.execute("""
            INSERT INTO ride (driver_id, origin_id, destination_id, departure_time, available_seats, price_per_seat)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            current_user_id,
            origin_id,
            destination_id,
            data['departure_time'],
            data['available_seats'],
            data['price_per_seat']
        ))
        new_ride = cur.fetchone()
        conn.commit()
        
        return jsonify({
            'message': 'Ride created successfully',
            'ride': dict(new_ride)
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET all locations
@app.route('/api/locations', methods=['GET'])
def get_locations():
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        cur.execute("SELECT * FROM location")
        locations = cur.fetchall()
        return jsonify([dict(loc) for loc in locations])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET ride by ID
@app.route('/api/rides/<int:ride_id>', methods=['GET'])
@jwt_required()
def get_ride(ride_id):
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT r.*, 
                   u.name AS driver_name, 
                   u.phone AS driver_phone,
                   u.rating AS driver_rating,
                   u.rides_completed AS driver_rides_completed,
                   lo.name AS origin_name, lo.lat AS origin_lat, lo.lng AS origin_lng,
                   ld.name AS destination_name, ld.lat AS destination_lat, ld.lng AS destination_lng
            FROM ride r
            JOIN users u ON r.driver_id = u.id
            JOIN location lo ON r.origin_id = lo.id
            JOIN location ld ON r.destination_id = ld.id
            WHERE r.id = %s
        """, (ride_id,))
        
        ride = cur.fetchone()
        if not ride:
            return jsonify({'message': 'Ride not found'}), 404
            
        ride_dict = dict(ride)
        ride_dict['origin'] = {
            'lat': ride_dict['origin_lat'],
            'lng': ride_dict['origin_lng'],
            'address': ride_dict['origin_name']
        }
        ride_dict['destination'] = {
            'lat': ride_dict['destination_lat'],
            'lng': ride_dict['destination_lng'],
            'address': ride_dict['destination_name']
        }
        ride_dict['driver'] = {
            'name': ride_dict['driver_name'],
            'phone': ride_dict['driver_phone'],
            'rating': ride_dict['driver_rating'],
            'rides_completed': ride_dict['driver_rides_completed']
        }
        
        # Remove temporary fields
        for field in ['origin_name', 'origin_lat', 'origin_lng', 
                     'destination_name', 'destination_lat', 'destination_lng',
                     'driver_name', 'driver_phone', 'driver_rating', 'driver_rides_completed']:
            del ride_dict[field]
        
        return jsonify(ride_dict)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET user's upcoming rides as passenger
@app.route('/api/rides/passenger/upcoming', methods=['GET'])
@jwt_required()
def passenger_upcoming_rides():
    user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT r.*, 
                   u.name AS driver_name, 
                   u.rating AS driver_rating,
                   u.rides_completed AS driver_rides_completed,
                   lo.name AS origin_name, lo.lat AS origin_lat, lo.lng AS origin_lng,
                   ld.name AS destination_name, ld.lat AS destination_lat, ld.lng AS destination_lng,
                   rr.status AS request_status,
                   rr.id AS request_id
            FROM ride_request rr
            JOIN ride r ON rr.ride_id = r.id
            JOIN users u ON r.driver_id = u.id
            JOIN location lo ON r.origin_id = lo.id
            JOIN location ld ON r.destination_id = ld.id
            WHERE rr.passenger_id = %s 
            AND rr.status IN ('pending', 'confirmed')
            AND r.departure_time > NOW()
        """, (user_id,))
        
        rides = cur.fetchall()
        
        formatted_rides = []
        for ride in rides:
            ride_dict = dict(ride)
            ride_dict['origin'] = {
                'lat': ride_dict['origin_lat'],
                'lng': ride_dict['origin_lng'],
                'address': ride_dict['origin_name']
            }
            ride_dict['destination'] = {
                'lat': ride_dict['destination_lat'],
                'lng': ride_dict['destination_lng'],
                'address': ride_dict['destination_name']
            }
            ride_dict['driver'] = {
                'name': ride_dict['driver_name'],
                'rating': ride_dict['driver_rating'],
                'rides_completed': ride_dict['driver_rides_completed']
            }
            
            # Remove temporary fields
            for field in ['origin_name', 'origin_lat', 'origin_lng', 
                         'destination_name', 'destination_lat', 'destination_lng',
                         'driver_name', 'driver_rating', 'driver_rides_completed']:
                del ride_dict[field]
                
            formatted_rides.append(ride_dict)
            
        return jsonify(formatted_rides)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET user's completed rides as passenger
@app.route('/api/rides/passenger/completed', methods=['GET'])
@jwt_required()
def passenger_completed_rides():
    user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT r.*, 
                   u.name AS driver_name, 
                   u.rating AS driver_rating,
                   u.rides_completed AS driver_rides_completed,
                   lo.name AS origin_name, lo.lat AS origin_lat, lo.lng AS origin_lng,
                   ld.name AS destination_name, ld.lat AS destination_lat, ld.lng AS destination_lng,
                   rr.status AS request_status,
                   rr.id AS request_id,
                   EXISTS (SELECT 1 FROM review rev WHERE rev.ride_id = r.id AND rev.reviewer_id = %s) AS has_reviewed
            FROM ride_request rr
            JOIN ride r ON rr.ride_id = r.id
            JOIN users u ON r.driver_id = u.id
            JOIN location lo ON r.origin_id = lo.id
            JOIN location ld ON r.destination_id = ld.id
            WHERE rr.passenger_id = %s 
            AND rr.status = 'completed'
            AND r.departure_time < NOW()
        """, (user_id, user_id))
        
        rides = cur.fetchall()
        
        formatted_rides = []
        for ride in rides:
            ride_dict = dict(ride)
            ride_dict['origin'] = {
                'lat': ride_dict['origin_lat'],
                'lng': ride_dict['origin_lng'],
                'address': ride_dict['origin_name']
            }
            ride_dict['destination'] = {
                'lat': ride_dict['destination_lat'],
                'lng': ride_dict['destination_lng'],
                'address': ride_dict['destination_name']
            }
            ride_dict['driver'] = {
                'name': ride_dict['driver_name'],
                'rating': ride_dict['driver_rating'],
                'rides_completed': ride_dict['driver_rides_completed']
            }
            
            # Remove temporary fields
            for field in ['origin_name', 'origin_lat', 'origin_lng', 
                         'destination_name', 'destination_lat', 'destination_lng',
                         'driver_name', 'driver_rating', 'driver_rides_completed']:
                del ride_dict[field]
                
            formatted_rides.append(ride_dict)
            
        return jsonify(formatted_rides)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET user's offered rides (as driver)
@app.route('/api/rides/driver', methods=['GET'])
@jwt_required()
def driver_rides():
    user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT r.*, 
                   lo.name AS origin_name, lo.lat AS origin_lat, lo.lng AS origin_lng,
                   ld.name AS destination_name, ld.lat AS destination_lat, ld.lng AS destination_lng,
                   (SELECT COUNT(*) FROM ride_request rr 
                    WHERE rr.ride_id = r.id AND rr.status = 'pending') AS pending_requests
            FROM ride r
            JOIN location lo ON r.origin_id = lo.id
            JOIN location ld ON r.destination_id = ld.id
            WHERE r.driver_id = %s
        """, (user_id,))
        
        rides = cur.fetchall()
        
        formatted_rides = []
        for ride in rides:
            ride_dict = dict(ride)
            ride_dict['origin'] = {
                'lat': ride_dict['origin_lat'],
                'lng': ride_dict['origin_lng'],
                'address': ride_dict['origin_name']
            }
            ride_dict['destination'] = {
                'lat': ride_dict['destination_lat'],
                'lng': ride_dict['destination_lng'],
                'address': ride_dict['destination_name']
            }
            
            # Remove temporary fields
            for field in ['origin_name', 'origin_lat', 'origin_lng', 
                         'destination_name', 'destination_lat', 'destination_lng']:
                del ride_dict[field]
                
            formatted_rides.append(ride_dict)
            
        return jsonify(formatted_rides)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST ride request
@app.route('/api/ride_requests', methods=['POST'])
@jwt_required()
def create_ride_request():
    data = request.get_json()
    user_id = get_jwt_identity()
    
    if 'ride_id' not in data:
        return jsonify({'message': 'Missing ride_id'}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Check if request already exists
        cur.execute("""
            SELECT id FROM ride_request 
            WHERE ride_id = %s AND passenger_id = %s
        """, (data['ride_id'], user_id))
        if cur.fetchone():
            return jsonify({'message': 'Request already exists'}), 400
        
        # Create new request
        cur.execute("""
            INSERT INTO ride_request (ride_id, passenger_id, status)
            VALUES (%s, %s, 'pending')
            RETURNING id
        """, (data['ride_id'], user_id))
        
        conn.commit()
        return jsonify({'message': 'Request created'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# GET ride requests for a ride
@app.route('/api/rides/<int:ride_id>/requests', methods=['GET'])
@jwt_required()
def get_ride_requests(ride_id):
    user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Verify user is the driver of this ride
        cur.execute("SELECT driver_id FROM ride WHERE id = %s", (ride_id,))
        ride = cur.fetchone()
        if not ride or str(ride['driver_id']) != str(user_id):
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Get requests
        cur.execute("""
            SELECT rr.*, u.name AS passenger_name, u.rating AS passenger_rating, u.rides_completed AS passenger_rides_completed
            FROM ride_request rr
            JOIN users u ON rr.passenger_id = u.id
            WHERE rr.ride_id = %s AND rr.status = 'pending'
        """, (ride_id,))
        
        requests = cur.fetchall()
        
        formatted_requests = []
        for req in requests:
            req_dict = dict(req)
            req_dict['passenger'] = {
                'name': req_dict['passenger_name'],
                'rating': req_dict['passenger_rating'],
                'rides_completed': req_dict['passenger_rides_completed']
            }
            
            # Remove temporary fields
            for field in ['passenger_name', 'passenger_rating', 'passenger_rides_completed']:
                del req_dict[field]
                
            formatted_requests.append(req_dict)
            
        return jsonify(formatted_requests)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# PATCH ride request (update status)
@app.route('/api/ride_requests/<int:request_id>', methods=['PATCH'])
@jwt_required()
def update_ride_request(request_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'status' not in data or data['status'] not in ['confirmed', 'rejected']:
        return jsonify({'message': 'Invalid status'}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Get request and verify user is the driver
        cur.execute("""
            SELECT r.driver_id, rr.ride_id
            FROM ride_request rr
            JOIN ride r ON rr.ride_id = r.id
            WHERE rr.id = %s
        """, (request_id,))
        request_info = cur.fetchone()
        
        if not request_info:
            return jsonify({'message': 'Request not found'}), 404
            
        if request_info['driver_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Update request status
        cur.execute("""
            UPDATE ride_request 
            SET status = %s 
            WHERE id = %s
            RETURNING *
        """, (data['status'], request_id))
        
        updated_request = cur.fetchone()
        
        # If confirmed, reduce available seats
        if data['status'] == 'confirmed':
            cur.execute("""
                UPDATE ride
                SET available_seats = available_seats - 1
                WHERE id = %s
            """, (request_info['ride_id'],))
        
        conn.commit()
        return jsonify({'message': 'Request updated', 'request': dict(updated_request)})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# DELETE ride request (cancel request)
@app.route('/api/ride_requests/<int:request_id>', methods=['DELETE'])
@jwt_required()
def cancel_ride_request(request_id):
    user_id = get_jwt_identity()
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Verify user is the passenger
        cur.execute("SELECT passenger_id FROM ride_request WHERE id = %s", (request_id,))
        request_info = cur.fetchone()
        
        if not request_info:
            return jsonify({'message': 'Request not found'}), 404
            
        if request_info['passenger_id'] != user_id:
            return jsonify({'message': 'Unauthorized'}), 403
        
        # Delete request
        cur.execute("DELETE FROM ride_request WHERE id = %s", (request_id,))
        conn.commit()
        
        return jsonify({'message': 'Request cancelled'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST review
@app.route('/api/reviews', methods=['POST'])
@jwt_required()
def create_review():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['ride_id', 'reviewee_id', 'rating', 'comment']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Create review
        cur.execute("""
            INSERT INTO review (ride_id, reviewer_id, reviewee_id, rating, comment)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
        """, (
            data['ride_id'],
            user_id,
            data['reviewee_id'],
            data['rating'],
            data['comment']
        ))
        review = cur.fetchone()
        conn.commit()
        
        # Update reviewee's rating
        cur.execute("""
            UPDATE users 
            SET rating = (
                SELECT AVG(rating) 
                FROM review 
                WHERE reviewee_id = %s
            ),
            rides_completed = rides_completed + 1
            WHERE id = %s
        """, (data['reviewee_id'], data['reviewee_id']))
        conn.commit()
        
        return jsonify({
            'message': 'Review created successfully',
            'review': dict(review)
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

# POST payment
@app.route('/api/payments', methods=['POST'])
@jwt_required()
def create_payment():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    required_fields = ['ride_id', 'payment_method', 'amount']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Create payment
        cur.execute("""
            INSERT INTO payment (ride_id, passenger_id, amount, payment_method, status)
            VALUES (%s, %s, %s, %s, 'completed')
            RETURNING *
        """, (
            data['ride_id'],
            user_id,
            data['amount'],
            data['payment_method']
        ))
        payment = cur.fetchone()
        conn.commit()
        
        # Update ride request status to completed
        cur.execute("""
            UPDATE ride_request
            SET status = 'completed'
            WHERE ride_id = %s AND passenger_id = %s
        """, (data['ride_id'], user_id))
        conn.commit()
        
        return jsonify({
            'message': 'Payment processed successfully',
            'payment': dict(payment)
        }), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

if __name__ == '__main__':
    app.run(host="0.0.0.0",debug=True)