### Prerequisites

- Install Docker.
- Install node/npm (and possibly others). This isn't absolutely essential, but if you don't then you'll have to always be running commands from inside containers which is not always convenient.
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

The production server builds containers from images, rather than building them from directories on the host machine like in development. It will read from the existing images that are on the virtual machine, or else it will pull them from Docker Hub. With this in mind let's get started.

Using `docker-machine`, switch the Docker engine that the Docker daemon is interacting with to the remote production machine. All we need to do is set some environment variables, and we can do this in one fell swoop by running `eval $(docker-machine env <remote-vm-name>)`.

The next step is to (re)build our images with `docker-compose build`. The beauty of this is that Docker builds our images using our production ready code that resides on the computer we are working from, but since we configured Docker to communicate with the production server in the previous step, that is now where the built images reside. After successfully building the production images, let's go ahead and push them to Docker Hub with `docker-compose push`.

Now, we can deploy updates (or deploy for the very first time) with `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d`.

By running `docker-compose up` with container instances already in service, Docker will automatically detect which images have changed and then tear down and rebuild the associated containers. This isn't exactly a blue/green or a rolling deployment, and there may be some minimal downtime, but it's pretty slick nonetheless. If there were any new database migrations, they will automatically be applied to the production database.

To understand the modified `docker-compose up` command we just ran, you will need an understanding of how multiple environments are handled using `docker-compose.yml` files, as recommended in the Docker documentation.

- `docker-compose.yml` - our base configuration, used by default by `docker-compose`
- `docker-compose.override.yml` - configuration specific to local development, and also used by default by `docker-compose`
- `docker-compose.prod.yml` - similar to `docker-compose.override.yml`, but used for production specific configuration. This file is not used by default by `docker-compose`, therefore we use the `-f` flag to specifically instruct Docker which configuration files to apply.
- You can of course have additional compose files as needed, for example to support a staging environment.

### Scaling your services

Scaling services to use more instances is exceptionally easy with docker-compose. Just run `docker-compose up -d --scale <service-name>=<no. of instances>`. The `<service-name>` comes from how you've named your service inside `docker-compose.yml`. The docker engine manages inter-service communication, including load balancing this communication. No extra steps are needed for docker to "discover" the new instances and begin load balancing to them.

However, our nginx reverse-proxy is not yet aware of our new instances and it will need to be restarted for it to begin sending traffic to them... `docker-compose restart nginx`. See the Issues section below for different strategies of updating our reverse-proxy on the fly without having to restart the container.

_Note: docker-compose is limited to container orchestration on a single host, as opposed to Docker Swarm or Kubernetes which can manage containers across multiple host machines. A natural question to ask is, Why bother with scaling at all? The answer has to do with maintaining availability in the event of instance failures. If you only have one instance of the `auth` service running and it goes down, your application will be unavailable for the period of time it takes Docker to replace the failed container. If, however, you have multiple instances of the `auth` service running the load balancer can distribute traffic to the healthy instances while Docker is bringing the failed instance back up. Keep in mind that this form of "scaling" only improves availability and not raw compute power. To take on higher volumes of traffic to your application, you will still need to scale vertically by increasing the size/power of your host machine._

_Note: Only stateless services can be scaled. Stateful services, such as the database, cannot be scaled. Neither can any services that have a port bound to the host, such as the nginx reverse-proxy. In the case of nginx, Docker will fail with the message `WARNING: The "nginx" service specifies a port on the host. If multiple containers for this service are created on a single host, the port will clash.`_

### Database migrations

When running `docker-compose up`, the migrations container will run all up migrations that have not already been applied when the container initializes. The migrations library, `node-migrate`, uses the `.migrate` file to track migrations.

When pulling in code updates that contain new migrations, or perhaps when switching to a different branch, you will need to apply those migrations from within the migrations container, `docker exec -it <container-name> npm run migrate`.

