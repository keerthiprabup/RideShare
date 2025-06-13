# models.py
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timezone  # Updated imports

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # 'driver', 'passenger', 'both'
    rating = db.Column(db.Float, default=0.0)
    rides_completed = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Updated
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), 
                      onupdate=lambda: datetime.now(timezone.utc))  # Updated
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'type': self.type,
            'rating': self.rating,
            'rides_completed': self.rides_completed
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Location(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    lat = db.Column(db.Float, nullable=False)
    lng = db.Column(db.Float, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False)

    def serialize(self):
        return {
            'id': self.id,
            'lat': self.lat,
            'lng': self.lng,
            'name': self.name,
            'type': self.type
        }

class Ride(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    driver_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False) # Note: changed to 'users.id' to match __tablename__
    origin_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    destination_id = db.Column(db.Integer, db.ForeignKey('location.id'), nullable=False)
    departure_time = db.Column(db.DateTime, nullable=False)
    available_seats = db.Column(db.Integer, nullable=False)
    price_per_seat = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='available')  # 'available', 'completed', 'canceled'
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Updated
    
    def serialize(self):
        return {
            'id': self.id,
            'driver_id': self.driver_id,
            'origin': self.origin.serialize(),
            'destination': self.destination.serialize(),
            'departure_time': self.departure_time.isoformat(),
            'available_seats': self.available_seats,
            'price_per_seat': self.price_per_seat,
            'status': self.status
        }

class RideRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('ride.id'), nullable=False)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to 'users.id'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'confirmed', 'rejected', 'canceled'
    requested_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Updated
    def serialize(self):
        return {
            'id': self.id,
            'ride_id': self.ride_id,
            'passenger_id': self.passenger_id,
            'status': self.status,
            'requested_at': self.requested_at.isoformat()
        }

class Payment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('ride.id'), nullable=False)
    passenger_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to 'users.id'
    amount = db.Column(db.Float, nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)  # 'credit_card', 'digital_wallet'
    status = db.Column(db.String(20), default='pending')  # 'pending', 'completed', 'failed'
    processed_at = db.Column(db.DateTime)
    def serialize(self):
        return {
            'id': self.id,
            'ride_id': self.ride_id,
            'passenger_id': self.passenger_id,
            'amount': self.amount,
            'payment_method': self.payment_method,
            'status': self.status,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ride_id = db.Column(db.Integer, db.ForeignKey('ride.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to 'users.id'
    reviewee_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed to 'users.id'
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))  # Updated
    def serialize(self):
        return {
            'id': self.id,
            'ride_id': self.ride_id,
            'reviewer_id': self.reviewer_id,
            'reviewee_id': self.reviewee_id,
            'rating': self.rating,
            'comment': self.comment,
            'created_at': self.created_at.isoformat()
        }