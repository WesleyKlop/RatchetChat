# RatchetChat
A Websocket based chat system using Ratchet, Adldap2 and a lot more!

## Installation

Using the setup script

```shell
# Clone the repo
git clone git@github.com:WesleyKlop/RatchetChat.git && cd RatchetChat

# Run the setup script
bin/setup.sh

# (Recommened) create symlink from your webroot to the ratchetchat folder
ln -s public/build /var/www/$webroot
```

Or

```shell
# Clone the repo
git clone git@github.com:WesleyKlop/RatchetChat.git && cd RatchetChat

# Install dependencies
composer install
npm install

# Generate certificates
openssl genrsa -aes256 -out keys/private.pem # Remember the password used here, you're going to need it for the .env file
openssl rsa -in keys/private.pem -pubout -out "keys/public.pem"

# Copy the .env.example file
cp .env.example .env

# Edit the settings in there
vim .env

# Import the required tables using sql file in database/
mysql RatchetChat < database/tables.sql

# (Recommened) create symlink from your webroot to the ratchetchat/public/build folder
ln -s public/build /var/www/$webroot
```

## Usage

```shell
# Build the website using gulp
gulp build

# Run the server!
bin/server
```
You should now be able to chat by visiting $webroot.  
Make sure you have port forwarded the APP_PORT in your router if you want to use this from outside your network.

## TODO

* Create a way for users to register when using the Db authenticator.
* A backend management page for admins.
* User classes.
* An app icon.
* A better name!

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request! :D

## License

The MIT License

Copyright (c) 2016 [Wesley Klop](https://wesleyklop.nl).

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
