from flask import Flask, request, jsonify
from flask_cors import CORS
from math import radians, cos, sin, asin, sqrt, pi
from geopy import distance
import random

app = Flask(__name__)
CORS(app)

center_coords = {'lat': 0, 'lng': 0}
radius = 0

# Calculate the distance between points to see if they are within circle radius
def distance_check(current_coords):
    # # Convert decimal degrees to radians
    # lat1, lng1 = center_coords['lat'], center_coords['lng']
    # lat2, lng2 = current_coords['lat'], current_coords['lng']
    # lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])

    # # Haversine formula
    # lat_diff = lat2 - lat1
    # lng_diff = lng2 - lng1 
    # a = sin(lat_diff/2)**2 + cos(lat1) * cos(lat2) * sin(lng_diff/2)**2
    # c = 2 * asin(sqrt(a)) 
    # r = 6371 # Radius of earth in kilometers
    # # Return whether or not the distance is less than the radius
    # return (c * r) < radius

    center_coords_tuple = tuple(center_coords.values())
    dist = distance.distance(center_coords_tuple, current_coords).km
    return dist <= radius

# Compute new coordinates to return
def new_coords():
    # Randomly pick amount to change latitude
    lat_diff = random.uniform(-radius, radius)
    # Randomly pick amount to change longitude staying within radius
    lng_diff_bound = sqrt(radius**2 - lat_diff**2)
    lng_diff = random.uniform(-lng_diff_bound, lng_diff_bound)

    # Get the conversion factors for km to latitude
    lat_km = 111
    lng_km = 111 * cos(center_coords['lat'] * (pi / 180))

    # Add the converted values to the center coords
    new_lat = center_coords['lat'] + (lat_diff / lat_km)
    new_lng = center_coords['lng'] + (lng_diff / lng_km)
    # print(lat_diff, lng_diff)

    return new_lat, new_lng


@app.route('/send_location', methods=['POST'])
def send_location():
    # Extract data from the request
    data = request.json
    coords = data['coords']
    # Save coordinates as center
    center_coords['lat'] = coords['lat']
    center_coords['lng'] = coords['lng']
    # Save radius and convert from meters to kilometers
    global radius
    radius = data['radius'] / 1000
    print(center_coords)
    print(radius)

    # Return a response if needed
    return jsonify({'message': 'Success'})


@app.route('/check_location', methods=['GET'])
def check_location():
    # Extract data from the request
    print("test")
    # data = request.args.get
    # print(request.args)
    lat = request.args.get('lat')
    lng = request.args.get('lng')
    print(lat, lng)

    if distance_check((lat, lng)):
        # print("Current coords are within radius of center coords.")
        # print("Randomly shifting coordinates...")
        lat, lng = new_coords()
        print(lat, lng)
        if not distance_check((lat, lng)):
            print("Computation went wrong...")

    # Return a response if needed
    return jsonify({'lat': lat, 'lng': lng})


if __name__ == '__main__':
    app.run(debug=True)