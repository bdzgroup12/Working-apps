# Database Migration Guide

This document outlines the steps to export your local PostgreSQL database and import it into a remote VPS PostgreSQL server.

## Exporting Local Database

Use the `pg_dump` utility to export your local database to a SQL file.

```bash
pg_dump -U your_local_username -h localhost -p 5432 -F c -b -v -f local_db_backup.dump your_local_database_name
```

- Replace `your_local_username` with your local PostgreSQL username.
- Replace `your_local_database_name` with the name of your local database.
- The output file `local_db_backup.dump` will be created in the current directory.

## Importing to Remote VPS Database

Copy the dump file to your VPS server using `scp` or any file transfer method.

```bash
scp local_db_backup.dump user@your_vps_ip:/path/to/destination
```

SSH into your VPS server:

```bash
ssh user@your_vps_ip
```

Restore the database using `pg_restore`:

```bash
pg_restore -U your_vps_username -h localhost -p 5432 -d your_vps_database_name -v /path/to/destination/local_db_backup.dump
```

- Replace `your_vps_username` with your VPS PostgreSQL username.
- Replace `your_vps_database_name` with the target database name on the VPS.
- Ensure the target database exists before running the restore command.

## Notes

- Ensure that your VPS PostgreSQL server allows connections from your IP or the server where you run the restore.
- Adjust firewall and PostgreSQL `pg_hba.conf` settings as needed.
- You may need to set environment variables or update your `.env` file on the VPS to reflect the new database connection details.

## Additional Resources

- [pg_dump Documentation](https://www.postgresql.org/docs/current/app-pgdump.html)
- [pg_restore Documentation](https://www.postgresql.org/docs/current/app-pgrestore.html)

If you need assistance with automating this process or have any questions, feel free to ask.
