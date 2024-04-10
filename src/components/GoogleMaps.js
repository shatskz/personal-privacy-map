import React, {Component} from 'react';
import {Map, Circle, GoogleApiWrapper} from 'google-maps-react';
import PlacesAutocomplete, {
    geocodeByAddress,
    getLatLng,
  } from 'react-places-autocomplete';
import axios from 'axios';

export class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            address: '',
            mapCenter: {
                lat: 36.174465,
                lng: -86.767960
            }
        };
    }

    handleChange = address => {
        this.setState({ address });
    };
     
    handleSelect = address => {
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => { 
                console.log('Success', latLng);
                this.setState({ address });
                this.setState({ mapCenter: latLng });
            })

            .catch(error => console.error('Error', error));
    };

    render() {
        return (
        <div id="googleMap">
            <PlacesAutocomplete
                value={this.state.address}
                onChange={this.handleChange}
                onSelect={this.handleSelect}
            >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
            <div>
                <input
                {...getInputProps({
                    placeholder: 'Where do you want your location hidden?',
                    className: 'location-search-input',
                })}
                />
                <div className="autocomplete-dropdown-container">
                {loading && <div>Loading...</div>}
                {suggestions.map(suggestion => {
                    const className = suggestion.active
                    ? 'suggestion-item--active'
                    : 'suggestion-item';
                    // inline style for demonstration purpose
                    const style = suggestion.active
                    ? { backgroundColor: '#fafafa', cursor: 'pointer' }
                    : { backgroundColor: '#ffffff', cursor: 'pointer' };
                    return (
                    <div
                        {...getSuggestionItemProps(suggestion, {
                        className,
                        style,
                        })}
                    >
                        <span>{suggestion.description}</span>
                    </div>
                    );
                })}
                </div>
            </div>
            )}
            </PlacesAutocomplete>

            {/* Conditionally render the map */}
            {this.state.address && (
                <MapDisplay 
                    className="map" 
                    center={this.state.mapCenter} 
                    googleProp = {this.props.google}
                />
            )}
            </div>
        );

                    {/* <Map 
                google={this.props.google}
                initialCenter={{
                    lat: this.state.mapCenter.lat,
                    lng: this.state.mapCenter.lng
                }}
                center={{
                    lat: this.state.mapCenter.lat,
                    lng: this.state.mapCenter.lng
                }}
            >
                <Circle
                    radius={1000}
                    center={{
                        lat: this.state.mapCenter.lat,
                        lng: this.state.mapCenter.lng
                    }}
                    fillColor='#FF0000'
                    fillOpacity={0.4}
                />
                {/* <Marker  
                    position= {{
                        lat: this.state.mapCenter.lat,
                        lng: this.state.mapCenter.lng 
                    }}
                />
            </Map>
        </div>
        ) */}
    }
}

const MapDisplay = ({ center, googleProp }) => {
    return (
        <div>
            <WeatherDisplay center={center} />
            <Map 
                className='map'
                style={{ width: '80%', height: '80%', margin: '130px' }}
                google={googleProp}
                initialCenter={{
                    lat: center.lat,
                    lng: center.lng
                }}
                center={{
                    lat: center.lat,
                    lng: center.lng
                }}
            >
                <Circle
                    radius={1000}
                    center={{
                        lat: center.lat,
                        lng: center.lng
                    }}
                    fillColor='#FF0000'
                    fillOpacity={0.4}
                />
            </Map>
        </div>
    );
}

function WeatherDisplay({ center }) {
    const [weather, setWeather] = React.useState(null);
    //const API_KEY = 'c0fffbaa1459c29a3f23ff1f9e831050';

    React.useEffect(() => {
        const fetchWeather = async () => {
            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${center.lat}&lon=${center.lng}&units=imperial&appid=c0fffbaa1459c29a3f23ff1f9e831050`);
            setWeather(response.data);
            console.log(response.data);
        };

        fetchWeather();
    }, [center]);

    return (
        <div>
            {weather && (
                <div>
                    {/* Insert longitude and latitude here and show that it's the same city */}
                    <h3>Weather in {weather.name}</h3>
                    <p>{weather.main.temp}°F</p>
                    <p>{weather.weather[0].description}</p>
                    <p>Longitude: {weather.coord.lon} Latitude: {weather.coord.lat}</p>
                    <h3>Location to Protect</h3>
                    <p>Longitude: {center.lng} Latitude: {center.lat}</p>
                </div>
            )}
        </div>
    );
} 
   
export default GoogleApiWrapper({
apiKey: ('') // TODO: delete before pushing to GitHub
})(MapContainer)
