import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { NavLink, json, redirect, useFetcher,useLoaderData,useSearchParams } from "@remix-run/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "~/components/AppLayout";
import { Button } from "~/components/Button";
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowDownIcon, ArrowUpIcon, Cross2Icon, PlusIcon } from '@radix-ui/react-icons';
import { Input } from "~/components/Input";
import { TablePagination } from "~/components/TablePagination";
import { Card } from "~/components/Card";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { FormErrorText } from "~/components/FormErrorText";
import React, { useEffect, useState } from "react";
import { isValidSession } from "~/utils/session.server";
import { TableLimitSelect } from "~/components/TableLimitSelect";
import { TableFootText } from "~/components/TableFootText";

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
  productName: z.string(),
  productPrice: z.number(),
  quantity: z.number().int()
});

export const action = async ({request}: ActionFunctionArgs) => {
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

  return await fetch(`${process.env.BACKEND_URL}/api/add-inventory`, {
    method: 'POST',
    body: JSON.stringify({
      product: {
        name: submission.value.productName,
        price: submission.value.productPrice,
      },
      quantity: submission.value.quantity
    }),
    headers: new Headers({'content-type': 'application/json', 'Authorization': `Bearer ${validSession.id}`}),
    mode: 'no-cors'
  }).then(res=>{
    if (res.status !== 201 && res.status !== 200) {
      return submission.reply({
        formErrors: ['status Failed to create inventory. Please try again later.'],
      });
    }
    try {
      const jsonRes = res.json()
      return json({success: true, data: jsonRes})
    } catch {
      return submission.reply({
        formErrors: ['json Failed to create inventory. Please try again later.'],
      });
    }
  }).catch(e=>{
    console.log('error: ', e)
    return submission.reply({
      formErrors: ['catch Failed to create inventory. Please try again later.'],
    });
  })
}

export default function Index() {
  const loaderData = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const urls = [`/api/inventory`]
  searchParams.forEach((v, k)=>{
    urls.push(`${k}=${v}`)
  })
  const name = searchParams.get('name')
  const sort = searchParams.get('sort')
  const page = searchParams.get('page')
  const limit = searchParams.get('limit')
  const constructedUrl = urls.length > 1 ? urls[0]+'?'+urls.splice(1).join('&') : urls[0]
  const { data, isPlaceholderData } = useQuery({
    queryKey: ['inventory', page, limit, name, sort],
    queryFn: () =>
      fetch(constructedUrl, {method: 'GET'}).then((res) =>res.json()),
  })

  const handleSearch = (newVal: string) => {
    return setSearchParams(prev=>{
      if (newVal === '') {
        prev.delete('name')
      } else {
        prev.set('name', newVal)
      }
      prev.set('page', '1')
      return prev
    }, {
      preventScrollReset: true
    })
  }

  const handleSort = (type: 'id' | 'name' | 'price' | 'quantity') => {
    let newVal = 'nameAsc'
    if (type === 'id') {
      if (!sort || sort === 'idDesc') {
        newVal = 'idAsc'
      } else {
        newVal = 'idDesc'
      }
    } else if (type === 'name') {
      if (sort && sort === 'nameDesc') {
        newVal = 'nameAsc'
      } else {
        newVal = 'nameDesc'
      }
    } else if (type === 'price') {
      if (sort && sort === 'priceDesc') {
        newVal = 'priceAsc'
      } else {
        newVal = 'priceDesc'
      }
    } else if (type === 'quantity') {
      if (sort && sort === 'qtyDesc') {
        newVal = 'qtyAsc'
      } else {
        newVal = 'qtyDesc'
      }
    }
    return setSearchParams(prev=>{
      prev.set('sort', newVal)
      prev.set('page', '1')
      return prev
    }, {
      preventScrollReset: true
    })
  }

  return (
    <AppLayout>
      <div className="flex items-center justify-between h-[60px]">
        <div><h1 className="font-medium text-3xl">Inventory</h1></div>
        <div>
          {!loaderData?.user?.roleId || loaderData?.user?.roleId == 2 ? (
            <DialogAddInventory />
          ) : '' }
        </div>
      </div>
      <Input placeholder="Search name..." defaultValue={searchParams.get('name') || undefined} onChange={(e)=>handleSearch(e.target.value)} />
      <Card>
        <div className="table w-full space-y-1">
          <div className="table-header-group bg-[rgba(0,0,0,0.02)]">
            <div className="table-row text-neutral-500 text-sm [&>*]:h-12 [&>*]:table-cell">
              <div className="border-b border-neutral-300 px-5 w-[100px] max-w-1/6"><button className="contents" onClick={()=>handleSort('id')}><div className="flex h-full items-center gap-x-1 hover:text-neutral-600 tracking-wider font-medium uppercase">ID {sort === 'idAsc' ? <ArrowUpIcon /> : sort === 'idDesc' || !sort ? <ArrowDownIcon /> : '' }</div></button></div>
              <div className="border-b border-neutral-300 px-5"><button className="flex items-center gap-x-1 hover:text-neutral-600 tracking-wider font-medium uppercase" onClick={()=>handleSort('name')}>Name {sort === 'nameAsc' ? <ArrowUpIcon /> : sort === 'nameDesc' ? <ArrowDownIcon /> : '' }</button></div>
              <div className="border-b border-neutral-300 px-5 w-1/5"><button className="flex items-center gap-x-1 hover:text-neutral-600 tracking-wider font-medium uppercase" onClick={()=>handleSort('price')}>Price {sort === 'priceAsc' ? <ArrowUpIcon /> : sort === 'priceDesc' ? <ArrowDownIcon /> : '' }</button></div>
              <div className="border-b border-neutral-300 px-5 w-1/5"><button className="flex items-center gap-x-1 hover:text-neutral-600 tracking-wider font-medium uppercase" onClick={()=>handleSort('quantity')}>Quantity {sort === 'qtyAsc' ? <ArrowUpIcon /> : sort === 'qtyDesc' ? <ArrowDownIcon /> : '' }</button></div>
            </div>
          </div>
          <div className={`table-row-group ${isPlaceholderData ? 'text-neutral-400' : ''}`}>
            {data?.data && data.data.length ? data.data.map((i, idx)=>(
              <NavLink key={idx} to={`/inventory/${i.product.id}`} className="contents [&>*]:even:bg-neutral-50 [&>*]:hover:bg-sky-100">
                <div className="table-row [&>*]:h-12 [&>*]:table-cell">
                  <div className="px-5"><div className="flex h-full items-center">{i.product.id}</div></div>
                  <div className="px-5"><div className="flex h-full items-center">{i.product.name}</div></div>
                  <div className="px-5"><div className="flex h-full items-center">{i.product.price.toFixed(2)}</div></div>
                  <div className="px-5"><div className="flex h-full items-center">{i.quantity}</div></div>
                </div>
              </NavLink>)) : ''}
          </div>
        </div>
      </Card>
      {data && (
        <div className="flex items-center justify-between">
          <TableFootText currentPage={data?.meta?.pagination?.current_page} totalCount={data?.meta?.pagination?.total_count} />
          <div className="flex gap-x-3">
            <TableLimitSelect />
            <TablePagination currentPage={data?.meta?.pagination?.current_page} totalPages={data?.meta?.pagination?.total_pages} />
          </div>
        </div>)}
      {/* {JSON.stringify(data)} */}
    </AppLayout>
  );
}

