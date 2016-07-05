# Bastobe Backend, Written in NodeJS
#### By Akib Shahjahan

## Bastobe
Bastobe is a mobile app, available in both Android and iOS. To put it bluntly,
it is a location-based photo-sharing app. The main purpose of the app is to
allow people to see the world around them and far away from them, and to truly
let people live and experience the world.

## Backend
The backend of the app is written in NodeJS and it is currently deployed on
Heroku. Most of the business logic of the app is purposely placed in the
backend to allow for control, flexibility and consistency. ExpressJS
framework was used to build the REST API, and the data was stored in a nosql
database called MongoDB, using the Mongoose framework. The database has been
currently deployed on mLab. Lastly, authentication has been handled using
the Facebook version of PassportJS.

## Status
The core of the backend has already been designed. The comments system is the
only major component that is not completed; it is currently in progress. Error
handling is yet to be completed as well. The code should also be cleaned up
considerable. However, a sleek final product is very near completion.
