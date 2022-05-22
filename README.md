# Share-A-Meal

## Description

This is an API I made for one of my classes at Avans.
This API allows users to search for users and meals submitted to an online database.
You can also make an account which you could use to add meals yourself.

## Badges

[![Deploy to Heroku](https://github.com/Niekelodius/programmeren-4-shareameal/actions/workflows/main.yml/badge.svg)](https://github.com/Niekelodius/programmeren-4-shareameal/actions/workflows/main.yml)

## Installation

```
cd existing_repo
git remote add origin https://github.com/Niekelodius/programmeren-4-shareameal.git
git branch -M main
git push -uf origin main
npm install
```

### Starting the program

After installing the code you can start running the programming by typing the following line of code in your terminal.
(Running this program does require a running instance of mysql, which can be done through XAMPP).

```
npm start
```

## Dependencies

### Required:

- [ ] [express](https://expressjs.com/)
- [ ] [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [ ] [mysql](https://www.w3schools.com/nodejs/nodejs_mysql.asp)
- [ ] [tracer](https://www.npmjs.com/package/tracer)

### Used in development:

- [ ] [chai](https://www.chaijs.com/)
- [ ] [chai-http](https://www.chaijs.com/plugins/chai-http/)
- [ ] [mocha](https://mochajs.org/)
- [ ] [nodemon](https://www.npmjs.com/package/nodemon)

## Tools used

Visual studio code was used to write the code for this API.
Github was used for uploading code and version control.
Heroku was used to make the API available online.
Postman was used to test the API in development.
XAMPP was used to have an offline database while testing.

## Languages used

.._ Javascript
.._ mySQL

# Deployment

This app has been deployed to heroku and can be found here: https://share-a-meal-niek.herokuapp.com/.

## Usage

Documentation of a simular API can be found here https://shareameal-api.herokuapp.com/docs/#/User/UserController_create.
The available routes are:
| Request | Route |
| ------------- |-------------|
| POST | /api/auth/login | Log in using emailAddress and password |
| POST | /api/user | Register as a new user |
| GET | /api/user | Get all users |
| GET | /api/user/profile | Request your personal user profile |
| GET | /api/user/{id} | Get a single user by id |
| PUT | /api/user/{id} | Update a single user |
| DELETE | /api/user/{id} | Delete user |
| POST | /api/meal | Register meal |
| GET | /api/meal | Get all meals |
| GET | /api/meal/{id} | Get a single meal by id |
| PUT | /api/meal/{id} | Update a single meal |
| DELETE | /api/meal/{id} | Delete meal |

## Support

My emailaddress is nca.goossens@student.avans.nl, however it is unlikely I will provide any support for this project.

## Roadmap

Development for this API will most likely stop on the 20th of may 2022.
