# Final Project for CS 8395-05 (Security & Privacy in Pervasive Environments)


In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes. You may also see any lint errors in the console.

To run the backend, execute `python3 backend.py` from within the backend/ directory, or click the run button on the file if you are using an IDE.

Additionally, a Google Maps API key will need to be entered into the bottom of the GoogleMaps.js file (located within the src/components/ directory) in order to run it. The location to enter this is the second to last line in the file inside of the `apiKey: ('')` statement.

Timing data was manually obtained using timing functions in the check_location() method in the backend.py file along with manual inputs on the frontend. To generate your own data, uncomment these lines and enter data into the frontend. Raw data that we collected can be found in the backend/data/ directory. The data.ipynb file in the same directory displays all of this data, as well as associated statistics and figures.