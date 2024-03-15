import { useSearchParams } from "@remix-run/react"

export const TableFootText = ({currentPage, totalCount}: {currentPage: number, totalCount: number}) => {
  const [searchParams,] = useSearchParams()
  const limitStr = searchParams.get('limit')
  const limit = limitStr ? parseInt(limitStr) : 25
  const startPage = limit * currentPage - limit + 1
  const endPage = totalCount > (limit * currentPage) ? limit * currentPage : totalCount % limit + ((currentPage - 1) * limit)
  return (
    <p className="text-sm text-neutral-500">Showing {startPage} - {endPage} of {totalCount} results</p>
  )
}
