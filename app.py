# app.py
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import datetime
from models import db, User, Location, Ride, RideRequest, Payment, Review
import os
from dotenv import load_dotenv
from flask import render_template
from flask_cors import CORS





load_dotenv()

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'your_secret_key'  # Change this in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    # Validate data
    if not data or not all(key in data for key in ['name', 'email', 'phone', 'password', 'type']):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already in use'}), 400
    
    user = User(
        name=data['name'],
        email=data['email'],
        phone=data['phone'],
        type=data['type']
    )
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Registration successful',
        'access_token': access_token,
        'user': user.serialize()
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid email or password'}), 401
    
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': user.serialize()
    })

@app.route('/api/rides', methods=['GET'])
@jwt_required()
def search_rides():
    # Extract query parameters
    origin_id = request.args.get('origin_id')
    destination_id = request.args.get('destination_id')
    date = request.args.get('date')  # Format: YYYY-MM-DD
    
    # Convert date string to date object
    try:
        search_date = datetime.datetime.strptime(date, '%Y-%m-%d').date()
    except:
        return jsonify({'message': 'Invalid date format'}), 400
    
    # Query rides for the given date and locations
    rides = Ride.query.filter(
        db.func.date(Ride.departure_time) == search_date,
        Ride.origin_id == origin_id,
        Ride.destination_id == destination_id,
        Ride.status == 'available',
        Ride.available_seats > 0
    ).all()
    
    return jsonify([ride.serialize() for ride in rides])

@app.route('/api/rides', methods=['POST'])
@jwt_required()
def create_ride():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate data
    required_fields = ['origin_id', 'destination_id', 'departure_time', 'available_seats', 'price_per_seat']
    if not all(key in data for key in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if user is a driver
    user = User.query.get(current_user_id)
    if user.type not in ['driver', 'both']:
        return jsonify({'message': 'Your account is not registered as a driver'}), 403
    
    # Create new ride
    ride = Ride(
        driver_id=current_user_id,
        origin_id=data['origin_id'],
        destination_id=data['destination_id'],
        departure_time=datetime.datetime.fromisoformat(data['departure_time']),
        available_seats=data['available_seats'],
        price_per_seat=data['price_per_seat']
    )
    db.session.add(ride)
    db.session.commit()
    
    return jsonify({
        'message': 'Ride created successfully',
        'ride': ride.serialize()
    }), 201

# Add similar endpoints for:
# - Ride requests
# - Payments
# - Reviews
# - User profile
# - Ride management

if __name__ == '__main__':
    app.run(debug=True)