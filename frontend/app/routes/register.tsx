import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { Form, Link, useActionData } from "@remix-run/react"
import { Input } from "~/components/Input"
import { z } from 'zod';
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { FormErrorText } from "~/components/FormErrorText";
import { isValidSession, sessionCookie } from "~/utils/session.server";
import { Button } from "~/components/Button";

export const loader = async ({request}: LoaderFunctionArgs)=>{
  const validSession = await isValidSession(request)
  if (validSession) {
    return redirect('/inventory')
  }
  return null
}

const schema = z.object({
  username: z.string({required_error: 'Please enter your username'})
      .min(2, {message: 'Username must be at least 2 characters'}),
  password: z.string({required_error: 'Please enter your password'})
      .min(6, {message: 'Password must be at least 6 characters'}),
  confirmPassword: z.string({required_error: 'Please repeat your password'}),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password don\'t match',
    path: ['confirmPassword'],
  })

export const action = async ({request}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  return await fetch(`${process.env.BACKEND_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify({
      username: submission.value.username,
      password: submission.value.password,
      confirmPassword: submission.value.confirmPassword,
    }),
    headers: new Headers({'content-type': 'application/json'}),
    mode: 'no-cors'
  }).then(async res=>{
    if (res.status !== 201 && res.status !== 200) {
      return submission.reply({
        formErrors: ['Invalid username'],
        fieldErrors: {username: ['Invalid username']}
      });
    }
    try {
      const jsonRes = await res.json()
      const headers = new Headers();
      headers.append('Set-Cookie', await sessionCookie.serialize(jsonRes));

      return redirect('/inventory', {headers});
    } catch {
      return submission.reply({
        formErrors: ['Invalid username'],
        fieldErrors: {username: ['Invalid username']}
      });
    }
  }).catch(e=>{
    console.log('error: ', e)
    return submission.reply({
      formErrors: ['Internal Server Error'],
    });
  })
}

export default function Page() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit: (e)=>{
      console.log('submit', e)
    }
  });

  return (
    <div className="flex items-center justify-center h-[100dvh]">
      <div className="w-full max-w-[450px] bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-xl">
        <div className="p-7 space-y-5">
          <div className="py-2">
            <h1 className="font-medium text-3xl">Register</h1>
          </div>
          <div className="flex items-center gap-x-2 text-xs text-neutral-500">
            <div className="h-[1px] w-full bg-neutral-100 flex-grow"></div>
            <p className="text-nowrap">DEMO ACCOUNTS</p>
            <div className="h-[1px] w-full bg-neutral-100 flex-grow"></div>
          </div>
          <div className="space-y-3">
            <Form method="post" className="w-full">
              <Button className="w-full" size="large" text="login as admin" />
              <input hidden type="hidden" name="username" value="admin" />
              <input hidden type="hidden" name="password" value="Password12" />
            </Form>
            <Form method="post" className="w-full">
              <Button className="w-full" size="large" text="login as guest" variant="secondary" />
              <input hidden type="hidden" name="username" value="khairul" />
              <input hidden type="hidden" name="password" value="Password12" />
            </Form>
          </div>
          <div className="flex items-center gap-x-2 text-xs text-neutral-500">
            <div className="h-[1px] w-full bg-neutral-100 flex-grow"></div>
            <p>OR</p>
            <div className="h-[1px] w-full bg-neutral-100 flex-grow"></div>
          </div>
          <Form method="post" className="space-y-5" {...getFormProps(form)}>
            <div className="space-y-1.5">
              <label className="text-neutral-600" htmlFor={fields.username.id}>Username</label>
              <Input size="large" {...getInputProps(fields.username, { type: 'text' })} />
              <FormErrorText id={fields.username.errorId}>{fields.username.errors}</FormErrorText>
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-600" htmlFor={fields.password.id}>Password</label>
              <Input size="large" {...getInputProps(fields.password, { type: 'password' })} />
              <FormErrorText id={fields.password.errorId}>{fields.password.errors}</FormErrorText>
            </div>
            <div className="space-y-1.5">
              <label className="text-neutral-600" htmlFor={fields.password.id}>Confirm password</label>
              <Input size="large" {...getInputProps(fields.confirmPassword, { type: 'password' })} />
              <FormErrorText id={fields.confirmPassword.errorId}>{fields.confirmPassword.errors}</FormErrorText>
            </div>
            <div>
              <button type="submit" className="font-medium text-[15px] uppercase bg-sky-500 text-white w-full h-14 rounded-md tracking-widest hover:bg-sky-400 active:bg-sky-400 transition-all outline-none focus:outline-sky-500">
                Register
              </button>
            </div>
          </Form>
          <div className="text-center py-2">
            <p className="text-sm text-neutral-500">Already have an account? <Link to="/login" className="text-sky-500 hover:text-sky-400">Sign in.</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}
