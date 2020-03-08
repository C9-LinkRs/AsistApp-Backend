#Bash script for initialize a Mongo DB collection
#!bin/bash
set -e

mongo << EOF
use admin
db.createUser({
  user: '$MONGODB_USERNAME',
  pwd: '$MONGODB_PASSWORD',
  roles: [{
    role: 'readWrite',
    db: '$MONGO_INITDB_DATABASE'
  }]
})