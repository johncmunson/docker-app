### Running the application

1. Create vm on remote host

docker-machine create —driver digitalocean --digitalocean-access-token=d32cdd36e73 myvm

2. Deploy containers to remote host

eval \$(docker-machine env myvm)

docker-compose build

docker-compose push

docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

3. Ssh into remote host (if needed)

Docker-machine ssh myvm

4. Open interactive terminal inside running container (if needed)

docker exec -it mycontainer bash

5. Copy source files to remote vm
   (shouldn’t need to do this since we’re not using docker volumes in production)

docker-machine scp -r -d /path/to/local/directory/ myvm:/path/to/remote/directory/

_use trailing slashes when using the -d flag_

See https://docs.docker.com/machine/reference/scp/ for more details

6. Tear down the remote vm and reset env variables on local computer

eval \$(docker-machine env -u)

docker-machine stop myvm

docker-machine rm myvm

### Database migrations

When running `docker-compose up`, the migrations container will run all up migrations that have not already been applied when the container initializes.

When pulling in code updates that contain new migrations, or perhaps when switching to a different branch, you will need to apply those migrations from within the migrations container, `docker exec -it <migrate-container-name> npm run migrate`.

When switching to an older branch you may need to apply down migrations to get the database into a compatible state. See the [node-migrate](https://github.com/tj/node-migrate) project for instructions.

To create a new migration, `cd migrate && npm run create-migration`, and then fill in the up and down migrations in the generated template.

If you need to reset the database for any reason (dev or staging only, obviously), you can run the `reset-db.sh` script from within the postgres container, `docker exec -it <postgres-container-name> sh reset-db.sh`. Alternatively, you could apply the `-v` flag when running `docker-compose down` to wipeout any shared docker volumes. From here, you can manually apply all of the up migrations as described above, or you can let `docker-compose up` handle it automatically when you bring the containers back up. _Note: Be sure to delete the `.migrate` file if you reset the database._

### Todo:

- setup CI/CD pipeline that handles dev, staging, and blue/green prod
- consider replacing node-migrate with squitch
- setup a testing suite
- establish a better database query layer to support a more restful api (or JSON-RPC)
  - many options here: pg-promise, massive, squel, knex, sqitch, node-db-migrate, node-migrate, flyway, sequelize, typeorm, umzug, slonik, etc
- refactor the auth service into [MVC architecture](https://itnext.io/a-new-and-better-mvc-pattern-for-node-express-478a95b09155)
- setup [EC2 autoscaling and ELB load balancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html)
- setup production database, perhaps AWS RDS or AWS Aurora
- build a frontend service

### Notes:

- see this [github issue](https://github.com/dmfay/massive-js/issues/663#issuecomment-459915014) regarding massive
- see this [github issue](https://github.com/brianc/node-postgres/issues/1151#issuecomment-461534295) regarding express
