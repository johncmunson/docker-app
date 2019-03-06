#!/bin/sh

# We currently don't have a great way of "migrating down", for example if you
# wanted to checkout an old branch and needed to rollback the database to a
# compatible state. This is because you would need access to migrations that
# aren't available to the old branch.

# One option would be to checkout the old branch, make note of most current
# migration it has access to, switch back to your working branch and apply all
# of the down migrations not available to the old branch, and then switching
# back to the old branch.

# Alternatively, you could checkout the old branch, run this bash script to
# reset the database (or add the -v flag to docker-compose down to wipeout any
# shared volumes), and then apply all of the up migrations. This method is
# easier, but also more destructive.
psql -U postgres -f reset-db.sql
