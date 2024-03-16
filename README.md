# Inventory app

This is an inventory app, made with nodejs, hono and remix.
These are some of the features:
- End to end authorization and authentication, the app is fully auth guarded so only logged in users can access. Login and register with ease.
- Role based authorization of actions, there are 2 roles, `admin` and `guest`, and admin can create, read, update and delete an item while the `guest` can only `read`.
- Search, sort and paginate inventory items.
- Profile page to view user details.

## Demo
https://github.com/khairulhaaziq/inventory-app/assets/101852870/c495062a-c474-4a5b-867a-9750bb7d14da

Visit the live demo [here](https://inventory-frontend.fly.dev/inventory)

> **Note**
> Your session might be revoked if there is another new active session with the same login. If you find data not showing, that might be the case. Fixing it is simply logout and login again(Yes, the other user will be logged off).

## Getting up and running

### Backend
1. Go to backend directory
  ```cd backend```
2. Create your `.env` or rename the `.env.development`
3. Start a local postgres db, replace the `DATABASE_URL` in the `.env` with your postgres url
4. Run `pnpm run setup` and then run `pnpm run dev:all`
5. Your server should be running on port 3000, visit http://localhost:3000/health_check and if it returns "ok", you are good to go!

### Frontend
1. Go to frontend directory
  ```cd frontend```
2. Create your `.env` or rename the `.env.development`
4. Run `pnpm install` & `pnpm run dev`
5. Your app should be running on port 5173, visit `http://localhost:5173/login` and if it returns the login page, you are good to go!

## Seeding the db
1. You can seed the db by running `pnpm run seed` from the `backend` directory.
2. Upon seeding, you should have 2 users: `khairul` with guest role, and `admin` with admin role, the passwords are in `/backend/scripts/seed.ts`

## Testing
1. You can run the backend tests with `pnpm run test` from the `backend` directory

## Deployment
### Backend
1. You can deploy at any service that supports docker. For me I used fly.io, and you can use the same configuration.
2. Make sure you have installed fly cli with an account. Go to `backend` directory, run `fly launch`, then, run `fly deploy`.
3. Your app is deployed 🎉

### Frontend
1. Same method as frontend, the only difference is you run it from the `frontend` directory.
