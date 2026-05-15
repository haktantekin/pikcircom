import NewPassword from '@/components/membership/NewPassword'
import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Şifreni Değiştir / Pikcir </title>
        <meta id="meta-description" name="description" content="Kafanın içinde biri var ve sürekli espri yapıyorsa bize katıl. Resmini al gel, koleksiyonlar oluştur, eğlen!" />
      </Head>
      <main className={`h-auto lg:h-screen`}>
        <div className='grid grid-cols-1 items-center h-screen bg-e5e5e5'>
          <div className='text-left flex flex-col lg:justify-center px-5 lg:px-0 bg-e5e5e5 py-4'>
            <div className='w-full lg:w-[50%] mx-auto'>
              <h1 className='font-black text-3xl lg:text-7xl text-202124 relative mt-5 pl-5 lg:pl-0 text-center'>PIKCIR!</h1>
              <p className='text-sm lg:text-lg text-center'>unutma bak bunları</p>
              <div className='w-full mt-4 lg:mt-2'>
                <NewPassword />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
