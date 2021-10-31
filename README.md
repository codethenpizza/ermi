# ERMI-API

## start services
`docker stack deploy -c stack.yml ermi`

## dev
`npm run dev`

## build
`npm run build`

## start
`npm run start`

## migrate
`npm run migrate`


## generate token secret
`node`
`require('crypto').randomBytes(64).toString('hex')`
