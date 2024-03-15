import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"

export const AppLayout = ({children}: {children?: ReactNode}) => {
  return (
    <div>
      <div className="flex">
        <Sidebar />
        <div className="flex-grow flex justify-center items-start py-8 px-12">
          <div className="w-full max-w-5xl space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