When switching to an older branch you may need to apply down migrations to get the database into a compatible state. See the [node-migrate](https://github.com/tj/node-migrate) project for instructions.

To create a new migration, `cd migrate && npm run create-migration`, and then fill in the up and down migrations in the generated template. You can apply your migration from within the migrations container, as described above.

If you need to reset the database for any reason (dev or staging only, obviously), you can run the `reset-db.sh` script from within the postgres container, `docker exec -it <postgres-container-name> sh reset-db.sh`. Alternatively, you could apply the `-v` flag when running `docker-compose down` to wipeout any shared docker volumes. From here, you can manually apply all of the up migrations as described above, or you can let `docker-compose up` handle it automatically when you bring the containers back up.

_Note: Be sure to delete the `.migrate` file if you reset the database. Also, triple check that you are not connected to the production virtual machine when running `docker-compose down`, especially when you are applying the `-v` flag._

### Environment variables and configuration

Common configuration settings are stored in `.env`. To make Docker aware of environment variables defined this way, we use the service level `env_file` key in our `docker-compose.yml` files, and we're even allowed to list multiple files. Sensitive information like passwords and secrets can be stored in `secrets.env`, which is ignored by version control. To set environment specific configuration, such as `NODE_ENV=production`, use the service level `environment` key inside of the appropriate `docker-compose.yml` file. To access environment variables inside of a Dockerfile, you can look at `docker-compose.override.yml` and `auth/Dockerfile` for an example.

### Useful Docker commands

- **SSH into a remote Docker machine:** `docker-machine ssh <machine-name>` - Docker automatically automatically generates and manages SSH keys when creating new virtual machines
- **Open an interactive terminal inside a running container:** `docker exec -it <container-name> bash` - Alternatively, you can replace `bash` with a one off command to run (no quotes needed)
- **Copy files to a remote virtual machine:** `docker-machine scp -r -d /path/to/local/directory/ myvm:/path/to/remote/directory/` - In general, shouldn't need to do this since we're just running containers in production. See https://docs.docker.com/machine/reference/scp/ for more details.
- **Reset docker-machine env variables so that the daemon is interacting with your local Docker engine:** `eval $(docker-machine env -u)`
- **Tear down a remote virtual machine:** `docker-machine stop <vm-name> && docker-machine rm <vm-name>`

### Helpful articles

- [How to Update a Single Running docker-compose Container](https://staxmanade.com/2016/09/how-to-update-a-single-running-docker-compose-container/)
- [Run Multiple Docker Environments from the Same docker-compose File](https://staxmanade.com/2016/07/run-multiple-docker-environments--qa--beta--prod--from-the-same-docker-compose-file-/)
- [An Easy Recipe for Creating a PostgreSQL Cluster with Docker Swarm](https://info.crunchydata.com/blog/an-easy-recipe-for-creating-a-postgresql-cluster-with-docker-swarm)
- [Automated Nginx Reverse Proxy for Docker](http://jasonwilder.com/blog/2014/03/25/automated-nginx-reverse-proxy-for-docker/)
- [Docker Service Discovery Using Etcd and Haproxy](http://jasonwilder.com/blog/2014/07/15/docker-service-discovery/)
- [jwilder/dockerize](https://github.com/jwilder/dockerize)
- [Docker Machine: Basic Examples](https://www.macadamian.com/learn/docker-machine-basic-examples/)
- [Rolling updates with Docker Swarm](https://container-solutions.com/rolling-updates-with-docker-swarm/)
- [Don't use nodemon, there are better ways!](https://codeburst.io/dont-use-nodemon-there-are-better-ways-fc016b50b45e)
- [Using Docker-Compose Auto-Scaling to Scale Node.js Instances on a Single Machine](http://blog.lookfar.com/blog/2015/10/29/docker-compose-auto-scaling-node/)
- [JrCs/docker-letsencrypt-nginx-proxy-companion](https://github.com/JrCs/docker-letsencrypt-nginx-proxy-companion)
- [Minimal nginx configuration for front end development](http://www.staticshin.com/minimal-nginx-configuration-for-front-end-development/)
- [Definitely an openresty guide](http://www.staticshin.com/programming/definitely-an-open-resty-guide/)
- [Nginx HTTP server boilerplate configs](https://github.com/h5bp/server-configs-nginx)
- [Docker Tip #34: Should You Use Docker Compose in Production?](https://nickjanetakis.com/blog/docker-tip-34-should-you-use-docker-compose-in-production)
- [10 Tips for Docker Compose in Production](https://blog.cloud66.com/10-tips-for-docker-compose-hosting-in-production/)
- [9 Critical Decisions for Running Docker in Production](https://blog.cloud66.com/9-crtitical-decisions-needed-to-run-docker-in-production/)
- [8 Components You Need to Run Containers in Production](https://blog.cloud66.com/8-components-you-need-to-run-containers-in-production/)
- [How to Use Docker Compose to Run Multiple Instances of a Service in Development](https://pspdfkit.com/blog/2018/how-to-use-docker-compose-to-run-multiple-instances-of-a-service-in-development/)
- [How To Use Traefik as a Reverse Proxy for Docker Containers](https://www.digitalocean.com/community/tutorials/how-to-use-traefik-as-a-reverse-proxy-for-docker-containers-on-ubuntu-16-04)
- [Load balance with Traefik and Automatically detect new service instances, no need to restart the reverse-proxy](https://github.com/containous/traefik/tree/master/examples/quickstart)

### Issues

- Need to convert nginx to use environment variables [as much as possible](https://docs.docker.com/samples/library/nginx/#using-environment-variables-in-nginx-configuration)
- We are ignoring `.migrate` in `.dockerignore` because we need to make sure that the production database sees new migrations and the `.migrate` file is typically going to be up to date with the development database, not production. The issue with this is that images will get built without this file and therefore every time we need to update the production database schema, _every single up migration will be run_. If our up migrations are idempotent, as they should be, then this shouldn't necessarily be an issue, but it isn't ideal. Need to look into storing migration status _in the database itself_.
- There are two options I'm aware of for dynamically discovering new service instances when scaling up and load balancing to them. This is a major issue that needs to be solved. When a service is scaled up with new instances, the load balancer needs to be aware of the new instances. But more importantly, when an instance fails, the load balancer needs to know not to send traffic to that destination. Even when the Docker engine replaces the failed instance with a healthy instance, the load balancer needs to updated with the new address/HOSTNAME of the new instance.
  - [traefik, which handles this natively...](https://github.com/containous/traefik/blob/ac6b11037dabd4dd64f75c486d6c68ef3c5e9eb9/docs/content/getting-started/quick-start.md)
  - [Automated nginx proxy for Docker containers using docker-gen](https://github.com/jwilder/nginx-proxy)

### Scratchpad

- consider replacing node-migrate with squitch
- setup CI/CD pipeline that handles dev, staging, and blue/green prod
- investigate how a reverse-proxy such as nginx, traefik, caddy, or node-http-proxy would fit into the architecture
  - I'm thinking that the reverse-proxy is what should be exposed to the internet, rather than the node service that contains the auth logic
  - the reverse-proxy server can then delegate to the node service, and any other service, as necessary
- setup a testing suite (possibly as another docker service)
- establish a better database query layer to support a more restful api (or JSON-RPC)
  - many options here: pg-promise, massive, squel, knex, sqitch, node-db-migrate, node-migrate, flyway, sequelize, typeorm, umzug, slonik, etc
- refactor the auth service into [MVC architecture](https://itnext.io/a-new-and-better-mvc-pattern-for-node-express-478a95b09155). Look at upgrading to Egg or Adonis.
- setup [EC2 autoscaling and ELB load balancing](https://docs.aws.amazon.com/autoscaling/ec2/userguide/autoscaling-load-balancer.html)
- setup production database. AWS RDS, AWS Aurora, Digital Ocean block storage, Digital Ocean managed database, etc.
- build a frontend service
- despite what was mentioned in the "scaling your services" section, it may still be possible to scale out with docker-compose by utilizing AWS elastic load balancer combined with auto scaling groups. In this scenario, you would have a fleet of docker-compose fleets.
- see this [github issue](https://github.com/dmfay/massive-js/issues/663#issuecomment-459915014) regarding massive
- see this [github issue](https://github.com/brianc/node-postgres/issues/1151#issuecomment-461534295) regarding express

### High level project goals

- Utilize the Docker platform (containers, compose, swarm)
- Embrace GitOps
- Generalized enough to be used for bootstrapping new projects quickly
- Rapid bootstrapping process
- Multiple environments (dev, testing, staging, prod, etc)
- Environment parity
- Blue/green deployments preferred, rolling deployments acceptable
- Simple database migrations
- CI/CD pipeline that runs testing suite and automates deployments
- Cloud agnostic (deploy anywhere)
- Language agnostic (individual services can be written in any language)
- Strategy for managing and distributing secrets
- DRY config utilizing environment variables
- High availability (many instances, multiple hosts, auto-healing, zero downtime deployments, protection from (D)DOS attacks)
- Scaling, and possibly auto-scaling
- Service oriented (rather than monolithic)
- Stateless and decoupled
- Database backups
- Secure (peer review necessary)
- Immutable deployments and easy rollback
- Strategy for implementing cross-cutting functionality i.e. sidecar pattern (logging, authorization, etc.)
