interface MemberLayoutProp{
    children: any
}

export default function MemberLayout({ children }:MemberLayoutProp) {
    return (
      <>
        <main className={`h-full lg:h-screen min-h-screen pb-10 lg:pb-0 max-lg:pt-20`} style={{ backgroundImage: 'linear-gradient(to right, #58b4d1, #afecff)' }}>
        <div className='grid grid-cols-1 lg:grid-cols-1 items-center h-full'>
          <div className='text-left flex flex-col lg:justify-center px-5 lg:px-0 mt-5 lg:mt-10'>
            <div className='w-full lg:w-[30%] mx-auto bg-white p-4 rounded-xl relative' style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px" }}>
              {children}
            </div>
          </div>
        </div>
      </main>
      </>
    )
  }
  