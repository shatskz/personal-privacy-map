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
            address2: '',
            mapCenter: {
                lat: 36.174465,
                lng: -86.767960
            },
            selectCalled: false
        };
    }

    handleChange = address => {
        this.setState({ address });
    };

    handleChange2 = address2 => {
        this.setState({ address2 });
    };
     
    handleSelect = address => {
        geocodeByAddress(address)
            .then(results => getLatLng(results[0]))
            .then(latLng => { 
                console.log('Success', latLng);
                this.setState({ address });
                this.setState({ mapCenter: latLng });
                this.setState({ selectCalled: true })

                // Send coords to Flask backend
                const send_route = "http://localhost:5000/send_location"
                axios.post(send_route, { coords: latLng, radius: 1000 })
                    .then(response => {
                        console.log('Flask response:', response.data);
                    })
                    .catch(error => console.error('Error calling Flask:', error)); 
            })

            .catch(error => console.error('Error', error));
    };

    handleSelect2 = address2 => {
        geocodeByAddress(address2)
            .then(results => getLatLng(results[0]))
            .then(latLng => { 
                console.log('Success2', latLng);
                this.setState({ address2 });
                this.setState({ selectCalled: true })

                // Send coords to Flask backend
            //     const send_route = "[INSERT FLASK ROUTE HERE]"
            //     axios.post(send_route, { coords: latLng, radius: 1000 })
            //         .then(response => {
            //             console.log('Flask response:', response.data);
            //         })
            //         .catch(error => console.error('Error calling Flask:', error)); 
            })

            .catch(error => console.error('Error', error));
    };

    // What happens when the clear database button is clicked
    clearDatabase = async () => {
        try {
            const response = await axios.post('[INSERT FLASK ROUTE HERE]');
            console.log(response.data);
        } catch (error) {
            console.error('Error clearing database', error);
        }
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
                    placeholder: 'Location to be hidden',
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
            
            {/* For second address */}
            {/* Only render the second address input after the first address has been selected */}
            {this.state.selectCalled && (
                <PlacesAutocomplete
                    value={this.state.address2}
                    onChange={this.handleChange2}
                    onSelect={this.handleSelect2}
                >
                {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                    <input
                    {...getInputProps({
                        placeholder: 'Location to be sent to DB',
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
            )}

            {/* Clear database button */}
            {/* Change the clearDatabase function to the correct route */}
            {this.state.selectCalled && (
                <button onClick={this.clearDatabase}>Clear Database</button>
            )}

            {/* Conditionally render the map */}
            {this.state.selectCalled && (
                <MapDisplay 
                    className="map" 
                    center={this.state.mapCenter} 
                    googleProp = {this.props.google}
                />
            )}
            </div>
        );
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

    React.useEffect(() => {
        const fetchWeather = async () => {
            var updatedLat = center.lat;
            var updatedLng = center.lng;
            // Make a GET request to your Flask backend
            const check_route = "http://localhost:5000/check_location"
            const backendResponse = await axios.get(check_route, {
                params: {
                    lat: center.lat,
                    lng: center.lng
                }
            }).then(response => {
                console.log('Flask response:', response.data);
                // Extract updated lat and lon from backend response
                updatedLat = response.data.lat;
                updatedLng = response.data.lng;
            })
            .catch(error => console.error('Error calling Flask:', error)); 
            console.log(updatedLat)

            // Update center state with new values
            // center({
            //     lat: updatedLat,
            //     lng: updatedLon
            // });

            const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${updatedLat}&lon=${updatedLng}&units=imperial&appid=c0fffbaa1459c29a3f23ff1f9e831050`);
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
                    <p>Latitude: {weather.coord.lat} Longitude: {weather.coord.lon}</p>
                    <h3>Location to Protect</h3>
                    <p>Latitude: {center.lat} Longitude: {center.lng}</p>
                </div>
            )}
        </div>
    );
} 
   
export default GoogleApiWrapper({
apiKey: ('AIzaSyC8Rg1gv03werkpPdxNBEhUr73b-k_wjqc') // TODO: delete before pushing to GitHub
})(MapContainer)