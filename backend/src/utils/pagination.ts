export const DEFAULT_PAGINATION_SEARCH = {page: 1, limit: 25}

export function responsePaginate<T extends any>(data: T, count: number, page: number, limit: number){
  const prevPage = page > 1 ? page - 1 : null
  const totalPages = Math.ceil(count / limit)
  const nextPage = page < totalPages ? page + 1 : null

  return {
    data: data,
    meta: {
      pagination: {
        current_page: page,
        prev_page: prevPage,
        next_page: nextPage,
        total_pages: totalPages,
        total_count: count
      }
    }
  }
}
