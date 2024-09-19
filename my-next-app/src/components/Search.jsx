export default function Search() {
    return (
      <form action="/search" method="GET" className="">
        <input name="query" placeholder="Search..." className="rounded-tl-2xl rounded-bl-2xl pl-3" />
        <button type="submit" className="px-1 bg-white rounded-tr-2xl rounded-br-2xl ml-1 bg-blue-900">
            <span className="px-1 text-xs font-bold items-baseline text-white">Submit</span>
        </button>
      </form>
    );
  }
  