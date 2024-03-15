import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect, useLoaderData, } from "@remix-run/react";
import { AppLayout } from "~/components/AppLayout";
import { isValidSession } from "~/utils/session.server";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({request}: LoaderFunctionArgs)=>{
  const validSession = await isValidSession(request)
  if (!validSession) {
    return redirect('/login')
  }
  return json({user: validSession?.user})
}

export default function Index() {
  const loaderData = useLoaderData<{user: {username: string, roleId: number, createdAt: Date}}>()

  return (
    <AppLayout>
      <div className="flex items-center justify-between h-[60px]">
        <div><h1 className="font-medium text-3xl">Profile</h1></div>
      </div>
      <div className="bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
        <div className="space-y-5 p-6">
          <div className="flex h-11 items-center">
            <div className="w-52 text-neutral-500 flex-shrink-0">Username</div>
            <div className="px-4">{loaderData?.user?.username}</div>
          </div>
          <div className="flex h-11 items-center">
            <div className="w-52 text-neutral-500 flex-shrink-0">Role</div>
            <div className="px-4">{loaderData?.user?.roleId && loaderData?.user?.roleId == 2 ? 'Admin' : 'Guest'}</div>
          </div>
          <div className="flex h-11 items-center">
            <div className="w-52 text-neutral-500 flex-shrink-0">Created</div>
            <div className="px-4">{loaderData?.user?.createdAt ? Intl.DateTimeFormat('en-US', {dateStyle:'medium', timeStyle: 'short'}).format(new Date(loaderData?.user?.createdAt)) : ''}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
