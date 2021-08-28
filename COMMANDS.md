# Commands

Sometimes useful commands for manual debugging.

```bash
APP_DB_DATABASE=mydb APP_DB_USER=john APP_DB_PASSWORD=mysecretpassword APP_DB_HOST=0.0.0.0 with-nvm ./src/db/init.js

docker run --rm -it --name mysql -p 3306:3306 --init -e MYSQL_DATABASE=mydb -e MYSQL_USER=john -e MYSQL_PASSWORD=mysecretpassword -e MYSQL_RANDOM_ROOT_PASSWORD=1 mysql

docker exec -it mysql mysql -prootsecretpassword mydb
```
