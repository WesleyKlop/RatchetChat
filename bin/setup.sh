#!/bin/bash
# cd to the app directory
APP_DIR="$(dirname "$(dirname "$(readlink -f "$0")")")"
echo "Application directory: ${APP_DIR}"
cd ${APP_DIR}

# Install dependencies
echo "Installing dependencies..."
composer install
npm install

# Get the password to use for the private key
echo -n "Please enter the password for the private key: "
read -s password
echo
# Generate the certificates
mkdir -p "${APP_DIR}/keys"
echo "Generating the private key."
openssl genrsa -aes256 -out "${APP_DIR}/keys/private.pem" -passout pass:${password}
echo "Generating the public key."
openssl rsa -in "${APP_DIR}/keys/private.pem" -passin pass:${password} -pubout -out "${APP_DIR}/keys/public.pem"

# Replace STRING with the password
sed  "24s/STRING/${password}/" "${APP_DIR}/.env.example" > "${APP_DIR}/.env"

echo "You will still need to edit the .env file to set some other variables like the port and Database credentials"

# Source the .env
source "${APP_DIR}/.env"

# Import the database using mysql if the user wants that
read -p "Would you like to import the tables using mysql? [y/n]" -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Importing tables to database ${DB_DATABASE}"
    mysql ${DB_DATABASE} < "${APP_DIR}/database/tables.sql"
else
    echo "Skipping."
    echo "Remember that you still need these tables so you will need to create them manually and edit the .env file accordingly."
fi

# Run gulp to build the website
echo "Building website with gulp..."
gulp build

echo "All done!"
echo
echo "You can now run the server by calling ${APP_DIR}/bin/server from the shell."
exit 0

