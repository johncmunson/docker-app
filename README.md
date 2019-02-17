### Running the application

`docker-compose up` and wait until you see `Connected to database` in the console

### Todo:

- ~~setup docker such that changes in src get mapped into the running container. see step 5 in [this page](https://docs.docker.com/compose/gettingstarted/) of the docker documentation.~~
- setup CI/CD pipeline that handles dev, staging, prod
- ~~establish a way to seed the database~~
- ~~establish a way to run database migrations~~
  - ~~[sqitch](https://github.com/sqitchers/sqitch), [migrate](https://github.com/golang-migrate/migrate), [flyway](https://github.com/flyway/flyway-docker#docker-compose), [umzug](https://github.com/sequelize/umzug), [liquibase](http://www.liquibase.org/), or if you choose an ORM it may come with migrations capability~~
- setup production database, perhaps AWS RDS or AWS Aurora. alternatively, read the next bullet point
- read [Where to Store Data](https://hub.docker.com/_/postgres/) from the postgres docker image readme
- setup [EC2 autoscaling and ELB load balancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html)
- refactor into some sort of [MVC architecture](https://itnext.io/a-new-and-better-mvc-pattern-for-node-express-478a95b09155)
- consider refactoring to use an ORM, or possibly massive
- before refactoring to ORM, see this [github issue](https://github.com/brianc/node-postgres/issues/1763#issuecomment-435961154) regarding moving SQL statements to an /sql directory
- see this [github issue](https://github.com/dmfay/massive-js/issues/663#issuecomment-459915014) regarding massive
- see this [github issue](https://github.com/brianc/node-postgres/issues/1151#issuecomment-461534295) regarding express
