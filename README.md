# Rolls Roycs Projectig Success Project Hack 27 Team 4B

The project is divided in 5 sub modules

Of which 3 are interdependen:
- backend
- frontend
- db

The other 2 are features and additional functioanlity that is to be integrated as the future scope.
- static
- notebook

<br>

# Static

In the `static/output/` you can find multiple `.html` files made for each team using the `.ipynb` script.

<br>

# Frontend

To host the front end you need to have NodeJS installed in your device

once done do

`cd frontend` in the project root directory

once in frontend run

`npm install`

then

`npm run start`

<br>

# Backend

Run

in terminal run

`cd backend`

`conda env create -f hcd.yaml`

`conda activate hcd`

`uvicorn app:app --reload`

