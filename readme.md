# Trip

## set up **.env**

**create** an `.env` or **rename** `.env.sample` to `.env` **put** your `GOOGLE_API_KEY` on it

## start the project

```bash
docker-compose up
```

## test e2e

```bash
# with the project started

# go to repository
cd QA

#install dependencies
npm install
# or
yarn

# run e2e tests
npx playwright test --debug
```
