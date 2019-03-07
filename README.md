### High level goals

- Utilize the Docker platform (containers, compose, swarm)
- Proper GitOps
- Generalized enough to be used for bootstrapping new projects quickly
- Rapid bootstrapping process
- Multiple environments (dev, testing, staging, prod)
- Environment parity
- Blue/green deployments
- Simple database migrations
- CI/CD pipeline w/ testing suite
- Cloud agnostic
- Strategy for managing and distributing secrets
- DRY config utilizing environment variables
- High availability (many instances, multiple hosts, auto-healing)
- Scaling, and possibly auto-scaling
- Service oriented (rather than monolithic)
- Stateless and decoupled
- Database backups

### Prerequisites

- Docker installed
- Node/npm installed (not absolutely essential, but if you don't then you'll have to always be running commands from inside containers which is not always convenient)
- An account with a cloud hosting platform. This project is currently using Digital Ocean, but it should be trivial to switch to another platform such as AWS.

### Hacking in the dev environment

To get up and running on your local machine, clone the project from Github and boot it up by running `docker-compose up -d`. You can then run `docker ps` to check that all containers started and are running.

Most containers make use of service volumes in development so that you can make edits on your host machine and Docker will automatically map your changes into the running container.

Upon initializing, the migrations container should automatically run any database migrations and apply them to the database container. The database container utilizes a named docker volume in order to persist data to the host machine. This way, if the database container fails, it can be spun back up and pick up where it left off. Speaking of failure, most containers are configured to be restarted in the event of a failure.

Some containers output useful information to the console, especially in development. However, it is the console inside the running container, not the console of your host machine. To access a container's console output, run `docker logs <container-name>`.

### Initial setup of the production server

Here, we will document how to setup your production server on Digital Ocean, but the process should be similar for other cloud providers.

First, create an account and in the API section generate an access token. Now, we will need to use `docker-machine` and the access token to install the Docker engine on Digital Ocean, which will create a new Droplet in the process.

```
docker-machine create \
--driver digitalocean \
--digitalocean-access-token=<access-token>
<machine-name>
```

And that's it! You can run `docker-machine ls` just to check that things went smoothly. We now have a running production server with Docker installed on it and ready to be deployed to.

### Deploying to production

The production environment builds containers from images in Docker Hub, rather than building them from directories on the host machine like in development. Therefore, rebuild your images with `docker-compose build` and push them to Docker Hub with `docker-compose push`.

Now, we're ready to deploy our updates. Using `docker-machine`, switch the Docker engine that the Docker daemon is interacting with to the remote production machine. All we need to do is set some environment variables, and we can do this in one fell swoop by running `eval $(docker-machine env <remote-vm-name>)`. Now, we can deploy updates with `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.

By running `docker-compose up` with container instances already in service, Docker will automatically detect which images have changed and then tear down and rebuild the associated containers. This isn't exactly a blue/green or a rolling deployment, and there may be some minimal downtime, but it's pretty slick nonetheless.

To understand the modified `docker-compose up` command we just ran, you will need an understanding of how multiple environments are handled using `docker-compose.yml` files, as recommended in the Docker documentation.

- `docker-compose.yml` - our base configuration, used by default by `docker-compose`
- `docker-compose.override.yml` - configuration specific to local development, and also used by default by `docker-compose`
- `docker-compose.prod.yml` - similar to `docker-compose.override.yml`, but used for production specific configuration. This file is not used by default by `docker-compose`, therefore we use the `-f` flag to specifically instruct Docker which configuration files to apply.
- You can of course have additional compose files as needed, for example to support a staging environment.

### Database migrations

When running `docker-compose up`, the migrations container will run all up migrations that have not already been applied when the container initializes. The migrations library, `node-migrate`, uses the `.migrate` file to track which migrations.

When pulling in code updates that contain new migrations, or perhaps when switching to a different branch, you will need to apply those migrations from within the migrations container, `docker exec -it <container-name> npm run migrate`.

When switching to an older branch you may need to apply down migrations to get the database into a compatible state. See the [node-migrate](https://github.com/tj/node-migrate) project for instructions.

To create a new migration, `cd migrate && npm run create-migration`, and then fill in the up and down migrations in the generated template. You can apply your migration from within the migrations container, as described above.

If you need to reset the database for any reason (dev or staging only, obviously), you can run the `reset-db.sh` script from within the postgres container, `docker exec -it <postgres-container-name> sh reset-db.sh`. Alternatively, you could apply the `-v` flag when running `docker-compose down` to wipeout any shared docker volumes. From here, you can manually apply all of the up migrations as described above, or you can let `docker-compose up` handle it automatically when you bring the containers back up.

_Note: Be sure to delete the `.migrate` file if you reset the database. Also, triple check that you are not connected to the production virtual machine when running `docker-compose down`, especially when you are applying the `-v` flag._

### Useful Docker commands

- **SSH into a remote Docker machine:** `docker-machine ssh <machine-name>` - Docker automatically automatically generates and manages SSH keys when creating new virtual machines
- **Open an interactive terminal inside a running container:** `docker exec -it <container-name> bash` - Alternatively, you can replace `bash` with a one off command to run (no quotes needed)
- **Copy files to a remote virtual machine:** `docker-machine scp -r -d /path/to/local/directory/ myvm:/path/to/remote/directory/` - In general, shouldn't need to do this since we're just running containers in production. See https://docs.docker.com/machine/reference/scp/ for more details.
- **Reset docker-machine env variables so that the daemon is interacting with your local Docker engine:** `eval $(docker-machine env -u)`
- **Tear down a remote virtual machine:** `docker-machine stop <vm-name> && docker-machine rm <vm-name>`

### Helpful articles

- [How to Update a Single Running docker-compose Container](https://staxmanade.com/2016/09/how-to-update-a-single-running-docker-compose-container/)
- [Run Multiple Docker Environments from the Same docker-compose File](https://staxmanade.com/2016/07/run-multiple-docker-environments--qa--beta--prod--from-the-same-docker-compose-file-/)

### Scratchpad:

- setup CI/CD pipeline that handles dev, staging, and blue/green prod
- investigate how a reverse-proxy such as nginx or traefik would fit into the architecture
  - I'm thinking that the reverse-proxy is what should be exposed to the internet, rather than the node service that contains the auth logic
  - the reverse-proxy server can then delegate to the node service, and any other service, as necessary
- consider replacing node-migrate with squitch
- setup a testing suite (possibly as another docker service)
- establish a better database query layer to support a more restful api (or JSON-RPC)
  - many options here: pg-promise, massive, squel, knex, sqitch, node-db-migrate, node-migrate, flyway, sequelize, typeorm, umzug, slonik, etc
- refactor the auth service into [MVC architecture](https://itnext.io/a-new-and-better-mvc-pattern-for-node-express-478a95b09155). Look at upgrading to Egg or Adonis.
- setup [EC2 autoscaling and ELB load balancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html)
- setup production database. AWS RDS, AWS Aurora, Digital Ocean block storage, Digital Ocean managed database, etc.
- build a frontend service
- see this [github issue](https://github.com/dmfay/massive-js/issues/663#issuecomment-459915014) regarding massive
- see this [github issue](https://github.com/brianc/node-postgres/issues/1151#issuecomment-461534295) regarding express
