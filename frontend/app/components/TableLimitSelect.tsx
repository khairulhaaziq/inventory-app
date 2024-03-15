import { useSearchParams } from "@remix-run/react"

export const TableLimitSelect = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultLimit = searchParams.get('limit') || '25'
  const limitOptions = ['10', '25', '50', '100']
  if (!limitOptions.includes(defaultLimit)) {
    limitOptions.push(defaultLimit)
    limitOptions.sort((a, b)=>(parseInt(a)-parseInt(b)))
  }

  function handleLimitChange(limit: number){
    return setSearchParams(prev=>{
      prev.set('limit', String(limit))
      prev.set('page', '1')
      return prev
    })
  }

  return (
    <select defaultValue={defaultLimit} className="px-4 bg-white shadow-[0px_2px_2px_0_rgba(0,0,0,0.08)] rounded-lg overflow-hidden" onChange={(e)=>handleLimitChange(parseInt(e.target.value))}>
      {limitOptions.map(i=>(
        <option key={i}>{i}</option>
      ))}
    </select>
  )
}