const DialogAddInventory = () => {
  const [openDialog, setOpenDialog] = useState(false)
  return (
    <Dialog.Root open={openDialog} onOpenChange={setOpenDialog}>
      <Dialog.Trigger asChild>
        <Button>
          <p className="flex items-center">
            <PlusIcon className="w-5 h-5 mr-2 -ml-0.5" /> Add Inventory
          </p>
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black/40 data-[state=open]:animate-overlayShow fixed inset-0" />
        <DialogAddInventoryContent  onOpenChange={setOpenDialog}/>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const DialogAddInventoryContent = React.forwardRef<HTMLDivElement, {onOpenChange: (open:boolean)=>void}>(({onOpenChange}, ref) => {
  const queryClient = useQueryClient()
  const fetcher = useFetcher<{success?: boolean}>()
  const [form, fields] = useForm({
    defaultNoValidate: false,
    constraint: getZodConstraint(schema),
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(()=>{
    if (fetcher.data?.success) {
      onOpenChange(false)
      queryClient.invalidateQueries({queryKey: ['inventory']})
    }
  }, [fetcher.data])

  return (
    <Dialog.Content ref={ref} className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-full max-w-[600px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white drop-shadow-sm focus:outline-none overflow-x-hidden overflow-y-scroll">
      <div className="px-7 py-6 border-b border-neutral-200">
        <Dialog.Title className="text-xl font-medium">
          Add new inventory
        </Dialog.Title>
      </div>
      <fetcher.Form method="POST" className="contents" {...getFormProps(form)}>
        <div className="p-7 mb-4 space-y-4">
          <fieldset className="flex items-start gap-5">
            <div className="h-11 flex items-center w-[180px] flex-shrink-0">
              <label className="text-neutral-600" htmlFor={fields.productName.id}>Product name</label>
            </div>
            <div className="space-y-1.5 flex-grow">
              <Input placeholder="My new product" {...getInputProps(fields.productName, { type: 'text' })} />
              <FormErrorText id={fields.productName.errorId}>{fields.productName.errors}</FormErrorText>
            </div>
          </fieldset>
          <fieldset className="flex items-start gap-5">
            <div className="h-11 flex items-center w-[180px] flex-shrink-0">
              <label className="text-neutral-600" htmlFor={fields.productPrice.id}>Product price</label>
            </div>
            <div className="space-y-1.5 flex-grow">
              <Input placeholder="0.00" {...getInputProps(fields.productPrice, { type: 'number' })} />
              <FormErrorText id={fields.productPrice.errorId}>{fields.productPrice.errors}</FormErrorText>
            </div>
          </fieldset>
          <fieldset className="flex items-start gap-5">
            <div className="h-11 flex items-center w-[180px] flex-shrink-0">
              <label className="text-neutral-600" htmlFor={fields.quantity.id}>Quantity</label>
            </div>
            <div className="space-y-1.5 flex-grow">
              <Input placeholder="0" {...getInputProps(fields.quantity, { type: 'number' })} />
              <FormErrorText id={fields.quantity.errorId}>{fields.quantity.errors}</FormErrorText>
            </div>
          </fieldset>
        </div>
        <div className="px-7 py-4 flex justify-end bg-neutral-50 items-center gap-x-3">
          <Dialog.Close asChild>
            <Button text="Cancel" variant="secondary" type="button" />
          </Dialog.Close>
          <Button text="Save changes" type="submit" />
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
  )
})

DialogAddInventoryContent.displayName = 'DialogAddInventoryContent'
