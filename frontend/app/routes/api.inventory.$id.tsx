import { LoaderFunctionArgs, json } from "@remix-run/node"
import { isValidSession } from "~/utils/session.server";

export const loader = async ({request, params}: LoaderFunctionArgs) => {
  const validSession = await isValidSession(request)
  if (!validSession) {
    return json('Unauthorized', {status: 401});
  }

  try {
    return await fetch(`${process.env.BACKEND_URL}/api/inventory/${params.id}`, {
      method: 'GET',
      mode: 'no-cors',
      headers: {'Authorization': `Bearer ${validSession.id}`}
    }).then(async res=>{
      if (res.status === 200) {
        return json(await res.json(), {status: 200})
      }
      return res
    })
  } catch {
    return json('Internal Server Error', {status: 500})
  }
}
