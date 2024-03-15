import { ArchiveIcon, GearIcon } from "@radix-ui/react-icons";
import { NavLink } from "@remix-run/react";
import { ReactNode } from "react";

export const Sidebar = ()=>{
  return (
    <div className="inset-y-0 min-h-[100dvh] w-[274px] bg-sky-950 flex-shrink-0 py-5 px-3">
      <div className="">
        <div className="my-4 px-3 font-medium text-lg text-white">myInventory</div>
        <nav className="">
          <ul className="text-white font-normal">
            <NavItem link="/inventory" text="Inventory" icon={<ArchiveIcon className="w-[18px] h-[18px]" />} />
            <NavItem link="/settings" text="Settings" icon={<GearIcon className="w-[18px] h-[18px]" />}  />
          </ul>
        </nav>
      </div>
    </div>
  )
}

const NavItem = ({link, text, icon}: {link: string; text: string; icon?: ReactNode}) => (
  <li>
    <NavLink to={link} className={({isActive})=>(`flex items-center h-11 hover:bg-sky-900 rounded-md px-3 transition-all hover:opacity-100 ${isActive ? 'opacity-100 bg-sky-900' : 'opacity-80'}`)}>
      <span className="w-8 pl-0.5 opacity-80">{icon}</span> <span>{text}</span>
    </NavLink>
  </li>
)
