# retro

A retro board

This project uses the following:

- **TurboRepo** - https://turbo.build/repo - This is what manages all of our packages/apps in the monorepo.
- **React** - https://reactjs.org/ - This is our frontend framework
- **Express** - https://expressjs.com/ - This is our back end web framework
- **SocketIO** - https://socket.io/ - This is our web socket framework to handle the live communication between users
- **Vite** - https://vitejs.dev/ - This is our tool to handle the frontend building
- **ESLint** - https://eslint.org/ - This lints our code using the rules we provide. We are using a Prettier plugin so it is aware of our Prettier rules
- **Prettier** - https://prettier.io/ - This formats our code based on the rules we provide in the config file. This ensures code and formating.

## Run Locally

Install the dependencies

```bash
  npm install
```

Run the development instance

```bash
  npm run dev
```

Run the Prettier code formatter

```bash
  npm run format
```

Run the ESLint code linter

```bash
  npm run lint
```

Run the Tests

```bash
  npm run test
```

## TODO

- [ ] Build ability to have seperate rooms
- [ ] User auth/login
- [ ] User votes on cards
- [ ] Automatic sorting of cards by color and votes
- [ ] Databse persistence for card data
