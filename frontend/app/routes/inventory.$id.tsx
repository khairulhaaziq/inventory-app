import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, json, redirect, useFetcher, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AppLayout } from "~/components/AppLayout";
import { Button } from "~/components/Button";
import { FormErrorText } from "~/components/FormErrorText";
import { Input } from "~/components/Input";
import { Skeleton } from "~/components/Skeleton";
import { isValidSession } from "~/utils/session.server";
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from "@radix-ui/react-icons";

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

const schema = z.object({
  _action: z.enum(['deleteInventory', 'updateInventory']).optional(),
  productName: z.string().optional(),
  productPrice: z.number().optional(),
  quantity: z.number().int().optional()
});

export const action = async ({request, params}: ActionFunctionArgs) => {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const validSession = await isValidSession(request)
  if (!validSession) {
    return submission.reply({
      formErrors: ['Unauthorized request'],
    });
  }

  let path = '/api/update-inventory'
  let method = 'PATCH'
  let action = 'update'
  if (submission.value._action && submission.value._action === 'deleteInventory') {
    path = '/api/delete-inventory'
    method = 'DELETE'
    action = 'delete'
  }

  return await fetch(`${process.env.BACKEND_URL}${path}`, {
    method,
    body: JSON.stringify({
      productId: Number(params.id),
      product: {
        name: submission.value.productName,
        price: submission.value.productPrice,
      },
      quantity: submission.value.quantity
    }),
    headers: new Headers({'content-type': 'application/json', 'Authorization': `Bearer ${validSession.id}`}),
    mode: 'no-cors'
  }).then(async res=>{
    if (res.status !== 201 && res.status !== 200) {
      console.log('status error: ', res)
      return submission.reply({
        formErrors: [`status Failed to ${action} inventory. Please try again later.`],
      });
    }
    try {
      const jsonRes = await res.json()
      return json({success: true, data: jsonRes})
    } catch {
      console.log('json error: ', res)
      return submission.reply({
        formErrors: [`json Failed to ${action} inventory. Please try again later.`],
      });
    }
  }).catch(e=>{
    console.log('error: ', e)
    return submission.reply({
      formErrors: [`catch Failed to ${action} inventory. Please try again later.`],
    });
  })
}

