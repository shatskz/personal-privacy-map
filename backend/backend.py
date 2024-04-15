from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from math import radians, cos, sin, asin, sqrt, pi
from geopy import distance
from cryptography.fernet import Fernet
import random
import struct
import os
# import timeit, pickle

# App/DB setup
app = Flask(__name__)
db_dir = "backend/locations.db"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.abspath(db_dir)
CORS(app)
db = SQLAlchemy(app)

# Cryptography generation for DB
key = Fernet.generate_key()
f = Fernet(key)

# Variable for currently entered location
current_coords = {'lat': 0, 'lng': 0}

# file_name = "db_no_matches_5.pkl"
# times_file = os.path.join("backend/data", file_name)
# times = []

# Class for Location objects to be stored in the DB
class Location(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    latitude = db.Column(db.LargeBinary, nullable = False)
    longitude = db.Column(db.LargeBinary, nullable = False)
    radius = db.Column(db.Integer, nullable = False)

    def __init__(self, latitude, longitude, radius):
        # Encrypt the latitude and longitude coordinates as they are stored
        self.latitude = f.encrypt(struct.pack('f', latitude))
        self.longitude = f.encrypt(struct.pack('f', longitude))
        self.radius = radius

# Calculate the distance between points to see if they are within circle radius
def distance_check(loc):
    current_coords_tuple = tuple(current_coords.values())
    center_coords_tuple = (loc['latitude'], loc['longitude'])
    dist = distance.distance(center_coords_tuple, current_coords_tuple).km
    return dist <= loc['radius']

# Compute new coordinates to return
def new_coords(loc):
    # Extract values from loc
    radius = loc['radius']
    lat = loc['latitude']
    lng = loc['longitude']

    # Randomly pick amount to change latitude
    lat_diff = random.uniform(-radius, radius)
    # Randomly pick amount to change longitude staying within radius
    lng_diff_bound = sqrt(radius**2 - lat_diff**2)
    lng_diff = random.uniform(-lng_diff_bound, lng_diff_bound)

    # Get the conversion factors for km to latitude
    lat_km = 111
    lng_km = 111 * cos(lat * (pi / 180))

    # Add the converted values to the center coords
    new_lat = lat + (lat_diff / lat_km)
    new_lng = lng + (lng_diff / lng_km)

    return new_lat, new_lng

# Clear the db
def reset_db():
    meta = db.metadata
    for table in reversed(meta.sorted_tables):
        db.session.execute(table.delete())
    db.session.commit()

# Send the entered location to be stored locally
@app.route('/send_location', methods=['POST'])
def send_location():
    # Extract data from the request
    data = request.json
    # Save coordinates locally
    current_coords['lat'] = data['coords']['lat']
    current_coords['lng'] = data['coords']['lng']
    print(current_coords)

    return jsonify({'message': 'Success'})

# Save the entered location into the database
@app.route('/save_location', methods=['POST'])
def save_location():
    data = request.json
    lat = data['coords']['lat']
    lng = data['coords']['lng']
    radius = data['radius'] / 1000
    # Create new Location object and insert it into the DB
    location = Location(lat, lng, radius)
    db.session.add(location)
    db.session.commit()

    # Get all the location data from the DB
    locations = Location.query.all()
    # Put all the location data into a list of Location objects in a serialized JSON format
    location_list = []
    for location in locations:
        location_data = {
            'id': location.id,
            'latitude': location.latitude,
            'longitude': location.longitude,
            'radius': location.radius
        }
        location_list.append(location_data)
    print(location_list)

    return jsonify({'message': 'Success'})

# Clear all the data in the database
@app.route('/clear_db', methods=['POST'])
def clear_db():
    reset_db()

    return jsonify({'message': 'Success'})

# Check to see if the stored location matches any database entries
@app.route('/check_location', methods=['GET'])
def check_location():
    # Start time
    # start = timeit.default_timer()
    # print("start", start)

    lat = current_coords['lat']
    lng = current_coords['lng']
    print("Entered location coordinates:", lat, lng)

    # Get all the location data from the DB
    locations = Location.query.all()
    # Put all the location data into a list of Location objects in a serialized JSON format
    # Decrypt the encrypted coordinates stored in the database
    location_list = []
    for location in locations:
        location_data = {
            'id': location.id,
            'latitude': struct.unpack('f', f.decrypt(location.latitude))[0],
            'longitude': struct.unpack('f', f.decrypt(location.longitude))[0],
            'radius': location.radius
        }
        location_list.append(location_data)

    print(location_list)
    modified = False # Test var

    for loc in location_list:
        if distance_check(loc):
            print("Current coords are within radius of saved coords.")
            lat, lng = new_coords(loc)
            modified = True
            print("New modified coordinates:", lat, lng)
            break
    
    if not modified:
        print("Coordinates not modified")

    # times.append(timeit.default_timer() - start)
    # if len(times) == 12:
    #     with open(times_file, 'wb') as file:
    #         pickle.dump(times[2:], file)
    #     print("file written")
    # print(len(times))
    # Return a response if needed
    return jsonify({'lat': lat, 'lng': lng})


if __name__ == '__main__':
    # Create the table in the DB
    with app.app_context():
        db.create_all()
        reset_db()
    app.run(debug=True)