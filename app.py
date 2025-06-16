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
        # Get the current user's ID from the JWT token
        username = get_jwt_identity()
        if not username:
            return jsonify({'message': 'Invalid token'}), 401
            
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Query the user from the database
        cur.execute("""
            SELECT id, name, email, phone 
            FROM users 
            WHERE name = %s
        """, (username,))
        
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
        
        # Check if email exists
        cur.execute("SELECT id FROM users WHERE email = %s or name = %s", (data['email'], data['name'],))
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
        
        access_token = create_access_token(identity=user['name'])
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
        
        access_token = create_access_token(identity=user['name'])
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'phone': user['phone']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        cur.close()
        conn.close()

@app.route('/api/rides', methods=['GET'])
@jwt_required()
def search_rides():
    origin_id = request.args.get('origin_id')
    destination_id = request.args.get('destination_id')
    date = request.args.get('date')
    
    if not all([origin_id, destination_id, date]):
        return jsonify({'message': 'Missing parameters'}), 400
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        cur.execute("""
            SELECT * FROM rides 
            WHERE DATE(departure_time) = %s 
            AND origin_id = %s 
            AND destination_id = %s 
            AND status = 'available'
            AND available_seats > 0
        """, (date, origin_id, destination_id))
        
        rides = cur.fetchall()
        return jsonify([dict(ride) for ride in rides])
        
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
    required_fields = ['origin_id', 'destination_id', 'departure_time', 'available_seats', 'price_per_seat']
    
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # cur.execute("SELECT type FROM users WHERE id = %s", (current_user_id,))
        # user_type = cur.fetchone()['type']
        # if user_type not in ['driver', 'both']:
        #     return jsonify({'message': 'Your account is not registered as a driver'}), 403
        
        cur.execute("""
            INSERT INTO rides (driver_id, origin_id, destination_id, departure_time, available_seats, price_per_seat)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING *
        """, (
            current_user_id,
            data['origin_id'],
            data['destination_id'],
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

# GET user's rides
@app.route('/api/my_rides', methods=['GET'])
@jwt_required()
def my_rides():
    user_id = get_jwt_identity()
    ride_type = request.args.get('type', 'upcoming')
    
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)
        
        # Different queries based on ride type
        if ride_type == 'upcoming':
            cur.execute("""
                SELECT r.*, rr.status AS request_status
                FROM ride_request rr
                JOIN ride r ON rr.ride_id = r.id
                WHERE rr.passenger_id = %s 
                AND rr.status IN ('pending', 'confirmed')
            """, (user_id,))
        elif ride_type == 'completed':
            cur.execute("""
                SELECT r.*, rr.status AS request_status
                FROM ride_request rr
                JOIN ride r ON rr.ride_id = r.id
                WHERE rr.passenger_id = %s 
                AND rr.status = 'completed'
            """, (user_id,))
        elif ride_type == 'offered':
            cur.execute("SELECT * FROM ride WHERE driver_id = %s", (user_id,))
            
        rides = cur.fetchall()
        return jsonify([dict(ride) for ride in rides])
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
    
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
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


if __name__ == '__main__':
    app.run(debug=True)




# # app.py v1
# from flask import Flask, request, jsonify
# from flask_sqlalchemy import SQLAlchemy
# from flask_migrate import Migrate
# from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
# import datetime
# from models import db, User, Location, Ride, RideRequest, Payment, Review
# import os
# from dotenv import load_dotenv
# from flask import render_template
# from flask_cors import CORS





# load_dotenv()

# app = Flask(__name__)
# CORS(app)
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# app.config['JWT_SECRET_KEY'] = 'hallelooya'  
# app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

# db.init_app(app)
# migrate = Migrate(app, db)
# jwt = JWTManager(app)

# @app.route('/')
# def home():
#     return render_template('index.html')


# @app.route('/api/current_user')
# def current_user():
#     token = request.headers.get('Authorization')
    
#     return user

# @app.route('/api/register', methods=['POST'])
# def register():
#     data = request.get_json()
#     if not data or not all(key in data for key in ['name', 'email', 'phone', 'password', 'type']):
#         return jsonify({'message': 'Missing required fields'}), 400
    
#     if User.query.filter_by(email=data['email']).first():
#         return jsonify({'message': 'Email already in use'}), 400
    
#     user = User(
#         name=data['name'],
#         email=data['email'],
#         phone=data['phone'],
#         type=data['type']
#     )
#     user.set_password(data['password'])
#     db.session.add(user)
#     db.session.commit()
    
#     access_token = create_access_token(identity=user.id)
#     return jsonify({
#         'message': 'Registration successful',
#         'access_token': access_token,
#         'user': user.serialize()
#     }), 201

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     user = User.query.filter_by(email=data['email']).first()
    
#     if not user or not user.check_password(data['password']):
#         return jsonify({'message': 'Invalid email or password'}), 401
    
#     access_token = create_access_token(identity=user.id)
#     return jsonify({
#         'message': 'Login successful',
#         'access_token': access_token,
#         'user': user.serialize()
#     })

# @app.route('/api/rides', methods=['GET'])
# @jwt_required()
# def search_rides():
#     # Extract query parameters
#     origin_id = request.args.get('origin_id')
#     destination_id = request.args.get('destination_id')
#     date = request.args.get('date')  # Format: YYYY-MM-DD
    
#     # Convert date string to date object
#     try:
#         search_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
#     except:
#         return jsonify({'message': 'Invalid date format'}), 400
    
#     # Query rides for the given date and locations
#     rides = Ride.query.filter(
#         db.func.date(Ride.departure_time) == search_date,
#         Ride.origin_id == origin_id,
#         Ride.destination_id == destination_id,
#         Ride.status == 'available',
#         Ride.available_seats > 0
#     ).all()
    
#     return jsonify([ride.serialize() for ride in rides])

# @app.route('/api/rides', methods=['POST'])
# @jwt_required()
# def create_ride():
#     current_user_id = get_jwt_identity()
#     data = request.get_json()
    
#     # Validate data
#     required_fields = ['origin_id', 'destination_id', 'departure_time', 'available_seats', 'price_per_seat']
#     if not all(key in data for key in required_fields):
#         return jsonify({'message': 'Missing required fields'}), 400
    
#     # Check if user is a driver
#     user = User.query.get(current_user_id)
#     if user.type not in ['driver', 'both']:
#         return jsonify({'message': 'Your account is not registered as a driver'}), 403
    
#     # Create new ride
#     ride = Ride(
#         driver_id=current_user_id,
#         origin_id=data['origin_id'],
#         destination_id=data['destination_id'],
#         departure_time=datetime.datetime.fromisoformat(data['departure_time']),
#         available_seats=data['available_seats'],
#         price_per_seat=data['price_per_seat']
#     )
#     db.session.add(ride)
#     db.session.commit()
    
#     return jsonify({
#         'message': 'Ride created successfully',
#         'ride': ride.serialize()
#     }), 201

# # Add similar endpoints for:
# # - Ride requests
# # - Payments
# # - Reviews
# # - User profile
# # - Ride management

# if __name__ == '__main__':
#     app.run(debug=True)