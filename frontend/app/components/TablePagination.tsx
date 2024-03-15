import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsHorizontalIcon,
} from "@radix-ui/react-icons"
import { useSearchParams } from "@remix-run/react";

interface TablePaginationProps {
  totalPages?: number;
  currentPage?: number;
}

export const TablePagination = ({totalPages=1, currentPage=1}: TablePaginationProps) => {
  const [, setSearchParams] = useSearchParams()
  const pages = [...Array(Math.round(totalPages)+1).keys()]
  pages.shift()
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  function handlePaginate(page: number){
    return setSearchParams(prev=>{
      prev.set('page', String(page))
      return prev
    }, {
      preventScrollReset: true
    })
  }

  function getMiddleThreeButtons(): number[] {
    if (totalPages <= 4) {
      return []
    } else if (totalPages <= 7) {
      return pages.slice(2, totalPages - 2)
    } else if (currentPage <= 3) {
      return pages.slice(2, 5)
    } else if (currentPage >= totalPages - 3) {
      return pages.slice(pages.length - 5, pages.length - 2)
    }
    return pages.slice(currentPage-2, currentPage+1)
  }

  return (
    <div className="flex bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-lg overflow-hidden">
      <button disabled={!hasPrevPage} onClick={()=>handlePaginate(currentPage-1)} className={`h-9 w-9 border-r flex items-center justify-center hover:bg-neutral-50 transition-all  ${currentPage === 1 ? 'border-neutral-200' : 'border-neutral-100'} disabled:text-neutral-400 disabled:bg-neutral-100 disabled:border-neutral-200`}><ChevronLeftIcon /></button>
      {pages.length > 0 ? (
        <button disabled={pages[0] === currentPage} onClick={()=>handlePaginate(pages[0])} className={`h-9 w-9 border-r flex items-center justify-center transition-all ${pages[0] === currentPage ? 'text-neutral-400 bg-neutral-100 border-neutral-200' : pages[0] === (currentPage - 1) ? 'border-neutral-200' : 'hover:bg-neutral-50 border-neutral-100'}`}>{pages[0]}</button>
      ): ''}
      {pages.length > 1 && pages.length !== 2 ?
        currentPage <= 3 || pages.length == 4 ? (
          <button disabled={pages[1] === currentPage} onClick={()=>handlePaginate(pages[1])} className={`h-9 w-9 border-r flex items-center justify-center transition-all ${pages[1] === currentPage ? 'text-neutral-400 bg-neutral-100 border-neutral-200' : pages[1] === (currentPage - 1) ? 'border-neutral-200' : 'hover:bg-neutral-50 border-neutral-100'}`}>{pages[1]}</button>
        ) : <button disabled className="h-9 w-9 border-r flex items-end py-1.5 justify-center text-neutral-500"><DotsHorizontalIcon /></button> :
      ''}
      {getMiddleThreeButtons().map(i=>(
        <button key={i} disabled={i === currentPage} onClick={()=>handlePaginate(i)} className={`h-9 w-9 border-r flex items-center justify-center transition-all ${i === currentPage ? 'text-neutral-400 bg-neutral-100 border-neutral-200' : i === (currentPage - 1) ? 'border-neutral-200' : 'hover:bg-neutral-50 border-neutral-100'}`}>{i}</button>
      ))}
      {pages.length > 3 ?
        currentPage >= pages.length-2 || pages.length ==4 ? (
          <button disabled={pages[pages.length-2] === currentPage} onClick={()=>handlePaginate(pages[pages.length-2])} className={`h-9 w-9 border-r flex items-center justify-center transition-all ${pages[pages.length-2] === currentPage ? 'text-neutral-400 bg-neutral-100 border-neutral-200' : pages[pages.length-2] === (currentPage - 1) ? 'border-neutral-200' : 'hover:bg-neutral-50 border-neutral-100'}`}>{pages[pages.length-2]}</button>
        ) : <button disabled className="h-9 w-9 border-r flex items-end py-1.5 justify-center text-neutral-500"><DotsHorizontalIcon /></button> :
      ''}
      {pages.length > 1 ? (
        <button disabled={pages[pages.length-1] === currentPage} onClick={()=>handlePaginate(pages[pages.length-1])} className={`h-9 w-9 border-r flex items-center justify-center transition-all ${pages[pages.length-1] === currentPage ? 'text-neutral-400 bg-neutral-100 border-neutral-200' : pages[pages.length-1] === (currentPage - 1) ? 'border-neutral-200' : 'hover:bg-neutral-50 border-neutral-100'}`}>{pages[pages.length-1]}</button>
      ): ''}
      <button disabled={!hasNextPage} onClick={()=>handlePaginate(currentPage+1)} className="h-9 w-9 border-r border-neutral-100 flex items-center justify-center hover:bg-neutral-50 transition-all disabled:text-neutral-400 disabled:bg-neutral-100 disabled:border-neutral-200"><ChevronRightIcon/></button>
    </div>
  )
}
