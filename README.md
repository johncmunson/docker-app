### Running the application

- `docker-compose up -d`

### Database migrations

- `cd migrate`
- `npm run migrate`... run any migrations that have not yet been applied
- `npm run clean-migrate`... reset the database and run all migrations
- `npm run create-migration`... create a database migration that needs to be populated

### Todo:

- setup CI/CD pipeline that handles dev, staging, and blue/green prod
- consider replacing node-migrate with squitch
- setup a testing suite
- establish a better database query layer to support a more restful api
  - many options here: pg-promise, massive, squel, knex, sqitch, node-db-migrate, node-migrate, flyway, sequelize, typeorm, umzug, slonik, etc
- refactor the auth service into [MVC architecture](https://itnext.io/a-new-and-better-mvc-pattern-for-node-express-478a95b09155)
- setup [EC2 autoscaling and ELB load balancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html)
- setup production database, perhaps AWS RDS or AWS Aurora
- build a frontend service

### Notes:

- see this [github issue](https://github.com/dmfay/massive-js/issues/663#issuecomment-459915014) regarding massive
- see this [github issue](https://github.com/brianc/node-postgres/issues/1151#issuecomment-461534295) regarding express