export default function Index() {
  const loaderData = useLoaderData()
  const params = useParams<{id: string}>()
  const queryClient = useQueryClient()
  const fetcher = useFetcher<{success?: boolean}>();
  const navigate = useNavigate()
  const id = params.id!
  const [isEditing, setIsEditing] = useState(false)

  //getting cached data
  const cachedQueryListData = queryClient.getQueriesData({queryKey: ['inventory', 'list']})?.length
    ? queryClient.getQueriesData({queryKey: ['inventory', 'list']})
    : undefined;
  const flatCachedQueryListData = cachedQueryListData?.flatMap((i) => i[1]?.data, 1);
  const cachedData = flatCachedQueryListData?.length ? flatCachedQueryListData.find((i) => i?.productId === parseInt(id)) : undefined;
  const initialData = cachedData ? ({code: 200, data: cachedData}) : undefined;
  console.log('init', initialData)
  const { isLoading, data } = useQuery({
    queryKey: ['inventory', id],
    queryFn: ({signal}) =>
      fetch(`/api/inventory/${id}`, {method: 'GET', signal})
        .then((res) =>res.json()),
    initialData,
  });

  const [form, fields] = useForm({
    defaultNoValidate: false,
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    }
  });

  useEffect(()=>{
    if (fetcher.data?.success && isEditing) {
      queryClient.invalidateQueries()
      setIsEditing(false)
    }
  }, [fetcher.data])

  return (
    <AppLayout>
      <fetcher.Form method="POST" className="space-y-6" {...getFormProps(form)}>
        <div className="flex items-center justify-between h-16">
          <div className="space-y-1">
            <div><NavLink to="#" onClick={()=>navigate(-1)} className="text-sky-500 uppercase text-sm font-medium">Inventory</NavLink></div>
            <div className="h-9 flex items-center">
              {isLoading ? (<Skeleton className="h-5 w-40 mt-1" />) : <h1 className="font-medium text-3xl">{data?.product?.name}</h1>}
            </div>
          </div>
          <div className="flex">
            <div className="flex gap-x-4">
              {!loaderData?.user?.roleId || loaderData?.user?.roleId == 2 ? (
                <>
                  {!isEditing ? (
                    <>
                      <Button text="Edit" type="button" variant="secondary" onClick={()=>setIsEditing(true)} />
                      <DialogDeleteConfirm product={data?.product} />
                    </>
          ): (
            <>
              <Button text="Cancel" type="button" variant="secondary" onClick={()=>setIsEditing(false)} />
              <Button text="Save changes" type="submit" />
            </>
              )}
                </>
              ) : '' }
            </div>
          </div>
        </div>
        <div className="bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
          <div className="space-y-5 p-6">
            <div className="flex h-11 items-center">
              <div className="w-52 text-neutral-500 flex-shrink-0">ID</div>
              <div className="px-4">{data?.product?.id}</div>
            </div>
            <div className="flex items-start">
              <div className="w-52 text-neutral-500 flex-shrink-0 flex items-center h-11">
                <label className="text-neutral-600" htmlFor={fields.productName.id}>Name</label>
              </div>
              {!isEditing ? (
                <div className="px-4 h-11 items-center flex">{data?.product?.name}</div>
            ): (
              <div className="max-w-sm w-full pl-[1px]">
                <Input disabled={fetcher.state === 'submitting'}  defaultValue={data?.product?.name} {...getInputProps(fields.productName, { type: 'text' })} />
                <FormErrorText id={fields.productName.errorId}>{fields.productName.errors}</FormErrorText>
              </div>
            )}
            </div>
            <div className="flex items-start">
              <div className="w-52 text-neutral-500 flex-shrink-0 flex items-center h-11">
                <label className="text-neutral-600" htmlFor={fields.productPrice.id}>Price</label>
              </div>
              {!isEditing ? (
                <div className="px-4 h-11 items-center flex">{data?.product?.price}</div>
            ): (
              <div className="max-w-sm w-full pl-[1px]">
                <Input disabled={fetcher.state === 'submitting'}  defaultValue={data?.product?.price} {...getInputProps(fields.productPrice, { type: 'number' })} />
                <FormErrorText id={fields.productPrice.errorId}>{fields.productPrice.errors}</FormErrorText>
              </div>
            )}
            </div>
            <div className="flex items-start">
              <div className="w-52 text-neutral-500 flex-shrink-0 flex items-center h-11">
                <label className="text-neutral-600" htmlFor={fields.quantity.id}>Quantity</label>
              </div>
              {!isEditing ? (
                <div className="px-4 h-11 items-center flex">{data?.quantity}</div>
            ): (
              <div className="max-w-sm w-full pl-[1px]">
                <Input disabled={fetcher.state === 'submitting'}  defaultValue={data?.quantity} {...getInputProps(fields.quantity, { type: 'number' })} />
                <FormErrorText id={fields.quantity.errorId}>{fields.quantity.errors}</FormErrorText>
              </div>
            )}
            </div>
            <div className="flex h-11 items-center">
              <div className="w-52 text-neutral-500 flex-shrink-0">Supplier</div>
              <div className="px-4">{data?.product?.supplier?.name}</div>
            </div>
            <div className="flex h-11 items-center">
              <div className="w-52 text-neutral-500 flex-shrink-0">Created</div>
              <div className="px-4">{data?.product?.createdAt ? Intl.DateTimeFormat('en-US', {dateStyle:'medium', timeStyle: 'short'}).format(new Date(data?.product?.createdAt)) : ''}</div>
            </div>
          </div>
        </div>
        <div>
        </div>
      </fetcher.Form>
    </AppLayout>
  );
}

const DialogDeleteConfirm = ({product}: {product?: {name: string}}) => {
  const navigate = useNavigate()
  const fetcher = useFetcher<{success?: boolean}>()
  const [form] = useForm({
    defaultNoValidate: false,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(()=>{
    if (fetcher.data?.success) {
      navigate('/inventory')
    }
  }, [fetcher.data])

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="danger" text="Delete" />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white drop-shadow-sm focus:outline-none overflow-x-hidden overflow-y-scroll">
          <div className="px-7 py-6 border-b border-neutral-200">
            <Dialog.Title className="text-xl font-medium">
              Confirm delete {product?.name} ?
            </Dialog.Title>
          </div>
          <fetcher.Form method="POST" className="contents" {...getFormProps(form)}>
            <div className="p-7 mb-4 space-y-4">
              <Dialog.Description>
                This action cannot be undone.
              </Dialog.Description>
            </div>
            <div className="px-7 py-4 flex justify-end bg-neutral-50 items-center gap-x-3">
              <Dialog.Close asChild>
                <Button text="Cancel" variant="secondary" type="button" />
              </Dialog.Close>
              <Button variant="danger" text="Delete" type="submit" />
              <input type="hidden" hidden name="_action" value="deleteInventory" />
            </div>
          </fetcher.Form>
          <Dialog.Close asChild>
            <button
          className="text-neutral-400 transition-all hover:bg-neutral-100 absolute top-[18px] right-[20px] inline-flex h-10 w-10 appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
          aria-label="Close"
        >
              <Cross2Icon height={26} width={26} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
