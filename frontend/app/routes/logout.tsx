import type {ActionFunctionArgs, LoaderFunctionArgs, MetaFunction} from '@remix-run/node';
import {json, redirect} from '@remix-run/node';
import { isValidSession, sessionCookie } from '~/utils/session.server';

export const meta: MetaFunction = () => {
  return [
    {title: 'myInventory | Logout'}
  ];
};

export const loader = async ({request}: LoaderFunctionArgs) => {
  return await logout(request)
};

export const action = async ({request}: ActionFunctionArgs) => {
  return await logout(request)
};

const logout = async (request: Request) => {
    const validSession = await isValidSession(request)
    if (!validSession) {
      return json('Unauthorized', {status: 401});
    }
    await fetch(`${process.env.BACKEND_URL}/api/logout`, {
      method: 'POST',
      headers: new Headers({'Authorization': `Bearer ${validSession.id}`}),
      mode: 'no-cors'
    })
    const headers = new Headers();
    headers.append('Set-Cookie', await sessionCookie.serialize('', {expires: new Date(0),}));
    return redirect('/login', {headers})
}
