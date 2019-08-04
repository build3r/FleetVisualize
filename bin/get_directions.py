#!/usr/bin/env python
import csv
import json
import requests

#from .config import GOOGLE_API_KEY, MAPQUEST_API_KEY

GOOGLE_DIRECTIONS = 'https://maps.googleapis.com/maps/api/directions/json'
MAPQUEST_DIRECTIONS = 'http://open.mapquestapi.com/directions/v2/route'

READ_KEYS = (
    'start_datetime',
    'pickup_longitude', 'pickup_latitude',
    'dropoff_longitude', 'dropoff_latitude',
    'trip_time_in_secs'
)

WRITE_KEYS = (
    'pickupTime', 'duration',
    'terminal', 'direction',
)


def get_google_polyline(value):
    value = json.loads(value)
    return value['routes'][0]['overview_polyline']['points']


def get_mapquest_polyline(value):
    value = json.loads(value)
    print(value['route']['shape']['shapePoints'])
    return value['route']['shape']['shapePoints']


def get_pickup_dropoff(data):
    return (
        '{},{}'.format(data['pickup_latitude'], data['pickup_longitude']),
        '{},{}'.format(data['dropoff_latitude'], data['dropoff_longitude'])
    )


def get_google_direction(data):
    pickup, dropoff = get_pickup_dropoff(data)
    params = dict(origin=pickup, destination=dropoff, key='GOOGLE_API_KEY')
    resp = requests.get(url=GOOGLE_DIRECTIONS, params=params)
    if resp.status_code == 200:
        return get_google_polyline(resp.content)
    return 'route-error'


def get_mapquest_direction(data):
    #pickup, dropoff = get_pickup_dropoff(data)
    pickup = "12.921529, 77.668855"
    dropoff = "12.909907, 77.685592"
    params = {
        'from': pickup, 'to': dropoff, 'key': 'q7kM2ebG1XIuP5kmcmLyhk1ASTN2GVeu',
        'fullShape': 'true', 'shapeFormat': 'cmp', 'manMaps': 'false',
        'narrativeType': 'none', 'doReverseGeocode': 'false',
    }
    resp = requests.get(url=MAPQUEST_DIRECTIONS, params=params)
    if resp.status_code == 200:
        #print(resp.content)
        return get_mapquest_polyline(resp.content)
    return 'route-error'


def record_error(row):
    with open('errors.csv', 'a') as f:
        writer = csv.DictWriter(f, READ_KEYS)
        writer.writerow(row)


def extract_data(path):
    with open(path, 'r') as f:
        reader = csv.DictReader(f, fieldnames=READ_KEYS)
        for row in reader:
            data = {
                'pickupTime': row['start_datetime'],
                'duration': row['trip_time_in_secs'],
                'terminal': "JFK",
                'direction': 'error',
            }
            try:
                data['direction'] = get_mapquest_direction(row)
            except:
                record_error(row)
            yield data


def write_with_directions():
    with open('with_directions.csv', 'w+') as f:
        writer = csv.DictWriter(f, WRITE_KEYS)
        writer.writeheader()
        rows = extract_data('sample.csv')
        for row in rows:
            writer.writerow(row)


if __name__ == '__main__':
    get_mapquest_direction(None)
    #write_with_directions()
