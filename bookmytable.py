from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
import datetime
import bcrypt
import os

app = Flask(__name__)
CORS(app)

# Initialize MongoDB Connection
mongo_uri = os.environ.get('MONGO_URI', 'mongodb://localhost:27017/')
client = MongoClient(mongo_uri)
db = client['brewtopia']

# Helper functions for serialization and password hashing
def serialize_doc(doc):
    if not doc:
        return None
    doc['id'] = str(doc['_id'])
    del doc['_id']
    for k, v in doc.items():
        if isinstance(v, datetime.datetime):
            doc[k] = v.isoformat()
    return doc

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password, hashed_password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

# API Route: Register
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({'error': 'Name, email, and password are required'}), 400

    # Check if user already exists
    if db.users.find_one({'email': email}):
        return jsonify({'error': 'Email already registered'}), 400

    hashed_pw = hash_password(password)
    is_admin = (email.lower() == 'admin@brewtopia.com')
    user_doc = {
        'name': name,
        'email': email,
        'password': hashed_pw,
        'is_admin': is_admin,
        'created_at': datetime.datetime.utcnow()
    }
    result = db.users.insert_one(user_doc)
    user_doc['id'] = str(result.inserted_id)
    
    # Do not return hashed password to frontend
    del user_doc['password']
    del user_doc['_id']
    user_doc['created_at'] = user_doc['created_at'].isoformat()

    return jsonify({'message': 'Registration successful!', 'user': user_doc}), 201

# API Route: Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': 'Email and password are required'}), 400

    user = db.users.find_one({'email': email})
    if not user or not verify_password(password, user['password']):
        return jsonify({'error': 'Invalid email or password'}), 401

    user_info = serialize_doc(user)
    del user_info['password'] # Safe to return user details

    return jsonify({'message': 'Login successful!', 'user': user_info})

# API Route: Book a Table
@app.route('/api/book-table', methods=['POST'])
def book_table():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    date = data.get('date')
    time = data.get('time')
    guests = data.get('guests')
    user_id = data.get('user_id') # Link to registered user if logged in

    if not all([name, email, phone, date, time, guests]):
        return jsonify({'error': 'All fields are required'}), 400

    booking_doc = {
        'name': name,
        'email': email,
        'phone': phone,
        'date': date,
        'time': time,
        'guests': int(guests),
        'user_id': user_id, # Can be null for guest bookings
        'created_at': datetime.datetime.utcnow()
    }
    result = db.bookings.insert_one(booking_doc)
    booking_doc['id'] = str(result.inserted_id)
    del booking_doc['_id']
    booking_doc['created_at'] = booking_doc['created_at'].isoformat()

    return jsonify({'message': 'Table booked successfully!', 'booking': booking_doc}), 201

# API Route: Cancel a Booking
@app.route('/api/cancel-booking', methods=['POST'])
def cancel_booking():
    data = request.json
    booking_id = data.get('booking_id')
    if not booking_id:
        return jsonify({'error': 'Booking ID is required'}), 400

    result = db.bookings.delete_one({'_id': ObjectId(booking_id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Booking not found'}), 404

    return jsonify({'message': 'Booking cancelled successfully!'})

# API Route: Update a Booking
@app.route('/api/update-booking', methods=['POST'])
def update_booking():
    data = request.json
    booking_id = data.get('booking_id')
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    date = data.get('date')
    time = data.get('time')
    guests = data.get('guests')

    if not booking_id:
        return jsonify({'error': 'Booking ID is required'}), 400

    if not all([name, email, phone, date, time, guests]):
        return jsonify({'error': 'All fields are required'}), 400

    update_fields = {
        'name': name,
        'email': email,
        'phone': phone,
        'date': date,
        'time': time,
        'guests': int(guests)
    }

    result = db.bookings.update_one({'_id': ObjectId(booking_id)}, {'$set': update_fields})
    if result.matched_count == 0:
        return jsonify({'error': 'Booking not found'}), 404

    # Fetch updated doc
    updated_doc = db.bookings.find_one({'_id': ObjectId(booking_id)})
    return jsonify({'message': 'Booking updated successfully!', 'booking': serialize_doc(updated_doc)})

# API Route: Place Food Order
@app.route('/api/place-order', methods=['POST'])
def place_order():
    data = request.json
    user_id = data.get('user_id')
    items = data.get('items')
    total_price = data.get('total_price')
    booking_id = data.get('booking_id') # Link to a table reservation if dine-in
    order_type = data.get('order_type', 'takeaway')

    if not all([user_id, items, total_price]):
        return jsonify({'error': 'User, order items, and total price are required'}), 400

    order_doc = {
        'user_id': user_id,
        'items': items,
        'total_price': float(total_price),
        'booking_id': booking_id, # Optional
        'order_type': order_type,
        'status': 'Preparing',
        'created_at': datetime.datetime.utcnow()
    }
    result = db.orders.insert_one(order_doc)
    order_doc['id'] = str(result.inserted_id)
    del order_doc['_id']
    order_doc['created_at'] = order_doc['created_at'].isoformat()

    return jsonify({'message': 'Order placed successfully!', 'order': order_doc}), 201

# API Route: Get User Profile Data (Bookings + Orders)
@app.route('/api/user-data', methods=['GET'])
def get_user_data():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    # Fetch all table bookings for this user
    bookings_cursor = db.bookings.find({'user_id': user_id}).sort('created_at', -1)
    bookings_list = [serialize_doc(b) for b in bookings_cursor]

    # Fetch all food orders for this user
    orders_cursor = db.orders.find({'user_id': user_id}).sort('created_at', -1)
    orders_list = [serialize_doc(o) for o in orders_cursor]

    return jsonify({
        'bookings': bookings_list,
        'orders': orders_list
    })

# API Route: Admin Panel Data (Get All Bookings and Orders)
@app.route('/api/admin/data', methods=['GET'])
def get_admin_data():
    bookings_cursor = db.bookings.find().sort('created_at', -1)
    bookings_list = [serialize_doc(b) for b in bookings_cursor]

    orders_cursor = db.orders.find().sort('created_at', -1)
    orders_list = [serialize_doc(o) for o in orders_cursor]

    return jsonify({
        'bookings': bookings_list,
        'orders': orders_list
    })

# API Route: Admin Update Order Status
@app.route('/api/admin/update-order-status', methods=['POST'])
def update_order_status():
    data = request.json
    order_id = data.get('order_id')
    status = data.get('status') # Preparing, Ready, Served

    if not order_id or not status:
        return jsonify({'error': 'Order ID and status are required'}), 400

    result = db.orders.update_one({'_id': ObjectId(order_id)}, {'$set': {'status': status}})
    if result.matched_count == 0:
        return jsonify({'error': 'Order not found'}), 404

    updated_order = db.orders.find_one({'_id': ObjectId(order_id)})
    return jsonify({'message': 'Order status updated successfully!', 'order': serialize_doc(updated_order)})

# API Route: Admin Cancel Order
@app.route('/api/admin/cancel-order', methods=['POST'])
def cancel_order():
    data = request.json
    order_id = data.get('order_id')

    if not order_id:
        return jsonify({'error': 'Order ID is required'}), 400

    result = db.orders.delete_one({'_id': ObjectId(order_id)})
    if result.deleted_count == 0:
        return jsonify({'error': 'Order not found'}), 404

    return jsonify({'message': 'Order cancelled successfully!'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
